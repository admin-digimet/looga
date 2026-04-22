# LOOGA DASHBOARD — Plan complet

## Ce qui est déjà codé et fonctionnel

### Dashboard (looga-dashboard) — Next.js 16 + DaisyUI 5
- `proxy.ts` — protection routes (auth Supabase, export `config` correct)
- `lib/supabase/client.ts` + `lib/supabase/server.ts` + `createAdminClient`
- `types/index.ts` — tous les types TypeScript
- `app/(auth)/login/page.tsx` — page login
- `app/(auth)/register/page.tsx` — page inscription
- `app/auth/callback/route.ts` — callback Supabase après vérif email
- `components/layout/Sidebar.tsx` + `TopNav.tsx`
- `app/(dashboard)/layout.tsx` — protection auth + vérif rôle organizer
- `app/(dashboard)/page.tsx` — overview stats + graphique revenus
- `app/(dashboard)/events/page.tsx` — liste événements
- `app/(dashboard)/events/new/page.tsx` — formulaire création
- `app/(dashboard)/events/[id]/page.tsx` — détail + stats + scans
- `app/(dashboard)/events/[id]/edit/page.tsx` — modification
- `app/(dashboard)/team/page.tsx` — gestion scanners
- `components/events/EventForm.tsx` — formulaire complet
- `components/dashboard/StatsCard.tsx` + `RevenueChart.tsx`
- `app/api/events/route.ts` — GET list + POST create
- `app/api/events/[id]/route.ts` — GET + PATCH + DELETE
- `app/api/events/[id]/stats/route.ts` — stats événement
- `app/api/events/[id]/scans/route.ts` — historique scans
- `app/api/team/route.ts` — GET list + POST create scanner
- `app/api/team/[id]/route.ts` — PATCH toggle actif/inactif

### looga-client (Expo RN)
- `.env` créé avec `EXPO_PUBLIC_API_URL` + clés Supabase
- `src/lib/supabase.ts` — client Supabase OTP
- `src/app/(auth)/verify.tsx` — écran OTP 6 chiffres
- `src/hooks/useAuth.ts` — `useRegister` redirige vers `/verify`

---

## Ce qu'il reste à faire

### ÉTAPE 1 — Supabase : créer les tables (OBLIGATOIRE)

Les tables n'existent pas encore → rien ne marche sans ça.

1. Aller sur [supabase.com](https://supabase.com) → projet looga → **SQL Editor**
2. Cliquer **New query**
3. Coller le contenu de `supabase/schema.sql`
4. Cliquer **Run** → doit afficher "Success"
5. Vérifier dans **Table Editor** : `profiles`, `events`, `ticket_types`, `tickets`, `ticket_scans`, `staff_accounts`, `payments`

### ÉTAPE 2 — Supabase Auth : configurer le callback URL

1. Aller dans Supabase → **Authentication → URL Configuration**
2. **Site URL** : `http://localhost:3000`
3. **Redirect URLs** : ajouter `http://localhost:3000/auth/callback`
4. Sauvegarder

> En production : remplacer `localhost:3000` par l'URL de déploiement.

### ÉTAPE 3 — Créer le premier compte organisateur

**Option A — Via le dashboard (recommandé)**
1. Lancer `npm run dev` dans `looga-dashboard/`
2. Aller sur `http://localhost:3000/register`
3. S'inscrire avec un email + mot de passe
4. Vérifier l'email (lien envoyé par Supabase)
5. Dans Supabase → **Table Editor → profiles** : changer `role` de `user` à `organizer`
6. Dans Supabase → **Table Editor → organizers** : insérer une ligne :
   - `user_id` = l'ID du profil créé (copier depuis la colonne `id` de `profiles`)
   - `name` = nom de ton organisation (ex: "Looga Events")
   - Laisser les autres champs vides
7. Se connecter sur `http://localhost:3000/login`

**Option B — Via SQL Editor**
```sql
-- Remplacer 'ton@email.com' et 'Ton Nom Orga' par tes vraies valeurs
-- D'abord créer le compte via /register, puis récupérer l'UUID depuis Authentication → Users

-- Mettre à jour le rôle
update public.profiles set role = 'organizer' where email = 'ton@email.com';

-- Créer l'organisateur
insert into public.organizers (user_id, name)
select id, 'Ton Nom Orga' from public.profiles where email = 'ton@email.com';
```

### ÉTAPE 4 — Tester le flow complet

1. **Dashboard** : créer un événement → statut `published`
2. **looga-client** : lancer `npx expo start` → vérifier que l'événement apparaît
3. **Acheter un billet** depuis l'app → vérifier les revenus sur le dashboard
4. **Scans** : se connecter sur looga-scan + scanner un QR → stats en temps réel

---

## Variables d'environnement

### looga-dashboard/.env.local (déjà configuré)
```
NEXT_PUBLIC_SUPABASE_URL=https://pqecuknwvwgdjjemfyjk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### looga-client/.env (déjà configuré)
```
EXPO_PUBLIC_API_URL=https://pqecuknwvwgdjjemfyjk.supabase.co/functions/v1
EXPO_PUBLIC_SUPABASE_URL=https://pqecuknwvwgdjjemfyjk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## Problèmes connus et solutions

| Problème | Solution |
|---|---|
| Login → redirect infini | Vérifier que la ligne dans `organizers` existe pour ce user |
| "role is not organizer" | Mettre `role = 'organizer'` dans `profiles` ET créer la ligne dans `organizers` |
| Événements ne s'affichent pas sur l'app mobile | Vérifier que le statut est `published` et non `draft` |
| RLS bloque les requêtes serveur | Le `createAdminClient` avec `service_role` bypasse RLS — utilisé côté API routes |
| Tables non créées | Exécuter `supabase/schema.sql` dans Supabase SQL Editor |

---

## Commandes utiles

```bash
# Lancer le dashboard
cd looga-dashboard && npm run dev

# Lancer l'app mobile
cd looga-client && npx expo start

# Vérifier TypeScript
cd looga-dashboard && npx tsc --noEmit
```

---

## Architecture résumée

```
looga-dashboard (Next.js 16)
  → Supabase JS (service_role) pour CRUD events/team
  → Supabase SSR (@supabase/ssr) pour l'auth

looga-client (Expo RN)
  → Edge Functions Supabase pour auth + achat billets
  → Supabase direct pour OTP verify

looga-scan (Expo RN) — hors scope MVP
  → Edge Function /scan/verify pour scanner les QR codes
```
