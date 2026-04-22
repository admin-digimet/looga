# Documentation Codebase — Looga App Utilisateur

> Guide de prise en main complet pour tout développeur rejoignant le projet.

---

## 1. Vue d'ensemble

**Looga** est une app mobile de billetterie digitale pour événements à Abidjan, Côte d'Ivoire.

- **Stack** : Expo SDK 55 / React Native 0.83 — New Architecture activée
- **Routing** : Expo Router v3 (file-based, comme Next.js)
- **State** : Zustand + React Query v5
- **Styling** : NativeWind v4 (Tailwind) + StyleSheet.create pour styles complexes
- **Thème** : Sombre obligatoire — jamais de fond blanc
- **Langue** : Français uniquement
- **Devise** : FCFA

---

## 2. Démarrer le projet

```bash
# Installer les dépendances
npm install

# Lancer en mode dev (mock — sans backend)
npx expo start

# Scanner le QR avec Expo Go sur téléphone Android
# OU appuyer sur 'a' pour émulateur Android

# Vérifier TypeScript
npx tsc --noEmit
```

### Mode Mock (dev sans backend)
Si `EXPO_PUBLIC_API_URL` est **vide** (ou absent), l'app tourne en **mode mock** :
- Les 5 événements ivoiriens sont chargés depuis `src/lib/mock/db.json`
- L'achat de billet simule une réponse après 1.2 secondes
- Pour bypasser le login → bouton **"Dev — Passer l'auth"** visible en bas de l'écran de connexion (uniquement en développement)

### Passer en mode réel
```bash
# .env (créer à la racine, ne jamais commiter)
EXPO_PUBLIC_API_URL=https://api.looga.ci/api/v1
```

---

## 3. Structure du projet

```
src/
├── app/                      # Expo Router — file-based routing
│   ├── _layout.tsx           # Root layout : fonts, QueryClient, auth guard
│   ├── index.tsx             # Écran de splash (redirect auto)
│   ├── (auth)/
│   │   ├── _layout.tsx       # Stack sans header
│   │   ├── login.tsx         # Formulaire connexion
│   │   └── register.tsx      # Formulaire inscription
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Tab bar avec icônes Lucide
│   │   ├── index.tsx         # Home / Feed événements
│   │   ├── explore.tsx       # Recherche + filtres
│   │   ├── tickets.tsx       # Mes billets
│   │   └── profile.tsx       # Profil utilisateur
│   ├── event/
│   │   └── [id].tsx          # Détail d'un événement
│   └── payment/
│       └── [eventId].tsx     # Achat de billet (3 étapes)
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx        # Bouton gradient orange→violet
│   │   └── Input.tsx         # Champ texte avec label + erreur + eye
│   ├── events/
│   │   ├── EventCard.tsx     # Carte compacte (liste verticale)
│   │   ├── FeaturedCard.tsx  # Grande carte 260×180 (scroll horizontal)
│   │   ├── CategoryTabs.tsx  # Onglets de catégorie horizontaux
│   │   └── ArtistCard.tsx    # Carte artiste (scroll horizontal)
│   ├── tickets/
│   │   └── TicketCard.tsx    # Billet design perforé + QR code
│   └── payment/
│       └── PaymentMethodCard.tsx  # Carte méthode paiement (grille 2×2)
│
├── hooks/
│   ├── useAuth.ts            # useLogin, useRegister, useLogout
│   ├── useEvents.ts          # useEvents (infini), useEvent, useCategories
│   └── useTickets.ts         # useTickets, useTicket
│
├── lib/
│   ├── api/
│   │   ├── client.ts         # Instance axios + intercepteurs Bearer + 401
│   │   ├── auth.ts           # login(), register(), logout()
│   │   ├── events.ts         # getEvents(), getEventById(), getCategories()
│   │   ├── tickets.ts        # getTickets(), getTicketById(), purchaseTicket()
│   │   └── payment.ts        # verifyPayment()
│   ├── store/
│   │   ├── authStore.ts      # Zustand : token, user, login(), logout()
│   │   ├── ticketStore.ts    # Zustand + MMKV : billets offline
│   │   └── mmkv.ts           # Instance MMKV (createMMKV)
│   ├── mock/
│   │   ├── index.ts          # mockApi + isMockMode
│   │   └── db.json           # 5 événements ivoiriens de test
│   └── utils/
│       └── formatters.ts     # formatDate(), formatPrice()
│
├── constants/
│   ├── colors.ts             # Tokens couleurs (Colors, Gradient)
│   ├── typography.ts         # Tokens typo (Fonts, FontSize)
│   └── api.ts                # BASE_URL + ENDPOINTS
│
└── types/
    ├── user.ts               # User, AuthResponse
    ├── event.ts              # Event, TicketType, Artist, EventCategory, PaginatedEvents
    └── ticket.ts             # Ticket, LocalTicket, PurchasePayload, PaymentMethod
```

---

## 4. Routing — Protection des routes

Le fichier `src/app/_layout.tsx` est le gardien central :

```
Démarrage app
    ↓
loadToken() — charge le token depuis expo-secure-store
    ↓
isAuthenticated ?
  ├── OUI → router.replace('/(tabs)')      ← accueil
  └── NON → router.replace('/(auth)/login') ← connexion
```

**Règles d'accès :**
| Route | Accès |
|-------|-------|
| `/(auth)/login` | Sans token |
| `/(auth)/register` | Sans token |
| `/(tabs)/*` | Token obligatoire |
| `/event/[id]` | Libre (consultation) |
| `/payment/[eventId]` | Token obligatoire |

---

## 5. Design System

### Couleurs — utiliser TOUJOURS les tokens, jamais de hex en dur

```typescript
import { Colors, Gradient } from '@/constants/colors';

Colors.bg           // '#0D0B12' — fond principal
Colors.surface      // '#161220' — surface cartes
Colors.surface2     // '#1E1830' — surface secondaire
Colors.card         // '#211C35' — fond cartes
Colors.orange       // '#FF5C1A' — couleur primaire
Colors.violet       // '#6B3FA0' — couleur secondaire
Colors.text         // '#F0ECF8' — texte principal
Colors.textMuted    // '#8A82A0' — texte secondaire
Colors.success      // '#00C864'
Colors.warning      // '#FFB800'
Colors.error        // '#FF3B3B'
Colors.border       // 'rgba(255,255,255,0.07)'

Gradient.primary    // ['#FF5C1A', '#6B3FA0'] — boutons principaux
```

### Typographie

```typescript
import { Fonts, FontSize } from '@/constants/typography';

// Syne = titres
Fonts.heading        // 'Syne_700Bold'
Fonts.headingBold    // 'Syne_800ExtraBold'

// DM Sans = corps
Fonts.body           // 'DMSans_400Regular'
Fonts.bodyMedium     // 'DMSans_500Medium'
Fonts.bodySemiBold   // 'DMSans_600SemiBold'

FontSize.xs    // 11
FontSize.sm    // 13
FontSize.base  // 15
FontSize.md    // 17
FontSize.lg    // 20
FontSize.xl    // 24
FontSize.xxl   // 28
FontSize.display // 34
```

### Règles de style
- **Border radius** : 8 (petit), 14 (moyen), 20 (grand), 100 (pill)
- **Spacing** : multiples de 4 → `4, 8, 12, 16, 20, 24, 32, 40, 48`
- **Boutons principaux** : gradient via `expo-linear-gradient`
- **Images** : toujours `expo-image` (jamais `Image` de React Native)
- **Listes verticales** : toujours `FlashList` (@shopify/flash-list)
- **Listes horizontales courtes** : `FlatList` acceptable

### Icônes
Toutes les icônes viennent de `lucide-react-native` :
```typescript
import { Bell, Search, Ticket, ArrowLeft, ... } from 'lucide-react-native';
// Usage : <Bell size={18} color={Colors.textMuted} />
```

---

## 6. Gestion des données

### React Query — règle absolue
Ne jamais appeler axios directement dans un composant. Toujours passer par un hook :

```typescript
// Dans un composant
import { useEvents } from '@/hooks/useEvents';
const { data, isLoading, isError } = useEvents('concerts');

// Pour scroll infini
const { data, fetchNextPage, hasNextPage } = useEvents();
const events = data?.pages.flatMap((p) => p.data) ?? [];
```

### Zustand stores

**authStore** — état d'authentification :
```typescript
import { useAuthStore } from '@/lib/store/authStore';

const { user, isAuthenticated, login, logout, loadToken } = useAuthStore();
// login(token, user) → stocke dans SecureStore + state
// logout() → efface SecureStore + state
// loadToken() → appelé au démarrage dans _layout.tsx
```

**ticketStore** — billets offline-first :
```typescript
import { useTicketStore } from '@/lib/store/ticketStore';

const { tickets, addTicket } = useTicketStore();
// tickets : LocalTicket[] lu depuis MMKV au démarrage
// addTicket(ticket) → ajoute au state + persiste en MMKV
```

### Stockage local
| Données | Outil | Clé |
|---------|-------|-----|
| Token auth | expo-secure-store | `looga_auth_token` |
| Billets (QR offline) | react-native-mmkv | `looga_tickets` |

---

## 7. Appels API

Toutes les fonctions API sont dans `src/lib/api/`. Elles utilisent l'instance axios centralisée avec :
- Header `Authorization: Bearer {token}` automatique
- Timeout 15 secondes
- Sur 401 → logout automatique + redirect login

```typescript
// Exemple d'utilisation directe (dans une mutation)
import { purchaseTicket } from '@/lib/api/tickets';

const mutation = useMutation({
  mutationFn: purchaseTicket,
  onSuccess: (ticket) => { ... },
  onError: (error) => { ... },
});
```

**Gestion des erreurs à respecter dans tous les composants :**
```typescript
// 401 → géré automatiquement par l'intercepteur axios
// 422 → erreurs de validation champ par champ
// Pas de réseau → "Vérifie ta connexion internet."
// 500 → "Une erreur est survenue, réessaie."
```

---

## 8. Ajouter un nouvel écran

1. Créer le fichier dans `src/app/` (Expo Router le détecte automatiquement)
2. Importer `SafeAreaView` depuis `react-native-safe-area-context`
3. Utiliser les tokens `Colors` et `Fonts`
4. Si besoin d'un appel API → créer un hook dans `src/hooks/`
5. Ajouter la route dans `.expo/types/router.d.ts` (pour les types de navigation)

---

## 9. Ajouter un nouveau composant

Conventions à respecter :
- Fichier `PascalCase.tsx` dans le bon sous-dossier de `components/`
- Props typées avec une interface au-dessus du composant
- Styles en bas du fichier avec `StyleSheet.create`
- Aucun emoji, aucune valeur hex en dur
- Exporter en named export (pas default)

---

## 10. Ordre des imports (à respecter)

```typescript
// 1. React / React Native core
import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. Librairies externes
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';

// 3. Navigation
import { router } from 'expo-router';

// 4. Composants internes
import { EventCard } from '@/components/events/EventCard';

// 5. Hooks / stores / utils
import { useEvents } from '@/hooks/useEvents';
import { Colors } from '@/constants/colors';

// 6. Types
import type { Event } from '@/types/event';
```

---

## 11. Commandes utiles

```bash
npx expo start              # Démarrer le serveur dev
npx expo start --clear      # Vider le cache Metro et démarrer
npx tsc --noEmit            # Vérifier TypeScript
npx eslint . --ext .ts,.tsx # Linter

npx expo prebuild           # Générer le code natif (une seule fois)
npx expo run:android        # Lancer sur émulateur/appareil Android
npx expo run:android --variant release  # Build APK release
```

---

## 12. Variables d'environnement

Créer un fichier `.env` à la racine (ne jamais commiter) :

```bash
EXPO_PUBLIC_API_URL=https://api.looga.ci/api/v1
EXPO_PUBLIC_KKIAPAY_PUBLIC_KEY=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Si `EXPO_PUBLIC_API_URL` est vide → mode mock automatique (données locales).

---

## 13. Points d'attention pour les modifications

- **Ne pas modifier** `src/lib/api/client.ts` sans comprendre les intercepteurs
- **Ne pas modifier** `src/app/_layout.tsx` sans tester la protection de routes
- **Ne pas remplacer** FlashList par FlatList sur les listes verticales
- **Ne pas importer** `SafeAreaView` depuis `react-native` (utiliser `react-native-safe-area-context`)
- **Ne pas utiliser** `AsyncStorage` pour des données sensibles
- Pour tester le flux complet sans backend → utiliser le bouton dev sur l'écran login
