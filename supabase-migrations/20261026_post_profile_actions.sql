-- Reliable owner-checked post deletion and public usernames for author headers.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;

CREATE OR REPLACE VIEW public.public_profiles WITH (security_barrier = true) AS
SELECT id, full_name, initials, avatar_url, role, bio, state, created_at, username
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.delete_post_v2(target_post_id bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_post_author uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Sign in to delete a post.';
  END IF;

  SELECT author_id INTO v_post_author
  FROM public.posts
  WHERE id = target_post_id
  FOR UPDATE;

  IF NOT FOUND OR v_post_author IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Post not found or you do not have permission to delete it.';
  END IF;

  UPDATE public.comments
  SET parent_comment_id = NULL
  WHERE post_id = target_post_id
    AND parent_comment_id IS NOT NULL;

  DELETE FROM public.comments WHERE post_id = target_post_id;
  DELETE FROM public.post_likes WHERE post_id = target_post_id;
  DELETE FROM public.shares WHERE post_id = target_post_id;
  DELETE FROM public.saved_posts WHERE post_id = target_post_id;
  DELETE FROM public.hidden_posts WHERE post_id = target_post_id;
  DELETE FROM public.posts WHERE id = target_post_id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_post_v2(bigint) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_post_v2(bigint) TO authenticated;
