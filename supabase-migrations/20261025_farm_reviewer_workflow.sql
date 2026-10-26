-- Trusted reviewer permissions and audited farmer/campaign approval actions.

ALTER TABLE public.farm_projects
  ALTER COLUMN payout_asset SET DEFAULT 'ist';

CREATE TABLE IF NOT EXISTS public.farm_reviewer_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('reviewer', 'admin')),
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.farm_reviewer_roles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.farm_reviewer_roles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.farm_reviewer_roles TO authenticated;
GRANT ALL ON TABLE public.farm_reviewer_roles TO service_role;

REVOKE UPDATE, DELETE ON TABLE public.farmer_verification_requests FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.guard_farmer_verification_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;
    RETURN NEW;
  END IF;
  IF TG_OP = 'DELETE'
    OR NOT public.has_farm_reviewer_role()
    OR current_setting('app.farmer_verification_review_rpc', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Farmer verification decisions must use the authorized review workflow'
      USING ERRCODE = '42501';
  END IF;
  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.farmer_id IS DISTINCT FROM OLD.farmer_id
    OR NEW.certification_type IS DISTINCT FROM OLD.certification_type
    OR NEW.issuing_authority IS DISTINCT FROM OLD.issuing_authority
    OR NEW.registration_number IS DISTINCT FROM OLD.registration_number
    OR NEW.document_path IS DISTINCT FROM OLD.document_path
    OR NEW.created_at IS DISTINCT FROM OLD.created_at
    OR OLD.status <> 'pending'
    OR NEW.status NOT IN ('approved', 'rejected')
    OR NEW.reviewed_by IS DISTINCT FROM auth.uid()
    OR NEW.reviewed_at IS NULL THEN
    RAISE EXCEPTION 'Invalid farmer verification review update';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS farmer_verification_review_guard ON public.farmer_verification_requests;
CREATE TRIGGER farmer_verification_review_guard
  BEFORE UPDATE OR DELETE ON public.farmer_verification_requests
  FOR EACH ROW EXECUTE FUNCTION public.guard_farmer_verification_review();

DROP POLICY IF EXISTS farm_reviewer_roles_select_own ON public.farm_reviewer_roles;
CREATE POLICY farm_reviewer_roles_select_own ON public.farm_reviewer_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_farm_reviewer_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.farm_reviewer_roles
    WHERE user_id = auth.uid()
      AND role IN ('reviewer', 'admin')
  );
$$;

REVOKE ALL ON FUNCTION public.has_farm_reviewer_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_farm_reviewer_role() TO authenticated;

DROP POLICY IF EXISTS farmer_verification_requests_select_reviewer ON public.farmer_verification_requests;
CREATE POLICY farmer_verification_requests_select_reviewer ON public.farmer_verification_requests
  FOR SELECT USING (public.has_farm_reviewer_role());

DROP POLICY IF EXISTS farmer_verification_documents_select_reviewer ON storage.objects;
CREATE POLICY farmer_verification_documents_select_reviewer ON storage.objects
  FOR SELECT USING (
    bucket_id = 'farmer-verification-documents'
    AND public.has_farm_reviewer_role()
  );

CREATE TABLE IF NOT EXISTS public.farm_campaign_reviews (
  id bigserial PRIMARY KEY,
  farm_id bigint NOT NULL REFERENCES public.farm_projects(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id),
  decision text NOT NULL CHECK (decision IN ('approved', 'rejected')),
  reviewer_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_farm_campaign_reviews_farm_created
  ON public.farm_campaign_reviews(farm_id, created_at DESC);

ALTER TABLE public.farm_campaign_reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.farm_campaign_reviews FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.farm_campaign_reviews TO authenticated;
GRANT ALL ON TABLE public.farm_campaign_reviews TO service_role;

DROP POLICY IF EXISTS farm_campaign_reviews_select_owner_or_reviewer ON public.farm_campaign_reviews;
CREATE POLICY farm_campaign_reviews_select_owner_or_reviewer ON public.farm_campaign_reviews
  FOR SELECT USING (
    public.has_farm_reviewer_role()
    OR EXISTS (
      SELECT 1 FROM public.farm_projects fp
      WHERE fp.id = farm_id AND fp.owner_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.guard_farm_project_financial_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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

  IF public.has_farm_reviewer_role() THEN
    IF current_setting('app.farm_campaign_review_rpc', true) IS DISTINCT FROM 'on' THEN
      RAISE EXCEPTION 'Campaign decisions must use the authorized review workflow'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.owner_id IS DISTINCT FROM OLD.owner_id
      OR NEW.funded_amount IS DISTINCT FROM OLD.funded_amount
      OR NEW.sold_shares IS DISTINCT FROM OLD.sold_shares THEN
      RAISE EXCEPTION 'Reviewers cannot change campaign ownership or funding';
    END IF;

    IF NEW.status IS DISTINCT FROM OLD.status
      AND NOT (OLD.status = 'active' AND NEW.status = 'draft') THEN
      RAISE EXCEPTION 'Invalid reviewer campaign status transition';
    END IF;

    IF NEW.verification_status IS DISTINCT FROM OLD.verification_status
      AND NOT (OLD.verification_status = 'pending' AND NEW.verification_status = 'verified') THEN
      RAISE EXCEPTION 'Invalid reviewer campaign verification transition';
    END IF;

    IF NEW.name IS DISTINCT FROM OLD.name
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
      OR NEW.funding_deadline IS DISTINCT FROM OLD.funding_deadline THEN
      RAISE EXCEPTION 'Reviewers cannot modify submitted campaign terms';
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

CREATE OR REPLACE FUNCTION public.review_farmer_verification(
  p_request_id bigint,
  p_decision text,
  p_reviewer_notes text DEFAULT NULL
)
RETURNS public.farmer_verification_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request public.farmer_verification_requests%ROWTYPE;
BEGIN
  IF NOT public.has_farm_reviewer_role() THEN
    RAISE EXCEPTION 'Farm reviewer access required' USING ERRCODE = '42501';
  END IF;
  IF p_decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Decision must be approved or rejected';
  END IF;
  IF p_decision = 'rejected' AND length(trim(COALESCE(p_reviewer_notes, ''))) < 10 THEN
    RAISE EXCEPTION 'Provide a clear reason of at least 10 characters for rejection';
  END IF;

  SELECT * INTO v_request
  FROM public.farmer_verification_requests
  WHERE id = p_request_id
  FOR UPDATE;
  IF NOT FOUND OR v_request.status <> 'pending' THEN
    RAISE EXCEPTION 'Pending farmer verification request not found';
  END IF;
  IF v_request.farmer_id = auth.uid() THEN
    RAISE EXCEPTION 'Reviewers cannot approve their own farmer certification';
  END IF;

  PERFORM set_config('app.farmer_verification_review_rpc', 'on', true);
  UPDATE public.farmer_verification_requests
  SET status = p_decision,
      reviewer_notes = NULLIF(trim(COALESCE(p_reviewer_notes, '')), ''),
      reviewed_by = auth.uid(),
      reviewed_at = now()
  WHERE id = p_request_id
  RETURNING * INTO v_request;

  RETURN v_request;
END;
$$;

REVOKE ALL ON FUNCTION public.review_farmer_verification(bigint, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_farmer_verification(bigint, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.review_farm_campaign(
  p_farm_id bigint,
  p_decision text,
  p_reviewer_notes text DEFAULT NULL
)
RETURNS public.farm_projects
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm public.farm_projects%ROWTYPE;
BEGIN
  IF NOT public.has_farm_reviewer_role() THEN
    RAISE EXCEPTION 'Farm reviewer access required' USING ERRCODE = '42501';
  END IF;
  IF p_decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Decision must be approved or rejected';
  END IF;
  IF p_decision = 'rejected' AND length(trim(COALESCE(p_reviewer_notes, ''))) < 10 THEN
    RAISE EXCEPTION 'Provide a clear reason of at least 10 characters for rejection';
  END IF;

  SELECT * INTO v_farm
  FROM public.farm_projects
  WHERE id = p_farm_id
  FOR UPDATE;
  IF NOT FOUND OR v_farm.status <> 'active' OR v_farm.verification_status <> 'pending' THEN
    RAISE EXCEPTION 'Pending campaign review not found';
  END IF;
  IF v_farm.owner_id = auth.uid() THEN
    RAISE EXCEPTION 'Reviewers cannot approve their own campaign';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM public.farmer_verification_requests fvr
    WHERE fvr.farmer_id = v_farm.owner_id
      AND fvr.status = 'approved'
  ) THEN
    RAISE EXCEPTION 'Farmer certification must be approved before campaign review';
  END IF;

  IF p_decision = 'approved' THEN
    IF v_farm.goal_amount <= 0
      OR v_farm.total_shares <= 0
      OR v_farm.price_per_share <= 0
      OR v_farm.return_share_percent <= 0
      OR v_farm.return_share_percent > 100
      OR length(trim(COALESCE(v_farm.risk_disclosure, ''))) = 0
      OR length(trim(COALESCE(v_farm.use_of_funds, ''))) = 0
      OR v_farm.funding_deadline IS NULL
      OR v_farm.funding_deadline < CURRENT_DATE
      OR v_farm.funding_deadline >= v_farm.start_date
      OR v_farm.start_date < CURRENT_DATE
      OR v_farm.harvest_date <= v_farm.start_date THEN
      RAISE EXCEPTION 'Campaign terms or investor disclosures are incomplete';
    END IF;
    IF NOT EXISTS (
      SELECT 1
      FROM public.farm_project_milestones m
      WHERE m.farm_id = v_farm.id
    ) OR (
      SELECT COALESCE(sum(m.release_percent), 0)
      FROM public.farm_project_milestones m
      WHERE m.farm_id = v_farm.id
    ) <> 100 THEN
      RAISE EXCEPTION 'Campaign milestone releases must total 100 percent';
    END IF;

    PERFORM set_config('app.farm_campaign_review_rpc', 'on', true);
    UPDATE public.farm_projects
    SET verification_status = 'verified', updated_at = now()
    WHERE id = p_farm_id
    RETURNING * INTO v_farm;
  ELSE
    PERFORM set_config('app.farm_campaign_review_rpc', 'on', true);
    UPDATE public.farm_projects
    SET status = 'draft',
        verification_status = 'pending',
        updated_at = now()
    WHERE id = p_farm_id
    RETURNING * INTO v_farm;
  END IF;

  INSERT INTO public.farm_campaign_reviews (farm_id, reviewer_id, decision, reviewer_notes)
  VALUES (
    p_farm_id,
    auth.uid(),
    p_decision,
    NULLIF(trim(COALESCE(p_reviewer_notes, '')), '')
  );

  RETURN v_farm;
END;
$$;

REVOKE ALL ON FUNCTION public.review_farm_campaign(bigint, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_farm_campaign(bigint, text, text) TO authenticated;

DROP POLICY IF EXISTS farm_projects_select_reviewer ON public.farm_projects;
CREATE POLICY farm_projects_select_reviewer ON public.farm_projects
  FOR SELECT USING (public.has_farm_reviewer_role());

DROP POLICY IF EXISTS farm_project_milestones_select_reviewer ON public.farm_project_milestones;
CREATE POLICY farm_project_milestones_select_reviewer ON public.farm_project_milestones
  FOR SELECT USING (public.has_farm_reviewer_role());
