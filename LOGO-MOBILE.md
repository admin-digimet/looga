# 📱 Logo — Apps mobiles Looga (brief ciblé)

> **À l'attention du propriétaire / designer.**
> Le document général [LOGO-BRIEF.md](LOGO-BRIEF.md) couvre **tout** (sites web + mobile).
> Celui-ci se concentre **uniquement sur les 2 applications mobiles**, pour que ce soit
> 100 % clair côté téléphone. À lire en complément, pas à la place.

---

## 1. Les 2 apps mobiles concernées

| App | Pour qui | Ambiance / fond | Identifiant technique |
|---|---|---|---|
| **App Utilisateur** (« Looga ») | Le public qui achète des billets | **Sombre** (fond `#0D0B12`) | `ci.looga.app` |
| **App Scan** (« Looga Scan ») | Le staff à l'entrée des événements | **Crème / clair** (fond `#EDEAE4`) | `ci.looga.scan` |

> ⚠️ Les deux apps ont des **ambiances différentes**. Le logo doit donc rester lisible **à la
> fois sur fond sombre (app user) et sur fond clair (app scan)**. C'est le point le plus
> important pour le mobile.

**État actuel :** les icônes des 2 apps sont des **placeholders par défaut** (l'icône grise
générique). Rien n'est encore à la marque — d'où ce brief.

---

## 2. Les fichiers exacts à fournir (par app)

Chaque app mobile a besoin des **mêmes types de fichiers**. L'idéal : du **SVG** (vectoriel,
net à toute taille). À défaut, du **PNG très haute résolution**.

| # | Fichier | Taille | Fond | Rôle sur le téléphone |
|---|---|---|---|---|
| 1 | **Icône d'app** | **1024 × 1024 px** | **PLEIN** (couleur/dégradé, **jamais transparent**) | L'icône sur l'écran d'accueil (iPhone + Android) |
| 2 | **Symbole avant-plan Android** | **1024 × 1024 px** | **transparent**, sujet **bien centré** | Icône « adaptive » Android (les bords sont rognés) |
| 3 | **Version monochrome** | **1024 × 1024 px** (ou SVG) | transparent, 1 seule couleur | Thème dynamique Android 13+ |
| 4 | **Splash (écran de lancement)** | **1024 × 1024 px** | **transparent**, symbole centré | Le logo affiché au démarrage de l'app |

> 💡 Si le **symbole** est fourni en **SVG**, on peut générer presque toutes ces déclinaisons
> nous-mêmes. Le SVG est la clé.

---

## 3. Les 2 règles critiques du mobile

### 🍎 Règle Apple : pas de transparence sur l'icône d'app
L'icône **1024×1024** (fichier #1) doit avoir un **fond plein**. Un fond transparent donne un
**carré noir moche** sur iPhone. (Le dégradé orange→violet de la marque est parfait comme fond.)

### 🤖 Règle Android : la « zone de sécurité »
Sur Android, l'icône est **rognée** différemment selon le téléphone (rond, carré arrondi,
goutte d'eau…). Tout ce qui touche les bords **peut être coupé**.
→ Il faut donc garder **tout l'élément important au centre**, dans un carré de **~528 × 528 px**
au milieu du fichier 1024×1024 (les 66 % centraux). Les bords servent juste de marge.

```
┌─────────────────────────┐  1024 px
│      (marge rognable)   │
│   ┌─────────────────┐   │
│   │                 │   │
│   │   SYMBOLE ICI   │   │  ← zone sûre ~528 px
│   │   (centré)      │   │
│   └─────────────────┘   │
│      (marge rognable)   │
└─────────────────────────┘
```

---

## 4. Couleurs officielles (rappel)

- 🟠 Orange : `#FF5C1A`
- 🟣 Violet : `#6B3FA0`
- 🌈 Dégradé principal : orange → violet (`#FF5C1A` → `#6B3FA0`)
- Fond app **user** (sombre) : `#0D0B12` · Fond app **scan** (crème) : `#EDEAE4`

---

## 5. ✅ Checklist mobile à livrer

Pour **chacune des 2 apps** (user + scan) :

- [ ] **Icône d'app 1024×1024** — fond plein (idéalement la version qui rend bien sur le fond de l'app)
- [ ] **Symbole avant-plan Android 1024×1024** — fond transparent, sujet dans la zone de sécurité
- [ ] **Version monochrome** — SVG ou PNG transparent
- [ ] **Splash 1024×1024** — fond transparent, symbole centré
- [ ] (Idéal) **Symbole seul en SVG** → on génère le reste nous-mêmes

> 👉 **Le plus simple pour toi** : fournis le **symbole en SVG** + **une icône 1024×1024 fond
> plein**. Avec ça, on habille les 2 apps mobiles (et on règle aussi la version claire/sombre).

---

## 6. Où ça s'intègre techniquement (pour info)

Les fichiers se branchent dans la config Expo de chaque app (`app.json`) :
`icon`, `android.adaptiveIcon.foregroundImage` / `monochromeImage`, et le `splash-screen`.
Une fois les fichiers reçus, l'intégration + un rebuild des APK suffisent — **rien d'autre
n'est demandé au designer**.

---

*Document préparé par l'équipe de développement Looga — 2026. Complément de [LOGO-BRIEF.md](LOGO-BRIEF.md).*
