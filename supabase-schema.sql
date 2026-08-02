-- Supabase schema for Infinite Sprouts
-- Run this in the Supabase SQL editor as a single script.

-- Profiles: connected to Supabase auth users
create table if not exists profiles (
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

-- Wallets: native Naira + IST balances for each user
create table if not exists wallets (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  naira_balance numeric default 0,
  ist_balance numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- Transactions: wallet transaction history
create table if not exists transactions (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('in','out')),
  title text not null,
  sub text,
  amount numeric not null default 0,
  wallet text not null check (wallet in ('naira','ist')),
  created_at timestamptz default now()
);

-- Notifications: user alerts and message notifications
create table if not exists notifications (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text,
  notification_type text,
  read boolean default false,
  created_at timestamptz default now()
);

-- Communities: social groups / discussion hubs
create table if not exists communities (
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

-- Posts: social feed posts
create table if not exists posts (
  id bigserial primary key,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text,
  tags text[],
  community_id bigserial references communities(id),
  image text,
  likes integer default 0,
  shares integer default 0,
  comments integer default 0,
  created_at timestamptz default now()
);

-- Comments: replies on posts
create table if not exists comments (
  id bigserial primary key,
  post_id bigserial not null references posts(id) on delete cascade,
  parent_comment_id bigserial references comments(id),
  author_id uuid not null references auth.users(id) on delete cascade,
  text text,
  likes integer default 0,
  created_at timestamptz default now()
);

-- Follows: user-to-user follow relationships
create table if not exists follows (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, target_user_id)
);

-- Market items: farm marketplace listings
create table if not exists market_items (
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

-- Orders: marketplace purchases
create table if not exists orders (
  id bigserial primary key,
  item_id bigserial not null references market_items(id) on delete cascade,
  quantity integer default 1,
  total numeric default 0,
  wallet text,
  created_at timestamptz default now()
);

-- Farms: investment opportunities
create table if not exists farms (
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

-- Conversations: chat threads
create table if not exists conversations (
  id bigserial primary key,
  participant_ids uuid[] not null,
  name text,
  preview text,
  unread integer default 0,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Messages: chat messages in conversations
create table if not exists messages (
  id bigserial primary key,
  conversation_id bigserial not null references conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  text text,
  created_at timestamptz default now()
);

-- Helpful indexes
create index if not exists idx_transactions_user_id on transactions(user_id);
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_posts_author_id on posts(author_id);
create index if not exists idx_comments_post_id on comments(post_id);
create index if not exists idx_messages_conversation_id on messages(conversation_id);
create index if not exists idx_wallets_user_id on wallets(user_id);

-- Optional: enable row level security and policies for authenticated access.
-- Remove or adjust these policies if your Supabase project does not have RLS enabled by default.
-- Note: PostgreSQL/Supabase does not support CREATE POLICY IF NOT EXISTS, so run this script on a fresh schema or use explicit policy checks.

alter table if exists profiles enable row level security;
create policy "profiles_self_select" on profiles for select using (auth.uid() = id);
create policy "profiles_self_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_self_update" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

alter table if exists wallets enable row level security;
create policy "wallets_owner" on wallets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table if exists transactions enable row level security;
create policy "transactions_owner_select" on transactions for select using (auth.uid() = user_id);
create policy "transactions_owner_insert" on transactions for insert with check (auth.uid() = user_id);

alter table if exists notifications enable row level security;
create policy "notifications_owner_select" on notifications for select using (auth.uid() = user_id);
create policy "notifications_owner_insert" on notifications for insert with check (auth.uid() = user_id);
create policy "notifications_owner_update" on notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table if exists posts enable row level security;
create policy "posts_public_select" on posts for select using (true);
create policy "posts_insert_auth" on posts for insert with check (auth.role() = 'authenticated');

alter table if exists comments enable row level security;
create policy "comments_public_select" on comments for select using (true);
create policy "comments_insert_auth" on comments for insert with check (auth.role() = 'authenticated');

alter table if exists communities enable row level security;
create policy "communities_public_select" on communities for select using (true);
create policy "communities_insert_auth" on communities for insert with check (auth.role() = 'authenticated');
create policy "communities_update_auth" on communities for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

alter table if exists follows enable row level security;
create policy "follows_owner" on follows for select using (auth.uid() = user_id);
create policy "follows_insert_auth" on follows for insert with check (auth.uid() = user_id);
create policy "follows_delete_owner" on follows for delete using (auth.uid() = user_id);

alter table if exists market_items enable row level security;
create policy "market_items_public_select" on market_items for select using (true);
create policy "market_items_insert_auth" on market_items for insert with check (auth.role() = 'authenticated');

alter table if exists orders enable row level security;
create policy "orders_owner" on orders for select using (true);
create policy "orders_insert_auth" on orders for insert with check (auth.role() = 'authenticated');

alter table if exists farms enable row level security;
create policy "farms_public_select" on farms for select using (true);
create policy "farms_insert_auth" on farms for insert with check (auth.role() = 'authenticated');

alter table if exists conversations enable row level security;
create policy "conversations_participant_select" on conversations for select using (auth.uid() = any(participant_ids));
create policy "conversations_insert_auth" on conversations for insert with check (auth.role() = 'authenticated');
create policy "conversations_update_auth" on conversations for update using (auth.uid() = any(participant_ids)) with check (auth.uid() = any(participant_ids));

alter table if exists messages enable row level security;
create policy "messages_conversation_participant_select" on messages for select using (true);
create policy "messages_insert_auth" on messages for insert with check (auth.role() = 'authenticated');

-- End of schema
