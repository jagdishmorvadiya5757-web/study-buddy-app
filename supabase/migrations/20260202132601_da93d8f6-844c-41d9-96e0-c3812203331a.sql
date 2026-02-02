-- Analytics: Track user sessions
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Analytics: Track app installs
CREATE TABLE public.app_installs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  device_id TEXT,
  platform TEXT, -- 'ios', 'android', 'web'
  app_version TEXT,
  installed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User scanned documents storage
CREATE TABLE public.user_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  page_count INTEGER DEFAULT 1,
  file_size_bytes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User downloaded resources tracking
CREATE TABLE public.user_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_saved BOOLEAN DEFAULT true
);

-- Enable RLS on all tables
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_installs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_downloads ENABLE ROW LEVEL SECURITY;

-- Sessions: Anyone can insert, admins can view all
CREATE POLICY "Anyone can create sessions"
  ON public.user_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all sessions"
  ON public.user_sessions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Installs: Anyone can insert, admins can view
CREATE POLICY "Anyone can record installs"
  ON public.app_installs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view installs"
  ON public.app_installs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Scans: Users manage their own scans
CREATE POLICY "Users can view own scans"
  ON public.user_scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own scans"
  ON public.user_scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scans"
  ON public.user_scans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans"
  ON public.user_scans FOR DELETE
  USING (auth.uid() = user_id);

-- Downloads: Users manage their own, admins view all
CREATE POLICY "Users can view own downloads"
  ON public.user_downloads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own downloads"
  ON public.user_downloads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own downloads"
  ON public.user_downloads FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all downloads"
  ON public.user_downloads FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at on user_scans
CREATE TRIGGER update_user_scans_updated_at
  BEFORE UPDATE ON public.user_scans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for analytics queries
CREATE INDEX idx_user_sessions_date ON public.user_sessions(session_start DESC);
CREATE INDEX idx_app_installs_date ON public.app_installs(installed_at DESC);
CREATE INDEX idx_user_scans_user ON public.user_scans(user_id);
CREATE INDEX idx_user_downloads_user ON public.user_downloads(user_id);
CREATE INDEX idx_user_downloads_resource ON public.user_downloads(resource_id);

-- Create storage bucket for user scans
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('user-scans', 'user-scans', false, 52428800);

-- Storage policies for user scans
CREATE POLICY "Users can upload own scans"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'user-scans' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own scans"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-scans' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own scans"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'user-scans' AND auth.uid()::text = (storage.foldername(name))[1]);