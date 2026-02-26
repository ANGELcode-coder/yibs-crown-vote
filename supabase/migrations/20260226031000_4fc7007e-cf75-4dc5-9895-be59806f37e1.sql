
-- Allow admins to upload to the photos bucket
CREATE POLICY "Admins can upload photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'photos' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Allow admins to update photos
CREATE POLICY "Admins can update photos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'photos' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Allow admins to delete photos
CREATE POLICY "Admins can delete photos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'photos' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Allow public read access to photos
CREATE POLICY "Photos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'photos');
