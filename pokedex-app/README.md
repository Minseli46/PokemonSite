# 🎮 Pokédex App - Full-Stack Application

Une application web full-stack moderne de Pokédex avec React, TypeScript, Node.js et PostgreSQL.

## 🚀 Technologies

### Front-end
- ⚛️ React 18 + TypeScript
- ⚡ Vite
- 🎨 Tailwind CSS
- 🎮 Three.js (affichage 3D)
- 🔄 React Query
- 🧪 Jest + React Testing Library

### Back-end
- 🟢 Node.js 20 + Express
- 📦 Prisma ORM
- 🐘 PostgreSQL
- 🔐 Firebase Auth
- 🧪 Jest + Supertest

## 📋 Fonctionnalités

- ✅ Liste paginée de Pokémon avec recherche et filtres
- ✅ Détails complets de chaque Pokémon (stats, évolutions, faiblesses)
- ✅ Affichage 3D des Pokémon avec Three.js
- ✅ Création et gestion d'équipes
- ✅ Quiz Pokémon interactif
- ✅ Comparaison de stats entre Pokémon
- ✅ Mode sombre/clair
- ✅ Authentification utilisateur

## 🏗️ Structure du Projet

```
/pokedex-app
├── /client (Front-end React + Vite)
└── /server (Back-end Node.js + Express)
```

## 🛠️ Installation

### Prérequis
- Node.js 20+
- PostgreSQL (optionnel, pour sauvegarder en base de données)
- npm ou yarn

### 🎯 Démarrage rapide (Les 2 serveurs ensemble)

#### Option 1 : Script automatique ⚡ (Recommandé)

**Sur Windows PowerShell :**
```powershell
.\start.ps1
```

**Sur Windows CMD :**
```cmd
start.bat
```

Ces scripts lancent automatiquement le backend ET le frontend dans des fenêtres séparées !

#### Option 2 : Avec npm (dans un seul terminal)
```bash
# À la racine du projet
npm install
npm run dev
```

### 🔧 Démarrage manuel (séparé)

**Backend (Terminal 1) :**
```bash
cd server
npm install
# Configurez votre DATABASE_URL dans .env si nécessaire
npm run dev
```

**Frontend (Terminal 2) :**
```bash
cd client
npm install
npm run dev
```

## 📝 Variables d'environnement

### Server (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/pokedex"
PORT=3000
NODE_ENV=development
```

### Client (.env)
```
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your_firebase_key
```

## 🧪 Tests

```bash
# Backend
cd server
npm test

# Frontend
cd client
npm test
```

## 📦 API Endpoints

- `GET /api/pokemons` - Liste paginée
- `GET /api/pokemons/:id` - Détails d'un Pokémon
- `GET /api/pokemons/search?name=...` - Recherche
- `GET /api/pokemons/filter?generation=...` - Filtre par génération
- `POST /api/teams` - Créer une équipe
- `GET /api/quiz` - Générer un quiz

## 🎨 APIs Externes

- [PokéAPI](https://pokeapi.co/) - Données Pokémon
- [Poké3D](https://github.com/tobiasbu/poke3d) - Modèles 3D
- Firebase Auth - Authentification

## 👥 Contribution

Développé avec ❤️ pour les fans de Pokémon

## 📄 Licence

MIT
