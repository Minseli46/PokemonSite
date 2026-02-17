# 🎨 Frontend — Pokédex Application

Interface utilisateur moderne construite avec **Next.js 16**, **React 19**, **Tailwind CSS 4** et **shadcn/ui**. Inclut une interface de chat avec le système multi-agent IA du backend.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-cyan)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Zustand](https://img.shields.io/badge/Zustand-5.0-orange)

---

## 🚀 Démarrage Rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement (optionnel)
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:3000" > .env.local

# 3. Lancer en développement
npm run dev
```

Le frontend démarre sur **http://localhost:3001** (port 3001 si le backend occupe le 3000).

> **Prérequis** : Le backend doit être lancé sur le port 3000 pour que les fonctionnalités IA et les données Pokémon fonctionnent.

---

## 📱 Pages de l'Application

| Page | Route | Description |
|------|-------|-------------|
| 🔍 **Pokédex** | `/` | Grille de Pokémon avec recherche, filtres par type/génération, pagination infinie |
| 📄 **Détail Pokémon** | `/pokemon/[id]` | Fiche complète : stats, évolutions, capacités, sprites |
| 👥 **Mon Équipe** | `/team` | Gestion d'une équipe de 6 Pokémon (drag & drop, analyse) |
| 📋 **Mes Équipes** | `/teams` | Liste de toutes les équipes sauvegardées |
| ⚔️ **Combat** | `/battle` | Simulateur de combat entre deux Pokémon |
| 📊 **Comparateur** | `/compare` | Comparer les stats de deux Pokémon côte à côte |
| 🎯 **Quiz** | `/quiz` | Quiz Pokémon interactif (6 modes, 3 difficultés) |
| 🎨 **Wallpaper** | `/wallpaper` | Créateur de fonds d'écran Pokémon (canvas) |
| 🗺️ **Événements** | `/events` | Actualités et événements Pokémon |
| 🤖 **PokéAgent IA** | `/agent` | Interface de chat multi-agent IA |

---

## 🤖 Interface IA — PokéAgent (`/agent`)

L'interface de chat permet d'interagir avec le système multi-agent du backend :

### Fonctionnalités

- **Sélection de mode** : Auto (orchestrateur), Team, Quiz, Wallpaper
- **Quick prompts** : 6 suggestions prédéfinies pour démarrer
- **Badges d'agent** : Chaque agents a son propre badge coloré (🛡️ Team, 🧠 Quiz, 🎨 Wallpaper)
- **Affichage des outils** : Montre quels outils LangChain ont été appelés
- **Actions interactives** :
  - `team_proposal` → Carte d'équipe avec 6 Pokémon (bouton "Créer cette équipe")
  - `quiz_question` → Question interactive avec 4 options
  - `wallpaper_config` → Aperçu du wallpaper avec couleurs et style
- **Health check** : Indicateur vert/rouge pour le statut du backend IA
- **Contexte d'équipe** : L'agent reçoit automatiquement la composition de votre équipe actuelle
- **Historique conversationnel** : Les 10 derniers messages sont envoyés pour le contexte

### Architecture du hook `useAgent`

```typescript
// hooks/use-agent.ts
const {
  messages,         // Historique de chat affiché
  isLoading,        // Requête en cours
  agentHealth,      // Statut du backend (ready/error)
  sendMessage,      // Envoyer un message au backend
  checkHealth,      // Vérifier le statut du backend
  clearMessages,    // Réinitialiser la conversation
  cancel,           // Annuler la requête (AbortController)
} = useAgent();
```

---

## 🛠️ Stack Technique

### Framework & Runtime

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Next.js** | 16.0.10 | Framework React (App Router, Turbopack) |
| **React** | 19.2.0 | Bibliothèque UI |
| **TypeScript** | 5.x | Typage statique |

### UI & Styling

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Tailwind CSS** | 4.1 | Utility-first CSS |
| **shadcn/ui** | — | Composants UI (Radix UI + Tailwind) |
| **Radix UI** | — | Primitives accessibles (Dialog, Tabs, Toast, etc.) |
| **Framer Motion** | 12.29 | Animations |
| **Lucide React** | 0.454 | Icônes |
| **next-themes** | 0.4 | Thème clair/sombre |

### État & Data Fetching

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Zustand** | 5.0.10 | State management (équipe, favoris) |
| **SWR** | 2.3.8 | Data fetching avec cache |

### Autres

| Technologie | Rôle |
|-------------|------|
| **canvas-confetti** | Effets de confettis (quiz) |
| **class-variance-authority** | Variants de composants |
| **@vercel/analytics** | Analytics |

---

## 🧩 Composants

### Composants IA (`components/ai/`)

| Composant | Description |
|-----------|-------------|
| `ai-chat-panel.tsx` | Panel de chat IA (messages, input, mode selector) |
| `team-proposal-card.tsx` | Carte d'équipe proposée par l'agent (6 Pokémon, bouton créer) |
| `quiz-card.tsx` | Carte de question quiz interactive (4 options, réponse) |
| `wallpaper-card.tsx` | Aperçu de wallpaper proposé par l'agent |

### Composants Pokémon (`components/pokemon/`)

| Composant | Description |
|-----------|-------------|
| `pokemon-card.tsx` | Carte Pokémon dans la grille |
| `pokemon-grid.tsx` | Grille responsive de cartes Pokémon |
| `search-bar.tsx` | Barre de recherche |
| `filter-panel.tsx` | Filtres (type, génération) |
| `stats-chart.tsx` | Graphique radar des stats |
| `evolution-chain.tsx` | Chaîne d'évolution |
| `type-badge.tsx` | Badge de type coloré |
| `weakness-chart.tsx` | Graphique des faiblesses/résistances |
| `team-preview.tsx` | Aperçu de l'équipe actuelle |

### Layout (`components/layout/`)

| Composant | Description |
|-----------|-------------|
| `header.tsx` | Navigation principale avec liens vers toutes les pages |

### UI (`components/ui/`)

Composants **shadcn/ui** (Radix UI + Tailwind) : Button, Card, Dialog, Input, Label, Progress, Tabs, Toast, etc.

---

## 🪝 Hooks Personnalisés

| Hook | Fichier | Description |
|------|---------|-------------|
| `useAgent` | `hooks/use-agent.ts` | Communication avec l'API multi-agent IA |
| `useAgentAction` | `hooks/use-agent-action.ts` | Gestion des actions agent (team_proposal, quiz, wallpaper) |
| `useBackendApi` | `hooks/use-backend-api.ts` | Appels API génériques au backend |
| `usePokemon` | `hooks/use-pokemon.ts` | Fetch et cache des données Pokémon |
| `usePokemonNews` | `hooks/use-pokemon-news.ts` | Actualités Pokémon |
| `useTeam` | `hooks/use-team.ts` | Gestion de l'équipe (Zustand store) |
| `useTheme` | `hooks/use-theme.ts` | Thème clair/sombre |
| `useToast` | `hooks/use-toast.ts` | Notifications toast |

---

## 📁 Structure des Fichiers

```
frontend/
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── components.json            # Config shadcn/ui
│
├── app/                       # Next.js App Router
│   ├── globals.css            # Styles globaux (Tailwind)
│   ├── layout.tsx             # Layout racine (lang="fr", police Geist)
│   ├── loading.tsx            # Composant de chargement
│   ├── not-found.tsx          # Page 404
│   ├── page.tsx               # Pokédex (accueil)
│   ├── agent/
│   │   └── page.tsx           # 🤖 Chat IA Multi-Agent (405 lignes)
│   ├── battle/
│   │   └── page.tsx           # ⚔️ Simulateur de combat
│   ├── compare/
│   │   └── page.tsx           # 📊 Comparateur
│   ├── events/
│   │   └── page.tsx           # 🗺️ Événements & news
│   ├── pokemon/
│   │   └── [id]/page.tsx      # 📄 Détail Pokémon (route dynamique)
│   ├── quiz/
│   │   └── page.tsx           # 🎯 Quiz interactif
│   ├── team/
│   │   └── page.tsx           # 👥 Gestion d'équipe
│   ├── teams/
│   │   └── page.tsx           # 📋 Liste des équipes
│   └── wallpaper/
│       └── page.tsx           # 🎨 Créateur de wallpapers
│
├── components/
│   ├── ai/                    # Composants IA
│   │   ├── ai-chat-panel.tsx
│   │   ├── quiz-card.tsx
│   │   ├── team-proposal-card.tsx
│   │   └── wallpaper-card.tsx
│   ├── pokemon/               # Composants Pokémon
│   │   ├── pokemon-card.tsx
│   │   ├── pokemon-grid.tsx
│   │   ├── search-bar.tsx
│   │   ├── filter-panel.tsx
│   │   ├── stats-chart.tsx
│   │   ├── evolution-chain.tsx
│   │   ├── type-badge.tsx
│   │   ├── weakness-chart.tsx
│   │   └── team-preview.tsx
│   ├── layout/
│   │   └── header.tsx
│   ├── ui/                    # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   └── theme-provider.tsx
│
├── hooks/
│   ├── use-agent.ts           # Hook principal IA
│   ├── use-agent-action.ts
│   ├── use-backend-api.ts
│   ├── use-pokemon.ts
│   ├── use-pokemon-news.ts
│   ├── use-team.ts
│   ├── use-theme.ts
│   └── use-toast.ts
│
├── lib/
│   ├── utils.ts               # Utilitaires (cn, etc.)
│   └── stores/                # Stores Zustand
│
└── public/
    └── ...                    # Assets statiques
```

---

## 🔧 Variables d'Environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `NEXT_PUBLIC_BACKEND_URL` | URL de l'API backend | `http://localhost:3000` |

Créer un fichier `.env.local` à la racine du frontend :

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

---

## 📜 Scripts NPM

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement (Turbopack, hot-reload) |
| `npm run build` | Build de production |
| `npm start` | Serveur de production |
| `npm run lint` | Linter ESLint |

---

## 🎨 Design System

### Thème

- **Mode clair/sombre** via `next-themes`
- **Palette** : Basée sur les couleurs des types Pokémon
- **Police** : Geist (Sans + Mono)
- **Animations** : Framer Motion pour les transitions de page et les cartes

### Responsive

- **Mobile-first** avec Tailwind breakpoints
- **Grille adaptive** : 1 col (mobile) → 2 cols (tablet) → 3-4 cols (desktop)

### Composants shadcn/ui

Composants Radix UI customisés avec Tailwind CSS :
- `Button`, `Card`, `Dialog`, `DropdownMenu`
- `Input`, `Label`, `Progress`, `Tabs`, `Toast`
- Intégrés via `components/ui/`

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
