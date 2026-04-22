# Endpoints API — App Utilisateur Looga

> Liste des endpoints que l'app mobile utilisateur a besoin.
> Base URL : `https://api.looga.ci/api/v1`
> Auth : Laravel Sanctum — toutes les routes marquées 🔒 requièrent `Authorization: Bearer {token}`

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

- **Pagination** : le format doit être `{ data: [...], nextPage: 2, total: 47 }` — `nextPage` vaut `null` sur la dernière page
- **`/tickets/purchase`** : ne décrémenter le stock qu'**après** confirmation du webhook KKiaPay
- **`qrCode`** dans la réponse billet : valeur unique lisible par l'app de scan (ex: `LOOGA-{eventId}-{ticketId}`)
- **`minPrice`** dans les événements : prix le plus bas parmi les types non sold out
- **`isSoldOut`** dans les événements : `true` si tous les types de billets sont épuisés
- **Durée du token** : prévoir 7 à 30 jours (l'app n'a pas de refresh token)
- **Langue** : tous les messages d'erreur en français

---

**Total : 13 endpoints** (10 MVP + 3 post-MVP)
