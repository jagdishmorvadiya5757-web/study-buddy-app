-- Create a helper function to check if user is admin OR sub_admin
CREATE OR REPLACE FUNCTION public.is_admin_or_subadmin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin'::app_role, 'sub_admin'::app_role)
  )
$$;

-- Update resources RLS to allow sub_admins to manage resources
DROP POLICY IF EXISTS "Admins can manage resources" ON public.resources;
CREATE POLICY "Admins and sub_admins can manage resources" 
ON public.resources 
FOR ALL 
USING (is_admin_or_subadmin(auth.uid()));