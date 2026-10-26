-- Ensure every account has a unique, editable public username.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;

UPDATE public.profiles
SET username = lower(regexp_replace(username, '^@', ''))
WHERE username IS NOT NULL;

UPDATE public.profiles
SET username = NULL
WHERE username IS NOT NULL
  AND (
    username !~ '^[a-z0-9_]{3,32}$'
    OR lower(username) IN ('member', 'username', 'user')
  );

WITH ranked_usernames AS (
  SELECT id, row_number() OVER (PARTITION BY username ORDER BY created_at NULLS LAST, id) AS row_num
  FROM public.profiles
  WHERE username IS NOT NULL
)
UPDATE public.profiles AS profile
SET username = NULL
FROM ranked_usernames AS ranked
WHERE profile.id = ranked.id
  AND ranked.row_num > 1;

UPDATE public.profiles
SET username =
  coalesce(
    nullif(trim(both '_' FROM left(regexp_replace(lower(coalesce(
      CASE
        WHEN nullif(lower(full_name), '') NOT IN ('farm user', 'member') THEN full_name
        ELSE nullif(split_part(coalesce(email, ''), '@', 1), '')
      END,
      'farmer'
    )), '[^a-z0-9]+', '_', 'g'), 10)), ''),
    'farmer'
  )
  || '_' || left(replace(id::text, '-', ''), 20)
WHERE username IS NULL;

CREATE OR REPLACE FUNCTION public.ensure_profile_username()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_base text;
BEGIN
  IF NEW.username IS NULL OR btrim(NEW.username) = '' THEN
    v_base := coalesce(
      nullif(trim(both '_' FROM left(regexp_replace(lower(coalesce(
        CASE
          WHEN nullif(lower(NEW.full_name), '') NOT IN ('farm user', 'member') THEN NEW.full_name
          ELSE nullif(split_part(coalesce(NEW.email, ''), '@', 1), '')
        END,
        'farmer'
      )), '[^a-z0-9]+', '_', 'g'), 10)), ''),
      'farmer'
    );
    NEW.username := v_base || '_' || left(replace(NEW.id::text, '-', ''), 20);
  ELSE
    NEW.username := lower(regexp_replace(NEW.username, '^@', ''));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_ensure_username ON public.profiles;
CREATE TRIGGER profiles_ensure_username
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.ensure_profile_username();

ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_format_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_format_check
  CHECK (username ~ '^[a-z0-9_]{3,32}$' AND lower(username) NOT IN ('member', 'username', 'user'));

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_unique_idx
  ON public.profiles (lower(username));

CREATE OR REPLACE VIEW public.public_profiles WITH (security_barrier = true) AS
SELECT id, full_name, initials, avatar_url, role, bio, state, created_at, username
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated;
