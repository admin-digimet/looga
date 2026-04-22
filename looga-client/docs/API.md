# Documentation API — Looga Backend

> Document à transmettre au développeur backend Laravel.
> Toutes les réponses doivent être en JSON. Toutes les routes authentifiées requièrent un header `Authorization: Bearer {token}`.

---

## Informations générales

| Propriété | Valeur |
|-----------|--------|
| Base URL | `https://api.looga.ci/api/v1` |
| Auth | Laravel Sanctum (tokens Bearer) |
| Format | JSON (`Content-Type: application/json`) |
| Encodage | UTF-8 |
| Langue des messages d'erreur | Français |

---

## Format des réponses d'erreur

L'app gère ces codes HTTP de façon spécifique :

```json
// 401 — Non authentifié → l'app redirige automatiquement vers le login
{ "message": "Unauthenticated." }

// 422 — Erreur de validation → affichée sous chaque champ
{
  "message": "Les données fournies sont invalides.",
  "errors": {
    "phone": ["Le numéro de téléphone est requis."],
    "password": ["Le mot de passe doit contenir au moins 8 caractères."]
  }
}

// 500 → affiche "Une erreur est survenue, réessaie."
// Pas de réseau → affiche "Vérifie ta connexion internet."
```

---

## 1. Authentification

### POST /auth/register

Inscription d'un nouvel utilisateur.

**Accès :** Public

**Corps de la requête :**
```json
{
  "name": "Koné Amadou",
  "phone": "0700000000",
  "password": "motdepasse123",
  "password_confirmation": "motdepasse123"
}
```

**Réponse 201 :**
```json
{
  "token": "1|aBcDeFgHiJkLmNoP...",
  "user": {
    "id": "usr-001",
    "name": "Koné Amadou",
    "phone": "0700000000",
    "email": null,
    "avatar": null,
    "createdAt": "2026-03-06T10:00:00.000Z"
  }
}
```

**Erreurs possibles :** 422 (phone déjà pris, password trop court, confirmation non correspondante)

---

### POST /auth/login

Connexion d'un utilisateur existant.

**Accès :** Public

**Corps de la requête :**
```json
{
  "phone": "0700000000",
  "password": "motdepasse123"
}
```

**Réponse 200 :**
```json
{
  "token": "2|xYzAbCdEfGhI...",
  "user": {
    "id": "usr-001",
    "name": "Koné Amadou",
    "phone": "0700000000",
    "email": null,
    "avatar": null,
    "createdAt": "2026-03-01T09:00:00.000Z"
  }
}
```

**Erreurs possibles :** 422 (identifiants incorrects)

---

### POST /auth/logout

Déconnexion — invalide le token côté serveur.

**Accès :** Authentifié

**Corps :** Aucun

**Réponse 200 :**
```json
{ "message": "Déconnecté avec succès." }
```

---

## 2. Événements

### GET /events

Liste paginée des événements publiés.

**Accès :** Public

**Paramètres query :**
| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `page` | integer | Non (défaut: 1) | Numéro de page |
| `category` | string | Non | Filtrer par catégorie : `concerts`, `soirees`, `culture`, `sports`, `workshops` |

**Exemple :** `GET /events?page=1&category=concerts`

**Réponse 200 :**
```json
{
  "data": [
    {
      "id": "evt-001",
      "name": "Nuit Afrobeat — Cocody Fest",
      "description": "La plus grande nuit afrobeat d'Abidjan...",
      "category": "concerts",
      "date": "2026-03-20",
      "time": "21h30",
      "location": "Salle des fêtes de Cocody, Abidjan",
      "image": "https://storage.supabase.co/looga/events/evt-001.jpg",
      "organizerName": "Looga Events",
      "isSoldOut": false,
      "minPrice": 5000,
      "ticketTypes": [
        {
          "id": "tt-001-std",
          "name": "Standard",
          "description": "Accès général à la salle",
          "price": 5000,
          "advantages": null,
          "stock": 200,
          "soldOut": false
        },
        {
          "id": "tt-001-vip",
          "name": "VIP",
          "description": "Zone VIP avec accès bar et lounge",
          "price": 15000,
          "advantages": "Boisson offerte à l'entrée",
          "stock": 50,
          "soldOut": false
        }
      ],
      "artists": [
        {
          "id": "art-001",
          "name": "DJ Arafat Jr",
          "image": "https://storage.supabase.co/looga/artists/art-001.jpg"
        }
      ]
    }
  ],
  "nextPage": 2,
  "total": 47
}
```

> **Important :** `nextPage` doit être `null` s'il n'y a plus de pages suivantes. L'app utilise cette valeur pour le scroll infini.

---

### GET /events/:id

Détail complet d'un événement.

**Accès :** Public

**Réponse 200 :** Même structure qu'un item de la liste ci-dessus (objet `Event` complet).

**Erreurs :** 404 si l'événement n'existe pas ou n'est pas publié.

---

### GET /events/categories

Liste des catégories disponibles.

**Accès :** Public

**Réponse 200 :**
```json
["tout", "concerts", "soirees", "culture", "sports", "workshops"]
```

---

## 3. Tickets

### GET /tickets

Tous les billets de l'utilisateur connecté.

**Accès :** Authentifié

**Réponse 200 :**
```json
[
  {
    "id": "tkt-001",
    "ticketNumber": "LGO-2026-84721",
    "eventId": "evt-001",
    "eventName": "Nuit Afrobeat — Cocody Fest",
    "eventDate": "2026-03-20",
    "eventTime": "21h30",
    "eventLocation": "Salle des fêtes de Cocody, Abidjan",
    "eventImage": "https://storage.supabase.co/looga/events/evt-001.jpg",
    "eventCategory": "concerts",
    "ticketTypeName": "VIP",
    "quantity": 2,
    "totalPrice": 30000,
    "qrCode": "LOOGA-evt-001-1709123456789",
    "status": "valid",
    "purchasedAt": "2026-03-06T14:30:00.000Z"
  }
]
```

---

### GET /tickets/:id

Détail d'un billet spécifique.

**Accès :** Authentifié (doit appartenir à l'utilisateur connecté)

**Réponse 200 :** Même structure qu'un item de la liste ci-dessus.

**Erreurs :** 404 si non trouvé, 403 si ne lui appartient pas.

---

### POST /tickets/purchase

Initier l'achat d'un billet.

**Accès :** Authentifié

**Corps de la requête :**
```json
{
  "eventId": "evt-001",
  "ticketTypeId": "tt-001-vip",
  "quantity": 2,
  "paymentMethod": "mtn_momo",
  "phoneNumber": "0700000000"
}
```

> **Note :** `phoneNumber` est requis uniquement pour `mtn_momo`, `orange_money` et `wave`. Omis pour `card`.

**Valeurs possibles pour `paymentMethod` :**
- `mtn_momo`
- `orange_money`
- `wave`
- `card`

**Réponse 201 — Achat réussi :**
```json
{
  "id": "tkt-002",
  "ticketNumber": "LGO-2026-93847",
  "eventId": "evt-001",
  "eventName": "Nuit Afrobeat — Cocody Fest",
  "eventDate": "2026-03-20",
  "eventTime": "21h30",
  "eventLocation": "Salle des fêtes de Cocody, Abidjan",
  "eventImage": "https://storage.supabase.co/looga/events/evt-001.jpg",
  "eventCategory": "concerts",
  "ticketTypeName": "VIP",
  "quantity": 2,
  "totalPrice": 30000,
  "qrCode": "LOOGA-evt-001-1709123456789",
  "status": "valid",
  "purchasedAt": "2026-03-06T14:35:00.000Z"
}
```

**Erreurs :**
- 422 si stock insuffisant ou données invalides
- 402 si paiement refusé

> **Règle critique :** Ne décrémenter le stock que **après** confirmation du paiement via le webhook KKiaPay. L'app redirige vers les billets dès réception du `201`.

---

## 4. Paiement

### POST /payment/verify

Vérifier la confirmation d'un paiement KKiaPay (webhook ou appel manuel).

**Accès :** Authentifié

**Corps de la requête :**
```json
{
  "transactionId": "kkiapay-txn-abc123",
  "eventId": "evt-001"
}
```

**Réponse 200 :**
```json
{
  "success": true,
  "ticketId": "tkt-002",
  "message": "Paiement confirmé."
}
```

**Réponse 200 (échec) :**
```json
{
  "success": false,
  "ticketId": null,
  "message": "Transaction introuvable ou expirée."
}
```

---

## 5. Utilisateur

### GET /user/profile

Récupérer le profil de l'utilisateur connecté.

**Accès :** Authentifié

**Réponse 200 :**
```json
{
  "id": "usr-001",
  "name": "Koné Amadou",
  "phone": "0700000000",
  "email": null,
  "avatar": null,
  "createdAt": "2026-03-01T09:00:00.000Z"
}
```

---

### PUT /user/profile

Mettre à jour le profil (post-MVP, non encore utilisé dans l'app).

**Accès :** Authentifié

**Corps de la requête :**
```json
{
  "name": "Koné Tchjima",
  "email": "kone@looga.ci"
}
```

**Réponse 200 :** Objet `User` mis à jour.

---

### POST /user/push-token

Enregistrer le token de notification push Expo (non encore utilisé — à implémenter quand les notifications push sont activées).

**Accès :** Authentifié

**Corps de la requête :**
```json
{
  "token": "ExponentPushToken[xxxxxx]",
  "platform": "android"
}
```

**Réponse 200 :**
```json
{ "message": "Token enregistré." }
```

---

## 6. Tableau récapitulatif — Où chaque endpoint est consommé

| Endpoint | Méthode | Fichier frontend | Hook / Fonction |
|----------|---------|-----------------|-----------------|
| `/auth/register` | POST | `src/app/(auth)/register.tsx` | `useRegister()` → `src/lib/api/auth.ts` |
| `/auth/login` | POST | `src/app/(auth)/login.tsx` | `useLogin()` → `src/lib/api/auth.ts` |
| `/auth/logout` | POST | `src/app/(tabs)/profile.tsx` | `useLogout()` → `src/lib/api/auth.ts` |
| `/events` | GET | `src/app/(tabs)/index.tsx` + `explore.tsx` | `useEvents()` → `src/hooks/useEvents.ts` |
| `/events/:id` | GET | `src/app/event/[id].tsx` | `useEvent(id)` → `src/hooks/useEvents.ts` |
| `/events/categories` | GET | `src/app/(tabs)/index.tsx` + `explore.tsx` | `useCategories()` → `src/hooks/useEvents.ts` |
| `/tickets` | GET | `src/app/(tabs)/tickets.tsx` | `useTickets()` → `src/hooks/useTickets.ts` |
| `/tickets/:id` | GET | *(non utilisé directement)* | `useTicket(id)` → `src/hooks/useTickets.ts` |
| `/tickets/purchase` | POST | `src/app/payment/[eventId].tsx` | `purchaseTicket()` → `src/lib/api/tickets.ts` |
| `/payment/verify` | POST | *(non utilisé côté app pour l'instant)* | `verifyPayment()` → `src/lib/api/payment.ts` |
| `/user/profile` | GET | *(non utilisé — données viennent du store)* | `src/lib/api/` (à brancher) |
| `/user/push-token` | POST | *(non utilisé — post-MVP)* | `src/lib/api/` (à brancher) |

---

## 7. Notes importantes pour le backend

### Pagination
L'app utilise `useInfiniteQuery` de React Query. Le format de pagination **doit** être :
```json
{
  "data": [...],
  "nextPage": 2,   // ou null si dernière page
  "total": 47
}
```
Ne pas utiliser un format Laravel standard `links/meta` — l'app attend exactement `data`, `nextPage`, `total`.

### Champ `qrCode` dans les billets
La valeur `qrCode` est stockée en local sur l'appareil (MMKV) pour fonctionner hors connexion. Elle doit :
- Être unique par billet
- Être lisible par l'app de scan (Looga Scan Staff)
- Contenir suffisamment d'informations pour valider le billet sans appel API

Format suggéré : `LOOGA-{eventId}-{ticketId}-{timestamp}`

### `minPrice` dans les événements
L'app affiche "À partir de X FCFA" en bas de la page événement. Le champ `minPrice` doit retourner le **prix le plus bas parmi les types de billets non sold out**.

### `isSoldOut` dans les événements
`true` si **tous** les types de billets ont `soldOut: true` ou `stock: 0`.

### Token Bearer — Durée de vie
L'app gère le 401 automatiquement (redirect login). Il n'y a pas de refresh token côté frontend. Une durée de vie longue (7-30 jours) est recommandée pour éviter les déconnexions fréquentes.
