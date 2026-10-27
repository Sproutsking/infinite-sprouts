-- Support produce/post images, post locations, and visible community rosters.

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS location text;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('social-images', 'social-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('marketplace-images', 'marketplace-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('farmer-verification-documents', 'farmer-verification-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS marketplace_images_public_read ON storage.objects;
CREATE POLICY marketplace_images_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'marketplace-images');

DROP POLICY IF EXISTS marketplace_images_owner_insert ON storage.objects;
CREATE POLICY marketplace_images_owner_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'marketplace-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS marketplace_images_owner_update ON storage.objects;
CREATE POLICY marketplace_images_owner_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'marketplace-images' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'marketplace-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS marketplace_images_owner_delete ON storage.objects;
CREATE POLICY marketplace_images_owner_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'marketplace-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS community_memberships_select_visible_members ON public.community_memberships;
CREATE POLICY community_memberships_select_visible_members ON public.community_memberships
  FOR SELECT TO authenticated
  USING (
    status = 'active'
    AND followed
    AND public.can_view_community(community_id)
  );
