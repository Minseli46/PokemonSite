# 🔧 Guide du Backend - Pokédex API

## 🛠️ Technologies utilisées

### Framework principal
- **Express.js 4.18.2**
  - Framework web minimaliste pour Node.js
  - Middleware flexible
  - Routing puissant
  - Compatible avec TypeScript

### Langage
- **TypeScript 5.3.3**
  - Typage statique pour Node.js
  - Compilation vers JavaScript
  - Meilleure maintenabilité du code

### Base de données
- **PostgreSQL** (via Prisma ORM)
  - Base de données relationnelle SQL
  - Haute performance
  - ACID (Atomicité, Cohérence, Isolation, Durabilité)
  - Stockage des équipes, favoris, utilisateurs

### ORM (Object-Relational Mapping)
- **Prisma 5.22.0**
  - ORM moderne pour Node.js
  - Type-safe database queries
  - Migration automatique
  - Prisma Studio pour visualiser les données
  - Auto-génération du client

### API externe
- **PokeAPI** (https://pokeapi.co/api/v2)
  - API RESTful gratuite
  - Données complètes sur tous les Pokémon
  - Aucune authentification requise

### Bibliothèques principales
- **Axios 1.6.5** - Client HTTP pour appels API
- **CORS 2.8.5** - Cross-Origin Resource Sharing
- **dotenv 16.3.1** - Variables d'environnement
- **express-validator 7.0.1** - Validation des requêtes
- **firebase-admin 12.0.0** - Authentification Firebase (optionnel)

### Outils de développement
- **tsx 4.21.0** - Exécution TypeScript en développement
- **Jest 29.7.0** - Framework de tests
- **Supertest 6.3.3** - Tests d'API
- **ts-jest 29.1.1** - Jest pour TypeScript

---

## 📁 Structure du Backend

```
backend/
├── src/
│   ├── config/              # Configurations centralisées
│   │   ├── database.ts      # Configuration Prisma Client
│   │   ├── cors.ts          # Configuration CORS
│   │   ├── server.ts        # Configuration serveur (port, env)
│   │   └── index.ts         # Point d'entrée config
│   │
│   ├── constants/           # Constantes de l'application
│   │   ├── api.ts          # URL, limites, timeout
│   │   ├── messages.ts     # Messages d'erreur/succès
│   │   ├── httpStatus.ts   # Codes HTTP (200, 404, 500...)
│   │   └── index.ts        # Point d'entrée constants
│   │
│   ├── types/              # Types TypeScript
│   │   ├── express.ts      # Types Express (Request, Response)
│   │   ├── pokemon.ts      # Types Pokémon
│   │   └── index.ts        # Point d'entrée types
│   │
│   ├── utils/              # Utilitaires réutilisables
│   │   ├── response.ts     # sendSuccess(), sendError()
│   │   ├── validation.ts   # Validateurs (ID, limite...)
│   │   └── index.ts        # Point d'entrée utils
│   │
│   ├── services/           # Logique métier (Business Logic)
│   │   ├── databaseService.ts    # Opérations base de données
│   │   └── pokeAPIService.ts     # Appels vers PokeAPI
│   │
│   ├── controllers/        # Contrôleurs (gestion des requêtes)
│   │   ├── pokemonController.ts  # CRUD Pokémon
│   │   ├── quizController.ts     # Quiz aléatoire
│   │   └── teamController.ts     # Gestion d'équipes
│   │
│   ├── routes/             # Définition des routes
│   │   ├── pokemonRoutes.ts      # /api/pokemons/*
│   │   ├── quizRoutes.ts         # /api/quiz/*
│   │   └── teamRoutes.ts         # /api/teams/*
│   │
│   ├── middlewares/        # Middlewares Express
│   │   ├── authMiddleware.ts     # Authentification (optionnel)
│   │   └── errorMiddleware.ts    # Gestion des erreurs
│   │
│   ├── app.ts              # Configuration Express (middlewares, routes)
│   └── server.ts           # Point d'entrée (démarrage serveur)
│
├── prisma/
│   └── schema.prisma       # Schéma de base de données
│
├── .env                    # Variables d'environnement (secret)
├── .env.example            # Exemple de configuration
├── package.json            # Dépendances NPM
├── tsconfig.json           # Configuration TypeScript
└── jest.config.js          # Configuration tests
```

---

## 🗄️ Base de données (PostgreSQL + Prisma)

### Schéma Prisma (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Modèle pour stocker les Pokémon en cache
model Pokemon {
  id         Int      @id @default(autoincrement())
  pokemonId  Int      @unique
  name       String
  types      Json     // ["fire", "flying"]
  sprite     String
  artwork    String
  stats      Json     // { hp: 78, attack: 84, ... }
  evolutions Json?    // ["Charmander", "Charmeleon", "Charizard"]
  generation Int
  height     Int
  weight     Int
  abilities  Json     // ["Blaze", "Solar Power"]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

// Modèle pour les équipes de Pokémon
model Team {
  id        Int      @id @default(autoincrement())
  name      String
  userId    String?  // ID Firebase (si authentifié)
  pokemon   Json     // [1, 25, 6, 143, 94, 150] (IDs des Pokémon)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Modèle pour les favoris
model Favorite {
  id        Int      @id @default(autoincrement())
  userId    String
  pokemonId Int
  createdAt DateTime @default(now())
  
  @@unique([userId, pokemonId])
}
```

### Migration de la base de données

```bash
# Créer une migration
npx prisma migrate dev --name init

# Générer le Prisma Client
npx prisma generate

# Ouvrir Prisma Studio (interface graphique)
npx prisma studio
```

### Connexion à la base de données

**Fichier : `src/config/database.ts`**

```typescript
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'error', 'warn'] 
        : ['error'],
    });
  }
  return prisma;
}

export async function disconnectDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}
```

---

## 🔄 Architecture en couches

```
┌─────────────────────────────────────────────┐
│         Client (Frontend)                    │
│         http://localhost:3001                │
└──────────────┬──────────────────────────────┘
               │
               │ HTTP Request (GET, POST, PUT, DELETE)
               │
               ▼
┌─────────────────────────────────────────────┐
│         Routes (Routing)                     │
│  pokemonRoutes | quizRoutes | teamRoutes    │
│  Définit les endpoints : /api/pokemons/:id  │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│       Controllers (Logique métier)           │
│  pokemonController | quizController          │
│  Traite la requête, appelle les services    │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│      Services (Accès aux données)            │
│  databaseService | pokeAPIService            │
│  Interagit avec DB ou API externe           │
└──────────────┬──────────────────────────────┘
               │
               ├──► PostgreSQL (via Prisma)
               │    Stockage persistant
               │
               └──► PokeAPI (API externe)
                    https://pokeapi.co/api/v2
```

---

## 🛣️ Routes API

### 1. Routes Pokémon (`/api/pokemons`)

**Fichier : `src/routes/pokemonRoutes.ts`**

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/pokemons` | Liste paginée (limit, offset) |
| GET | `/api/pokemons/:id` | Détails d'un Pokémon |
| GET | `/api/pokemons/search?name=pikachu` | Recherche par nom |
| GET | `/api/pokemons/type/:type` | Pokémon par type |

**Exemple de requête :**
```bash
GET http://localhost:3000/api/pokemons?limit=20&offset=0

Réponse:
{
  "count": 1000,
  "next": "/api/pokemons?limit=20&offset=20",
  "previous": null,
  "results": [
    { "id": 1, "name": "bulbasaur", "url": "/api/pokemons/1" },
    { "id": 2, "name": "ivysaur", "url": "/api/pokemons/2" },
    ...
  ]
}
```

### 2. Routes Quiz (`/api/quiz`)

**Fichier : `src/routes/quizRoutes.ts`**

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/quiz/random?min=1&max=151` | Pokémon aléatoire dans un range |

**Exemple :**
```bash
GET http://localhost:3000/api/quiz/random?min=1&max=151

Réponse:
{
  "id": 25,
  "name": "pikachu",
  "sprite": "https://...",
  "types": ["electric"]
}
```

### 3. Routes Équipes (`/api/teams`)

**Fichier : `src/routes/teamRoutes.ts`**

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/teams` | Toutes les équipes de l'utilisateur |
| POST | `/api/teams` | Créer une équipe |
| PUT | `/api/teams/:id` | Mettre à jour une équipe |
| DELETE | `/api/teams/:id` | Supprimer une équipe |

**Exemple de création :**
```bash
POST http://localhost:3000/api/teams
Content-Type: application/json

{
  "name": "Mon équipe de feu",
  "pokemon": [4, 5, 6, 37, 38, 58]
}

Réponse:
{
  "id": 1,
  "name": "Mon équipe de feu",
  "pokemon": [4, 5, 6, 37, 38, 58],
  "userId": null,
  "createdAt": "2026-01-25T10:00:00Z",
  "updatedAt": "2026-01-25T10:00:00Z"
}
```

---

## ⚙️ Fonctionnalités détaillées

### 1. Récupération des Pokémon (Cache + PokeAPI)

**Fichier : `src/controllers/pokemonController.ts`**

**Flux de données :**

```
1. Client → GET /api/pokemons/25
2. Controller → Vérifie le cache en DB
3. Si en cache → Retourne depuis PostgreSQL
4. Si pas en cache → Appelle PokeAPI
5. Sauvegarde dans PostgreSQL (cache)
6. Retourne au client
```

**Code du controller :**

```typescript
export async function getPokemonById(req: Request, res: Response) {
  const { id } = req.params;
  
  try {
    // 1. Chercher dans la base de données (cache)
    let pokemon = await databaseService.getPokemonById(Number(id));
    
    if (!pokemon) {
      // 2. Pas en cache, appeler PokeAPI
      const pokeApiData = await pokeAPIService.getPokemonDetails(id);
      
      // 3. Formater les données
      const formattedPokemon = {
        pokemonId: pokeApiData.id,
        name: pokeApiData.name,
        types: pokeApiData.types.map(t => t.type.name),
        sprite: pokeApiData.sprites.front_default,
        artwork: pokeApiData.sprites.other['official-artwork'].front_default,
        stats: {
          hp: pokeApiData.stats[0].base_stat,
          attack: pokeApiData.stats[1].base_stat,
          defense: pokeApiData.stats[2].base_stat,
          specialAttack: pokeApiData.stats[3].base_stat,
          specialDefense: pokeApiData.stats[4].base_stat,
          speed: pokeApiData.stats[5].base_stat,
        },
        abilities: pokeApiData.abilities.map(a => a.ability.name),
        height: pokeApiData.height,
        weight: pokeApiData.weight,
        generation: getGeneration(pokeApiData.id),
      };
      
      // 4. Sauvegarder en cache
      pokemon = await databaseService.savePokemon(formattedPokemon);
    }
    
    // 5. Répondre
    sendSuccess(res, pokemon);
  } catch (error) {
    sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.POKEMON_NOT_FOUND, error);
  }
}
```

### 2. Service PokeAPI

**Fichier : `src/services/pokeAPIService.ts`**

```typescript
import axios from 'axios';
import { POKEAPI_BASE_URL, API_TIMEOUT } from '../constants';

class PokeAPIService {
  /**
   * Récupère la liste des Pokémon depuis PokeAPI
   */
  async getPokemonList(limit: number = 20, offset: number = 0) {
    try {
      const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon`, {
        params: { limit, offset },
        timeout: API_TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch Pokemon list from PokeAPI');
    }
  }

  /**
   * Récupère les détails d'un Pokémon
   */
  async getPokemonDetails(idOrName: string | number) {
    try {
      const response = await axios.get(
        `${POKEAPI_BASE_URL}/pokemon/${idOrName}`,
        { timeout: API_TIMEOUT }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Pokemon ${idOrName} not found`);
    }
  }

  /**
   * Récupère la chaîne d'évolution
   */
  async getEvolutionChain(url: string) {
    try {
      const response = await axios.get(url, { timeout: API_TIMEOUT });
      return this.parseEvolutionChain(response.data.chain);
    } catch (error) {
      throw new Error('Failed to fetch evolution chain');
    }
  }

  /**
   * Parse la chaîne d'évolution récursive
   */
  private parseEvolutionChain(chain: any): string[] {
    const evolutions = [chain.species.name];
    if (chain.evolves_to.length > 0) {
      chain.evolves_to.forEach((evolution: any) => {
        evolutions.push(...this.parseEvolutionChain(evolution));
      });
    }
    return evolutions;
  }
}

export default new PokeAPIService();
```

### 3. Service Database (Prisma)

**Fichier : `src/services/databaseService.ts`**

```typescript
import { getPrismaClient } from '../config';

class DatabaseService {
  private prisma = getPrismaClient();

  /**
   * Sauvegarde ou met à jour un Pokémon
   */
  async savePokemon(pokemonData: any) {
    return await this.prisma.pokemon.upsert({
      where: { pokemonId: pokemonData.pokemonId },
      update: pokemonData,
      create: pokemonData,
    });
  }

  /**
   * Récupère un Pokémon par ID
   */
  async getPokemonById(pokemonId: number) {
    return await this.prisma.pokemon.findUnique({
      where: { pokemonId },
    });
  }

  /**
   * Récupère tous les Pokémon avec pagination
   */
  async getAllPokemon(skip: number = 0, take: number = 20) {
    const [pokemon, total] = await Promise.all([
      this.prisma.pokemon.findMany({
        skip,
        take,
        orderBy: { pokemonId: 'asc' },
      }),
      this.prisma.pokemon.count(),
    ]);
    return { pokemon, total };
  }

  /**
   * Recherche des Pokémon par nom
   */
  async searchPokemonByName(name: string) {
    return await this.prisma.pokemon.findMany({
      where: {
        name: {
          contains: name.toLowerCase(),
          mode: 'insensitive',
        },
      },
      take: 20,
    });
  }

  /**
   * Créer une équipe
   */
  async createTeam(name: string, pokemon: number[], userId?: string) {
    return await this.prisma.team.create({
      data: {
        name,
        pokemon,
        userId,
      },
    });
  }

  /**
   * Récupérer les équipes d'un utilisateur
   */
  async getTeamsByUserId(userId: string) {
    return await this.prisma.team.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default new DatabaseService();
```

### 4. Middleware d'authentification (optionnel)

**Fichier : `src/middlewares/authMiddleware.ts`**

```typescript
import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

/**
 * Middleware d'authentification optionnel
 * Si un token est fourni, vérifie et ajoute userId à la requête
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (token) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      (req as any).userId = decodedToken.uid;
    } catch (error) {
      console.error('Invalid token:', error);
    }
  }
  
  next();
}

/**
 * Middleware d'authentification requis
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    (req as any).userId = decodedToken.uid;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
```

### 5. Middleware de gestion des erreurs

**Fichier : `src/middlewares/errorMiddleware.ts`**

```typescript
import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../constants';

/**
 * Gère les routes non trouvées (404)
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    message: `Route ${req.originalUrl} not found`,
  });
}

/**
 * Gère toutes les erreurs de l'application
 */
export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_ERROR;
  
  const response: any = {
    message: error.message || 'Internal server error',
  };
  
  // En développement, ajouter la stack trace
  if (process.env.NODE_ENV === 'development') {
    response.error = error.toString();
    response.stack = error.stack;
  }
  
  console.error('Error:', error);
  res.status(statusCode).json(response);
}
```

---

## 🔐 Sécurité et validation

### Variables d'environnement (`.env`)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/pokedex?schema=public"

# Server
PORT=3000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3001

# Firebase (optionnel - pour l'authentification)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Validation des requêtes

**Utilisation d'express-validator :**

```typescript
import { body, param, validationResult } from 'express-validator';

// Validation de création d'équipe
export const validateTeamCreation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Le nom doit contenir entre 1 et 50 caractères'),
  body('pokemon')
    .isArray({ min: 1, max: 6 })
    .withMessage('Une équipe doit contenir entre 1 et 6 Pokémon'),
  body('pokemon.*')
    .isInt({ min: 1 })
    .withMessage('ID Pokémon invalide'),
];

// Dans le controller
export async function createTeam(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  // Logique de création...
}
```

---

## 🧪 Tests

### Configuration Jest

**Fichier : `jest.config.js`**

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts'],
};
```

### Exemple de test d'API

**Fichier : `src/__tests__/pokemon.test.ts`**

```typescript
import request from 'supertest';
import app from '../app';

describe('Pokemon API', () => {
  it('GET /api/pokemons/1 - devrait retourner Bulbasaur', async () => {
    const response = await request(app)
      .get('/api/pokemons/1')
      .expect(200);
    
    expect(response.body.name).toBe('bulbasaur');
    expect(response.body.types).toContain('grass');
  });

  it('GET /api/pokemons/999999 - devrait retourner 404', async () => {
    await request(app)
      .get('/api/pokemons/999999')
      .expect(404);
  });

  it('GET /api/pokemons - devrait retourner une liste paginée', async () => {
    const response = await request(app)
      .get('/api/pokemons?limit=10&offset=0')
      .expect(200);
    
    expect(response.body.results).toHaveLength(10);
    expect(response.body.count).toBeGreaterThan(0);
  });
});
```

---

## 🚀 Démarrage et déploiement

### Scripts NPM

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

### Démarrage en développement

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer .env
cp .env.example .env
# Éditer .env avec vos valeurs

# 3. Générer le client Prisma
npm run prisma:generate

# 4. Créer la base de données
npm run prisma:migrate

# 5. Démarrer le serveur
npm run dev
```

### Déploiement en production

Le backend peut être déployé sur :
- **Heroku** (avec addon PostgreSQL)
- **Railway** (PostgreSQL inclus)
- **DigitalOcean App Platform**
- **AWS EC2 + RDS**
- **VPS** (avec PostgreSQL installé)

**Build de production :**
```bash
npm run build
npm run start
```

---

## 📊 Monitoring et logs

### Logs de développement

En développement, Prisma log toutes les requêtes :
```typescript
prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});
```

### Health check

```bash
GET http://localhost:3000/health

Réponse:
{
  "status": "ok",
  "timestamp": "2026-01-25T10:00:00.000Z"
}
```

---

**Backend robuste, scalable et bien structuré ! 🚀🔧**
