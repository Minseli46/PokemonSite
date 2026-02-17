# 🔧 Backend — Pokédex API + Système Multi-Agent IA

API RESTful Express avec PostgreSQL et système multi-agent IA propulsé par **LangChain**, **LangGraph** et **Mistral AI**.

![Express](https://img.shields.io/badge/Express-4.18-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![LangChain](https://img.shields.io/badge/LangChain-1.2-orange)
![LangGraph](https://img.shields.io/badge/LangGraph-1.1-purple)
![Mistral AI](https://img.shields.io/badge/Mistral_AI-small--latest-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.22-teal)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)

---

## 🚀 Démarrage Rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos credentials

# 3. Appliquer les migrations Prisma
npx prisma migrate dev

# 4. Lancer en développement (hot-reload)
npm run dev
```

Le serveur démarre sur **http://localhost:3000**.

---

## 🔧 Variables d'Environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://user:pass@localhost:5432/pokedex` |
| `PORT` | Port du serveur | `3000` |
| `NODE_ENV` | Environnement | `development` |
| `FRONTEND_URL` | URL du frontend (CORS) | `http://localhost:3001` |
| `MISTRAL_API_KEY` | Clé API Mistral AI **(requis pour les agents)** | `votre_cle` |

---

## 📡 API Endpoints

### Health Check

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/health` | Statut global du serveur |
| `GET` | `/api/agent/health` | Statut du système IA (clé API, agents disponibles) |

### Pokémon (`/api/pokemons`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/pokemons/` | Lister les Pokémon (pagination) |
| `GET` | `/api/pokemons/search?q=pikachu` | Recherche par nom |
| `GET` | `/api/pokemons/filter?gen=1` | Filtrer par génération |
| `GET` | `/api/pokemons/compare?ids=25,6` | Comparer des Pokémon |
| `GET` | `/api/pokemons/:id` | Détail d'un Pokémon |

### Agents IA (`/api/agent`)

| Méthode | Endpoint | Body | Description |
|---------|----------|------|-------------|
| `POST` | `/api/agent/chat` | `{ message, conversationHistory? }` | Chat via Orchestrateur (routage automatique) |
| `POST` | `/api/agent/team` | `{ message, conversationHistory? }` | Accès direct au Team Agent |
| `POST` | `/api/agent/quiz` | `{ message, conversationHistory? }` | Accès direct au Quiz Agent |
| `POST` | `/api/agent/wallpaper` | `{ message, conversationHistory? }` | Accès direct au Wallpaper Agent |

#### Exemple : Chat avec l'orchestrateur

```bash
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Construis-moi une équipe autour de Charizard",
    "conversationHistory": []
  }'
```

#### Réponse type :

```json
{
  "success": true,
  "data": {
    "agent": "team",
    "message": "Voici 3 propositions d'équipes autour de Charizard 🔥...",
    "toolsUsed": ["get_pokemon_data", "build_team_proposal", "build_team_proposal", "build_team_proposal"],
    "actions": [
      {
        "type": "team_proposal",
        "data": {
          "name": "Équipe Feu Ultime",
          "description": "Équipe offensive centrée sur Charizard...",
          "pokemon": [
            {
              "id": 6,
              "name": "charizard",
              "types": ["fire", "flying"],
              "image": "https://raw.githubusercontent.com/.../6.png"
            }
          ]
        }
      }
    ],
    "conversationHistory": [...]
  }
}
```

### News (`/api/news`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/news` | Actualités Pokémon (web scraping via Cheerio) |

---

## 🤖 Système Multi-Agent IA

### Vue d'ensemble

Le système utilise une **architecture multi-agent** où un orchestrateur route les requêtes vers des agents spécialisés, chacun équipé d'outils (tools) pour accéder aux données Pokémon en temps réel.

```
┌────────────────────────────────────────────────────┐
│                   ORCHESTRATOR                     │
│        ChatMistralAI via simpleChat()              │
│                                                    │
│  Intent Classification:                            │
│    Regex heuristics → LLM fallback                 │
│    Conversation continuity (lastAgent)             │
│                                                    │
│         team │    quiz │    wallpaper │  general    │
└──────────┬───┴────┬────┴──────┬──────┴─────────────┘
           │        │           │
    ┌──────┴──┐ ┌───┴────┐ ┌───┴──────┐
    │  TEAM   │ │  QUIZ  │ │WALLPAPER │
    │  AGENT  │ │  AGENT │ │  AGENT   │
    │         │ │        │ │          │
    │ LangGraph│ │LangGraph│ │LangGraph│
    │ ReAct   │ │ ReAct  │ │ ReAct   │
    │         │ │        │ │          │
    │ 8 tools │ │ 7 tools│ │ 7 tools │
    └─────────┘ └────────┘ └──────────┘
```

### Pattern ReAct (LangGraph)

Chaque agent spécialiste utilise `createReactAgent` de `@langchain/langgraph/prebuilt` qui implémente automatiquement la boucle :

```
┌────────────────────────────────────────┐
│           createReactAgent             │
│                                        │
│  ┌──────────┐                          │
│  │  REASON  │ ← Le LLM analyse        │
│  │          │   le contexte et décide  │
│  └────┬─────┘   quel outil appeler     │
│       │                                │
│  ┌────▼─────┐                          │
│  │   ACT    │ ← Appel automatique      │
│  │          │   du DynamicStructuredTool│
│  └────┬─────┘   avec params Zod-validés│
│       │                                │
│  ┌────▼──────┐                         │
│  │ OBSERVE   │ ← Le LLM reçoit le     │
│  │           │   résultat de l'outil   │
│  └────┬──────┘                         │
│       │                                │
│       ▼ Boucle jusqu'à réponse finale  │
│         (recursionLimit: 12)           │
└────────────────────────────────────────┘
```

### Agents & Configuration

| Agent | Fichier | Température | Max Tokens | Outils |
|-------|---------|-------------|------------|--------|
| **Orchestrator** | `orchestrator.ts` | 0.3 (défaut) | — | Aucun (classification simple) |
| **Team Agent** 🛡️ | `teamAgent.ts` | 0.4 | 4096 | `pokemonTools` + `teamTools` (8) |
| **Quiz Agent** 🧠 | `quizAgent.ts` | 0.7 | 2048 | `pokemonTools` + `quizTools` (7) |
| **Wallpaper Agent** 🎨 | `wallpaperAgent.ts` | 0.8 | 2048 | `pokemonTools` + `wallpaperTools` (7) |

### 14 Outils IA (DynamicStructuredTool + Zod)

#### Outils Pokémon (partagés par tous les agents)

| Outil | Description | Schéma Zod |
|-------|-------------|------------|
| `get_pokemon_data` | Données complètes d'un Pokémon (stats, types, sprite) | `{ name: string }` |
| `get_type_effectiveness` | Relations de dégâts d'un type | `{ type: string }` |
| `search_pokemon_by_type` | Recherche par type | `{ type: string, limit?: number }` |
| `get_pokemon_species_info` | Infos espèce (description, génération, habitat) | `{ name: string }` |

#### Outils Team Builder

| Outil | Description | Schéma Zod |
|-------|-------------|------------|
| `calculate_team_coverage` | Analyse couverture de types défensive | `{ pokemonNames: string[] }` |
| `evaluate_team_balance` | Évaluation équilibre (attaque/défense/vitesse) | `{ pokemonNames: string[] }` |
| `suggest_pokemon_for_team` | Suggestions pour combler les faiblesses | `{ currentTeam: string[], focusType?: string }` |
| `build_team_proposal` | Construit une proposition d'équipe structurée | `{ teamName, description, pokemonNames[] }` |

#### Outils Quiz

| Outil | Description | Schéma Zod |
|-------|-------------|------------|
| `generate_quiz_question` | Génère une question avec 4 options | `{ mode, difficulty }` |
| `get_pokemon_trivia` | Fun facts et anecdotes | `{ name: string }` |
| `get_generation_info` | Informations sur une génération | `{ generation: number }` |

#### Outils Wallpaper

| Outil | Description | Schéma Zod |
|-------|-------------|------------|
| `suggest_wallpaper_theme` | Suggestion de thème visuel complet | `{ pokemonName, style }` |
| `get_type_color_palette` | Palette de couleurs HEX d'un type | `{ type: string }` |
| `suggest_pokemon_duo` | Duo/trio visuellement complémentaire | `{ pokemonName }` |

### Frameworks IA

| Package | Version | Rôle |
|---------|---------|------|
| `@langchain/mistralai` | 1.0.4 | `ChatMistralAI` — wrapper LLM Mistral |
| `@langchain/core` | 1.1.24 | `DynamicStructuredTool`, types de messages |
| `@langchain/langgraph` | 1.1.4 | `createReactAgent` — boucle ReAct |
| `langchain` | 1.2.24 | Framework core |
| `zod` | 4.3.6 | Schémas de validation pour les outils |

### Types d'actions retournées au frontend

```typescript
// Actions structurées que le frontend peut afficher interactivement
type AgentAction =
  | { type: 'team_proposal';    data: { name, description, pokemon[] } }
  | { type: 'quiz_question';    data: { question, options[], correctAnswer, hint, pokemonImage } }
  | { type: 'wallpaper_config'; data: { pokemonId, backgroundColor, pattern, accentColor, style } }
```

---

## 🗄️ Base de Données (Prisma + PostgreSQL)

### Modèles

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  teams     Team[]
}

model Pokemon {
  pokemonId  Int      @unique
  name       String
  types      String[]
  sprite     String
  artwork    String?
  stats      Json          // { hp, attack, defense, ... }
  generation Int
  abilities  Json?
}

model Team {
  id        String   @id @default(uuid())
  name      String
  userId    String?
  pokemons  Int[]         // Array de pokemonIds
  user      User?    @relation(...)
}

model Quiz {
  id         String   @id @default(uuid())
  question   String
  answer     String
  options    String[]
  difficulty String         // "easy" | "medium" | "hard"
  type       String         // "name" | "type" | "evolution" | ...
  pokemonId  Int
}

model Favorite {
  userId    String
  pokemonId Int
  @@unique([userId, pokemonId])
}
```

### Commandes Prisma

```bash
npx prisma migrate dev          # Créer/appliquer migrations
npx prisma studio               # Interface visuelle
npx prisma generate             # Régénérer le client
npx prisma db push              # Push sans migration
```

---

## 📁 Structure des Fichiers

```
backend/
├── package.json
├── tsconfig.json
├── .env.example
├── prisma/
│   └── schema.prisma
└── src/
    ├── server.ts                  # Point d'entrée (connect DB + listen)
    ├── app.ts                     # Config Express (CORS, routes, middleware)
    │
    ├── agents/                    # 🤖 Système Multi-Agent IA
    │   ├── index.ts               # Re-exports publics
    │   ├── mistralClient.ts       # ChatMistralAI singleton + simpleChat()
    │   ├── orchestrator.ts        # Orchestrateur (classification → délégation)
    │   ├── teamAgent.ts           # Agent Team Builder (LangGraph ReAct)
    │   ├── quizAgent.ts           # Agent Quiz Master (LangGraph ReAct)
    │   ├── wallpaperAgent.ts      # Agent Wallpaper Designer (LangGraph ReAct)
    │   ├── types.ts               # Types TypeScript du système agent
    │   └── tools/                 # 14 DynamicStructuredTool + Zod
    │       ├── index.ts           # Re-exports des tableaux de tools
    │       ├── pokemonTools.ts    # 4 outils Pokémon (PokeAPI)
    │       ├── teamTools.ts       # 4 outils construction d'équipe
    │       ├── quizTools.ts       # 3 outils quiz
    │       └── wallpaperTools.ts  # 3 outils wallpaper (palettes, duos)
    │
    ├── routes/
    │   ├── agentRoutes.ts         # /api/agent/* (chat, team, quiz, wallpaper, health)
    │   ├── pokemonRoutes.ts       # /api/pokemons/* (CRUD, search, filter, compare)
    │   └── news.ts                # /api/news (web scraping)
    │
    ├── controllers/
    │   └── pokemonController.ts   # Logique des routes Pokémon
    │
    ├── services/
    │   ├── databaseService.ts     # Prisma connect/disconnect/CRUD
    │   ├── pokeAPIService.ts      # Intégration PokeAPI
    │   └── pokemonNewsService.ts  # Scraping news (Cheerio)
    │
    ├── config/
    │   ├── database.ts            # PrismaClient singleton
    │   ├── cors.ts                # Configuration CORS
    │   └── server.ts              # Config serveur (port, etc.)
    │
    ├── constants/
    │   └── api.ts                 # POKEAPI_BASE_URL, etc.
    │
    ├── middlewares/
    │   └── errorMiddleware.ts     # Gestion d'erreurs Express
    │
    ├── types/
    │   ├── express.ts
    │   └── pokemon.ts
    │
    └── __tests__/
        └── services/              # Tests unitaires
```

---

## 📜 Scripts NPM

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur dev avec hot-reload (`tsx watch`) |
| `npm run build` | Compilation TypeScript → `dist/` |
| `npm start` | Serveur production (`node dist/server.js`) |
| `npm run prisma:generate` | Régénérer le client Prisma |
| `npm run prisma:migrate` | Appliquer les migrations |
| `npm run prisma:studio` | Interface visuelle de la DB |

---

## 🧪 Tests

```bash
# Lancer les tests
npx jest

# Avec couverture
npx jest --coverage
```

---

## 📝 Notes Techniques

### tsconfig.json

```json
{
  "module": "ES2020",
  "moduleResolution": "bundler",
  "target": "ES2020"
}
```

> `module: "ES2020"` + `moduleResolution: "bundler"` sont requis pour les imports `@langchain/langgraph/prebuilt`.

### Extraction des messages LangGraph

Les agents utilisent `_getType()` au lieu de `instanceof` pour détecter les types de messages, car LangGraph sérialise les objets et les checks `instanceof` ne fonctionnent pas de manière fiable entre les packages.

```typescript
// ✅ Fonctionne avec LangGraph
const msgType = (msg as any)._getType?.();
if (msgType === 'ai') { /* AIMessage */ }
if (msgType === 'tool') { /* ToolMessage */ }

// ❌ Ne fonctionne PAS avec LangGraph
if (msg instanceof AIMessage) { /* peut échouer */ }
```

---

## 👥 Auteurs

- **Minseli Fridel WANKPO** — Développement full-stack, architecture du projet
- **Kenneth SANGLI** — Système IA Multi-Agent (LangChain/LangGraph), intégration full-stack

---

## 📄 Licence

MIT License - Voir le fichier [LICENSE](../LICENSE) pour plus de détails.

---

## 🙏 Remerciements

- [PokéAPI](https://pokeapi.co/) — Source de données Pokémon
- [The Pokémon Company](https://www.pokemon.co.jp/) — Propriétaires de la franchise
- Communauté Open Source pour les librairies utilisées
