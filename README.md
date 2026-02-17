# 🎮 Pokédex Full-Stack — Application Multi-Agent IA

Application web complète pour explorer, gérer et interagir avec l'univers Pokémon. Inclut un **système multi-agent IA** propulsé par **LangChain / LangGraph** et **Mistral AI** pour le team building, les quiz et la création de wallpapers.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![Express](https://img.shields.io/badge/Express-4.18-green)
![LangChain](https://img.shields.io/badge/LangChain-1.2-orange)
![LangGraph](https://img.shields.io/badge/LangGraph-1.1-purple)
![Mistral AI](https://img.shields.io/badge/Mistral_AI-small--latest-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 📐 Architecture Générale

```
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16)                 │
│       React 19 · Tailwind 4 · shadcn/ui · Zustand 5     │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │ Pokédex  │ │  Équipes │ │   Quiz   │ │ PokéAgent  │  │
│  │  Grid    │ │  Builder │ │          │ │  IA Chat   │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │
│                         │                                │
│                    REST API calls                        │
└─────────────────────────┼────────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────────┐
│                    BACKEND (Express 4)                   │
│             TypeScript · Prisma · PokeAPI                │
│                                                          │
│  ┌───────────────────────────────────────────────────┐   │
│  │           Système Multi-Agent IA 🤖               │   │
│  │                                                   │   │
│  │   Orchestrator (ChatMistralAI — classification)   │   │
│  │          │              │              │           │   │
│  │   ┌──────┴───┐  ┌──────┴───┐  ┌──────┴────┐      │   │
│  │   │  Team    │  │  Quiz    │  │ Wallpaper │      │   │
│  │   │  Agent   │  │  Agent   │  │  Agent    │      │   │
│  │   │ 8 tools  │  │ 7 tools  │  │ 7 tools   │      │   │
│  │   └──────────┘  └──────────┘  └───────────┘      │   │
│  │        LangGraph createReactAgent (boucle ReAct)  │   │
│  │     DynamicStructuredTool + Zod · PokeAPI data    │   │
│  └───────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │ Pokémon  │  │  News    │  │   CRUD   │               │
│  │ Routes   │  │ Scraping │  │  Routes  │               │
│  └──────────┘  └──────────┘  └──────────┘               │
└──────────────────────────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │  PostgreSQL + Prisma  │
              │  PokeAPI (REST)       │
              └───────────────────────┘
```

---

## ✨ Fonctionnalités

### 🔍 Pokédex Interactif
- Recherche par nom ou numéro
- Filtres par type et génération (Gen I → IX)
- Pagination infinie avec SWR
- Fiches détaillées : stats, évolutions, capacités

### 👥 Gestion d'Équipe
- Créer et gérer une équipe de 6 Pokémon
- Analyse de couverture des types
- Sauvegarde en base de données PostgreSQL

### ⚔️ Simulateur de Combat
- Combat entre deux Pokémon
- Calcul automatique des dégâts
- Système d'efficacité des types

### 📊 Comparateur
- Comparer deux Pokémon côte à côte
- Graphiques de statistiques radar

### 🎯 Quiz Pokémon
- 6 modes : Nom, Type, Stat, Évolution, Capacité, Génération
- 3 niveaux de difficulté adaptatifs
- Timer et scoring

### 🎨 Créateur de Fonds d'Écran
- Wallpapers 1920×1080
- 4 motifs : Dégradé, Points, Vagues, Géométrique
- Palettes de couleurs par type Pokémon

### 🗺️ Événements & News
- Agrégation d'actualités Pokémon (web scraping)

### 🤖 PokéAgent IA (Système Multi-Agent)
- **Orchestrateur intelligent** : route automatiquement vers l'agent spécialiste
- **Team Agent** 🛡️ : analyse d'équipe, couverture de types, propositions stratégiques
- **Quiz Agent** 🧠 : génération de quiz dynamiques, trivia, fun facts
- **Wallpaper Agent** 🎨 : suggestion de thèmes visuels, palettes, duos Pokémon
- **14 outils IA** avec validation Zod — données en temps réel via PokeAPI
- **Boucle ReAct** automatique via LangGraph (Reason → Act → Observe)
- Interface de chat avec affichage des agents, outils utilisés et actions interactives

---

## 🛠️ Stack Technique

| Couche | Technologies |
|--------|-------------|
| **Frontend** | Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, Zustand 5, SWR, Framer Motion |
| **Backend** | Express 4.18, TypeScript 5.3, tsx (dev runner) |
| **IA / LLM** | LangChain 1.2, LangGraph 1.1 (`createReactAgent`), Mistral AI (`mistral-small-latest`), Zod |
| **Base de données** | PostgreSQL 15, Prisma 5.22 (ORM) |
| **Sources de données** | PokeAPI (REST), Cheerio (web scraping news) |
| **Monorepo** | concurrently (backend + frontend en parallèle) |
| **Tests** | Jest, ts-jest |

---

## 🚀 Démarrage Rapide

### Prérequis

- **Node.js** ≥ 18
- **PostgreSQL** ≥ 15
- **npm** ≥ 9
- Clé API **Mistral AI** ([console.mistral.ai](https://console.mistral.ai)) — pour le système IA

### Installation

```bash
# 1. Cloner le repo
git clone https://github.com/Minseli46/PokemonSite.git
cd PokemonSite

# 2. Installer toutes les dépendances (backend + frontend)
npm run install:all

# 3. Configurer les variables d'environnement
cp backend/.env.example backend/.env
# Éditer backend/.env avec vos credentials :
#   DATABASE_URL="postgresql://user:password@localhost:5432/pokedex"
#   MISTRAL_API_KEY="votre_cle_mistral"

# 4. Créer la base de données et appliquer les migrations
cd backend
npx prisma migrate dev
cd ..

# 5. Lancer le projet complet (backend + frontend)
npm run dev
```

### Accès

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:3000 |
| Health Check | http://localhost:3000/health |
| Agents IA Health | http://localhost:3000/api/agent/health |
| Prisma Studio | `cd backend && npx prisma studio` |

---

## 📡 API Endpoints

### Pokémon

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/pokemons/` | Lister les Pokémon |
| `GET` | `/api/pokemons/search?q=pikachu` | Rechercher |
| `GET` | `/api/pokemons/filter?gen=1` | Filtrer par génération |
| `GET` | `/api/pokemons/compare?ids=25,6` | Comparer |
| `GET` | `/api/pokemons/:id` | Détail d'un Pokémon |

### Agents IA

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/agent/chat` | Chat via Orchestrateur (auto-routage) |
| `POST` | `/api/agent/team` | Accès direct Team Agent |
| `POST` | `/api/agent/quiz` | Accès direct Quiz Agent |
| `POST` | `/api/agent/wallpaper` | Accès direct Wallpaper Agent |
| `GET` | `/api/agent/health` | Statut des agents |

#### Exemple de requête

```bash
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Construis-moi une équipe autour de Charizard"}'
```

#### Exemple de réponse

```json
{
  "success": true,
  "data": {
    "agent": "team",
    "message": "Voici 3 propositions d'équipes autour de Charizard...",
    "toolsUsed": ["get_pokemon_data", "build_team_proposal"],
    "actions": [
      {
        "type": "team_proposal",
        "data": {
          "name": "Équipe Feu Ultime",
          "description": "Équipe offensive...",
          "pokemon": [
            { "id": 6, "name": "charizard", "types": ["fire", "flying"], "image": "..." },
            { "id": 149, "name": "dragonite", "types": ["dragon", "flying"], "image": "..." }
          ]
        }
      }
    ]
  }
}
```

### Autres

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/news` | Actualités Pokémon (scraping) |
| `GET` | `/health` | Health check global |

---

## 🤖 Système Multi-Agent IA — Détails

### Architecture LangChain / LangGraph

```
Utilisateur → "Construis-moi une équipe autour de Pikachu"
                                  │
                    ┌─────────────┴─────────────┐
                    │       ORCHESTRATOR         │
                    │  ChatMistralAI (simpleChat)│
                    │  Classification d'intention │
                    │  team | quiz | wallpaper   │
                    └─────────────┬─────────────┘
                                  │ → "team"
                    ┌─────────────┴─────────────┐
                    │       TEAM AGENT           │
                    │  createReactAgent          │
                    │  (LangGraph ReAct loop)    │
                    │                            │
                    │  1. Reason: I need data    │
                    │  2. Act: get_pokemon_data   │
                    │  3. Observe: stats Pikachu  │
                    │  4. Reason: suggest team    │
                    │  5. Act: build_team_proposal │
                    │  6. Observe: 3 équipes      │
                    │  7. Final: message + actions│
                    └────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │         RESPONSE           │
                    │  message: "Voici 3 équipes"│
                    │  toolsUsed: [...]          │
                    │  actions: [team_proposal×3]│
                    └────────────────────────────┘
```

### Agents & Outils

| Agent | Température | Outils | Rôle |
|-------|-------------|--------|------|
| **Orchestrator** | 0.3 | — | Classifie l'intention → route vers le spécialiste |
| **Team Agent** 🛡️ | 0.4 | `get_pokemon_data`, `get_type_effectiveness`, `search_pokemon_by_type`, `get_pokemon_species_info`, `calculate_team_coverage`, `evaluate_team_balance`, `suggest_pokemon_for_team`, `build_team_proposal` | Construction & analyse d'équipe |
| **Quiz Agent** 🧠 | 0.7 | `get_pokemon_data`, `get_type_effectiveness`, `search_pokemon_by_type`, `get_pokemon_species_info`, `generate_quiz_question`, `get_pokemon_trivia`, `get_generation_info` | Quiz, trivia, fun facts |
| **Wallpaper Agent** 🎨 | 0.8 | `get_pokemon_data`, `get_type_effectiveness`, `search_pokemon_by_type`, `get_pokemon_species_info`, `suggest_wallpaper_theme`, `get_type_color_palette`, `suggest_pokemon_duo` | Thèmes visuels, palettes |

### Frameworks IA utilisés

| Package | Version | Utilisation |
|---------|---------|-------------|
| `@langchain/mistralai` | 1.0.4 | `ChatMistralAI` — wrapper LLM pour Mistral |
| `@langchain/core` | 1.1.24 | `DynamicStructuredTool`, messages (`HumanMessage`, `AIMessage`) |
| `@langchain/langgraph` | 1.1.4 | `createReactAgent` — boucle ReAct automatique |
| `langchain` | 1.2.24 | Core framework LangChain |
| `zod` | 4.3.6 | Validation des schémas d'entrée des outils |

### Types d'actions retournées

| Action | Agent | Description |
|--------|-------|-------------|
| `team_proposal` | Team | Proposition d'équipe complète (6 Pokémon avec sprites, types) |
| `quiz_question` | Quiz | Question interactive (4 options, réponse, indice, image) |
| `wallpaper_config` | Wallpaper | Configuration de wallpaper (couleurs, motif, style, Pokémon) |

---

## 🗄️ Base de Données

### Modèles Prisma

| Modèle | Description | Champs clés |
|--------|-------------|-------------|
| **User** | Utilisateur | `id` (UUID), `email` (unique), `name`, `teams[]` |
| **Pokemon** | Pokémon en cache | `pokemonId` (unique), `name`, `types[]`, `stats` (JSON), `generation` |
| **Team** | Équipe | `id` (UUID), `name`, `pokemons` (Int[]), `userId` |
| **Quiz** | Question de quiz | `question`, `answer`, `options[]`, `difficulty`, `type` |
| **Favorite** | Favori | `userId` + `pokemonId` (unique composite) |

---

## 📁 Structure du Projet

```
PokemonSite/
├── package.json              # Monorepo (concurrently)
├── README.md                 # ← Ce fichier
│
├── backend/
│   ├── README.md             # Documentation backend détaillée
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── prisma/
│   │   └── schema.prisma     # Modèles de données
│   └── src/
│       ├── server.ts          # Point d'entrée serveur
│       ├── app.ts             # Configuration Express
│       ├── agents/            # 🤖 Système Multi-Agent IA
│       │   ├── orchestrator.ts    # Routeur intelligent
│       │   ├── teamAgent.ts       # Agent Team Builder
│       │   ├── quizAgent.ts       # Agent Quiz Master
│       │   ├── wallpaperAgent.ts  # Agent Wallpaper Designer
│       │   ├── mistralClient.ts   # ChatMistralAI (LangChain)
│       │   ├── types.ts           # Types TypeScript
│       │   └── tools/             # 14 DynamicStructuredTool + Zod
│       │       ├── pokemonTools.ts    # 4 outils Pokémon
│       │       ├── teamTools.ts       # 4 outils équipe
│       │       ├── quizTools.ts       # 3 outils quiz
│       │       └── wallpaperTools.ts  # 3 outils wallpaper
│       ├── routes/            # Routes Express
│       ├── controllers/       # Contrôleurs
│       ├── services/          # Services (DB, PokeAPI, News)
│       ├── config/            # Configuration
│       └── __tests__/         # Tests unitaires
│
└── frontend/
    ├── README.md              # Documentation frontend détaillée
    ├── package.json
    ├── app/                   # Pages Next.js (App Router)
    │   ├── page.tsx               # Pokédex (accueil)
    │   ├── agent/page.tsx         # 🤖 Chat IA Multi-Agent
    │   ├── team/page.tsx          # Gestion d'équipe
    │   ├── teams/page.tsx         # Liste des équipes
    │   ├── quiz/page.tsx          # Quiz Pokémon
    │   ├── wallpaper/page.tsx     # Créateur de wallpapers
    │   ├── battle/page.tsx        # Simulateur de combat
    │   ├── compare/page.tsx       # Comparateur
    │   ├── events/page.tsx        # Événements & news
    │   └── pokemon/[id]/page.tsx  # Détail Pokémon
    ├── components/
    │   ├── ai/                # Composants IA
    │   ├── pokemon/           # Composants Pokémon
    │   ├── layout/            # Header, navigation
    │   └── ui/                # shadcn/ui
    ├── hooks/                 # Hooks custom
    └── lib/                   # Stores Zustand
```

---

## 🔧 Variables d'Environnement

### Backend (`backend/.env`)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pokedex?schema=public"
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
MISTRAL_API_KEY=votre_cle_api_mistral
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

---

## 📜 Scripts NPM

### Racine (Monorepo)

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance backend (port 3000) + frontend (port 3001) en parallèle |
| `npm run install:all` | Installe les dépendances backend + frontend |
| `npm run dev:backend` | Lance uniquement le backend |
| `npm run dev:frontend` | Lance uniquement le frontend |

### Backend

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur dev avec hot-reload (tsx watch) |
| `npm run build` | Compilation TypeScript |
| `npm start` | Serveur production |
| `npm run prisma:migrate` | Appliquer les migrations |
| `npm run prisma:studio` | Interface visuelle DB |

### Frontend

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur dev Next.js (Turbopack) |
| `npm run build` | Build de production |
| `npm start` | Serveur production |
| `npm run lint` | Linter ESLint |

---

## 🌿 Branches Git

| Branche | Description |
|---------|-------------|
| `main` | Branche principale |
| `kenneth-ai-agents` | Version avec Mistral SDK natif (avant LangChain) |
| `kenneth-langchain` | Refactoring LangChain / LangGraph |
| `version_kenneth_langchain` | Version finale LangChain (stable) |

---

## 👥 Auteurs

- **Kenneth SANGLI** — Système IA Multi-Agent (LangChain/LangGraph), intégration full-stack

---

## 📄 Licence

MIT
