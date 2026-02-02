-- Create function to increment download count
CREATE OR REPLACE FUNCTION public.increment_download_count(resource_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.resources
  SET download_count = download_count + 1
  WHERE id = resource_id;
END;
$$;

-- Create a table to track individual downloads for analytics
CREATE TABLE public.resource_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_hash TEXT
);

-- Enable RLS
ALTER TABLE public.resource_downloads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert download records (for tracking)
CREATE POLICY "Anyone can track downloads"
  ON public.resource_downloads
  FOR INSERT
  WITH CHECK (true);

-- Only admins can view download analytics
CREATE POLICY "Admins can view download analytics"
  ON public.resource_downloads
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create index for faster analytics queries
CREATE INDEX idx_resource_downloads_resource_id ON public.resource_downloads(resource_id);
CREATE INDEX idx_resource_downloads_downloaded_at ON public.resource_downloads(downloaded_at DESC);