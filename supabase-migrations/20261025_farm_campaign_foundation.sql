-- Farm campaign foundation: campaign terms, milestone releases, and guarded investment records.

ALTER TABLE public.farm_projects
  ADD COLUMN IF NOT EXISTS return_share_percent numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payout_asset text NOT NULL DEFAULT 'ist',
  ADD COLUMN IF NOT EXISTS risk_disclosure text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS use_of_funds text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS funding_deadline date;

ALTER TABLE public.farm_projects
  DROP CONSTRAINT IF EXISTS farm_projects_status_check;

ALTER TABLE public.farm_projects
  ADD CONSTRAINT farm_projects_status_check
  CHECK (status IN ('draft', 'active', 'funded', 'in_progress', 'completed', 'cancelled', 'archived'));

ALTER TABLE public.farm_projects
  DROP CONSTRAINT IF EXISTS farm_projects_payout_asset_check;

ALTER TABLE public.farm_projects
  ADD CONSTRAINT farm_projects_payout_asset_check
  CHECK (payout_asset IN ('ngn', 'ist'));

ALTER TABLE public.farm_projects
  DROP CONSTRAINT IF EXISTS farm_projects_return_share_percent_check;

ALTER TABLE public.farm_projects
  ADD CONSTRAINT farm_projects_return_share_percent_check
  CHECK (return_share_percent >= 0 AND return_share_percent <= 100) NOT VALID;

ALTER TABLE public.farm_projects
  DROP CONSTRAINT IF EXISTS farm_projects_funding_amount_check;

ALTER TABLE public.farm_projects
  ADD CONSTRAINT farm_projects_funding_amount_check
  CHECK (goal_amount >= 0 AND total_shares >= 0 AND price_per_share >= 0) NOT VALID;

CREATE TABLE IF NOT EXISTS public.farmer_verification_requests (
  id bigserial PRIMARY KEY,
  farmer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certification_type text NOT NULL,
  issuing_authority text NOT NULL,
  registration_number text NOT NULL,
  document_path text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_farmer_verification_one_pending_request
  ON public.farmer_verification_requests(farmer_id)
  WHERE status = 'pending';

ALTER TABLE public.farmer_verification_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS farmer_verification_requests_select_own ON public.farmer_verification_requests;
CREATE POLICY farmer_verification_requests_select_own ON public.farmer_verification_requests
  FOR SELECT USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS farmer_verification_requests_insert_own ON public.farmer_verification_requests;
CREATE POLICY farmer_verification_requests_insert_own ON public.farmer_verification_requests
  FOR INSERT WITH CHECK (auth.uid() = farmer_id AND status = 'pending');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'farmer-verification-documents',
  'farmer-verification-documents',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS farmer_verification_documents_select_own ON storage.objects;
CREATE POLICY farmer_verification_documents_select_own ON storage.objects
  FOR SELECT USING (
    bucket_id = 'farmer-verification-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS farmer_verification_documents_insert_own ON storage.objects;
CREATE POLICY farmer_verification_documents_insert_own ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'farmer-verification-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS farmer_verification_documents_update_own ON storage.objects;
CREATE POLICY farmer_verification_documents_update_own ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'farmer-verification-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  ) WITH CHECK (
    bucket_id = 'farmer-verification-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS farmer_verification_documents_delete_own ON storage.objects;
CREATE POLICY farmer_verification_documents_delete_own ON storage.objects
  FOR DELETE USING (
    bucket_id = 'farmer-verification-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE TABLE IF NOT EXISTS public.farm_project_milestones (
  id bigserial PRIMARY KEY,
  farm_id bigint NOT NULL REFERENCES public.farm_projects(id) ON DELETE CASCADE,
  sequence integer NOT NULL CHECK (sequence > 0),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  release_percent numeric NOT NULL CHECK (release_percent > 0 AND release_percent <= 100),
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'submitted', 'approved', 'released', 'rejected')),
  farmer_update text NOT NULL DEFAULT '',
  evidence_urls text[] NOT NULL DEFAULT '{}',
  reviewer_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  release_tx_hash text,
  released_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (farm_id, sequence)
);

CREATE INDEX IF NOT EXISTS idx_farm_project_milestones_farm_sequence
  ON public.farm_project_milestones(farm_id, sequence);

ALTER TABLE public.farm_project_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS farm_project_milestones_select ON public.farm_project_milestones;
CREATE POLICY farm_project_milestones_select ON public.farm_project_milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.farm_projects fp
      WHERE fp.id = farm_id
        AND (
          fp.owner_id = auth.uid()
          OR (fp.status <> 'draft' AND fp.verification_status = 'verified')
          OR EXISTS (
            SELECT 1
            FROM public.farm_investments fi
            WHERE fi.farm_id = fp.id AND fi.investor_id = auth.uid()
          )
        )
    )
  );

DROP POLICY IF EXISTS farm_project_milestones_insert ON public.farm_project_milestones;
CREATE POLICY farm_project_milestones_insert ON public.farm_project_milestones
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.farm_projects fp
      WHERE fp.id = farm_id AND fp.owner_id = auth.uid() AND fp.status = 'draft'
    )
  );

DROP POLICY IF EXISTS farm_project_milestones_update ON public.farm_project_milestones;
CREATE POLICY farm_project_milestones_update ON public.farm_project_milestones
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.farm_projects fp
      WHERE fp.id = farm_id AND fp.owner_id = auth.uid() AND fp.status IN ('draft', 'active', 'in_progress')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.farm_projects fp
      WHERE fp.id = farm_id AND fp.owner_id = auth.uid() AND fp.status IN ('draft', 'active', 'in_progress')
    )
  );

DROP POLICY IF EXISTS farm_project_milestones_delete ON public.farm_project_milestones;
CREATE POLICY farm_project_milestones_delete ON public.farm_project_milestones
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.farm_projects fp
      WHERE fp.id = farm_id AND fp.owner_id = auth.uid() AND fp.status = 'draft'
    )
  );

CREATE OR REPLACE FUNCTION public.guard_farm_project_milestone_review_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_campaign_status text;
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'planned'
      OR NEW.reviewer_notes IS NOT NULL
      OR NEW.reviewed_by IS NOT NULL
      OR NEW.reviewed_at IS NOT NULL
      OR NEW.release_tx_hash IS NOT NULL
      OR NEW.released_at IS NOT NULL THEN
      RAISE EXCEPTION 'Milestone review and release fields are platform-managed';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.reviewer_notes IS DISTINCT FROM OLD.reviewer_notes
    OR NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by
    OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
    OR NEW.release_tx_hash IS DISTINCT FROM OLD.release_tx_hash
    OR NEW.released_at IS DISTINCT FROM OLD.released_at THEN
    RAISE EXCEPTION 'Milestone review and release fields are platform-managed';
  END IF;

  SELECT status INTO v_campaign_status
  FROM public.farm_projects
  WHERE id = OLD.farm_id AND owner_id = auth.uid();

  IF v_campaign_status = 'draft' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'Draft milestone status is platform-managed';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.farm_id IS DISTINCT FROM OLD.farm_id
    OR NEW.sequence IS DISTINCT FROM OLD.sequence
    OR NEW.title IS DISTINCT FROM OLD.title
    OR NEW.description IS DISTINCT FROM OLD.description
    OR NEW.release_percent IS DISTINCT FROM OLD.release_percent
    OR NEW.due_date IS DISTINCT FROM OLD.due_date THEN
    RAISE EXCEPTION 'Milestone terms cannot be changed after campaign submission';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status AND NOT (
    NEW.status = 'submitted'
    AND OLD.status IN ('planned', 'rejected')
    AND length(trim(NEW.farmer_update)) >= 20
    AND cardinality(NEW.evidence_urls) > 0
  ) THEN
    RAISE EXCEPTION 'Only a documented farmer milestone report may be submitted';
  END IF;

  IF NEW.status <> 'submitted' AND (
    NEW.farmer_update IS DISTINCT FROM OLD.farmer_update
    OR NEW.evidence_urls IS DISTINCT FROM OLD.evidence_urls
  ) THEN
    RAISE EXCEPTION 'Farmer evidence can only be changed when submitting a milestone report';
  END IF;

  IF NEW.status = OLD.status AND OLD.status NOT IN ('planned', 'rejected')
    AND (NEW.farmer_update IS DISTINCT FROM OLD.farmer_update
      OR NEW.evidence_urls IS DISTINCT FROM OLD.evidence_urls) THEN
    RAISE EXCEPTION 'Submitted milestone evidence cannot be edited until review';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS farm_project_milestones_review_fields_guard ON public.farm_project_milestones;
CREATE TRIGGER farm_project_milestones_review_fields_guard
  BEFORE INSERT OR UPDATE ON public.farm_project_milestones
  FOR EACH ROW EXECUTE FUNCTION public.guard_farm_project_milestone_review_fields();

CREATE OR REPLACE FUNCTION public.create_farm_campaign(
  p_campaign jsonb,
  p_milestones jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_farm public.farm_projects%ROWTYPE;
  v_milestone jsonb;
  v_release_total numeric := 0;
  v_sequence integer := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF jsonb_typeof(p_milestones) <> 'array' OR jsonb_array_length(p_milestones) < 1 THEN
    RAISE EXCEPTION 'At least one campaign milestone is required';
  END IF;

  FOR v_milestone IN SELECT value FROM jsonb_array_elements(p_milestones)
  LOOP
    v_sequence := v_sequence + 1;
    v_release_total := v_release_total + (v_milestone->>'release_percent')::numeric;
    IF length(trim(v_milestone->>'title')) = 0
      OR (v_milestone->>'due_date')::date < (p_campaign->>'start_date')::date
      OR (v_milestone->>'due_date')::date > (p_campaign->>'harvest_date')::date THEN
      RAISE EXCEPTION 'Milestones require a title and a due date within the season';
    END IF;
  END LOOP;

  IF v_release_total <> 100 THEN
    RAISE EXCEPTION 'Milestone release percentages must total 100';
  END IF;
  IF (p_campaign->>'goal_amount')::numeric <= 0
    OR (p_campaign->>'total_shares')::integer <= 0
    OR (p_campaign->>'price_per_share')::numeric <= 0
    OR (p_campaign->>'return_share_percent')::numeric <= 0
    OR (p_campaign->>'return_share_percent')::numeric > 100 THEN
    RAISE EXCEPTION 'Campaign funding, units, share price, and proceeds share must be positive and within limits';
  END IF;
  IF (p_campaign->>'funding_deadline')::date >= (p_campaign->>'start_date')::date
    OR (p_campaign->>'harvest_date')::date <= (p_campaign->>'start_date')::date THEN
    RAISE EXCEPTION 'Funding must close before the season starts and harvest must follow the start date';
  END IF;

  INSERT INTO public.farm_projects (
    owner_id, name, description, location, state, lga, crop_type,
    farm_size_hectares, goal_amount, total_shares, price_per_share,
    start_date, harvest_date, timeline_months, expected_roi, project_image,
    return_share_percent, payout_asset, risk_disclosure, use_of_funds,
    funding_deadline, status, verification_status
  ) VALUES (
    auth.uid(),
    trim(p_campaign->>'name'),
    COALESCE(p_campaign->>'description', ''),
    trim(p_campaign->>'location'),
    trim(p_campaign->>'state'),
    trim(p_campaign->>'lga'),
    trim(p_campaign->>'crop_type'),
    (p_campaign->>'farm_size_hectares')::numeric,
    (p_campaign->>'goal_amount')::numeric,
    (p_campaign->>'total_shares')::integer,
    (p_campaign->>'price_per_share')::numeric,
    (p_campaign->>'start_date')::date,
    (p_campaign->>'harvest_date')::date,
    (p_campaign->>'timeline_months')::integer,
    (p_campaign->>'expected_roi')::numeric,
    COALESCE(p_campaign->>'project_image', '🌾'),
    (p_campaign->>'return_share_percent')::numeric,
    p_campaign->>'payout_asset',
    trim(p_campaign->>'risk_disclosure'),
    trim(p_campaign->>'use_of_funds'),
    (p_campaign->>'funding_deadline')::date,
    'draft',
    'pending'
  )
  RETURNING * INTO v_farm;

  v_sequence := 0;
  FOR v_milestone IN SELECT value FROM jsonb_array_elements(p_milestones)
  LOOP
    v_sequence := v_sequence + 1;
    INSERT INTO public.farm_project_milestones (
      farm_id, sequence, title, description, release_percent, due_date
    ) VALUES (
      v_farm.id,
      v_sequence,
      trim(v_milestone->>'title'),
      COALESCE(v_milestone->>'description', ''),
      (v_milestone->>'release_percent')::numeric,
      (v_milestone->>'due_date')::date
    );
  END LOOP;

  RETURN to_jsonb(v_farm);
END;
$$;

REVOKE ALL ON FUNCTION public.create_farm_campaign(jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_farm_campaign(jsonb, jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_draft_farm_campaign(
  p_farm_id bigint,
  p_campaign jsonb,
  p_milestones jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_farm public.farm_projects%ROWTYPE;
  v_milestone jsonb;
  v_release_total numeric := 0;
  v_sequence integer := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF jsonb_typeof(p_milestones) <> 'array' OR jsonb_array_length(p_milestones) < 1 THEN
    RAISE EXCEPTION 'At least one campaign milestone is required';
  END IF;

  FOR v_milestone IN SELECT value FROM jsonb_array_elements(p_milestones)
  LOOP
    v_sequence := v_sequence + 1;
    v_release_total := v_release_total + (v_milestone->>'release_percent')::numeric;
    IF length(trim(v_milestone->>'title')) = 0
      OR (v_milestone->>'due_date')::date < (p_campaign->>'start_date')::date
      OR (v_milestone->>'due_date')::date > (p_campaign->>'harvest_date')::date THEN
      RAISE EXCEPTION 'Milestones require a title and a due date within the season';
    END IF;
  END LOOP;

  IF v_release_total <> 100 THEN
    RAISE EXCEPTION 'Milestone release percentages must total 100';
  END IF;
  IF (p_campaign->>'goal_amount')::numeric <= 0
    OR (p_campaign->>'total_shares')::integer <= 0
    OR (p_campaign->>'price_per_share')::numeric <= 0
    OR (p_campaign->>'return_share_percent')::numeric <= 0
    OR (p_campaign->>'return_share_percent')::numeric > 100 THEN
    RAISE EXCEPTION 'Campaign funding, units, share price, and proceeds share must be positive and within limits';
  END IF;
  IF (p_campaign->>'funding_deadline')::date >= (p_campaign->>'start_date')::date
    OR (p_campaign->>'harvest_date')::date <= (p_campaign->>'start_date')::date THEN
    RAISE EXCEPTION 'Funding must close before the season starts and harvest must follow the start date';
  END IF;

  UPDATE public.farm_projects
  SET name = trim(p_campaign->>'name'),
      description = COALESCE(p_campaign->>'description', ''),
      location = trim(p_campaign->>'location'),
      state = trim(p_campaign->>'state'),
      lga = trim(p_campaign->>'lga'),
      crop_type = trim(p_campaign->>'crop_type'),
      farm_size_hectares = (p_campaign->>'farm_size_hectares')::numeric,
      goal_amount = (p_campaign->>'goal_amount')::numeric,
      total_shares = (p_campaign->>'total_shares')::integer,
      price_per_share = (p_campaign->>'price_per_share')::numeric,
      start_date = (p_campaign->>'start_date')::date,
      harvest_date = (p_campaign->>'harvest_date')::date,
      timeline_months = (p_campaign->>'timeline_months')::integer,
      expected_roi = (p_campaign->>'expected_roi')::numeric,
      return_share_percent = (p_campaign->>'return_share_percent')::numeric,
      payout_asset = p_campaign->>'payout_asset',
      risk_disclosure = trim(p_campaign->>'risk_disclosure'),
      use_of_funds = trim(p_campaign->>'use_of_funds'),
      funding_deadline = (p_campaign->>'funding_deadline')::date,
      updated_at = now()
  WHERE id = p_farm_id
    AND owner_id = auth.uid()
    AND status = 'draft'
  RETURNING * INTO v_farm;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Draft campaign not found or no longer editable';
  END IF;

  DELETE FROM public.farm_project_milestones WHERE farm_id = p_farm_id;

  v_sequence := 0;
  FOR v_milestone IN SELECT value FROM jsonb_array_elements(p_milestones)
  LOOP
    v_sequence := v_sequence + 1;
    INSERT INTO public.farm_project_milestones (
      farm_id, sequence, title, description, release_percent, due_date
    ) VALUES (
      v_farm.id,
      v_sequence,
      trim(v_milestone->>'title'),
      COALESCE(v_milestone->>'description', ''),
      (v_milestone->>'release_percent')::numeric,
      (v_milestone->>'due_date')::date
    );
  END LOOP;

  RETURN to_jsonb(v_farm);
END;
$$;

REVOKE ALL ON FUNCTION public.update_draft_farm_campaign(bigint, jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_draft_farm_campaign(bigint, jsonb, jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.guard_farm_project_financial_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.owner_id <> auth.uid()
      OR NEW.status <> 'draft'
      OR NEW.verification_status <> 'pending'
      OR COALESCE(NEW.funded_amount, 0) <> 0
      OR COALESCE(NEW.sold_shares, 0) <> 0
      OR NEW.goal_amount <= 0
      OR NEW.total_shares <= 0
      OR NEW.price_per_share <= 0
      OR NEW.return_share_percent <= 0
      OR NEW.return_share_percent > 100 THEN
      RAISE EXCEPTION 'Campaigns must be created as owner-owned, unverified drafts with zero funding';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.owner_id IS DISTINCT FROM OLD.owner_id
    OR NEW.funded_amount IS DISTINCT FROM OLD.funded_amount
    OR NEW.sold_shares IS DISTINCT FROM OLD.sold_shares
    OR NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
    RAISE EXCEPTION 'Funding and verification fields can only be changed by the platform';
  END IF;

  IF OLD.status <> 'draft' AND (
    NEW.name IS DISTINCT FROM OLD.name
    OR NEW.description IS DISTINCT FROM OLD.description
    OR NEW.location IS DISTINCT FROM OLD.location
    OR NEW.state IS DISTINCT FROM OLD.state
    OR NEW.lga IS DISTINCT FROM OLD.lga
    OR NEW.crop_type IS DISTINCT FROM OLD.crop_type
    OR NEW.farm_size_hectares IS DISTINCT FROM OLD.farm_size_hectares
    OR NEW.goal_amount IS DISTINCT FROM OLD.goal_amount
    OR NEW.total_shares IS DISTINCT FROM OLD.total_shares
    OR NEW.price_per_share IS DISTINCT FROM OLD.price_per_share
    OR NEW.start_date IS DISTINCT FROM OLD.start_date
    OR NEW.harvest_date IS DISTINCT FROM OLD.harvest_date
    OR NEW.timeline_months IS DISTINCT FROM OLD.timeline_months
    OR NEW.expected_roi IS DISTINCT FROM OLD.expected_roi
    OR NEW.return_share_percent IS DISTINCT FROM OLD.return_share_percent
    OR NEW.payout_asset IS DISTINCT FROM OLD.payout_asset
    OR NEW.risk_disclosure IS DISTINCT FROM OLD.risk_disclosure
    OR NEW.use_of_funds IS DISTINCT FROM OLD.use_of_funds
    OR NEW.funding_deadline IS DISTINCT FROM OLD.funding_deadline
  ) THEN
    RAISE EXCEPTION 'Campaign terms cannot be changed after submission';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF OLD.status = 'draft' AND NEW.status = 'active' THEN
      IF NOT EXISTS (
        SELECT 1
        FROM public.farmer_verification_requests fvr
        WHERE fvr.farmer_id = OLD.owner_id
          AND fvr.status = 'approved'
      ) THEN
        RAISE EXCEPTION 'Farmer verification approval is required before campaign review';
      END IF;
    ELSIF NOT (
      (OLD.status = 'active' AND NEW.status = 'archived')
      OR (OLD.status = 'archived' AND NEW.status = 'active')
    ) THEN
      RAISE EXCEPTION 'Campaign status transition requires platform approval';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS farm_projects_financial_fields_guard ON public.farm_projects;
CREATE TRIGGER farm_projects_financial_fields_guard
  BEFORE INSERT OR UPDATE ON public.farm_projects
  FOR EACH ROW EXECUTE FUNCTION public.guard_farm_project_financial_fields();

ALTER TABLE public.farm_investments
  ADD COLUMN IF NOT EXISTS chain_network text,
  ADD COLUMN IF NOT EXISTS wallet_address text,
  ADD COLUMN IF NOT EXISTS transaction_hash text;

ALTER TABLE public.farm_investments
  DROP CONSTRAINT IF EXISTS farm_investments_status_check;

ALTER TABLE public.farm_investments
  ADD CONSTRAINT farm_investments_status_check
  CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'refunded'));

ALTER TABLE public.farm_investments
  DROP CONSTRAINT IF EXISTS farm_investments_transaction_hash_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_farm_investments_transaction_hash
  ON public.farm_investments(transaction_hash)
  WHERE transaction_hash IS NOT NULL;

DROP POLICY IF EXISTS farm_investments_insert ON public.farm_investments;
CREATE POLICY farm_investments_insert ON public.farm_investments
  FOR INSERT WITH CHECK (false);
