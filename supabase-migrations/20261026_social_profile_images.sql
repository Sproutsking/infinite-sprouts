-- Persist profile banners and community identity images.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS banner_url text;

ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS image_url text;

CREATE OR REPLACE VIEW public.public_profiles WITH (security_barrier = true) AS
SELECT id, full_name, initials, avatar_url, role, bio, state, created_at, username, banner_url
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated;

INSERT INTO storage.buckets (id, name, public)
VALUES ('social-images', 'social-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS social_images_public_read ON storage.objects;
CREATE POLICY social_images_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'social-images');

DROP POLICY IF EXISTS social_images_owner_insert ON storage.objects;
CREATE POLICY social_images_owner_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'social-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS social_images_owner_update ON storage.objects;
CREATE POLICY social_images_owner_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'social-images' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'social-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS social_images_owner_delete ON storage.objects;
CREATE POLICY social_images_owner_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'social-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP FUNCTION IF EXISTS public.create_community(text, text, text);
CREATE FUNCTION public.create_community(
  community_name text,
  community_description text,
  community_icon text,
  community_image_url text,
  community_cover_image_url text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_id uuid := auth.uid();
  created_community public.communities%rowtype;
BEGIN
  IF actor_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to create a community.';
  END IF;
  IF nullif(trim(community_name), '') IS NULL THEN
    RAISE EXCEPTION 'Community name is required.';
  END IF;

  INSERT INTO public.communities (name, "desc", ico, members, posts, owner_id, image_url, cover_image_url)
  VALUES (
    trim(community_name),
    nullif(trim(community_description), ''),
    coalesce(nullif(trim(community_icon), ''), '🌱'),
    1,
    0,
    actor_id,
    nullif(trim(community_image_url), ''),
    nullif(trim(community_cover_image_url), '')
  )
  RETURNING * INTO created_community;

  INSERT INTO public.community_memberships (user_id, community_id, followed, role)
  VALUES (actor_id, created_community.id, true, 'owner')
  ON CONFLICT (user_id, community_id) DO UPDATE SET followed = true, role = 'owner';

  RETURN to_jsonb(created_community) || jsonb_build_object('followed', true, 'notif', false);
END;
$$;

REVOKE ALL ON FUNCTION public.create_community(text, text, text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.create_community(text, text, text, text, text) TO authenticated;

DROP FUNCTION IF EXISTS public.update_community_settings(bigint, text, text, text, text, text, boolean, boolean, boolean, text, text);
CREATE FUNCTION public.update_community_settings(
  target_community_id bigint,
  new_name text,
  new_description text,
  new_icon text,
  new_category text,
  new_privacy text,
  new_join_approval boolean,
  new_posts_enabled boolean,
  new_comments_enabled boolean,
  new_rules text,
  new_image_url text,
  new_cover_image_url text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_id uuid := auth.uid();
  updated_community public.communities%rowtype;
BEGIN
  IF actor_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to manage a community.';
  END IF;
  IF new_privacy NOT IN ('public', 'private') THEN
    RAISE EXCEPTION 'Invalid community visibility.';
  END IF;

  UPDATE public.communities SET
    name = nullif(trim(new_name), ''),
    "desc" = coalesce(new_description, ''),
    ico = coalesce(nullif(trim(new_icon), ''), '🌱'),
    category = coalesce(nullif(trim(new_category), ''), 'General'),
    privacy = new_privacy,
    join_approval = coalesce(new_join_approval, false),
    posts_enabled = coalesce(new_posts_enabled, true),
    comments_enabled = coalesce(new_comments_enabled, true),
    rules = coalesce(new_rules, ''),
    image_url = nullif(trim(new_image_url), ''),
    cover_image_url = nullif(trim(new_cover_image_url), ''),
    updated_at = now()
  WHERE id = target_community_id AND owner_id = actor_id
  RETURNING * INTO updated_community;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Community not found or you are not its owner.';
  END IF;

  UPDATE public.posts SET comments_enabled = new_comments_enabled
  WHERE community_id = target_community_id
    AND comments_enabled IS DISTINCT FROM new_comments_enabled;

  RETURN to_jsonb(updated_community);
END;
$$;

REVOKE ALL ON FUNCTION public.update_community_settings(bigint, text, text, text, text, text, boolean, boolean, boolean, text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.update_community_settings(bigint, text, text, text, text, text, boolean, boolean, boolean, text, text, text) TO authenticated;
