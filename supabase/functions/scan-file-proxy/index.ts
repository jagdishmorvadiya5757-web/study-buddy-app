import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

type ScanRow = {
  file_url: string;
  title: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Expose-Headers": "Content-Type, Content-Disposition",
};

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const url = new URL(req.url);
    const scanId = url.searchParams.get("scanId");

    if (!scanId) {
      return new Response("Missing scanId", { status: 400, headers: corsHeaders });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!jwt) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const backendUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!backendUrl || !anonKey || !serviceRoleKey) {
      console.error("scan-file-proxy: missing env vars");
      return new Response("Server misconfigured", { status: 500, headers: corsHeaders });
    }

    const userClient = createClient(backendUrl, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const adminClient = createClient(backendUrl, serviceRoleKey);
    const { data: isAdmin, error: roleErr } = await adminClient.rpc(
      "is_admin_or_subadmin",
      { _user_id: userData.user.id },
    );

    if (roleErr) {
      console.error("scan-file-proxy: role check failed");
      return new Response("Failed to verify permissions", { status: 500, headers: corsHeaders });
    }
    if (!isAdmin) {
      return new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

    const { data: scan, error: scanErr } = await adminClient
      .from("user_scans")
      .select("file_url,title")
      .eq("id", scanId)
      .maybeSingle<ScanRow>();

    if (scanErr) {
      console.error("scan-file-proxy: scan load failed");
      return new Response("Failed to load scan", { status: 500, headers: corsHeaders });
    }
    if (!scan?.file_url) {
      return new Response("Not found", { status: 404, headers: corsHeaders });
    }

    const match = scan.file_url.match(
      /\/storage\/v1\/object\/public\/user-scans\/(.+)$/,
    );
    if (!match?.[1]) {
      return new Response("Invalid file URL", { status: 400, headers: corsHeaders });
    }

    const objectPath = match[1];

    if (objectPath.includes('..') || objectPath.includes('./')) {
      return new Response("Invalid file path", { status: 400, headers: corsHeaders });
    }

    const pathParts = objectPath.split('/');
    if (pathParts.length < 2) {
      return new Response("Invalid file path structure", { status: 400, headers: corsHeaders });
    }
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(pathParts[0])) {
      return new Response("Invalid user folder", { status: 400, headers: corsHeaders });
    }

    const filename = decodeURIComponent(objectPath.split("/").pop() || "scan.pdf");

    const { data: blob, error: dlErr } = await adminClient.storage
      .from("user-scans")
      .download(objectPath);

    if (dlErr || !blob) {
      console.error("scan-file-proxy: download failed");
      return new Response("Failed to download file", { status: 500, headers: corsHeaders });
    }

    const body = await blob.arrayBuffer();
    const contentType = blob.type || "application/pdf";

    return new Response(body, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (_e) {
    console.error("scan-file-proxy: unexpected error");
    return new Response("Unexpected error", { status: 500, headers: corsHeaders });
  }
});
