-- Make the user-scans bucket public so PDFs can be viewed
UPDATE storage.buckets SET public = true WHERE id = 'user-scans';