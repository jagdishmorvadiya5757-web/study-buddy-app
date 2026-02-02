import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

type ScanRow = {
  file_url: string;
  title: string;
};

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const scanId = url.searchParams.get("scanId");

    if (!scanId) {
      return new Response("Missing scanId", { status: 400 });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!jwt) {
      return new Response("Unauthorized", { status: 401 });
    }

    const backendUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!backendUrl || !anonKey || !serviceRoleKey) {
      return new Response("Server misconfigured", { status: 500 });
    }

    // Verify the caller and their role
    const userClient = createClient(backendUrl, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const adminClient = createClient(backendUrl, serviceRoleKey);
    const { data: isAdmin, error: roleErr } = await adminClient.rpc(
      "is_admin_or_subadmin",
      { _user_id: userData.user.id },
    );

    if (roleErr) {
      return new Response("Failed to verify permissions", { status: 500 });
    }
    if (!isAdmin) {
      return new Response("Forbidden", { status: 403 });
    }

    // Load scan to get its file URL
    const { data: scan, error: scanErr } = await adminClient
      .from("user_scans")
      .select("file_url,title")
      .eq("id", scanId)
      .maybeSingle<ScanRow>();

    if (scanErr) {
      return new Response("Failed to load scan", { status: 500 });
    }
    if (!scan?.file_url) {
      return new Response("Not found", { status: 404 });
    }

    // Expected format: .../storage/v1/object/public/user-scans/<path>
    const match = scan.file_url.match(
      /\/storage\/v1\/object\/public\/user-scans\/(.+)$/,
    );
    if (!match?.[1]) {
      return new Response("Invalid file URL", { status: 400 });
    }

    const objectPath = match[1];
    const filename = decodeURIComponent(objectPath.split("/").pop() || "scan.pdf");

    const { data: blob, error: dlErr } = await adminClient.storage
      .from("user-scans")
      .download(objectPath);

    if (dlErr || !blob) {
      return new Response("Failed to download file", { status: 500 });
    }

    const body = await blob.arrayBuffer();
    const contentType = blob.type || "application/pdf";

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
        "X-Content-Type-Options": "nosniff",
        // Prevent caching sensitive admin content in shared caches.
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (_e) {
    return new Response("Unexpected error", { status: 500 });
  }
});
