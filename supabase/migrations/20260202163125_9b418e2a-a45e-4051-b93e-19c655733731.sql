-- Add RLS policies for admins to view and manage all user scans
CREATE POLICY "Admins can view all scans"
ON public.user_scans
FOR SELECT
USING (is_admin_or_subadmin(auth.uid()));

CREATE POLICY "Admins can update all scans"
ON public.user_scans
FOR UPDATE
USING (is_admin_or_subadmin(auth.uid()));

CREATE POLICY "Admins can delete all scans"
ON public.user_scans
FOR DELETE
USING (is_admin_or_subadmin(auth.uid()));