
-- Fix 1: Make user-scans bucket private
UPDATE storage.buckets SET public = false WHERE id = 'user-scans';

-- Fix 2: Add is_public column to site_settings and restrict access
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Mark public-facing settings
UPDATE public.site_settings SET is_public = true WHERE setting_key IN ('about', 'faqs', 'terms_privacy');
-- ad_settings remains is_public = false (sensitive)

-- Drop the old permissive policy
DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;

-- Public users can only see public settings
CREATE POLICY "Public can view public settings"
  ON public.site_settings FOR SELECT
  USING (is_public = true);

-- Admins can view all settings (including ad_settings)
CREATE POLICY "Admins can view all settings"
  ON public.site_settings FOR SELECT
  USING (public.is_admin_or_subadmin(auth.uid()));
