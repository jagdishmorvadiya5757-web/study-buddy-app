-- Create site_settings table for managing about section and other site-wide content
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read site settings
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Only admins can update site settings
CREATE POLICY "Admins can manage site settings"
ON public.site_settings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Insert default about section content
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
('about', '{
  "title": "GTU-VERSE",
  "tagline": "Engineering Resources Portal",
  "description": "A comprehensive platform for GTU engineering students to access study materials, previous year papers, solutions, and more.",
  "contact_email": "support@gtuverse.com",
  "contact_location": "Gujarat, India",
  "quick_links": [
    {"label": "Home", "url": "/"},
    {"label": "Resources", "url": "/resources"},
    {"label": "Branches", "url": "/branches"},
    {"label": "Login", "url": "/auth"}
  ]
}'::jsonb);