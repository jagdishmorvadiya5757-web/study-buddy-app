
-- 1. Fix profiles: restrict SELECT to own profile + admins
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. user_sessions: allow users to view and update their own sessions
CREATE POLICY "Users can view own sessions"
ON public.user_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
ON public.user_sessions
FOR UPDATE
USING (auth.uid() = user_id);

-- 3. app_installs: allow users to view their own installs
CREATE POLICY "Users can view own installs"
ON public.app_installs
FOR SELECT
USING (auth.uid() = user_id);

-- 4. resource_downloads: allow users to view their own downloads
CREATE POLICY "Users can view own downloads"
ON public.resource_downloads
FOR SELECT
USING (auth.uid() = user_id);

-- 5. user_downloads: allow users to update their own downloads (is_saved toggle)
CREATE POLICY "Users can update own downloads"
ON public.user_downloads
FOR UPDATE
USING (auth.uid() = user_id);
