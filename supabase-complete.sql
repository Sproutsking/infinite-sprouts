-- =========================================================
-- Infinite Sprouts - complete Supabase schema
-- Safe to run in the Supabase SQL editor
-- No seed or mock data is injected; all content comes from
-- real user activity in the live app.
-- =========================================================

-- 1) Extensions
create extension if not exists pgcrypto;

-- 2) Profiles
create table if not exists public.profiles (
  id uuid primary key,
  email text,
  full_name text,
  initials text,
  avatar_url text,
  role text,
  bio text,
  phone text,
  state text,
  created_at timestamptz default now()
);

-- 3) Wallets
create table if not exists public.wallets (
  id bigserial primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  naira_balance numeric default 0,
  ist_balance numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4) Transactions
create table if not exists public.transactions (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('in','out')),
  title text not null,
  sub text,
  amount numeric not null default 0,
  wallet text not null check (wallet in ('naira','ist')),
  created_at timestamptz default now()
);

-- 5) Notifications
create table if not exists public.notifications (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text,
  notification_type text,
  read boolean default false,
  created_at timestamptz default now()
);

-- 6) Communities
create table if not exists public.communities (
  id bigserial primary key,
  name text not null,
  "desc" text,
  ico text,
  members integer default 0,
  posts integer default 0,
  followed boolean default false,
  notif boolean default false,
  created_at timestamptz default now()
);

-- 7) Posts
create table if not exists public.posts (
  id bigserial primary key,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text,
  tags text[],
  community_id bigint references public.communities(id),
  image text,
  likes integer default 0,
  shares integer default 0,
  comments integer default 0,
  created_at timestamptz default now()
);

-- 8) Comments
create table if not exists public.comments (
  id bigserial primary key,
  post_id bigint not null references public.posts(id) on delete cascade,
  parent_comment_id bigint references public.comments(id),
  author_id uuid not null references auth.users(id) on delete cascade,
  body text,
  likes integer default 0,
  created_at timestamptz default now()
);

-- 9) Post likes
create table if not exists public.post_likes (
  id bigserial primary key,
  post_id bigint not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- 10) Shares
create table if not exists public.shares (
  id bigserial primary key,
  post_id bigint not null references public.posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  message text,
  created_at timestamptz default now()
);

-- 11) Follows
create table if not exists public.follows (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, target_user_id)
);

-- 12) Market items
create table if not exists public.market_items (
  id bigserial primary key,
  name text not null,
  category text,
  price numeric default 0,
  qty numeric default 0,
  unit text,
  seller text,
  state text,
  lga text,
  "desc" text,
  icon text,
  created_at timestamptz default now()
);

-- 13) Orders
create table if not exists public.orders (
  id bigserial primary key,
  item_id bigint not null references public.market_items(id) on delete cascade,
  quantity integer default 1,
  total numeric default 0,
  wallet text,
  created_at timestamptz default now()
);

-- 14) Farms
create table if not exists public.farms (
  id bigserial primary key,
  name text not null,
  location text,
  goal numeric default 0,
  funded numeric default 0,
  shares integer default 0,
  sold integer default 0,
  roi numeric default 0,
  timeline integer default 0,
  icon text,
  "desc" text,
  created_at timestamptz default now()
);

-- 15) Conversations
create table if not exists public.conversations (
  id bigserial primary key,
  participant_ids uuid[] not null,
  name text,
  preview text,
  unread integer default 0,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- 16) Messages
create table if not exists public.messages (
  id bigserial primary key,
  conversation_id bigint not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  text text,
  created_at timestamptz default now()
);

-- Compatibility fixes for the current app
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'comments'
      AND column_name = 'text'
      AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'comments'
          AND column_name = 'body'
      )
  ) THEN
    ALTER TABLE public.comments RENAME COLUMN text TO body;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'posts'
      AND column_name = 'community_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.posts ALTER COLUMN community_id DROP NOT NULL;
  END IF;
END $$;

-- =========================================================
-- Indexes for speed
-- =========================================================
create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_posts_author_id on public.posts(author_id);
create index if not exists idx_posts_community_id on public.posts(community_id);
create index if not exists idx_comments_post_id on public.comments(post_id);
create index if not exists idx_comments_parent_id on public.comments(parent_comment_id);
create index if not exists idx_post_likes_post_id on public.post_likes(post_id);
create index if not exists idx_post_likes_user_id on public.post_likes(user_id);
create index if not exists idx_shares_post_id on public.shares(post_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_conversations_updated_at on public.conversations(updated_at desc);

-- =========================================================
-- RLS enablement
-- =========================================================
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;
alter table public.notifications enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.shares enable row level security;
alter table public.communities enable row level security;
alter table public.follows enable row level security;
alter table public.market_items enable row level security;
alter table public.orders enable row level security;
alter table public.farms enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_self_select') THEN
    CREATE POLICY profiles_self_select ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_self_insert') THEN
    CREATE POLICY profiles_self_insert ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_self_update') THEN
    CREATE POLICY profiles_self_update ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Wallets
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'wallets' AND policyname = 'wallets_owner_select') THEN
    CREATE POLICY wallets_owner_select ON public.wallets FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'wallets' AND policyname = 'wallets_owner_insert') THEN
    CREATE POLICY wallets_owner_insert ON public.wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'wallets' AND policyname = 'wallets_owner_update') THEN
    CREATE POLICY wallets_owner_update ON public.wallets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Transactions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'transactions' AND policyname = 'transactions_owner_select') THEN
    CREATE POLICY transactions_owner_select ON public.transactions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'transactions' AND policyname = 'transactions_owner_insert') THEN
    CREATE POLICY transactions_owner_insert ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Notifications
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'notifications_owner_select') THEN
    CREATE POLICY notifications_owner_select ON public.notifications FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'notifications_owner_insert') THEN
    CREATE POLICY notifications_owner_insert ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'notifications_owner_update') THEN
    CREATE POLICY notifications_owner_update ON public.notifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Posts
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'posts_public_select') THEN
    CREATE POLICY posts_public_select ON public.posts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'posts_insert_auth') THEN
    CREATE POLICY posts_insert_auth ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
  END IF;
END $$;

-- Comments
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'comments' AND policyname = 'comments_public_select') THEN
    CREATE POLICY comments_public_select ON public.comments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'comments' AND policyname = 'comments_insert_auth') THEN
    CREATE POLICY comments_insert_auth ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
  END IF;
END $$;

-- Post likes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'post_likes' AND policyname = 'post_likes_owner_select') THEN
    CREATE POLICY post_likes_owner_select ON public.post_likes FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'post_likes' AND policyname = 'post_likes_insert_auth') THEN
    CREATE POLICY post_likes_insert_auth ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Shares
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'shares' AND policyname = 'shares_public_select') THEN
    CREATE POLICY shares_public_select ON public.shares FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'shares' AND policyname = 'shares_insert_auth') THEN
    CREATE POLICY shares_insert_auth ON public.shares FOR INSERT WITH CHECK (auth.uid() = author_id);
  END IF;
END $$;

-- Communities
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'communities' AND policyname = 'communities_public_select') THEN
    CREATE POLICY communities_public_select ON public.communities FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'communities' AND policyname = 'communities_insert_auth') THEN
    CREATE POLICY communities_insert_auth ON public.communities FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'communities' AND policyname = 'communities_update_auth') THEN
    CREATE POLICY communities_update_auth ON public.communities FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- Follows
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'follows' AND policyname = 'follows_owner_select') THEN
    CREATE POLICY follows_owner_select ON public.follows FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'follows' AND policyname = 'follows_insert_auth') THEN
    CREATE POLICY follows_insert_auth ON public.follows FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'follows' AND policyname = 'follows_delete_owner') THEN
    CREATE POLICY follows_delete_owner ON public.follows FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Market items
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'market_items' AND policyname = 'market_items_public_select') THEN
    CREATE POLICY market_items_public_select ON public.market_items FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'market_items' AND policyname = 'market_items_insert_auth') THEN
    CREATE POLICY market_items_insert_auth ON public.market_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- Orders
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'orders_public_select') THEN
    CREATE POLICY orders_public_select ON public.orders FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'orders_insert_auth') THEN
    CREATE POLICY orders_insert_auth ON public.orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- Farms
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'farms' AND policyname = 'farms_public_select') THEN
    CREATE POLICY farms_public_select ON public.farms FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'farms' AND policyname = 'farms_insert_auth') THEN
    CREATE POLICY farms_insert_auth ON public.farms FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- Conversations
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'conversations' AND policyname = 'conversations_participant_select') THEN
    CREATE POLICY conversations_participant_select ON public.conversations FOR SELECT USING (auth.uid() = any(participant_ids));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'conversations' AND policyname = 'conversations_insert_auth') THEN
    CREATE POLICY conversations_insert_auth ON public.conversations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'conversations' AND policyname = 'conversations_update_auth') THEN
    CREATE POLICY conversations_update_auth ON public.conversations FOR UPDATE USING (auth.uid() = any(participant_ids)) WITH CHECK (auth.uid() = any(participant_ids));
  END IF;
END $$;

-- Messages
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'messages_public_select') THEN
    CREATE POLICY messages_public_select ON public.messages FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'messages_insert_auth') THEN
    CREATE POLICY messages_insert_auth ON public.messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- =========================================================
-- Cleanup of previously injected sample data
-- =========================================================
-- Remove the earlier sample rows from any database that was
-- populated during setup/testing so only real live content remains.
delete from public.communities
where lower(trim(name)) in ('farmers circle', 'agri jobs', 'research lab');

delete from public.market_items
where lower(trim(name)) in ('organic compost', 'irrigation pump');

delete from public.farms
where lower(trim(name)) in ('sunrise maize farm', 'riverbank vegetable hub');

-- =========================================================
-- No seed data
-- =========================================================
-- The database is intentionally left empty for live user data.
-- Communities, market items, farms, posts, and other content
-- should be created through real app interactions only.
