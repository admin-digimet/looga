-- ============================================================
-- LOOGA — Bootstrap d'un compte super_admin
-- À exécuter UNE FOIS dans Supabase SQL Editor pour promouvoir
-- un compte existant en super_admin du back-office.
-- ============================================================
--
-- Pré-requis : le compte doit déjà exister dans auth.users
-- (créé via Auth > Users > Invite user dans le Supabase Studio,
-- ou via inscription depuis l'app).
--
-- Remplace 'TON_EMAIL_ADMIN' par ton email réel ci-dessous.
-- ============================================================

DO $$
DECLARE
  target_email text := 'TON_EMAIL_ADMIN';   -- ← À MODIFIER
  target_user_id uuid;
BEGIN
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_email
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Aucun compte trouvé pour l''email %. Crée-le d''abord via Auth > Users > Invite user.', target_email;
  END IF;

  -- S'assurer que le profil existe (le trigger handle_new_user le crée
  -- normalement, mais on sécurise)
  INSERT INTO public.profiles (id, name, role, is_active)
  VALUES (target_user_id, target_email, 'super_admin', true)
  ON CONFLICT (id) DO UPDATE
    SET role = 'super_admin', is_active = true;

  RAISE NOTICE 'Compte % promu en super_admin (id=%)', target_email, target_user_id;
END $$;

-- Vérification :
--   SELECT id, role, is_active FROM profiles WHERE role IN ('admin','super_admin');
