-- Infinite Sprouts social/community actions migration
-- Apply after supabase-complete.sql. This migration is additive and safe to rerun.

create extension if not exists pgcrypto;

-- Community ownership and configurable policy.
alter table public.communities add column if not exists owner_id uuid references auth.users(id) on delete set null;
alter table public.communities add column if not exists category text not null default 'General';
alter table public.communities add column if not exists privacy text not null default 'public';
alter table public.communities add column if not exists join_approval boolean not null default false;
alter table public.communities add column if not exists posts_enabled boolean not null default true;
alter table public.communities add column if not exists comments_enabled boolean not null default true;
alter table public.communities add column if not exists rules text not null default '';
alter table public.communities add column if not exists cover_image_url text;
alter table public.communities add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'communities_privacy_check') then
    alter table public.communities add constraint communities_privacy_check check (privacy in ('public', 'private'));
  end if;
end $$;

create index if not exists idx_communities_owner_id on public.communities(owner_id);

create table if not exists public.community_memberships (
  user_id uuid not null references auth.users(id) on delete cascade,
  community_id bigint not null references public.communities(id) on delete cascade,
  followed boolean not null default true,
  notifications_enabled boolean not null default false,
  role text not null default 'member' check (role in ('owner', 'moderator', 'member')),
  status text not null default 'active' check (status in ('pending', 'active', 'rejected')),
  created_at timestamptz not null default now(),
  primary key (user_id, community_id)
);
alter table public.community_memberships add column if not exists role text not null default 'member';
alter table public.community_memberships add column if not exists status text not null default 'active';

update public.communities c set owner_id = coalesce(
  (select p.author_id from public.posts p where p.community_id = c.id order by p.created_at asc limit 1),
  (select cm.user_id from public.community_memberships cm where cm.community_id = c.id order by cm.created_at asc limit 1)
) where c.owner_id is null;
insert into public.community_memberships (user_id, community_id, followed, role, status)
select c.owner_id, c.id, true, 'owner', 'active'
from public.communities c where c.owner_id is not null
on conflict (user_id, community_id) do update set role = 'owner', followed = true, status = 'active';

create table if not exists public.comment_likes (
  comment_id bigint not null references public.comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

-- Post capabilities and share-event idempotency.
alter table public.posts add column if not exists comments_enabled boolean not null default true;
alter table public.posts add column if not exists pinned_at timestamptz;
alter table public.shares add column if not exists share_method text not null default 'external';
alter table public.shares add column if not exists request_id uuid;
create unique index if not exists idx_shares_request_id on public.shares(request_id) where request_id is not null;
create index if not exists idx_posts_pinned_at on public.posts(author_id, pinned_at desc) where pinned_at is not null;

-- Per-user saved collections and post saves.
create table if not exists public.save_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 60),
  color text not null default '#38a038',
  created_at timestamptz not null default now(),
  unique (user_id, name)
);
create table if not exists public.saved_posts (
  user_id uuid not null references auth.users(id) on delete cascade,
  collection_id uuid not null references public.save_collections(id) on delete cascade,
  post_id bigint not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (collection_id, post_id)
);
create index if not exists idx_saved_posts_user_id on public.saved_posts(user_id, created_at desc);

-- Persistent feed moderation preferences and reports.
create table if not exists public.hidden_posts (
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id bigint not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);
create table if not exists public.muted_users (
  user_id uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, target_user_id),
  check (user_id <> target_user_id)
);
create table if not exists public.blocked_users (
  user_id uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, target_user_id),
  check (user_id <> target_user_id)
);
create table if not exists public.post_reports (
  id bigserial primary key,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  post_id bigint not null references public.posts(id) on delete cascade,
  reason text not null,
  details text not null default '',
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);
create table if not exists public.comment_reports (
  id bigserial primary key,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  comment_id bigint not null references public.comments(id) on delete cascade,
  reason text not null,
  details text not null default '',
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

-- RLS for social actions.
alter table public.community_memberships enable row level security;
alter table public.save_collections enable row level security;
alter table public.saved_posts enable row level security;
alter table public.hidden_posts enable row level security;
alter table public.muted_users enable row level security;
alter table public.blocked_users enable row level security;
alter table public.post_reports enable row level security;
alter table public.comment_reports enable row level security;
alter table public.post_likes enable row level security;
alter table public.comment_likes enable row level security;
alter table public.shares enable row level security;
alter table public.communities enable row level security;

create or replace function public.is_community_owner(target_community_id bigint)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.communities c where c.id = target_community_id and c.owner_id = auth.uid());
$$;
revoke all on function public.is_community_owner(bigint) from public;
grant execute on function public.is_community_owner(bigint) to anon, authenticated;

create or replace function public.can_view_community(target_community_id bigint)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.communities c
    where c.id = target_community_id and (
      c.privacy = 'public' or c.owner_id = auth.uid() or exists (
        select 1 from public.community_memberships cm
        where cm.community_id = c.id and cm.user_id = auth.uid() and cm.followed and cm.status = 'active'
      )
    )
  );
$$;
revoke all on function public.can_view_community(bigint) from public;
grant execute on function public.can_view_community(bigint) to anon, authenticated;

drop policy if exists community_memberships_select_self_or_owner on public.community_memberships;
drop policy if exists community_memberships_insert_self on public.community_memberships;
drop policy if exists community_memberships_owner_insert on public.community_memberships;
drop policy if exists community_memberships_update_owner on public.community_memberships;
drop policy if exists community_memberships_delete_self_or_owner on public.community_memberships;
create policy community_memberships_select_self_or_owner on public.community_memberships for select to authenticated
  using (auth.uid() = user_id or public.is_community_owner(community_id));
create policy community_memberships_update_owner on public.community_memberships for update to authenticated
  using (public.is_community_owner(community_id)) with check (public.is_community_owner(community_id));
create policy community_memberships_delete_self_or_owner on public.community_memberships for delete to authenticated
  using (auth.uid() = user_id or public.is_community_owner(community_id));

drop policy if exists comment_likes_select_self on public.comment_likes;
drop policy if exists comment_likes_insert_self on public.comment_likes;
drop policy if exists comment_likes_delete_self on public.comment_likes;
create policy comment_likes_select_self on public.comment_likes for select to authenticated using (auth.uid() = user_id);
create policy comment_likes_insert_self on public.comment_likes for insert to authenticated with check (auth.uid() = user_id);
create policy comment_likes_delete_self on public.comment_likes for delete to authenticated using (auth.uid() = user_id);

-- Tighten legacy community policies so only the creator manages settings.
drop policy if exists communities_insert_auth on public.communities;
drop policy if exists communities_update_auth on public.communities;
drop policy if exists communities_owner_insert on public.communities;
drop policy if exists communities_owner_update on public.communities;
drop policy if exists communities_owner_delete on public.communities;
drop policy if exists communities_public_select on public.communities;
create policy communities_public_select on public.communities for select using (privacy = 'public' or public.is_community_owner(id) or exists (
  select 1 from public.community_memberships cm where cm.community_id = id and cm.user_id = auth.uid()
));
create policy communities_owner_insert on public.communities for insert to authenticated with check (auth.uid() = owner_id);
create policy communities_owner_update on public.communities for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy communities_owner_delete on public.communities for delete to authenticated using (auth.uid() = owner_id);

drop policy if exists posts_public_select on public.posts;
create policy posts_public_select on public.posts for select using (
  community_id is null or public.can_view_community(community_id)
);
drop policy if exists posts_insert_auth on public.posts;
create policy posts_insert_auth on public.posts for insert to authenticated with check (
  auth.uid() = author_id and (
    community_id is null or exists (
      select 1 from public.communities c
      where c.id = community_id
        and public.can_view_community(c.id)
        and (c.posts_enabled or c.owner_id = auth.uid())
        and exists (
          select 1 from public.community_memberships cm
          where cm.community_id = c.id and cm.user_id = auth.uid() and cm.followed and cm.status = 'active'
        )
    )
  )
);
drop policy if exists comments_public_select on public.comments;
create policy comments_public_select on public.comments for select using (
  exists (select 1 from public.posts p where p.id = post_id and (p.community_id is null or public.can_view_community(p.community_id)))
);
drop policy if exists comments_insert_auth on public.comments;
create policy comments_insert_auth on public.comments for insert to authenticated with check (
  auth.uid() = author_id and exists (
    select 1 from public.posts p
    left join public.communities c on c.id = p.community_id
    where p.id = post_id and p.comments_enabled
      and (c.id is null or (public.can_view_community(c.id) and c.comments_enabled))
  )
);

-- Collection ownership policies.
drop policy if exists save_collections_select_owner on public.save_collections;
drop policy if exists save_collections_insert_owner on public.save_collections;
drop policy if exists save_collections_update_owner on public.save_collections;
drop policy if exists save_collections_delete_owner on public.save_collections;
create policy save_collections_select_owner on public.save_collections for select to authenticated using (auth.uid() = user_id);
create policy save_collections_insert_owner on public.save_collections for insert to authenticated with check (auth.uid() = user_id);
create policy save_collections_update_owner on public.save_collections for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy save_collections_delete_owner on public.save_collections for delete to authenticated using (auth.uid() = user_id);

drop policy if exists saved_posts_select_owner on public.saved_posts;
drop policy if exists saved_posts_insert_owner on public.saved_posts;
drop policy if exists saved_posts_delete_owner on public.saved_posts;
create policy saved_posts_select_owner on public.saved_posts for select to authenticated using (auth.uid() = user_id);
create policy saved_posts_insert_owner on public.saved_posts for insert to authenticated with check (auth.uid() = user_id and exists (
  select 1 from public.save_collections c where c.id = collection_id and c.user_id = auth.uid()
));
create policy saved_posts_delete_owner on public.saved_posts for delete to authenticated using (auth.uid() = user_id);

-- User preference policies.
drop policy if exists hidden_posts_owner_all on public.hidden_posts;
create policy hidden_posts_owner_all on public.hidden_posts for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists muted_users_owner_all on public.muted_users;
create policy muted_users_owner_all on public.muted_users for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists blocked_users_owner_all on public.blocked_users;
create policy blocked_users_owner_all on public.blocked_users for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Reports can be submitted and viewed only by their reporter.
drop policy if exists post_reports_reporter_all on public.post_reports;
drop policy if exists post_reports_reporter_select on public.post_reports;
drop policy if exists post_reports_reporter_insert on public.post_reports;
create policy post_reports_reporter_select on public.post_reports for select to authenticated using (auth.uid() = reporter_id);
create policy post_reports_reporter_insert on public.post_reports for insert to authenticated with check (auth.uid() = reporter_id);
drop policy if exists comment_reports_reporter_all on public.comment_reports;
drop policy if exists comment_reports_reporter_select on public.comment_reports;
drop policy if exists comment_reports_reporter_insert on public.comment_reports;
create policy comment_reports_reporter_select on public.comment_reports for select to authenticated using (auth.uid() = reporter_id);
create policy comment_reports_reporter_insert on public.comment_reports for insert to authenticated with check (auth.uid() = reporter_id);

-- Create communities with a recorded owner and owner membership.
create or replace function public.create_community(community_name text, community_description text, community_icon text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  actor_id uuid := auth.uid();
  created_community public.communities%rowtype;
begin
  if actor_id is null then raise exception 'Authentication required to create a community.'; end if;
  if nullif(trim(community_name), '') is null then raise exception 'Community name is required.'; end if;
  insert into public.communities (name, "desc", ico, members, posts, owner_id)
  values (trim(community_name), nullif(trim(community_description), ''), coalesce(nullif(trim(community_icon), ''), '🌱'), 1, 0, actor_id)
  returning * into created_community;
  insert into public.community_memberships (user_id, community_id, followed, role)
  values (actor_id, created_community.id, true, 'owner')
  on conflict (user_id, community_id) do update set followed = true, role = 'owner';
  return to_jsonb(created_community) || jsonb_build_object('followed', true, 'notif', false);
end;
$$;
revoke all on function public.create_community(text, text, text) from public;
grant execute on function public.create_community(text, text, text) to authenticated;

create or replace function public.set_community_membership(
  target_community_id bigint,
  should_follow boolean,
  enable_notifications boolean
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  actor_id uuid := auth.uid();
  target_community public.communities%rowtype;
  membership_status text;
  member_count integer;
begin
  if actor_id is null then raise exception 'Authentication required to update community membership.'; end if;
  select * into target_community from public.communities where id = target_community_id for update;
  if not found then raise exception 'Community not found.'; end if;

  if not should_follow then
    delete from public.community_memberships where user_id = actor_id and community_id = target_community_id and role <> 'owner';
    select count(*)::integer into member_count from public.community_memberships
      where community_id = target_community_id and followed and status = 'active';
    update public.communities set members = member_count where id = target_community_id;
    return jsonb_build_object('followed', false, 'pending', false, 'notif', false, 'members', member_count);
  end if;

  membership_status := case when target_community.privacy = 'private' or target_community.join_approval then 'pending' else 'active' end;
  insert into public.community_memberships (user_id, community_id, followed, notifications_enabled, role, status)
  values (actor_id, target_community_id, membership_status = 'active', enable_notifications, 'member', membership_status)
  on conflict (user_id, community_id) do update set
    followed = excluded.followed,
    notifications_enabled = excluded.notifications_enabled,
    status = case when public.community_memberships.status = 'active' then 'active' else excluded.status end;
  select count(*)::integer into member_count from public.community_memberships
    where community_id = target_community_id and followed and status = 'active';
  update public.communities set members = member_count where id = target_community_id;
  return jsonb_build_object('followed', membership_status = 'active', 'pending', membership_status = 'pending', 'notif', enable_notifications, 'members', member_count);
end;
$$;
revoke all on function public.set_community_membership(bigint, boolean, boolean) from public;
grant execute on function public.set_community_membership(bigint, boolean, boolean) to authenticated;

create or replace function public.review_community_member(target_community_id bigint, target_user_id uuid, approve boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  member_count integer;
begin
  if auth.uid() is null or not public.is_community_owner(target_community_id) then
    raise exception 'Only the community owner can review membership requests.';
  end if;
  if approve then
    update public.community_memberships set status = 'active', followed = true
      where community_id = target_community_id and user_id = target_user_id and status = 'pending';
  else
    update public.community_memberships set status = 'rejected', followed = false
      where community_id = target_community_id and user_id = target_user_id and status = 'pending';
  end if;
  select count(*)::integer into member_count from public.community_memberships
    where community_id = target_community_id and followed and status = 'active';
  update public.communities set members = member_count where id = target_community_id;
  return jsonb_build_object('members', member_count);
end;
$$;
revoke all on function public.review_community_member(bigint, uuid, boolean) from public;
grant execute on function public.review_community_member(bigint, uuid, boolean) to authenticated;

create or replace function public.update_community_settings(
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
  new_cover_image_url text
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  actor_id uuid := auth.uid();
  updated_community public.communities%rowtype;
begin
  if actor_id is null then raise exception 'Authentication required to manage a community.'; end if;
  if new_privacy not in ('public', 'private') then raise exception 'Invalid community visibility.'; end if;
  update public.communities set
    name = nullif(trim(new_name), ''),
    "desc" = coalesce(new_description, ''),
    ico = coalesce(nullif(trim(new_icon), ''), '🌱'),
    category = coalesce(nullif(trim(new_category), ''), 'General'),
    privacy = new_privacy,
    join_approval = coalesce(new_join_approval, false),
    posts_enabled = coalesce(new_posts_enabled, true),
    comments_enabled = coalesce(new_comments_enabled, true),
    rules = coalesce(new_rules, ''),
    cover_image_url = nullif(trim(new_cover_image_url), ''),
    updated_at = now()
  where id = target_community_id and owner_id = actor_id
  returning * into updated_community;
  if not found then raise exception 'Community not found or you are not its owner.'; end if;
  update public.posts set comments_enabled = new_comments_enabled
    where community_id = target_community_id and comments_enabled is distinct from new_comments_enabled;
  return to_jsonb(updated_community);
end;
$$;
revoke all on function public.update_community_settings(bigint, text, text, text, text, text, boolean, boolean, boolean, text, text) from public;
grant execute on function public.update_community_settings(bigint, text, text, text, text, text, boolean, boolean, boolean, text, text) to authenticated;

-- Persist one like per user and return the authoritative aggregate count.
create or replace function public.toggle_post_like(target_post_id bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  actor_id uuid := auth.uid();
  liked_now boolean;
  like_count integer;
begin
  if actor_id is null then raise exception 'Authentication required to like a post.'; end if;
  perform 1 from public.posts where id = target_post_id for update;
  if not found then raise exception 'Post not found.'; end if;
  delete from public.post_likes where post_id = target_post_id and user_id = actor_id;
  if not found then
    insert into public.post_likes (post_id, user_id) values (target_post_id, actor_id) on conflict (post_id, user_id) do nothing;
    liked_now := true;
  else
    liked_now := false;
  end if;
  select count(*)::integer into like_count from public.post_likes where post_id = target_post_id;
  update public.posts set likes = like_count where id = target_post_id;
  return jsonb_build_object('liked', liked_now, 'likes', like_count);
end;
$$;
revoke all on function public.toggle_post_like(bigint) from public;
grant execute on function public.toggle_post_like(bigint) to authenticated;

create or replace function public.toggle_comment_like(target_comment_id bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  actor_id uuid := auth.uid();
  liked_now boolean;
  like_count integer;
begin
  if actor_id is null then raise exception 'Authentication required to like a comment.'; end if;
  perform 1 from public.comments where id = target_comment_id for update;
  if not found then raise exception 'Comment not found.'; end if;
  delete from public.comment_likes where comment_id = target_comment_id and user_id = actor_id;
  if not found then
    insert into public.comment_likes (comment_id, user_id) values (target_comment_id, actor_id) on conflict (comment_id, user_id) do nothing;
    liked_now := true;
  else
    liked_now := false;
  end if;
  select count(*)::integer into like_count from public.comment_likes where comment_id = target_comment_id;
  update public.comments set likes = like_count where id = target_comment_id;
  return jsonb_build_object('liked', liked_now, 'likes', like_count);
end;
$$;
revoke all on function public.toggle_comment_like(bigint) from public;
grant execute on function public.toggle_comment_like(bigint) to authenticated;

-- A share event is recorded only after a real share target is opened or the native share sheet completes.
create or replace function public.record_post_share_v2(target_post_id bigint, share_method text, request_id uuid, share_message text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  actor_id uuid := auth.uid();
  share_id bigint;
  share_count integer;
begin
  if actor_id is null then raise exception 'Authentication required to share a post.'; end if;
  if request_id is null then raise exception 'Share request id is required.'; end if;
  perform 1 from public.posts where id = target_post_id for update;
  if not found then raise exception 'Post not found.'; end if;
  insert into public.shares (post_id, author_id, message, share_method, request_id)
  values (target_post_id, actor_id, share_message, coalesce(nullif(trim(share_method), ''), 'external'), request_id)
  on conflict (request_id) where request_id is not null do nothing;
  select id into share_id from public.shares where request_id = record_post_share_v2.request_id;
  select count(*)::integer into share_count from public.shares where post_id = target_post_id;
  update public.posts set shares = share_count where id = target_post_id;
  return jsonb_build_object('id', share_id, 'shares', share_count);
end;
$$;
revoke all on function public.record_post_share_v2(bigint, text, uuid, text) from public;
grant execute on function public.record_post_share_v2(bigint, text, uuid, text) to authenticated;

create or replace function public.toggle_post_pin(target_post_id bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  actor_id uuid := auth.uid();
  target_author_id uuid;
  was_pinned boolean;
  pinned_time timestamptz;
begin
  if actor_id is null then raise exception 'Authentication required to pin posts.'; end if;
  select author_id, pinned_at is not null into target_author_id, was_pinned
  from public.posts where id = target_post_id for update;
  if not found or target_author_id <> actor_id then raise exception 'You can only pin your own posts.'; end if;
  update public.posts set pinned_at = null where author_id = actor_id and pinned_at is not null;
  if not was_pinned then
    pinned_time := now();
    update public.posts set pinned_at = pinned_time where id = target_post_id;
  end if;
  return jsonb_build_object('pinned', not was_pinned, 'pinned_at', pinned_time);
end;
$$;
revoke all on function public.toggle_post_pin(bigint) from public;
grant execute on function public.toggle_post_pin(bigint) to authenticated;

-- Keep cached post comment totals accurate for roots and replies.
create or replace function public.refresh_post_comment_count()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  target_post_id bigint;
begin
  target_post_id := case when tg_op = 'DELETE' then old.post_id else new.post_id end;
  update public.posts set comments = (select count(*)::integer from public.comments where post_id = target_post_id)
  where id = target_post_id;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;
drop trigger if exists comments_refresh_post_count on public.comments;
create trigger comments_refresh_post_count
after insert or delete on public.comments
for each row execute function public.refresh_post_comment_count();
update public.posts p set comments = (select count(*)::integer from public.comments c where c.post_id = p.id);

-- Migration workflow: keep this baseline intact and add future changes as dated files here.
