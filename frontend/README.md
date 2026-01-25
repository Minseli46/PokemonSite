# Frontend - Pokédex Application

Interface utilisateur Next.js 16 pour l'application Pokédex.

## 🚀 Démarrage Rapide

```bash
# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env.local
# Éditer .env.local avec l'URL du backend

# Lancer en développement
npm run dev
```

L'application sera accessible sur **http://localhost:3001**

## 📁 Structure

```
frontend/
├── app/                    # Pages (App Router)
│   ├── page.tsx           # Page d'accueil (Pokédex)
│   ├── layout.tsx         # Layout racine
│   ├── battle/            # Simulateur de combat
│   ├── compare/           # Comparateur
│   ├── events/            # Événements locaux
│   ├── pokemon/[id]/      # Détails Pokémon (route dynamique)
│   ├── quiz/              # Quiz interactif
│   ├── team/              # Gestion d'équipe
│   └── wallpaper/         # Générateur de wallpapers
│
├── components/            # Composants réutilisables
│   ├── layout/           # Header, Footer
│   ├── pokemon/          # Composants Pokémon
│   ├── team/             # Composants équipe
│   └── ui/               # Composants UI (shadcn)
│
├── hooks/                # Custom hooks
│   ├── use-pokemon.ts    # Hooks Pokémon
│   ├── use-team.ts       # Gestion équipe
│   ├── use-theme.ts      # Thème sombre/clair
│   └── use-backend-api.ts # API backend
│
├── lib/                  # Utilitaires
│   ├── pokemon.ts        # Types & constantes
│   ├── api-config.ts     # Configuration API
│   ├── translations.ts   # Traductions FR
│   └── utils.ts          # Fonctions utilitaires
│
└── public/               # Assets statiques
```

## 🎨 Pages & Fonctionnalités

### 🏠 Page d'Accueil (`/`)
- Grille de Pokémon avec scroll infini
- Recherche en temps réel
- Filtres : Type, Génération
- Ajout rapide à l'équipe

### 👥 Équipe (`/team`)
- Vue 3D interactive (Three.js)
- Vue liste avec détails
- Analyse de couverture des types
- Sauvegarde en BDD

### ⚔️ Combat (`/battle`)
- Sélection de 2 Pokémon
- Simulation de combat
- Calcul de dégâts basé sur stats
- Système d'efficacité des types

### 📊 Comparaison (`/compare`)
- Comparaison côte à côte
- Graphiques de statistiques
- Recherche rapide
- Sélection depuis équipe

### 🎯 Quiz (`/quiz`)
- 3 modes : Qui est ce Pokémon ?, Silhouette, Types
- 3 difficultés : Facile (Gen 1), Moyen (Gen 1-4), Difficile (Tous)
- Timer et score
- Effets visuels (confetti)

### 🗺️ Événements (`/events`)
- Géolocalisation automatique
- Événements Pokémon locaux
- Liens vers informations

### 🎨 Fond d'Écran (`/wallpaper`)
- Génération 1920x1080
- 4 motifs : Dégradé, Points, Vagues, Géométrique
- Palette de couleurs personnalisable
- Téléchargement PNG

### 📄 Détails Pokémon (`/pokemon/[id]`)
- Informations complètes
- Statistiques détaillées
- Chaîne d'évolution
- Faiblesses/Résistances

## 🎨 Technologies UI

- **Next.js 16** - Framework React avec App Router
- **Tailwind CSS** - Styling utilitaire
- **shadcn/ui** - Composants (Radix UI)
- **Framer Motion** - Animations fluides
- **Three.js** - Rendu 3D (vue équipe)
- **SWR** - Data fetching & cache
- **Canvas API** - Génération wallpapers

## 🔌 Intégration Backend

Configuration dans `.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Hooks disponibles dans `hooks/use-backend-api.ts` :

```typescript
import { useBackendPokemonList, useBackendPokemon } from '@/hooks/use-backend-api'

// Liste avec pagination
const { data, error, isLoading } = useBackendPokemonList(20, 0)

// Pokémon unique
const { pokemon } = useBackendPokemon(25) // Pikachu
```

## 🎨 Composants UI

### shadcn/ui

Composants installés :
- Button, Card, Input, Select
- Dialog, DropdownMenu, Popover
- Progress, Spinner, Badge
- Et plus...

Ajouter un composant :

```bash
npx shadcn-ui@latest add button
```

### Composants Personnalisés

- `<PokemonCard>` - Carte Pokémon
- `<TypeBadge>` - Badge de type
- `<SearchBar>` - Barre de recherche
- `<FilterPanel>` - Panneau de filtres
- `<TeamPreview>` - Prévisualisation équipe
- `<Team3DScene>` - Scène 3D équipe

## 🔧 Scripts NPM

```bash
npm run dev      # Développement (Turbopack)
npm run build    # Build production
npm start        # Serveur production
npm run lint     # ESLint
```

## 🌍 Internationalisation

L'application est actuellement en **français**.

Fichier de traductions : `lib/translations.ts`

Pour ajouter une langue :
1. Créer `lib/translations-en.ts`
2. Créer un hook `use-locale.ts`
3. Mettre à jour les composants

## 📦 Dépendances Principales

```json
{
  "next": "^16.0.10",
  "react": "^19.0.0",
  "tailwindcss": "^3.4.0",
  "framer-motion": "^11.0.0",
  "three": "^0.160.0",
  "swr": "^2.2.0",
  "canvas-confetti": "^1.9.0"
}
```

## 🎨 Thèmes

Support du mode sombre/clair via `use-theme` hook :

```typescript
import { useTheme } from '@/hooks/use-theme'

const { theme, setTheme } = useTheme()
```

Classes Tailwind disponibles :
- `bg-background`, `text-foreground`
- `bg-card`, `text-card-foreground`
- `bg-primary`, `text-primary-foreground`

## 🐛 Debugging

### Erreur d'Hydration

Si vous voyez des erreurs d'hydration :
1. Vérifier `suppressHydrationWarning` dans `layout.tsx`
2. Vider `.next/` : `rm -rf .next`
3. Relancer : `npm run dev`

### Erreur CORS

Vérifier que `NEXT_PUBLIC_API_URL` pointe vers le bon backend.

### Images ne chargent pas

Vérifier `next.config.mjs` - domaines autorisés :
- `raw.githubusercontent.com`
- `pokeapi.co`

## 📱 Responsive Design

Breakpoints Tailwind :
- `sm:` - ≥ 640px
- `md:` - ≥ 768px
- `lg:` - ≥ 1024px
- `xl:` - ≥ 1280px

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
vercel deploy
```

### Build Manuel

```bash
npm run build
npm start
```

L'application sera servie sur le port **3000** (configurable via `PORT`).

## 📝 Développement

### Ajouter une Page

1. Créer `app/ma-page/page.tsx`
2. Ajouter la route dans `components/layout/header.tsx`
3. (Optionnel) Créer `app/ma-page/loading.tsx` pour le skeleton

### Créer un Composant

```bash
# Avec shadcn
npx shadcn-ui@latest add nom-composant

# Personnalisé
# Créer dans components/pokemon/ ou components/ui/
```

### Utiliser l'API

```typescript
import { useBackendPokemon } from '@/hooks/use-backend-api'

export default function MaPage() {
  const { pokemon, error, isLoading } = useBackendPokemon(1)
  
  if (isLoading) return <div>Chargement...</div>
  if (error) return <div>Erreur</div>
  
  return <div>{pokemon.name}</div>
}
```
