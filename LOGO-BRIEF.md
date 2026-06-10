# 🎨 Brief Logo Looga — Ce qu'il nous faut pour intégrer la marque

> **À l'attention du propriétaire / designer.**
> Ce document explique **exactement** quels fichiers fournir pour que le logo Looga
> s'affiche correctement partout : sites web, applications mobiles, onglet du navigateur,
> écran d'accueil du téléphone, aperçus de partage WhatsApp/Facebook, etc.
>
> ⚠️ **Important** : envoyer 2 simples PNG ne suffit pas. Voici pourquoi, et ce qu'il faut à la place.

---

## 1. Pourquoi 2 PNG ne suffisent pas

Le logo Looga ne s'affiche pas à un seul endroit. Il apparaît dans **au moins 8 contextes différents**, et chacun a ses propres règles techniques imposées par Apple, Google et les navigateurs :

| Où le logo apparaît | Contrainte imposée |
|---|---|
| 🌐 Onglet du navigateur (favicon) | Doit rester net à **16 pixels** (minuscule) |
| 📱 Écran d'accueil iPhone | iOS **interdit la transparence** → fond plein obligatoire |
| 🤖 Écran d'accueil Android | L'icône est **rognée** en rond / carré / goutte selon le téléphone |
| 🚀 Écran de lancement (splash) | Fond transparent, centré |
| 💬 Partage d'un lien (WhatsApp, Facebook) | Format paysage **1200×630** imposé |
| 🌓 Mode clair ET sombre | L'app user est **sombre**, le web est **crème** |
| 🖥️ En-tête des sites | Logo **horizontal** avec le texte |
| 🎨 Thème Android 13+ | Version **monochrome** (une seule couleur) |

👉 **Conclusion** : il nous faut un petit **kit de fichiers sources** (de préférence vectoriels), pas 2 images figées. Avec les bons fichiers sources, **nous générons nous-mêmes** toutes les déclinaisons.

---

## 2. Les fichiers sources à fournir (le minimum vital)

Si possible, fournis les logos en **SVG** (format vectoriel = net à n'importe quelle taille, c'est le plus important). À défaut, des **PNG en très haute résolution** (au moins 2000 px de large).

| # | Fichier | Format idéal | Taille | Fond | À quoi ça sert |
|---|---------|--------------|--------|------|----------------|
| 1 | **Logo horizontal complet** (symbole + texte « looga ») | SVG + PNG | vectoriel / 2000px+ | **transparent** | En-têtes des sites, navbar, pages de connexion |
| 2 | **Symbole seul** (l'icône sans le texte) | SVG + PNG | vectoriel / 1024px+ | **transparent** | Favicon, icône d'application |
| 3 | **Icône d'app** (le symbole sur un fond) | PNG | **1024×1024** | **plein** (pas transparent) | Icône sur l'écran d'accueil iPhone/Android |
| 4 | **Symbole pour Android** | PNG | **1024×1024** | **transparent**, sujet bien centré | Icône adaptive Android (rognée) |
| 5 | **Version monochrome** (1 seule couleur, ex. blanc) | SVG + PNG | vectoriel / 1024px | transparent | Thème dynamique Android 13+ |

---

## 3. Spécifications détaillées par usage

### 🌐 Favicon — l'icône dans l'onglet du navigateur (3 sites web)

- **SVG** (idéal) : reste parfaitement net à toutes les tailles.
- **PNG de secours** : 16×16, 32×32, 48×48 px (pour les vieux navigateurs / Safari).
- **apple-touch-icon** : 180×180 px PNG, avec **~20 px de marge** autour du symbole et un fond coloré (pas transparent), pour l'ajout aux favoris sur iPhone.
- 💡 Le symbole doit rester **reconnaissable à 16 px**. Si le logo a des détails fins ou du texte minuscule, il deviendra illisible. Prévoir une version **simplifiée** pour les petites tailles.

### 📱 Icône d'application mobile (app utilisateur + app scan)

- **1024×1024 px PNG, fond PLEIN** (couleur unie ou dégradé).
  - ⚠️ **Apple refuse la transparence** : un fond transparent donnera un carré noir moche sur l'iPhone.
- **Splash screen** (écran de lancement) : 1024×1024 px PNG, **fond transparent**, symbole centré.
- **Icône Android « adaptive »** :
  - Image *foreground* (premier plan) : 1024×1024 px, **fond transparent**.
  - ⚠️ Les bords sont **rognés** selon la forme choisie par le téléphone (rond, carré arrondi, goutte…). Il faut donc garder **tout l'élément important dans la zone centrale de sécurité** (un carré de ~528×528 px au centre, soit les 66 % du milieu). Tout ce qui dépasse peut être coupé.
- **Version monochrome** : pour le thème dynamique Android 13+ (l'icône prend la couleur du fond d'écran de l'utilisateur).

### 💬 Image de partage social (Open Graph)

- **1200×630 px** (ratio 1.91:1), PNG ou JPG.
- C'est la **grande image d'aperçu** qui apparaît quand quelqu'un partage un lien Looga sur WhatsApp, Facebook, LinkedIn, Discord, etc.
- Idéalement : le logo + un fond aux couleurs de la marque + éventuellement un slogan.

---

## 4. Règles de design à respecter (transverses)

✅ **Lisibilité en tout petit** — le symbole doit être clair même à 16 px (onglet navigateur). Éviter les détails fins.

✅ **Deux fonds** — fournir une version qui marche sur **fond clair** et sur **fond sombre** :
- App mobile utilisateur : fond **sombre** `#0D0B12`
- Sites web + app scan : fond **crème** `#EDEAE4`

✅ **Zone de sécurité** — pour toutes les icônes, garder le sujet **loin des bords** (ils peuvent être rognés).

✅ **Couleurs officielles de la marque** :
- 🟠 Orange : `#FF5C1A`
- 🟣 Violet : `#6B3FA0`
- 🌈 Dégradé principal : orange → violet (`#FF5C1A` → `#6B3FA0`)

✅ **Nommage clair** des fichiers (ex. `looga-logo-horizontal.svg`, `looga-symbole.svg`, `looga-icon-app-1024.png`…).

---

## 5. ✅ Checklist à livrer

Coche au fur et à mesure :

- [ ] **Logo horizontal complet** — SVG + PNG transparent haute résolution
- [ ] **Symbole seul** (sans texte) — SVG + PNG transparent
- [ ] **Icône app 1024×1024** — fond plein, **versions claire + sombre**
- [ ] **Symbole Android** 1024×1024 — fond transparent, sujet centré (zone de sécurité)
- [ ] **Version monochrome** — SVG ou PNG transparent
- [ ] **Image de partage social** 1200×630
- [ ] Tous les fichiers **nommés clairement** et en **haute résolution**

> 💡 **Le plus simple pour toi** : si tu nous donnes le **logo horizontal en SVG** + le **symbole seul en SVG** + une **icône 1024×1024 fond plein**, on peut générer presque tout le reste nous-mêmes. Le SVG est la clé.

---

## 6. Annexe technique — où le logo sera intégré (pour information)

Aujourd'hui, le mot « looga » est écrit **en texte stylé** un peu partout, et les icônes sont des **placeholders par défaut** (l'icône grise de Vercel). Voici l'ampleur de ce qui change une fois les bons fichiers reçus :

**Sites web (3 applications)**
- Site utilisateur (`looga-ci.com`) : navbar, footer, pages connexion/inscription, favicon
- Dashboard organisateur (`pro.looga-ci.com`) : barre latérale, page de connexion, favicon
- Back-office admin : barre latérale, page de connexion, favicon
- + image de partage social (Open Graph) pour les 3

**Applications mobiles (2 applications)**
- App utilisateur : écran d'accueil, écran de bienvenue, icône d'app, splash screen
- App scan (staff) : écran de connexion, profil, icône d'app, splash screen
- + icônes adaptive Android (5 densités d'écran) pour les 2

---

## Sources techniques (références officielles 2025)

- Favicons : [evilmartians.com](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs), [browserux.com](https://browserux.com/blog/guides/web-icons/favicons-best-practices.html), [favicon.im](https://favicon.im/blog/complete-favicon-size-format-guide-2025)
- Icônes d'app Expo / mobile : [docs.expo.dev](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/)
- Icônes PWA & maskable : [web.dev](https://web.dev/learn/pwa/web-app-manifest), [developer.chrome.com](https://developer.chrome.com/docs/lighthouse/pwa/maskable-icon-audit), [MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/icons)
- Open Graph (partage social) : ratio 1200×630 — standard Facebook/LinkedIn/WhatsApp

---

*Document préparé pour l'équipe Looga — 2026. Toute question technique : revenir vers l'équipe de développement.*
