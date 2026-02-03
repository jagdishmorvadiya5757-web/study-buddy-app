-- Create a storage bucket for resource files (PDFs, documents)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read resource files (public access for downloads)
CREATE POLICY "Anyone can read resource files"
ON storage.objects FOR SELECT
USING (bucket_id = 'resources');

-- Allow admins and sub-admins to upload resource files
CREATE POLICY "Admins can upload resource files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resources' 
  AND public.is_admin_or_subadmin(auth.uid())
);

-- Allow admins and sub-admins to update resource files
CREATE POLICY "Admins can update resource files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resources' 
  AND public.is_admin_or_subadmin(auth.uid())
);

-- Allow admins and sub-admins to delete resource files
CREATE POLICY "Admins can delete resource files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resources' 
  AND public.is_admin_or_subadmin(auth.uid())
);