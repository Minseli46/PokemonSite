# 📱 Guide du Frontend - Pokédex Application

## 🛠️ Technologies utilisées

### Framework principal
- **Next.js 16.0.10** (App Router avec Turbopack)
  - Framework React moderne avec rendu côté serveur (SSR)
  - Routing basé sur les fichiers
  - Optimisation automatique des images et des performances

### Bibliothèques React
- **React 19** avec React DOM 19
  - Dernière version de React
  - Hooks modernes (useState, useEffect, useCallback, useMemo)
  - Server Components et Client Components

### Langage
- **TypeScript**
  - Typage statique pour éviter les erreurs
  - IntelliSense amélioré
  - Interfaces et types personnalisés

### UI/Design
- **Tailwind CSS** - Framework CSS utility-first
  - Classes CSS préconçues
  - Design responsive natif
  - Personnalisation via `tailwind.config.ts`

- **shadcn/ui** - Composants UI basés sur Radix UI
  - Composants accessibles (ARIA)
  - Composants utilisés : Button, Card, Input, Select, Tabs, Dialog, Badge, Progress
  - Personnalisables avec Tailwind

- **Lucide React** - Icônes modernes
  - Plus de 1000 icônes SVG
  - Optimisées pour React

### Animations
- **Framer Motion** - Animations fluides
  - Animations de transitions
  - Animations au scroll
  - Gestures et interactions

- **Three.js & React Three Fiber** - Rendu 3D
  - Modèles 3D des Pokémon
  - Animations 3D interactives
  - Camera controls

### Gestion des données
- **SWR (stale-while-revalidate)** - Fetching de données
  - Cache intelligent
  - Revalidation automatique
  - Support du scroll infini (useSWRInfinite)

- **Axios** - Client HTTP
  - Requêtes vers le backend
  - Intercepteurs de requêtes/réponses

### Autres bibliothèques
- **canvas-confetti** - Effets de confetti (quiz)
- **clsx** - Utilitaire pour classes CSS conditionnelles
- **html2canvas** - Capture d'écran (wallpaper)

---

## 📁 Structure du projet

```
frontend/
├── app/                    # App Router de Next.js
│   ├── layout.tsx         # Layout global (HTML, body)
│   ├── page.tsx           # Page d'accueil (/)
│   ├── pokemon/           # Page détails Pokémon
│   │   └── [id]/page.tsx  # Route dynamique (/pokemon/1)
│   ├── team/              # Gestionnaire d'équipe
│   │   └── page.tsx
│   ├── compare/           # Comparateur de Pokémon
│   │   └── page.tsx
│   ├── quiz/              # Quiz Pokémon
│   │   └── page.tsx
│   ├── battle/            # Simulateur de combat
│   │   └── page.tsx
│   ├── events/            # Événements Pokémon
│   │   └── page.tsx
│   ├── wallpaper/         # Générateur de fonds d'écran
│   │   └── page.tsx
│   └── globals.css        # Styles globaux + Tailwind
│
├── components/            # Composants réutilisables
│   ├── ui/               # Composants shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── dialog.tsx
│   │   ├── badge.tsx
│   │   └── progress.tsx
│   ├── pokemon-card.tsx       # Carte d'affichage Pokémon
│   ├── pokemon-list.tsx       # Liste avec scroll infini
│   ├── pokemon-stats.tsx      # Statistiques du Pokémon
│   ├── type-badge.tsx         # Badge de type (Feu, Eau...)
│   ├── evolution-chain.tsx    # Chaîne d'évolution
│   ├── ability-card.tsx       # Carte de capacité
│   ├── search-bar.tsx         # Barre de recherche
│   ├── filter-panel.tsx       # Panneau de filtres
│   └── header.tsx             # En-tête de navigation
│
├── hooks/                 # Custom Hooks React
│   ├── use-pokemon.ts     # Hooks SWR pour Pokémon
│   ├── use-team.ts        # Gestion de l'équipe
│   └── use-backend-pokemon.ts  # Appels backend
│
├── lib/                   # Bibliothèques utilitaires
│   ├── pokemon.ts         # Types et constantes Pokémon
│   ├── utils.ts           # Fonctions utilitaires (cn, etc.)
│   └── translations.ts    # Traductions françaises
│
├── public/               # Fichiers statiques
│   └── next.svg          # Logo Next.js
│
├── .env.local           # Variables d'environnement
├── next.config.ts       # Configuration Next.js
├── tailwind.config.ts   # Configuration Tailwind
├── tsconfig.json        # Configuration TypeScript
└── package.json         # Dépendances
```

---

## 🔄 Communication avec le Backend

### Configuration de l'API

**Fichier : `.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Hooks personnalisés pour l'API

**Fichier : `hooks/use-backend-pokemon.ts`**

```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Récupérer un Pokémon depuis le backend
export function useBackendPokemon(id: number) {
  const { data, error, isLoading } = useSWR(
    id ? `${API_URL}/api/pokemons/${id}` : null,
    fetcher
  );
  return { pokemon: data, error, isLoading };
}
```

### Architecture de communication

```
┌─────────────────────────────────────────────┐
│         Frontend (Next.js)                   │
│         http://localhost:3001                │
└──────────────┬──────────────────────────────┘
               │
               │ HTTP Requests (axios/fetch)
               │ GET, POST, PUT, DELETE
               │
               ▼
┌─────────────────────────────────────────────┐
│         Backend API (Express)                │
│         http://localhost:3000/api            │
└──────────────┬──────────────────────────────┘
               │
               ├──► PokeAPI (données Pokémon)
               │    https://pokeapi.co/api/v2
               │
               └──► PostgreSQL (équipes, favoris)
                    via Prisma ORM
```

### Flux de données typique

**Exemple : Afficher un Pokémon**

1. **User** → Clique sur un Pokémon
2. **Frontend** → Navigation vers `/pokemon/25`
3. **Next.js** → Charge `app/pokemon/[id]/page.tsx`
4. **Hook SWR** → Appelle `usePokemon(25)`
5. **Axios** → GET `http://localhost:3000/api/pokemons/25`
6. **Backend** → Vérifie cache, sinon appelle PokeAPI
7. **Backend** → Retourne données JSON
8. **Frontend** → SWR met en cache + affiche

### Gestion du cache avec SWR

```typescript
// Configuration SWR globale
const swrConfig = {
  revalidateOnFocus: false,     // Pas de revalidation au focus
  revalidateOnReconnect: true,  // Revalidation à la reconnexion
  dedupingInterval: 5000,       // Évite les appels dupliqués (5s)
}

// Utilisation
const { data, error, isLoading } = useSWR('/api/pokemons/1', fetcher, swrConfig);
```

---

## 🎨 Fonctionnalités principales

### 1. Page d'accueil - Liste des Pokémon

**Fichier : `app/page.tsx`**

**Fonctionnalités :**
- ✅ Scroll infini (charge 20 Pokémon à la fois)
- ✅ Recherche par nom
- ✅ Filtres par type, génération
- ✅ Tri par ID, nom, statistiques
- ✅ Vue grille ou liste

**Technologies :**
- `useSWRInfinite` pour le scroll infini
- Framer Motion pour les animations
- Debounce pour la recherche

**Code simplifié :**
```typescript
function Home() {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  const { pokemon, isLoading, isReachingEnd, loadMore } = usePokemonList({
    limit: 20,
    search,
    type: selectedType,
  });
  
  return (
    <div>
      <SearchBar onSearch={setSearch} />
      <FilterPanel onTypeChange={setSelectedType} />
      <PokemonList 
        pokemon={pokemon} 
        onLoadMore={loadMore}
        isReachingEnd={isReachingEnd}
      />
    </div>
  );
}
```

### 2. Page détails Pokémon

**Fichier : `app/pokemon/[id]/page.tsx`**

**Affiche :**
- Informations générales (nom, types, taille, poids)
- Statistiques (HP, Attack, Defense, Speed...)
- Capacités (abilities)
- Chaîne d'évolution
- Modèle 3D interactif
- Sprite animé

**Communication API :**
```typescript
// Récupère le Pokémon
GET /api/pokemons/:id

// Réponse
{
  id: 25,
  name: "Pikachu",
  types: ["Electric"],
  stats: { hp: 35, attack: 55, ... },
  abilities: ["Static", "Lightning Rod"],
  evolutions: ["Pichu", "Pikachu", "Raichu"],
  sprite: "https://...",
  artwork: "https://..."
}
```

### 3. Gestionnaire d'équipe

**Fichier : `app/team/page.tsx`**

**Fonctionnalités :**
- ✅ Ajouter/supprimer des Pokémon (max 6)
- ✅ Drag & drop pour réorganiser
- ✅ Sauvegarde dans le backend (si authentifié)
- ✅ Analyse de l'équipe (types, faiblesses)

**État local :**
```typescript
const [team, setTeam] = useState<Pokemon[]>([]);

// Ajouter un Pokémon
function addToTeam(pokemon: Pokemon) {
  if (team.length < 6) {
    setTeam([...team, pokemon]);
    // Sauvegarder dans le backend
    saveTeamToBackend(team);
  }
}
```

### 4. Comparateur de Pokémon

**Fichier : `app/compare/page.tsx`**

**Compare :**
- Statistiques côte à côte
- Types et faiblesses
- Capacités
- Graphique radar des stats

**Bibliothèque :** Chart.js ou Recharts pour le graphique

### 5. Quiz Pokémon

**Fichier : `app/quiz/page.tsx`**

**Modes de jeu :**
- Facile : Pokémon 1-151 (Gen 1)
- Moyen : Pokémon 1-493 (Gen 1-4)
- Difficile : Pokémon 1-905 (Gen 1-8)

**Logique :**
```typescript
function Quiz() {
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  
  function checkAnswer(answer: string) {
    if (answer.toLowerCase() === currentPokemon.name.toLowerCase()) {
      setScore(score + 1);
      confetti(); // 🎉
      nextQuestion();
    } else {
      setLives(lives - 1);
      if (lives === 0) gameOver();
    }
  }
}
```

### 6. Simulateur de combat

**Fichier : `app/battle/page.tsx`**

**Simule :**
- Combat entre 2 Pokémon
- Calcul de dégâts basé sur les stats
- Avantages de types
- Animations de combat

**Formule de dégâts simplifiée :**
```typescript
function calculateDamage(attacker: Pokemon, defender: Pokemon) {
  const typeMultiplier = getTypeEffectiveness(attacker.types, defender.types);
  const baseDamage = (attacker.stats.attack / defender.stats.defense) * 50;
  return baseDamage * typeMultiplier;
}
```

### 7. Générateur de fonds d'écran

**Fichier : `app/wallpaper/page.tsx`**

**Fonctionnalités :**
- Sélection d'un Pokémon
- Choix du motif de fond (gradient, dots, waves, geometric)
- Génération 1920x1080
- Téléchargement en PNG

**Technologies :**
- Canvas API pour le dessin
- html2canvas pour la capture

**Code simplifié :**
```typescript
function generateWallpaper() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  
  // Dessiner le fond
  drawBackground(ctx, pattern);
  
  // Dessiner le Pokémon
  drawPokemon(ctx, pokemon);
  
  // Télécharger
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${pokemon.name}-wallpaper.png`;
    link.href = url;
    link.click();
  });
}
```

---

## 🎯 Hooks personnalisés

### `use-pokemon.ts` - Gestion des Pokémon

```typescript
// Récupérer un Pokémon
export function usePokemon(id: number | string) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/pokemons/${id}` : null,
    fetcher
  );
  return { pokemon: data, error, isLoading };
}

// Liste avec scroll infini
export function usePokemonList(options) {
  const { data, size, setSize, isLoading } = useSWRInfinite(
    (index) => `/api/pokemons?limit=20&offset=${index * 20}`,
    fetcher
  );
  
  const pokemon = data ? data.flatMap(page => page.results) : [];
  const isReachingEnd = data && data[data.length - 1]?.results.length < 20;
  
  return {
    pokemon,
    isLoading,
    isReachingEnd,
    loadMore: () => setSize(size + 1),
  };
}
```

### `use-team.ts` - Gestion d'équipe

```typescript
export function useTeam() {
  const [team, setTeam] = useState<Pokemon[]>([]);
  
  const addPokemon = (pokemon: Pokemon) => {
    if (team.length < 6 && !team.find(p => p.id === pokemon.id)) {
      setTeam([...team, pokemon]);
    }
  };
  
  const removePokemon = (id: number) => {
    setTeam(team.filter(p => p.id !== id));
  };
  
  return { team, addPokemon, removePokemon };
}
```

---

## 🌐 Internationalisation (i18n)

**Fichier : `lib/translations.ts`**

Toutes les traductions sont centralisées :
```typescript
export const translations = {
  types: {
    fire: 'Feu',
    water: 'Eau',
    grass: 'Plante',
    electric: 'Électrik',
    // ... tous les types
  },
  stats: {
    hp: 'PV',
    attack: 'Attaque',
    defense: 'Défense',
    'special-attack': 'Attaque Spé.',
    'special-defense': 'Défense Spé.',
    speed: 'Vitesse',
  },
  ui: {
    search: 'Rechercher un Pokémon...',
    loading: 'Chargement...',
    loadMore: 'Charger plus',
    // ... tous les textes
  }
};
```

---

## 🎨 Système de design

### Couleurs par type de Pokémon

```typescript
const typeColors = {
  fire: 'bg-orange-500',
  water: 'bg-blue-500',
  grass: 'bg-green-500',
  electric: 'bg-yellow-400',
  psychic: 'bg-pink-500',
  // ... tous les types
};
```

### Composants réutilisables

Tous les composants UI suivent le pattern shadcn/ui :
- Accessible (ARIA)
- Personnalisable avec Tailwind
- Composable
- Type-safe

---

## 🚀 Performance

### Optimisations Next.js

- **Image Optimization** : `next/image` optimise automatiquement
- **Code Splitting** : Chaque page charge uniquement son code
- **Static Generation** : Pages pré-rendues quand possible
- **Turbopack** : Bundler ultra-rapide en développement

### Optimisations React

- `useMemo` pour les calculs coûteux
- `useCallback` pour éviter les re-renders
- Lazy loading des composants lourds
- Debounce sur la recherche

### Cache SWR

- Cache en mémoire des requêtes
- Revalidation intelligente
- Deduplicate les requêtes identiques

---

## 📦 Déploiement

L'application peut être déployée sur :
- **Vercel** (recommandé pour Next.js)
- **Netlify**
- **Tout serveur Node.js**

**Build de production :**
```bash
npm run build
npm run start
```

---

**Frontend moderne, performant et accessible ! 🎨✨**
