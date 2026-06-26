# 👥 Rôles & Back-office Looga — Note pour la direction

> **À l'attention du propriétaire de Looga.**
> Ce document explique **qui peut faire quoi** sur la plateforme, et en particulier la
> différence entre un **Super Admin** et un **Admin** dans le back-office.
> Aucune connaissance technique n'est nécessaire pour le lire.

---

## 1. Les 5 rôles de la plateforme

Looga repose sur **5 rôles**. Chaque personne (ou compte) a **un seul** rôle, qui détermine
à quelle application elle accède et ce qu'elle peut y faire.

| Rôle | Application utilisée | Qui c'est | Ce qu'il fait |
|---|---|---|---|
| **Utilisateur** (`user`) | App mobile + site web | Le grand public | Achète des billets, gère ses billets et son profil |
| **Organisateur** (`organizer`) | Dashboard organisateur | Ceux qui créent des événements | Crée/gère ses événements, ses billets, ses scanners, demande ses reversements |
| **Scanner / Staff** (`staff`) | App de scan | Agents d'entrée d'un événement | Scanne les QR codes à l'entrée. **Aucun accès** aux finances ni aux données |
| **Admin** (`admin`) | Back-office | Équipe Looga | Modère la plateforme (voir détail §2) |
| **Super Admin** (`super_admin`) | Back-office | Direction Looga | Tout ce que fait l'Admin **+ gestion de l'équipe et des comptes** (voir §2) |

> 💡 Les comptes **scanner** ne s'inscrivent pas eux-mêmes : c'est **l'organisateur** qui les
> crée depuis son dashboard. Les comptes **Admin / Super Admin** sont créés **uniquement** par
> un Super Admin depuis le back-office.

---

## 2. La différence Super Admin vs Admin (la question clé)

Les deux travaillent dans le **back-office** (l'outil d'administration de Looga). La différence
tient en une phrase :

> **L'Admin gère la plateforme au quotidien. Le Super Admin gère aussi l'équipe et les comptes
> sensibles.**

### Ce que **les deux** peuvent faire (Admin **et** Super Admin)
- 📊 Voir les statistiques globales (utilisateurs, événements, revenus, commission Looga)
- 🎫 Gérer les événements (publier, annuler)
- 🏢 Approuver / suspendre les organisateurs
- 💸 Traiter les demandes de reversement (approuver, rejeter, marquer payé)
- 🚩 Traiter les signalements et les messages de support
- 📝 Modifier le contenu des pages (CGU, confidentialité, etc.)
- 👁️ Consulter le journal d'activité (audit)
- 🔓 Activer / désactiver un compte utilisateur (le bloquer)

### Ce que **seul le Super Admin** peut faire
| Action réservée | Pourquoi c'est sensible |
|---|---|
| ➕ **Inviter un nouvel Admin / Super Admin** | Donner les clés du back-office à quelqu'un |
| ✏️ **Modifier ou supprimer un membre de l'équipe** | Retirer/changer les pouvoirs d'un admin |
| 🔑 **Changer le rôle d'un utilisateur** | Ex. transformer un user en organisateur, ou nommer un admin |
| 🗑️ **Supprimer définitivement un compte utilisateur** | Action irréversible |

> En résumé : un **Admin** modère et opère ; un **Super Admin** décide **qui fait partie de
> l'équipe** et **qui a quel rôle**. On garde **très peu** de Super Admins (idéalement 1 à 2
> personnes de confiance).

---

## 3. Sécurité du back-office (important)

- 🔐 **Double authentification (2FA) obligatoire** : tout Admin / Super Admin doit valider un
  code à usage unique (application type Google Authenticator) **à chaque connexion**. Sans 2FA,
  l'accès est refusé — même avec le bon mot de passe.
- 🧾 **Journal d'audit** : chaque action sensible (approbation, suppression, changement de rôle,
  paiement…) est **enregistrée** avec l'auteur, la date et la cible. Rien n'est invisible.
- 🚫 Un compte **désactivé** ne peut plus rien faire, même s'il connaît son mot de passe.

---

## 4. « Faut-il d'autres rôles ? » — réponse

C'est une **excellente** question, et voici la part qui te revient et celle qui revient à la tech :

- **Les 5 rôles techniques** ci-dessus sont **déjà définis et fonctionnels** dans le système.
  Les créer/coder, c'est le travail de l'équipe de développement — **pas le tien**.
- **Décider de la politique d'attribution**, ça c'est **ta décision** (direction) :
  - Combien de Super Admins ? (recommandé : **1 à 2 maximum**.)
  - Qui est Admin dans ton équipe ?

- **Faut-il des rôles supplémentaires ?** Pour le lancement, les 5 rôles **suffisent largement**
  et couvrent tout le modèle. Si plus tard l'équipe Looga grandit, on **pourra** créer des
  **sous-rôles d'admin spécialisés** (ex. un rôle « Finances » qui ne voit que les reversements,
  un rôle « Support » qui ne voit que les messages, un rôle « Modération » qui ne voit que les
  signalements). **Ce n'est pas nécessaire maintenant** — on l'ajoutera le jour où le besoin
  apparaît, sur ta demande.

> 👉 **Ce que tu dois retenir** : tu n'as **rien à définir techniquement**. Ton seul choix
> aujourd'hui = **désigner qui sont les 1-2 Super Admins** et **qui sont les Admins** de
> confiance. Le reste est déjà en place.

---

*Document préparé par l'équipe de développement Looga — 2026. Toute question : revenir vers nous.*
