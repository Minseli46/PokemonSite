# Backend API - Pokédex

API RESTful Express avec PostgreSQL pour l'application Pokédex.

## 🚀 Démarrage Rapide

```bash
# Installer les dépendances
npm install

# Configurer la base de données
cp .env.example .env
# Éditer .env avec vos paramètres

# Générer Prisma Client
npx prisma generate

# Lancer les migrations
npx prisma migrate dev

# Démarrer le serveur
npm run dev
```

Le serveur sera accessible sur **http://localhost:3000**

## 📁 Structure

```
backend/
├── prisma/
│   └── schema.prisma      # Schéma de base de données
├── src/
│   ├── config/           # Configurations centralisées
│   │   ├── database.ts
│   │   ├── cors.ts
│   │   ├── server.ts
│   │   └── index.ts
│   ├── constants/        # Constantes de l'app
│   │   ├── api.ts
│   │   ├── messages.ts
│   │   ├── httpStatus.ts
│   │   └── index.ts
│   ├── types/           # Types TypeScript
│   │   ├── express.ts
│   │   ├── pokemon.ts
│   │   └── index.ts
│   ├── utils/           # Utilitaires
│   │   ├── response.ts
│   │   ├── validation.ts
│   │   └── index.ts
│   ├── controllers/     # Logique métier
│   │   ├── pokemonController.ts
│   │   ├── teamController.ts
│   │   └── quizController.ts
│   ├── routes/          # Routes API
│   │   ├── pokemonRoutes.ts
│   │   ├── teamRoutes.ts
│   │   └── quizRoutes.ts
│   ├── services/        # Services externes
│   │   ├── databaseService.ts
│   │   └── pokeAPIService.ts
│   ├── middlewares/     # Middlewares
│   │   ├── authMiddleware.ts
│   │   └── errorMiddleware.ts
│   ├── app.ts          # Configuration Express
│   └── server.ts       # Point d'entrée
└── package.json
```

## 🔌 API Endpoints

### Pokémon

- `GET /api/pokemons` - Liste paginée (limit, offset)
- `GET /api/pokemons/:id` - Détails d'un Pokémon
- `GET /api/pokemons/search?name=pikachu` - Recherche par nom
- `GET /api/pokemons/type/:type` - Pokémon par type

### Équipes

- `GET /api/teams` - Toutes les équipes
- `POST /api/teams` - Créer une équipe
- `PUT /api/teams/:id` - Modifier une équipe
- `DELETE /api/teams/:id` - Supprimer une équipe

### Quiz

- `GET /api/quiz/random?min=1&max=151` - Pokémon aléatoire dans un range

## 🗄️ Base de Données

Le schéma Prisma définit les modèles suivants :

- **Pokemon** : Cache des Pokémon (de PokeAPI)
- **Team** : Équipes de Pokémon
- **Favorite** : Pokémon favoris par utilisateur

### Commandes Prisma Utiles

```bash
# Ouvrir Prisma Studio (GUI)
npx prisma studio

# Créer une migration
npx prisma migrate dev --name nom_migration

# Réinitialiser la BDD
npx prisma migrate reset

# Formater le schéma
npx prisma format
```

## 🔧 Scripts NPM

```bash
npm run dev      # Mode développement (tsx watch)
npm run build    # Compiler TypeScript
npm start        # Production
```

## 📦 Dépendances Principales

- **express** - Framework web Node.js
- **prisma** - ORM moderne pour PostgreSQL
- **@prisma/client** - Client Prisma généré
- **axios** - Client HTTP pour appels vers PokeAPI
- **cors** - Gestion Cross-Origin Resource Sharing
- **dotenv** - Variables d'environnement
- **typescript** - Typage statique JavaScript
- **tsx** - Exécution TypeScript en développement

## 🌐 Service PokéAPI

Le backend utilise [PokéAPI](https://pokeapi.co) comme source de données :

- Données Pokémon complètes et à jour
- Cache en base de données PostgreSQL
- Appels API optimisés avec timeout

## 🛠️ Configuration

Variables d'environnement (`.env`) :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pokedex?schema=public"
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

## 📝 Développement

### Ajouter un Endpoint

1. Créer un controller dans `src/controllers/`
2. Créer une route dans `src/routes/`
3. Enregistrer la route dans `src/app.ts`

### Modifier le Schéma BDD

1. Éditer `prisma/schema.prisma`
2. Lancer `npx prisma migrate dev --name nom_migration`
3. Générer le client : `npx prisma generate`

## 🏗️ Architecture

Le backend suit une architecture en couches :

```
Routes → Controllers → Services → Database/API
```

- **Routes** : Définissent les endpoints HTTP
- **Controllers** : Logique métier et validation
- **Services** : Accès aux données (DB, API externe)
- **Middlewares** : Traitement des requêtes (CORS, erreurs)

## 🐛 Debugging

```bash
# Ouvrir Prisma Studio (GUI pour la DB)
npx prisma studio

# Vérifier la connexion BDD
npx prisma db pull
```

---

**Pour plus de détails sur l'architecture, voir [STRUCTURE.md](STRUCTURE.md) et [BACKEND-GUIDE.md](BACKEND-GUIDE.md)**
