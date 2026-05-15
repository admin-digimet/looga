# Endpoints API — App Utilisateur Looga

> Liste des endpoints utilisés par l'app mobile utilisateur.
> Backend : **Supabase** (PostgREST direct + quelques Edge Functions). Pas de Laravel.
> Base URL Edge Functions : `${SUPABASE_URL}/functions/v1` (ex : `https://<project>.supabase.co/functions/v1`)
> Base URL PostgREST : `${SUPABASE_URL}/rest/v1`
> Auth : **Supabase Auth** (JWT) — toutes les routes 🔒 requièrent `Authorization: Bearer {access_token}` + header `apikey: SUPABASE_ANON_KEY`

---

## Auth

| # | Méthode | Route | Accès | Description |
|---|---------|-------|-------|-------------|
| 1 | POST | `/auth/register` | Public | Inscription → retourne `{ token, user }` |
| 2 | POST | `/auth/login` | Public | Connexion → retourne `{ token, user }` |
| 3 | POST | `/auth/logout` | 🔒 | Invalide le token |

---

## Événements

| # | Méthode | Route | Accès | Description |
|---|---------|-------|-------|-------------|
| 4 | GET | `/events?page=1&category=concerts` | Public | Liste paginée — format `{ data, nextPage, total }` |
| 5 | GET | `/events/:id` | Public | Détail complet d'un événement |
| 6 | GET | `/events/categories` | Public | Liste des catégories disponibles |

---

## Tickets

| # | Méthode | Route | Accès | Description |
|---|---------|-------|-------|-------------|
| 7 | GET | `/tickets` | 🔒 | Tous les billets de l'utilisateur connecté |
| 8 | GET | `/tickets/:id` | 🔒 | Détail d'un billet |
| 9 | POST | `/tickets/purchase` | 🔒 | Acheter un billet → retourne le billet généré |

---

## Paiement

| # | Méthode | Route | Accès | Description |
|---|---------|-------|-------|-------------|
| 10 | POST | `/payment/verify` | 🔒 | Vérifier confirmation paiement KKiaPay |

---

## Utilisateur

| # | Méthode | Route | Accès | Description |
|---|---------|-------|-------|-------------|
| 11 | GET | `/user/profile` | 🔒 | Récupérer le profil utilisateur |
| 12 | PUT | `/user/profile` | 🔒 | Modifier le profil (post-MVP) |
| 13 | POST | `/user/push-token` | 🔒 | Enregistrer le token Expo Push Notifications |

---

## Points critiques à respecter

- **Pagination** : format `{ data: [...], nextPage: 2, total: 47 }` — `nextPage` vaut `null` sur la dernière page (côté Edge Function). Si appel PostgREST direct, utiliser le header `Prefer: count=exact` et lire `Content-Range`.
- **`/tickets/purchase`** : Edge Function obligatoire (logique serveur stock + paiement). Ne décrémenter le stock qu'**après** confirmation du webhook KKiaPay.
- **`qrCode`** dans la réponse billet : valeur unique lisible par l'app de scan (ex: `LOOGA-{eventId}-{ticketId}`)
- **`minPrice`** dans les événements : prix le plus bas parmi les types non sold out
- **`isSoldOut`** dans les événements : `true` si tous les types de billets sont épuisés
- **Tokens Supabase** : access_token court (~1h) + refresh_token long (30j). L'app refresh automatiquement via `/auth/v1/token?grant_type=refresh_token` sur 401 (voir `lib/api/client.ts`).
- **PostgREST direct possible** pour les ressources read-only (events list, event detail, organizers, ticket_types) — voir `lib/api/events.ts:getEventById` qui fait `SUPABASE_URL/rest/v1/events?id=eq.X&select=*,organizer:organizers(*)`. Permet d'inclure le join sans dépendre d'Edge Function.
- **Langue** : tous les messages d'erreur en français

---

**Total : 13 routes utiles** (mixte Edge Functions + PostgREST direct)
