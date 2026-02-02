-- Create a function to log user scan creation with security definer
CREATE OR REPLACE FUNCTION public.log_scan_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_audit_logs (
    admin_id,
    action,
    entity_type,
    entity_id,
    details
  ) VALUES (
    NEW.user_id,
    'create_scan',
    'user_scans',
    NEW.id,
    jsonb_build_object(
      'title', NEW.title,
      'page_count', NEW.page_count,
      'file_size_bytes', NEW.file_size_bytes
    )
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically log when scans are created
CREATE TRIGGER on_scan_created
  AFTER INSERT ON public.user_scans
  FOR EACH ROW
  EXECUTE FUNCTION public.log_scan_creation();