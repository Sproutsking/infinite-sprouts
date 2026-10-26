-- Marketplace discovery and labor-contract safeguards.
-- Apply after the enhanced base schema and the 20261025 farm/social migrations.

ALTER TABLE public.produce_listings
  ADD COLUMN IF NOT EXISTS quality_condition text NOT NULL DEFAULT 'unspecified';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS lga text,
  ADD COLUMN IF NOT EXISTS farm_size_hectares numeric,
  ADD COLUMN IF NOT EXISTS crops_grown text;

ALTER TABLE public.produce_listings
  DROP CONSTRAINT IF EXISTS produce_listings_quality_condition_check;

ALTER TABLE public.produce_listings
  ADD CONSTRAINT produce_listings_quality_condition_check
  CHECK (quality_condition IN ('fresh', 'good', 'processing', 'stored', 'unspecified'));

ALTER TABLE public.labor_contracts
  ADD COLUMN IF NOT EXISTS days_reported integer NOT NULL DEFAULT 0
  CHECK (days_reported >= 0);

DROP POLICY IF EXISTS farm_projects_select ON public.farm_projects;
CREATE POLICY farm_projects_select ON public.farm_projects
  FOR SELECT USING (
    owner_id = auth.uid()
    OR (status = 'active' AND verification_status = 'verified')
    OR public.has_farm_reviewer_role()
  );

DROP POLICY IF EXISTS farm_project_milestones_select ON public.farm_project_milestones;
CREATE POLICY farm_project_milestones_select ON public.farm_project_milestones
  FOR SELECT USING (
    public.has_farm_reviewer_role()
    OR EXISTS (
      SELECT 1 FROM public.farm_projects fp
      WHERE fp.id = farm_project_milestones.farm_id
        AND (
          fp.owner_id = auth.uid()
          OR (fp.status <> 'draft' AND fp.verification_status = 'verified')
          OR EXISTS (
            SELECT 1 FROM public.farm_investments fi
            WHERE fi.farm_id = fp.id AND fi.investor_id = auth.uid()
          )
        )
    )
  );

DROP POLICY IF EXISTS farm_projects_delete ON public.farm_projects;
CREATE POLICY farm_projects_delete ON public.farm_projects
  FOR DELETE USING (
    owner_id = auth.uid()
    AND status = 'draft'
    AND NOT EXISTS (
      SELECT 1 FROM public.farm_investments
      WHERE farm_id = farm_projects.id
    )
  );

DROP POLICY IF EXISTS produce_listings_select ON public.produce_listings;
CREATE POLICY produce_listings_select ON public.produce_listings
  FOR SELECT USING (
    seller_id = auth.uid()
    OR (
      status = 'active'
      AND quantity_available > 0
      AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)
    )
  );

DROP POLICY IF EXISTS labor_services_select ON public.labor_services;
CREATE POLICY labor_services_select ON public.labor_services
  FOR SELECT USING (worker_id = auth.uid() OR status = 'active');

-- Client-side order writes can spoof amounts, inventory and payment state.
-- Keep reads available to participants; enable writes only with a verified payment RPC.
DROP POLICY IF EXISTS produce_orders_insert ON public.produce_orders;
DROP POLICY IF EXISTS produce_orders_update ON public.produce_orders;

-- Contract creation and lifecycle changes derive parties, rate and status in
-- these authenticated RPCs rather than accepting client-supplied financial data.
DROP POLICY IF EXISTS labor_contracts_insert ON public.labor_contracts;
DROP POLICY IF EXISTS labor_contracts_update ON public.labor_contracts;

CREATE TABLE IF NOT EXISTS public.farm_project_milestone_reviews (
  id bigserial PRIMARY KEY,
  milestone_id bigint NOT NULL REFERENCES public.farm_project_milestones(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id),
  decision text NOT NULL CHECK (decision IN ('approved', 'rejected')),
  reviewer_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_farm_milestone_reviews_created
  ON public.farm_project_milestone_reviews(milestone_id, created_at DESC);

ALTER TABLE public.farm_project_milestone_reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.farm_project_milestone_reviews FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.farm_project_milestone_reviews TO authenticated;
DROP POLICY IF EXISTS farm_project_milestone_reviews_select ON public.farm_project_milestone_reviews;
CREATE POLICY farm_project_milestone_reviews_select ON public.farm_project_milestone_reviews
  FOR SELECT USING (
    public.has_farm_reviewer_role()
    OR EXISTS (
      SELECT 1 FROM public.farm_project_milestones m
      JOIN public.farm_projects fp ON fp.id = m.farm_id
      WHERE m.id = farm_project_milestone_reviews.milestone_id AND fp.owner_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.guard_farm_project_milestone_review_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_campaign_status text;
  v_campaign_owner uuid;
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

  IF public.has_farm_reviewer_role()
    AND current_setting('app.farm_milestone_review_rpc', true) = 'on' THEN
    IF OLD.status <> 'submitted'
      OR NEW.status NOT IN ('approved', 'rejected')
      OR NEW.reviewed_by IS DISTINCT FROM auth.uid()
      OR NEW.reviewed_at IS NULL
      OR NEW.release_tx_hash IS DISTINCT FROM OLD.release_tx_hash
      OR NEW.released_at IS DISTINCT FROM OLD.released_at
      OR NEW.farm_id IS DISTINCT FROM OLD.farm_id
      OR NEW.sequence IS DISTINCT FROM OLD.sequence
      OR NEW.title IS DISTINCT FROM OLD.title
      OR NEW.description IS DISTINCT FROM OLD.description
      OR NEW.release_percent IS DISTINCT FROM OLD.release_percent
      OR NEW.due_date IS DISTINCT FROM OLD.due_date
      OR NEW.farmer_update IS DISTINCT FROM OLD.farmer_update
      OR NEW.evidence_urls IS DISTINCT FROM OLD.evidence_urls THEN
      RAISE EXCEPTION 'Only submitted milestone evidence may be reviewed';
    END IF;
    IF NEW.status = 'rejected' AND length(trim(COALESCE(NEW.reviewer_notes, ''))) < 10 THEN
      RAISE EXCEPTION 'A rejection reason of at least 10 characters is required';
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

  SELECT status, owner_id INTO v_campaign_status, v_campaign_owner
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
    AND COALESCE(cardinality(NEW.evidence_urls), 0) > 0
    AND v_campaign_owner = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Only a documented farmer milestone report may be submitted';
  END IF;

  IF NEW.status = 'submitted' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF EXISTS (
      SELECT 1
      FROM unnest(NEW.evidence_urls) AS evidence(path)
      WHERE split_part(evidence.path, '/', 1) <> v_campaign_owner::text
        OR split_part(evidence.path, '/', 2) <> 'campaigns'
        OR split_part(evidence.path, '/', 3) <> NEW.farm_id::text
        OR split_part(evidence.path, '/', 4) <> 'milestones'
        OR split_part(evidence.path, '/', 5) <> NEW.id::text
        OR NOT EXISTS (
          SELECT 1 FROM storage.objects o
          WHERE o.bucket_id = 'farmer-verification-documents'
            AND o.name = evidence.path
        )
    ) THEN
      RAISE EXCEPTION 'Milestone evidence must be uploaded to this farmer''s private campaign folder';
    END IF;
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

CREATE OR REPLACE FUNCTION public.review_farm_project_milestone(
  p_milestone_id bigint,
  p_decision text,
  p_reviewer_notes text DEFAULT NULL
)
RETURNS public.farm_project_milestones
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_milestone public.farm_project_milestones%ROWTYPE;
  v_owner_id uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_farm_reviewer_role() THEN
    RAISE EXCEPTION 'You are not authorized to review milestone evidence.';
  END IF;

  IF p_decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Choose approve or reject for this milestone report.';
  END IF;

  IF p_decision = 'rejected' AND length(trim(COALESCE(p_reviewer_notes, ''))) < 10 THEN
    RAISE EXCEPTION 'A rejection reason of at least 10 characters is required.';
  END IF;

  SELECT m.* INTO v_milestone
  FROM public.farm_project_milestones m
  WHERE m.id = p_milestone_id AND m.status = 'submitted'
  FOR UPDATE OF m;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'This milestone report is no longer awaiting review.';
  END IF;

  SELECT owner_id INTO v_owner_id
  FROM public.farm_projects
  WHERE id = v_milestone.farm_id;

  IF COALESCE(cardinality(v_milestone.evidence_urls), 0) = 0 OR EXISTS (
    SELECT 1 FROM unnest(v_milestone.evidence_urls) AS evidence(path)
    WHERE split_part(evidence.path, '/', 1) <> v_owner_id::text
      OR split_part(evidence.path, '/', 2) <> 'campaigns'
      OR split_part(evidence.path, '/', 3) <> v_milestone.farm_id::text
      OR split_part(evidence.path, '/', 4) <> 'milestones'
      OR split_part(evidence.path, '/', 5) <> v_milestone.id::text
      OR NOT EXISTS (
        SELECT 1 FROM storage.objects o
        WHERE o.bucket_id = 'farmer-verification-documents'
          AND o.name = evidence.path
      )
  ) THEN
    RAISE EXCEPTION 'Milestone evidence is missing or outside the farmer''s private campaign folder.';
  END IF;

  PERFORM set_config('app.farm_milestone_review_rpc', 'on', true);
  UPDATE public.farm_project_milestones
  SET status = p_decision,
      reviewer_notes = NULLIF(trim(COALESCE(p_reviewer_notes, '')), ''),
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      updated_at = now()
  WHERE id = p_milestone_id
  RETURNING * INTO v_milestone;

  INSERT INTO public.farm_project_milestone_reviews (milestone_id, reviewer_id, decision, reviewer_notes)
  VALUES (p_milestone_id, auth.uid(), p_decision, NULLIF(trim(COALESCE(p_reviewer_notes, '')), ''));

  RETURN v_milestone;
END;
$$;

CREATE OR REPLACE FUNCTION public.request_labor_contract(
  p_service_id bigint,
  p_start_date date,
  p_end_date date,
  p_contract_name text DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS public.labor_contracts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_service public.labor_services%ROWTYPE;
  v_days integer;
  v_contract public.labor_contracts%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Sign in before requesting a labor service.';
  END IF;

  IF p_start_date IS NULL OR p_end_date IS NULL OR p_end_date < p_start_date THEN
    RAISE EXCEPTION 'Choose a valid labor schedule.';
  END IF;

  IF p_start_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'The requested start date cannot be in the past.';
  END IF;

  SELECT * INTO v_service
  FROM public.labor_services
  WHERE id = p_service_id AND status = 'active'
  FOR SHARE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'This labor service is no longer available.';
  END IF;

  IF v_service.worker_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot request your own labor service.';
  END IF;

  v_days := p_end_date - p_start_date + 1;
  IF v_days < COALESCE(v_service.minimum_duration_days, 1) THEN
    RAISE EXCEPTION 'The requested schedule is shorter than this service''s minimum duration.';
  END IF;

  IF (v_service.available_from IS NOT NULL AND p_start_date < v_service.available_from)
     OR (v_service.available_to IS NOT NULL AND p_end_date > v_service.available_to) THEN
    RAISE EXCEPTION 'The requested dates are outside this worker''s listed availability.';
  END IF;

  INSERT INTO public.labor_contracts (
    service_id, farmer_id, worker_id, contract_name, description,
    daily_rate, start_date, end_date, estimated_days,
    total_contract_value, payment_per_day, status, payment_status
  )
  VALUES (
    v_service.id, auth.uid(), v_service.worker_id,
    COALESCE(NULLIF(BTRIM(p_contract_name), ''), v_service.service_name),
    NULLIF(BTRIM(p_description), ''),
    v_service.daily_rate, p_start_date, p_end_date, v_days,
    v_service.daily_rate * v_days, v_service.daily_rate, 'pending', 'pending'
  )
  RETURNING * INTO v_contract;

  RETURN v_contract;
END;
$$;

CREATE OR REPLACE FUNCTION public.respond_to_labor_contract(
  p_contract_id bigint,
  p_decision text
)
RETURNS public.labor_contracts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_contract public.labor_contracts%ROWTYPE;
  v_next_status text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Sign in to update a labor request.';
  END IF;

  SELECT * INTO v_contract
  FROM public.labor_contracts
  WHERE id = p_contract_id
  FOR UPDATE;

  IF NOT FOUND OR v_contract.status <> 'pending' THEN
    RAISE EXCEPTION 'This labor request is no longer pending.';
  END IF;

  IF p_decision = 'accept' AND auth.uid() = v_contract.worker_id THEN
    v_next_status := 'accepted';
  ELSIF p_decision = 'decline' AND auth.uid() = v_contract.worker_id THEN
    v_next_status := 'cancelled';
  ELSIF p_decision = 'cancel' AND auth.uid() = v_contract.farmer_id THEN
    v_next_status := 'cancelled';
  ELSE
    RAISE EXCEPTION 'You are not permitted to make that decision.';
  END IF;

  UPDATE public.labor_contracts
  SET status = v_next_status, updated_at = now()
  WHERE id = p_contract_id
  RETURNING * INTO v_contract;

  RETURN v_contract;
END;
$$;

CREATE OR REPLACE FUNCTION public.report_labor_workdays(
  p_contract_id bigint,
  p_days_reported integer
)
RETURNS public.labor_contracts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_contract public.labor_contracts%ROWTYPE;
  v_next_status text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Sign in to report completed work.';
  END IF;

  SELECT * INTO v_contract
  FROM public.labor_contracts
  WHERE id = p_contract_id
  FOR UPDATE;

  IF NOT FOUND OR auth.uid() <> v_contract.worker_id THEN
    RAISE EXCEPTION 'Only the assigned worker can report completed days.';
  END IF;

  IF v_contract.status NOT IN ('accepted', 'in_progress')
     OR p_days_reported IS NULL
     OR p_days_reported <> v_contract.days_reported + 1
     OR p_days_reported > v_contract.estimated_days THEN
    RAISE EXCEPTION 'The reported workday count is invalid for this contract.';
  END IF;

  v_next_status := 'in_progress';
  UPDATE public.labor_contracts
  SET days_reported = p_days_reported,
      status = v_next_status,
      updated_at = now()
  WHERE id = p_contract_id
  RETURNING * INTO v_contract;

  RETURN v_contract;
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_labor_workdays(
  p_contract_id bigint,
  p_days_completed integer
)
RETURNS public.labor_contracts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_contract public.labor_contracts%ROWTYPE;
  v_next_status text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Sign in to confirm completed work.';
  END IF;

  SELECT * INTO v_contract
  FROM public.labor_contracts
  WHERE id = p_contract_id
  FOR UPDATE;

  IF NOT FOUND OR auth.uid() <> v_contract.farmer_id THEN
    RAISE EXCEPTION 'Only the hiring farmer can confirm reported workdays.';
  END IF;

  IF v_contract.status NOT IN ('accepted', 'in_progress')
     OR p_days_completed IS NULL
     OR p_days_completed <> v_contract.days_completed + 1
     OR p_days_completed > v_contract.days_reported
     OR p_days_completed > v_contract.estimated_days THEN
    RAISE EXCEPTION 'There is no matching unconfirmed workday to approve.';
  END IF;

  v_next_status := CASE
    WHEN p_days_completed = v_contract.estimated_days THEN 'completed'
    ELSE 'in_progress'
  END;

  UPDATE public.labor_contracts
  SET days_completed = p_days_completed,
      status = v_next_status,
      updated_at = now()
  WHERE id = p_contract_id
  RETURNING * INTO v_contract;

  RETURN v_contract;
END;
$$;

CREATE OR REPLACE FUNCTION public.rate_labor_contract(
  p_contract_id bigint,
  p_rating numeric,
  p_review text DEFAULT NULL
)
RETURNS public.labor_contracts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_contract public.labor_contracts%ROWTYPE;
  v_ratee uuid;
  v_average numeric;
  v_review_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Sign in to rate a completed labor contract.';
  END IF;

  IF p_rating IS NULL OR p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'A rating must be between 1 and 5.';
  END IF;

  SELECT * INTO v_contract
  FROM public.labor_contracts
  WHERE id = p_contract_id
  FOR UPDATE;

  IF NOT FOUND OR v_contract.status <> 'completed' THEN
    RAISE EXCEPTION 'Only completed labor contracts can be rated.';
  END IF;

  IF auth.uid() = v_contract.farmer_id THEN
    IF v_contract.farmer_rating IS NOT NULL THEN
      RAISE EXCEPTION 'You have already rated this contract.';
    END IF;
    v_contract.farmer_rating := p_rating;
    v_contract.farmer_review := NULLIF(BTRIM(p_review), '');
    v_ratee := v_contract.worker_id;
    UPDATE public.labor_contracts
    SET farmer_rating = p_rating, farmer_review = NULLIF(BTRIM(p_review), ''), updated_at = now()
    WHERE id = p_contract_id
    RETURNING * INTO v_contract;
    SELECT AVG(farmer_rating), COUNT(*) INTO v_average, v_review_count
    FROM public.labor_contracts
    WHERE worker_id = v_ratee AND farmer_rating IS NOT NULL;
  ELSIF auth.uid() = v_contract.worker_id THEN
    IF v_contract.worker_rating IS NOT NULL THEN
      RAISE EXCEPTION 'You have already rated this contract.';
    END IF;
    v_ratee := v_contract.farmer_id;
    UPDATE public.labor_contracts
    SET worker_rating = p_rating, worker_review = NULLIF(BTRIM(p_review), ''), updated_at = now()
    WHERE id = p_contract_id
    RETURNING * INTO v_contract;
    SELECT AVG(worker_rating), COUNT(*) INTO v_average, v_review_count
    FROM public.labor_contracts
    WHERE farmer_id = v_ratee AND worker_rating IS NOT NULL;
  ELSE
    RAISE EXCEPTION 'Only a contract participant can submit a rating.';
  END IF;

  UPDATE public.profiles
  SET rating = ROUND(v_average, 1), review_count = v_review_count
  WHERE id = v_ratee;

  RETURN v_contract;
END;
$$;

REVOKE ALL ON FUNCTION public.request_labor_contract(bigint, date, date, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.respond_to_labor_contract(bigint, text) FROM PUBLIC, anon;
DROP FUNCTION IF EXISTS public.report_labor_days_completed(bigint, integer);
REVOKE ALL ON FUNCTION public.report_labor_workdays(bigint, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.confirm_labor_workdays(bigint, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rate_labor_contract(bigint, numeric, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_labor_contract(bigint, date, date, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_to_labor_contract(bigint, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_labor_workdays(bigint, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_labor_workdays(bigint, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rate_labor_contract(bigint, numeric, text) TO authenticated;
REVOKE ALL ON FUNCTION public.review_farm_project_milestone(bigint, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_farm_project_milestone(bigint, text, text) TO authenticated;
