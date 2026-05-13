-- ============================================================
-- LOOGA — Table payout_requests
-- Table des demandes de reversement des organisateurs.
-- À coller dans Supabase SQL Editor (Project > SQL Editor).
-- Idempotent : peut être ré-exécuté sans casser l'existant.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.payout_requests (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id    uuid        NOT NULL REFERENCES public.organizers(id) ON DELETE CASCADE,
  amount          integer     NOT NULL CHECK (amount > 0),
  method          text        NOT NULL CHECK (method IN ('mtn_momo','orange_money','wave','bank_transfer')),
  phone_number    text,
  bank_details    jsonb,
  status          text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','paid','rejected')),
  admin_note      text,
  reviewed_by     uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at     timestamptz,
  paid_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payout_requests_status     ON public.payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_organizer  ON public.payout_requests(organizer_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_created_at ON public.payout_requests(created_at DESC);

ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- Organizer voit/crée/modifie ses propres demandes (status pending uniquement côté update)
DROP POLICY IF EXISTS payouts_organizer_select ON public.payout_requests;
CREATE POLICY payouts_organizer_select ON public.payout_requests
  FOR SELECT USING (
    organizer_id IN (SELECT id FROM public.organizers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS payouts_organizer_insert ON public.payout_requests;
CREATE POLICY payouts_organizer_insert ON public.payout_requests
  FOR INSERT WITH CHECK (
    organizer_id IN (SELECT id FROM public.organizers WHERE user_id = auth.uid())
  );

-- Note : les admins du back-office utilisent le service_role (bypass RLS)
-- donc pas besoin de policy spécifique côté admin.

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_payout_requests_set_updated_at ON public.payout_requests;
CREATE TRIGGER trg_payout_requests_set_updated_at
  BEFORE UPDATE ON public.payout_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Vérification rapide :
--   SELECT * FROM payout_requests LIMIT 1;
--   INSERT INTO payout_requests (organizer_id, amount, method)
--   VALUES ('<organizer_uuid>', 100000, 'mtn_momo');
-- ============================================================
