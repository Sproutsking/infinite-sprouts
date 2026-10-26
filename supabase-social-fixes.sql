-- Apply once in the Supabase SQL editor. Safe to rerun.

create or replace view public.public_profiles with (security_barrier = true) as
select id, full_name, initials, avatar_url, role, bio, state, created_at
from public.profiles;
grant select on public.public_profiles to authenticated;

alter table public.profiles enable row level security;
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles for select using (auth.uid() = id);
drop policy if exists profiles_self_insert on public.profiles;
create policy profiles_self_insert on public.profiles for insert with check (auth.uid() = id);
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create table if not exists public.community_memberships (
  user_id uuid not null references auth.users(id) on delete cascade,
  community_id bigint not null references public.communities(id) on delete cascade,
  followed boolean not null default true,
  notifications_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, community_id)
);
alter table public.community_memberships enable row level security;
drop policy if exists community_memberships_owner_select on public.community_memberships;
create policy community_memberships_owner_select on public.community_memberships for select using (auth.uid() = user_id);
drop policy if exists community_memberships_owner_insert on public.community_memberships;
create policy community_memberships_owner_insert on public.community_memberships for insert with check (auth.uid() = user_id);
drop policy if exists community_memberships_owner_update on public.community_memberships;
create policy community_memberships_owner_update on public.community_memberships for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists communities_update_auth on public.communities;
drop policy if exists communities_owner_update on public.communities;

alter table public.posts enable row level security;
alter table public.posts add column if not exists comments_enabled boolean not null default true;
drop policy if exists posts_insert_auth on public.posts;
create policy posts_insert_auth on public.posts for insert with check (auth.uid() = author_id);
drop policy if exists posts_owner_update on public.posts;
create policy posts_owner_update on public.posts for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
drop policy if exists posts_owner_delete on public.posts;
create policy posts_owner_delete on public.posts for delete using (auth.uid() = author_id);

alter table public.comments enable row level security;
drop policy if exists comments_insert_auth on public.comments;
create policy comments_insert_auth on public.comments for insert with check (
  auth.uid() = author_id and exists (
    select 1 from public.posts p where p.id = post_id and p.comments_enabled = true
  )
);
drop policy if exists comments_owner_delete on public.comments;
create policy comments_owner_delete on public.comments for delete using (auth.uid() = author_id);

alter table public.post_likes enable row level security;
drop policy if exists post_likes_owner_select on public.post_likes;
create policy post_likes_owner_select on public.post_likes for select using (auth.uid() = user_id);
drop policy if exists post_likes_insert_auth on public.post_likes;
create policy post_likes_insert_auth on public.post_likes for insert with check (auth.uid() = user_id);
drop policy if exists post_likes_owner_delete on public.post_likes;
create policy post_likes_owner_delete on public.post_likes for delete using (auth.uid() = user_id);

alter table public.shares enable row level security;
drop policy if exists shares_public_select on public.shares;
create policy shares_public_select on public.shares for select using (true);

create table if not exists public.comment_likes (
  comment_id bigint not null references public.comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);
alter table public.comment_likes enable row level security;
drop policy if exists comment_likes_owner_select on public.comment_likes;
create policy comment_likes_owner_select on public.comment_likes for select using (auth.uid() = user_id);
drop policy if exists comment_likes_insert_auth on public.comment_likes;
create policy comment_likes_insert_auth on public.comment_likes for insert with check (auth.uid() = user_id);
drop policy if exists comment_likes_owner_delete on public.comment_likes;
create policy comment_likes_owner_delete on public.comment_likes for delete using (auth.uid() = user_id);

alter table public.conversations enable row level security;
drop policy if exists conversations_insert_auth on public.conversations;
create policy conversations_insert_auth on public.conversations for insert with check (auth.uid() = any(participant_ids));

alter table public.messages enable row level security;
drop policy if exists messages_public_select on public.messages;
drop policy if exists messages_conversation_participant_select on public.messages;
create policy messages_conversation_participant_select on public.messages for select using (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id and auth.uid() = any(c.participant_ids)
  )
);
drop policy if exists messages_insert_auth on public.messages;
create policy messages_insert_auth on public.messages for insert with check (
  auth.uid() = sender_id and exists (
    select 1 from public.conversations c
    where c.id = conversation_id and auth.uid() = any(c.participant_ids)
  )
);
drop policy if exists messages_owner_delete on public.messages;
create policy messages_owner_delete on public.messages for delete using (
  auth.uid() = sender_id and exists (
    select 1 from public.conversations c
    where c.id = conversation_id and auth.uid() = any(c.participant_ids)
  )
);

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;
drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists avatars_owner_insert on storage.objects;
create policy avatars_owner_insert on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and name like auth.uid()::text || '-%');
drop policy if exists avatars_owner_update on storage.objects;
create policy avatars_owner_update on storage.objects for update to authenticated
using (bucket_id = 'avatars' and name like auth.uid()::text || '-%')
with check (bucket_id = 'avatars' and name like auth.uid()::text || '-%');
drop policy if exists avatars_owner_delete on storage.objects;
create policy avatars_owner_delete on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and name like auth.uid()::text || '-%');

create or replace function public.create_community(
  community_name text,
  community_description text,
  community_icon text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  created_community public.communities%rowtype;
begin
  if actor_id is null then
    raise exception 'Authentication required to create a community.';
  end if;
  if nullif(trim(community_name), '') is null then
    raise exception 'Community name is required.';
  end if;

  insert into public.communities (name, "desc", ico, members, posts)
  values (trim(community_name), nullif(trim(community_description), ''), coalesce(nullif(trim(community_icon), ''), '🌱'), 1, 0)
  returning * into created_community;

  insert into public.community_memberships (user_id, community_id, followed)
  values (actor_id, created_community.id, true);

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
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  previous_followed boolean;
  member_count integer;
begin
  if actor_id is null then
    raise exception 'Authentication required to update community settings.';
  end if;

  select members into member_count from public.communities where id = target_community_id for update;
  if not found then
    raise exception 'Community not found.';
  end if;
  select followed into previous_followed from public.community_memberships
    where user_id = actor_id and community_id = target_community_id;

  insert into public.community_memberships (user_id, community_id, followed, notifications_enabled)
  values (actor_id, target_community_id, should_follow, enable_notifications)
  on conflict (user_id, community_id) do update
    set followed = excluded.followed,
        notifications_enabled = excluded.notifications_enabled;

  if should_follow and not coalesce(previous_followed, false) then
    member_count := coalesce(member_count, 0) + 1;
  elsif not should_follow and coalesce(previous_followed, false) then
    member_count := greatest(0, coalesce(member_count, 0) - 1);
  end if;
  update public.communities set members = member_count where id = target_community_id;

  return jsonb_build_object('followed', should_follow, 'notif', enable_notifications, 'members', member_count);
end;
$$;
revoke all on function public.set_community_membership(bigint, boolean, boolean) from public;
grant execute on function public.set_community_membership(bigint, boolean, boolean) to authenticated;

create or replace function public.toggle_post_like(target_post_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  was_liked boolean;
  like_count integer;
begin
  if actor_id is null then
    raise exception 'Authentication required to like a post.';
  end if;
  perform 1 from public.posts where id = target_post_id for update;
  if not found then
    raise exception 'Post not found.';
  end if;

  select exists(select 1 from public.post_likes where post_id = target_post_id and user_id = actor_id)
    into was_liked;
  if was_liked then
    delete from public.post_likes where post_id = target_post_id and user_id = actor_id;
  else
    insert into public.post_likes (post_id, user_id) values (target_post_id, actor_id)
    on conflict (post_id, user_id) do nothing;
  end if;
  select count(*)::integer into like_count from public.post_likes where post_id = target_post_id;
  update public.posts set likes = like_count where id = target_post_id;
  return jsonb_build_object('liked', not was_liked, 'likes', like_count);
end;
$$;
revoke all on function public.toggle_post_like(bigint) from public;
grant execute on function public.toggle_post_like(bigint) to authenticated;

create or replace function public.record_post_share(target_post_id bigint, share_message text default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  share_count integer;
begin
  if actor_id is null then
    raise exception 'Authentication required to share a post.';
  end if;
  perform 1 from public.posts where id = target_post_id for update;
  if not found then
    raise exception 'Post not found.';
  end if;

  insert into public.shares (post_id, author_id, message)
  values (target_post_id, actor_id, share_message);
  select count(*)::integer into share_count from public.shares where post_id = target_post_id;
  update public.posts set shares = share_count where id = target_post_id;
  return share_count;
end;
$$;

revoke all on function public.record_post_share(bigint, text) from public;
grant execute on function public.record_post_share(bigint, text) to authenticated;

create or replace function public.toggle_comment_like(target_comment_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  was_liked boolean;
  like_count integer;
begin
  if actor_id is null then
    raise exception 'Authentication required to like a comment.';
  end if;
  perform 1 from public.comments where id = target_comment_id for update;
  if not found then
    raise exception 'Comment not found.';
  end if;

  select exists(select 1 from public.comment_likes where comment_id = target_comment_id and user_id = actor_id)
    into was_liked;
  if was_liked then
    delete from public.comment_likes where comment_id = target_comment_id and user_id = actor_id;
  else
    insert into public.comment_likes (comment_id, user_id) values (target_comment_id, actor_id)
    on conflict (comment_id, user_id) do nothing;
  end if;
  select count(*)::integer into like_count from public.comment_likes where comment_id = target_comment_id;
  update public.comments set likes = like_count where id = target_comment_id;
  return jsonb_build_object('liked', not was_liked, 'likes', like_count);
end;
$$;
revoke all on function public.toggle_comment_like(bigint) from public;
grant execute on function public.toggle_comment_like(bigint) to authenticated;

create or replace function public.delete_comment(target_comment_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  comment_depth record;
begin
  if actor_id is null then
    raise exception 'Authentication required to delete a comment.';
  end if;
  perform 1 from public.comments where id = target_comment_id and author_id = actor_id for update;
  if not found then
    raise exception 'Comment not found or not owned by the current user.';
  end if;

  for comment_depth in
    with recursive descendants(id, depth) as (
      select id, 0 from public.comments where id = target_comment_id
      union all
      select child.id, parent.depth + 1
      from public.comments child join descendants parent on child.parent_comment_id = parent.id
    )
    select id from descendants order by depth desc
  loop
    delete from public.comments where id = comment_depth.id;
  end loop;
end;
$$;
revoke all on function public.delete_comment(bigint) from public;
grant execute on function public.delete_comment(bigint) to authenticated;
