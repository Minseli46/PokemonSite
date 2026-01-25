# 🏗️ Structure du Backend

## 📁 Organisation des dossiers

```
backend/
├── src/
│   ├── config/              # Configurations centralisées
│   │   ├── database.ts      # Configuration Prisma
│   │   ├── cors.ts          # Configuration CORS
│   │   ├── server.ts        # Configuration serveur
│   │   └── index.ts         # Point d'entrée config
│   │
│   ├── constants/           # Constantes de l'application
│   │   ├── api.ts          # Constantes API (URL, timeout)
│   │   ├── messages.ts     # Messages d'erreur/succès
│   │   ├── httpStatus.ts   # Codes HTTP
│   │   └── index.ts        # Point d'entrée constants
│   │
│   ├── types/              # Types TypeScript
│   │   ├── express.ts      # Types Express personnalisés
│   │   ├── pokemon.ts      # Types Pokémon
│   │   └── index.ts        # Point d'entrée types
│   │
│   ├── utils/              # Utilitaires
│   │   ├── response.ts     # Utilitaires de réponse HTTP
│   │   ├── validation.ts   # Utilitaires de validation
│   │   └── index.ts        # Point d'entrée utils
│   │
│   ├── services/           # Logique métier
│   │   ├── databaseService.ts    # Service base de données
│   │   └── pokeAPIService.ts     # Service API Pokémon
│   │
│   ├── controllers/        # Contrôleurs (logique des routes)
│   │   ├── pokemonController.ts
│   │   ├── quizController.ts
│   │   └── teamController.ts
│   │
│   ├── routes/             # Définition des routes
│   │   ├── pokemonRoutes.ts
│   │   ├── quizRoutes.ts
│   │   └── teamRoutes.ts
│   │
│   ├── middlewares/        # Middlewares Express
│   │   ├── authMiddleware.ts
│   │   └── errorMiddleware.ts
│   │
│   ├── app.ts              # Configuration Express
│   └── server.ts           # Point d'entrée serveur
│
├── prisma/                 # Configuration Prisma
│   └── schema.prisma       # Schéma de base de données
│
├── .env                    # Variables d'environnement
├── .env.example            # Exemple de variables
├── package.json            # Dépendances NPM
├── tsconfig.json           # Configuration TypeScript
└── README.md               # Documentation

```

## 🎯 Principes de conception

### 1. **Séparation des préoccupations**
- **config/** : Toutes les configurations en un seul endroit
- **constants/** : Constantes magiques évitées, tout est nommé
- **types/** : Types TypeScript centralisés et réutilisables
- **utils/** : Fonctions utilitaires réutilisables

### 2. **Architecture en couches**
```
Requête HTTP
    ↓
Routes (routing)
    ↓
Controllers (logique métier)
    ↓
Services (accès données)
    ↓
Database / API externe
```

### 3. **Points d'entrée centralisés**
Chaque dossier a un `index.ts` qui exporte tout :
```typescript
// Utilisation simple
import { getPrismaClient, serverConfig } from './config';
import { HTTP_STATUS, ERROR_MESSAGES } from './constants';
import { sendSuccess, sendError } from './utils';
```

## 📦 Modules principaux

### **config/**
Centralise toutes les configurations :
- `database.ts` : Prisma Client avec logging conditionnel
- `cors.ts` : Configuration CORS pour le frontend
- `server.ts` : Port, environnement, préfixes API

### **constants/**
Évite les "magic numbers" et strings :
- `api.ts` : URL de base, limites de pagination, timeout
- `messages.ts` : Messages d'erreur et de succès standardisés
- `httpStatus.ts` : Codes HTTP en constantes nommées

### **types/**
Types TypeScript partagés :
- `express.ts` : Types pour Express (AuthRequest, RouteHandler)
- `pokemon.ts` : Types pour les données Pokémon

### **utils/**
Fonctions utilitaires :
- `response.ts` : `sendSuccess()`, `sendError()`, classe `AppError`
- `validation.ts` : Validateurs réutilisables

## 🔄 Flux de données

### Exemple : Récupérer un Pokémon
```
1. GET /api/pokemons/:id
2. pokemonRoutes.ts → route vers controller
3. pokemonController.ts → logique métier
4. pokeAPIService.ts → appel API externe
5. Controller → formate réponse
6. sendSuccess() → répond au client
```

## 🛠️ Utilisation des utilitaires

### Réponses standardisées
```typescript
import { sendSuccess, sendError } from './utils';
import { HTTP_STATUS, ERROR_MESSAGES } from './constants';

// Succès
sendSuccess(res, pokemon, 'Pokémon trouvé');

// Erreur
sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.POKEMON_NOT_FOUND);
```

### Configuration Prisma
```typescript
import { getPrismaClient } from './config';

const prisma = getPrismaClient();
await prisma.pokemon.findMany();
```

## 🚀 Avantages de cette structure

✅ **Maintenabilité** : Code organisé, facile à trouver
✅ **Réutilisabilité** : Utilitaires et types partagés
✅ **Testabilité** : Modules indépendants, faciles à tester
✅ **Scalabilité** : Ajouter des features facilement
✅ **Type Safety** : TypeScript avec types centralisés
✅ **Lisibilité** : Structure claire et documentée

## 📝 Conventions de code

- **Fichiers** : camelCase (pokemonController.ts)
- **Classes** : PascalCase (DatabaseService)
- **Fonctions** : camelCase (getPokemonList)
- **Constants** : UPPER_SNAKE_CASE (POKEAPI_BASE_URL)
- **Types/Interfaces** : PascalCase (PokemonDetails)

## 🔧 Configuration environnement

Variables dans `.env` :
```env
# Database
DATABASE_URL="postgresql://..."

# Server
PORT=3000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3001

# Firebase (optionnel)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

## 📚 Prochaines étapes

Pour ajouter une nouvelle fonctionnalité :

1. **Définir les types** dans `types/`
2. **Ajouter les constantes** dans `constants/`
3. **Créer le service** dans `services/`
4. **Créer le controller** dans `controllers/`
5. **Définir les routes** dans `routes/`
6. **Importer dans** `app.ts`

---

**Cette structure suit les meilleures pratiques Node.js/Express/TypeScript** 🎯
