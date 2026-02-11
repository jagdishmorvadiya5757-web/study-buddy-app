
-- Fix 1: Add role check to log_scan_creation trigger to prevent non-admin entries in audit logs
CREATE OR REPLACE FUNCTION public.log_scan_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if the user is an admin or sub_admin
  IF public.is_admin_or_subadmin(NEW.user_id) THEN
    INSERT INTO public.admin_audit_logs (admin_id, action, entity_type, entity_id, details)
    VALUES (
      NEW.user_id,
      'scan_created',
      'user_scan',
      NEW.id,
      jsonb_build_object('title', NEW.title, 'file_url', NEW.file_url)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Fix 2: Replace permissive INSERT policies on analytics tables with auth-required ones

-- user_sessions: drop old permissive policy, add auth-required
DROP POLICY IF EXISTS "Anyone can create sessions" ON public.user_sessions;
CREATE POLICY "Authenticated users can create sessions"
  ON public.user_sessions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- app_installs: drop old permissive policy, add auth-required
DROP POLICY IF EXISTS "Anyone can record installs" ON public.app_installs;
CREATE POLICY "Authenticated users can record installs"
  ON public.app_installs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- resource_downloads: drop old permissive policy, add auth-required
DROP POLICY IF EXISTS "Anyone can track downloads" ON public.resource_downloads;
CREATE POLICY "Authenticated users can track downloads"
  ON public.resource_downloads FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
