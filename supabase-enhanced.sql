-- =========================================================
-- Infinite Sprouts - ENHANCED schema for complete functionality
-- This extends the base schema with tables needed for:
-- - Proper farmer profiles & role management
-- - Farm project creation & management
-- - Tokenization & share ownership
-- - Produce marketplace with proper order workflow
-- - Labor marketplace with contracts
-- - Ratings & verifications
-- =========================================================

-- 1) Enhanced Profiles - add role flags and verification
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role_type text check (role_type in ('investor','farmer','worker','buyer'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified boolean default false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_status text default 'pending' check (kyc_status in ('pending','approved','rejected'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rating numeric default 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS review_count integer default 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state_lga text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_account text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nin text;

-- 2) FARM PROJECTS - proper farm management with all details
CREATE TABLE IF NOT EXISTS public.farm_projects (
  id bigserial primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  icon text default '🌾',
  location text not null,
  state text not null,
  lga text not null,
  crop_type text, -- e.g., Maize, Rice, Cassava, Tomato
  farm_size_hectares numeric,
  
  -- Funding/Investment details
  goal_amount numeric not null, -- Total IST needed
  funded_amount numeric default 0, -- IST raised so far
  total_shares integer not null, -- Total share units
  sold_shares integer default 0, -- Shares sold so far
  price_per_share numeric not null, -- IST per share
  
  -- Timeline & ROI
  start_date date,
  harvest_date date,
  timeline_months integer,
  expected_roi numeric, -- Expected return percentage
  
  -- Status tracking
  status text default 'active' check (status in ('draft','active','funded','in_progress','completed','cancelled')),
  verification_status text default 'pending' check (verification_status in ('pending','verified','rejected')),
  
  -- Images & documents
  project_image text,
  soil_report_url text,
  farming_plan_url text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3) FARM INVESTMENTS - track who owns what shares
CREATE TABLE IF NOT EXISTS public.farm_investments (
  id bigserial primary key,
  farm_id bigint not null references public.farm_projects(id) on delete cascade,
  investor_id uuid not null references auth.users(id) on delete cascade,
  shares_purchased integer not null,
  amount_invested numeric not null,
  certificate_id text unique, -- Digital certificate
  status text default 'active' check (status in ('active','completed','cancelled')),
  created_at timestamptz default now(),
  unique(farm_id, investor_id)
);

-- 4) HARVEST PAYOUTS - when farm completes
CREATE TABLE IF NOT EXISTS public.harvest_payouts (
  id bigserial primary key,
  farm_id bigint not null references public.farm_projects(id) on delete cascade,
  total_harvest_amount numeric, -- Total value of harvest in IST
  payout_date timestamptz,
  status text default 'pending' check (status in ('pending','processing','completed')),
  created_at timestamptz default now()
);

-- 5) HARVEST DISTRIBUTIONS - per investor payout
CREATE TABLE IF NOT EXISTS public.harvest_distributions (
  id bigserial primary key,
  payout_id bigint not null references public.harvest_payouts(id) on delete cascade,
  investment_id bigint not null references public.farm_investments(id) on delete cascade,
  investor_id uuid not null references auth.users(id) on delete cascade,
  amount_due numeric not null,
  amount_paid numeric default 0,
  status text default 'pending' check (status in ('pending','processing','completed')),
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- 6) PRODUCE LISTINGS - farmers list produce for sale
CREATE TABLE IF NOT EXISTS public.produce_listings (
  id bigserial primary key,
  seller_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  produce_type text, -- Maize, Rice, Tomato, etc.
  price_per_unit numeric not null, -- IST
  unit text, -- kg, bag, basket, piece
  quantity_available numeric not null,
  quantity_sold numeric default 0,
  state text not null,
  lga text not null,
  location_details text,
  image_url text,
  certification text, -- Organic, Fair Trade, etc.
  
  -- Delivery options
  can_deliver boolean default false,
  delivery_radius_km integer,
  
  status text default 'active' check (status in ('active','sold_out','archived')),
  listing_date timestamptz default now(),
  expiry_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7) PRODUCE ORDERS - buyer purchases produce
CREATE TABLE IF NOT EXISTS public.produce_orders (
  id bigserial primary key,
  listing_id bigint not null references public.produce_listings(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  quantity_ordered numeric not null,
  unit_price numeric not null,
  total_amount numeric not null,
  
  -- Status workflow
  order_status text default 'pending' check (order_status in ('pending','confirmed','paid','preparing','ready','delivered','cancelled','disputed')),
  payment_status text default 'pending' check (payment_status in ('pending','completed','failed','refunded')),
  
  -- Delivery info
  delivery_address text,
  delivery_date date,
  estimated_delivery date,
  
  -- Ratings
  buyer_rating numeric,
  seller_rating numeric,
  buyer_review text,
  seller_review text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 8) LABOR SERVICES - workers offer services
CREATE TABLE IF NOT EXISTS public.labor_services (
  id bigserial primary key,
  worker_id uuid not null references auth.users(id) on delete cascade,
  service_name text not null,
  description text,
  service_type text, -- Planting, Harvesting, Weeding, etc.
  team_size integer, -- Number of people in team
  daily_rate numeric not null, -- IST per day
  minimum_duration_days integer default 1,
  
  state text not null,
  lga text not null,
  
  -- Skills & verification
  skills text[], -- Array of skill tags
  years_experience integer,
  certifications text,
  is_verified boolean default false,
  
  -- Availability
  available_from date,
  available_to date,
  
  -- Status
  status text default 'active' check (status in ('active','unavailable','archived')),
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 9) LABOR CONTRACTS - farmer hires worker
CREATE TABLE IF NOT EXISTS public.labor_contracts (
  id bigserial primary key,
  service_id bigint not null references public.labor_services(id) on delete cascade,
  farmer_id uuid not null references auth.users(id) on delete cascade,
  worker_id uuid not null references auth.users(id) on delete cascade,
  
  contract_name text,
  description text,
  
  -- Payment terms
  daily_rate numeric not null,
  start_date date not null,
  end_date date not null,
  estimated_days integer,
  total_contract_value numeric,
  
  -- Tracking
  days_completed integer default 0,
  payment_per_day numeric,
  
  -- Status
  status text default 'pending' check (status in ('pending','accepted','in_progress','completed','cancelled','disputed')),
  payment_status text default 'pending' check (payment_status in ('pending','partial','completed')),
  
  -- Ratings
  farmer_rating numeric,
  worker_rating numeric,
  farmer_review text,
  worker_review text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 10) RATINGS & REVIEWS - trust system
CREATE TABLE IF NOT EXISTS public.ratings_reviews (
  id bigserial primary key,
  rater_id uuid not null references auth.users(id) on delete cascade,
  ratee_id uuid not null references auth.users(id) on delete cascade,
  rating numeric not null check (rating >= 1 and rating <= 5),
  review text,
  rating_type text, -- 'farm','produce','labor'
  related_transaction_id bigint, -- Reference to order/contract
  created_at timestamptz default now()
);

-- 11) VERIFICATION REQUESTS
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  verification_type text not null, -- 'seller','farmer','worker','buyer'
  status text default 'pending' check (status in ('pending','approved','rejected')),
  documents text[], -- Array of document URLs
  reviewer_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- =========================================================
-- INDEXES for performance
-- =========================================================
create index if not exists idx_farm_projects_owner_id on public.farm_projects(owner_id);
create index if not exists idx_farm_projects_status on public.farm_projects(status);
create index if not exists idx_farm_projects_state on public.farm_projects(state);
create index if not exists idx_farm_investments_farm_id on public.farm_investments(farm_id);
create index if not exists idx_farm_investments_investor_id on public.farm_investments(investor_id);
create index if not exists idx_produce_listings_seller_id on public.produce_listings(seller_id);
create index if not exists idx_produce_listings_status on public.produce_listings(status);
create index if not exists idx_produce_listings_state on public.produce_listings(state);
create index if not exists idx_produce_orders_buyer_id on public.produce_orders(buyer_id);
create index if not exists idx_produce_orders_seller_id on public.produce_orders(seller_id);
create index if not exists idx_produce_orders_status on public.produce_orders(order_status);
create index if not exists idx_labor_services_worker_id on public.labor_services(worker_id);
create index if not exists idx_labor_services_state on public.labor_services(state);
create index if not exists idx_labor_contracts_farmer_id on public.labor_contracts(farmer_id);
create index if not exists idx_labor_contracts_worker_id on public.labor_contracts(worker_id);
create index if not exists idx_labor_contracts_status on public.labor_contracts(status);
create index if not exists idx_ratings_rater_id on public.ratings_reviews(rater_id);
create index if not exists idx_ratings_ratee_id on public.ratings_reviews(ratee_id);

-- =========================================================
-- RLS POLICIES
-- =========================================================

-- Farm Projects
ALTER TABLE public.farm_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY farm_projects_select ON public.farm_projects FOR SELECT USING (true); -- Anyone can view
CREATE POLICY farm_projects_insert ON public.farm_projects FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY farm_projects_update ON public.farm_projects FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY farm_projects_delete ON public.farm_projects FOR DELETE USING (auth.uid() = owner_id);

-- Farm Investments
ALTER TABLE public.farm_investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY farm_investments_select ON public.farm_investments FOR SELECT USING (auth.uid() = investor_id OR auth.uid() IN (SELECT owner_id FROM public.farm_projects WHERE id = farm_id));
CREATE POLICY farm_investments_insert ON public.farm_investments FOR INSERT WITH CHECK (auth.uid() = investor_id);

-- Produce Listings
ALTER TABLE public.produce_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY produce_listings_select ON public.produce_listings FOR SELECT USING (true);
CREATE POLICY produce_listings_insert ON public.produce_listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY produce_listings_update ON public.produce_listings FOR UPDATE USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

-- Produce Orders
ALTER TABLE public.produce_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY produce_orders_select ON public.produce_orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY produce_orders_insert ON public.produce_orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY produce_orders_update ON public.produce_orders FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id) WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Labor Services
ALTER TABLE public.labor_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY labor_services_select ON public.labor_services FOR SELECT USING (true);
CREATE POLICY labor_services_insert ON public.labor_services FOR INSERT WITH CHECK (auth.uid() = worker_id);
CREATE POLICY labor_services_update ON public.labor_services FOR UPDATE USING (auth.uid() = worker_id) WITH CHECK (auth.uid() = worker_id);

-- Labor Contracts
ALTER TABLE public.labor_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY labor_contracts_select ON public.labor_contracts FOR SELECT USING (auth.uid() = farmer_id OR auth.uid() = worker_id);
CREATE POLICY labor_contracts_insert ON public.labor_contracts FOR INSERT WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY labor_contracts_update ON public.labor_contracts FOR UPDATE USING (auth.uid() = farmer_id OR auth.uid() = worker_id) WITH CHECK (auth.uid() = farmer_id OR auth.uid() = worker_id);

-- Ratings
ALTER TABLE public.ratings_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY ratings_select ON public.ratings_reviews FOR SELECT USING (true);
CREATE POLICY ratings_insert ON public.ratings_reviews FOR INSERT WITH CHECK (auth.uid() = rater_id);

-- Verification
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY verification_select ON public.verification_requests FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT reviewed_by FROM public.verification_requests WHERE id = id));
CREATE POLICY verification_insert ON public.verification_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
