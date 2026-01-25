# 🎮 Pokédex Full-Stack

Application web complète pour explorer et gérer vos Pokémon préférés. Interface moderne en Next.js 16 avec backend Express et PostgreSQL.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Fonctionnalités

### 🔍 **Pokédex Interactif**
- Recherche par nom ou numéro
- Filtres par type et génération
- Pagination infinie
- Fiches détaillées avec statistiques, évolutions, et capacités

### 👥 **Gestion d'Équipe**
- Créer et gérer une équipe de 6 Pokémon
- Vue 3D interactive avec Three.js
- Analyse de couverture des types
- Sauvegarde en base de données

### ⚔️ **Simulateur de Combat**
- Combat en temps réel entre deux Pokémon
- Calcul automatique des dégâts
- Système d'efficacité des types
- Interface intuitive

### 📊 **Comparateur**
- Comparer deux Pokémon côte à côte
- Graphiques de statistiques
- Différences visuelles en temps réel

### 🎯 **Quiz Pokémon**
- 3 modes de jeu : Identification, Silhouette, Types
- 3 niveaux de difficulté
- Timer et système de score
- Effets visuels avec confetti

### 🗺️ **Événements Locaux**
- Géolocalisation automatique
- Événements Pokémon près de chez vous
- Liens vers plus d'informations

### 🎨 **Créateur de Fonds d'Écran**
- Génération de wallpapers 1920x1080
- 4 motifs : Dégradé, Points, Vagues, Géométrique
- 6 couleurs prédéfinies + sélecteur personnalisé
- Téléchargement PNG

## 🏗️ Architecture

```
Projet Pokemon/
├── backend/              # API Express + PostgreSQL
│   ├── prisma/          # Schémas de base de données
│   ├── src/
│   │   ├── controllers/ # Logique métier
│   │   ├── routes/      # Routes API
│   │   ├── services/    # Services (PokéAPI)
│   │   └── index.ts     # Point d'entrée
│   └── package.json
│
├── frontend/            # Application Next.js 16
│   ├── app/            # Pages (App Router)
│   │   ├── battle/     # Simulateur de combat
│   │   ├── compare/    # Comparateur
│   │   ├── events/     # Événements
│   │   ├── pokemon/    # Détails Pokémon
│   │   ├── quiz/       # Quiz
│   │   ├── team/       # Gestion d'équipe
│   │   └── wallpaper/  # Générateur de wallpapers
│   ├── components/     # Composants réutilisables
│   ├── hooks/          # Custom hooks React
│   ├── lib/            # Utilitaires et config
│   └── package.json
│
└── package.json        # Scripts racine
```

## 🚀 Installation

### Prérequis

- **Node.js** ≥ 20.0.0
- **npm** ≥ 10.0.0
- **PostgreSQL** 14+ (ou Docker)

### Installation Rapide

```bash
# 1. Cloner le projet
git clone <url-du-repo>
cd "Projet Pokemon"

# 2. Installer toutes les dépendances
npm run install:all

# 3. Configurer la base de données (voir section Base de données)

# 4. Lancer l'application
npm start
```

L'application sera accessible sur :
- **Frontend** : http://localhost:3001
- **Backend API** : http://localhost:3000

## 🗄️ Configuration Base de Données

### Option 1 : PostgreSQL Local

```bash
# 1. Créer la base de données
createdb pokedex

# 2. Configurer les variables d'environnement
cd backend
cp .env.example .env

# 3. Modifier .env avec vos paramètres
DATABASE_URL="postgresql://user:password@localhost:5432/pokedex"

# 4. Générer le client Prisma et migrer
npx prisma generate
npx prisma migrate dev
```

### Option 2 : Docker

```bash
# Lancer PostgreSQL dans Docker
docker run --name pokedex-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=pokedex \
  -p 5432:5432 \
  -d postgres:14

# Puis suivre les étapes 2-4 de l'option 1
```

## 📝 Variables d'Environnement

### Backend (`backend/.env`)

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/pokedex"

# Serveur
PORT=3000
NODE_ENV=development

# JWT (optionnel pour authentification future)
JWT_SECRET=votre_secret_jwt
```

### Frontend (`frontend/.env.local`)

```env
# URL de l'API backend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🛠️ Scripts Disponibles

### Racine du projet

```bash
npm start              # Lancer frontend + backend
npm run dev            # Même chose que start
npm run install:all    # Installer toutes les dépendances
npm run dev:backend    # Lancer uniquement le backend
npm run dev:frontend   # Lancer uniquement le frontend
```

### Backend (`cd backend`)

```bash
npm run dev           # Mode développement avec hot-reload
npm run build         # Compiler TypeScript
npm start             # Lancer en production
npx prisma studio     # Interface de gestion BDD
npx prisma migrate dev # Créer une migration
```

### Frontend (`cd frontend`)

```bash
npm run dev           # Mode développement (Turbopack)
npm run build         # Build de production
npm start             # Serveur de production
npm run lint          # Vérifier le code
```

## 🎨 Stack Technique

### Frontend
- **Framework** : Next.js 16 (App Router + Turbopack)
- **UI** : React 19 + TypeScript
- **Styling** : Tailwind CSS 3
- **Composants** : shadcn/ui (Radix UI)
- **Animations** : Framer Motion
- **3D** : Three.js / React Three Fiber
- **Data Fetching** : SWR
- **Formulaires** : React Hook Form

### Backend
- **Runtime** : Node.js 20 + Express
- **Langage** : TypeScript
- **ORM** : Prisma
- **Base de données** : PostgreSQL
- **API externe** : PokéAPI (https://pokeapi.co)

## 📡 API Endpoints

### Pokémon

```
GET    /api/pokemon              # Liste des Pokémon
GET    /api/pokemon/:id          # Détails d'un Pokémon
GET    /api/pokemon/search/:name # Rechercher par nom
GET    /api/pokemon/type/:type   # Filtrer par type
POST   /api/pokemon/:id1/compare/:id2 # Comparer deux Pokémon
```

### Équipes

```
GET    /api/teams/user/:userId   # Équipes d'un utilisateur
POST   /api/teams                # Créer une équipe
DELETE /api/teams/:id            # Supprimer une équipe
```

### Quiz

```
GET    /api/quiz/random          # Question aléatoire
POST   /api/quiz/submit          # Soumettre une réponse
```

## 🎯 Roadmap

- [ ] Authentification Firebase / Auth0
- [ ] Système de favoris persistants
- [ ] Partage d'équipes via URL
- [ ] Mode sombre personnalisable
- [ ] PWA (Progressive Web App)
- [ ] Traduction multilingue
- [ ] Statistiques utilisateur
- [ ] Classement global du quiz

## 🐛 Dépannage

### Le backend ne démarre pas

```bash
# Vérifier PostgreSQL
psql -U postgres -c "SELECT version();"

# Regénérer Prisma
cd backend
npx prisma generate
npx prisma migrate reset
```

### Le frontend affiche des erreurs d'hydration

```bash
# Vider le cache Next.js
cd frontend
rm -rf .next
npm run dev
```

### Problème de CORS

Vérifier que `NEXT_PUBLIC_API_URL` dans `frontend/.env.local` correspond bien à l'URL du backend.

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.

## 🙏 Remerciements

- [PokéAPI](https://pokeapi.co) - Source de données Pokémon
- [The Pokémon Company](https://www.pokemon.com) - Propriétaires de la franchise
- Communauté Open Source pour les librairies utilisées

---

**Développé avec ❤️ pour les fans de Pokémon**
