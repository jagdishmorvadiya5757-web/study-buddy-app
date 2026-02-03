-- Add unique constraint on user_downloads for upsert functionality
ALTER TABLE public.user_downloads 
DROP CONSTRAINT IF EXISTS user_downloads_resource_user_unique;

ALTER TABLE public.user_downloads 
ADD CONSTRAINT user_downloads_resource_user_unique UNIQUE (resource_id, user_id);