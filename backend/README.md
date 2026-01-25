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
│   ├── schema.prisma      # Schéma de base de données
│   └── migrations/        # Migrations SQL
├── src/
│   ├── controllers/       # Logique métier
│   │   ├── pokemonController.ts
│   │   ├── teamController.ts
│   │   └── quizController.ts
│   ├── routes/           # Routes API
│   │   ├── pokemon.ts
│   │   ├── teams.ts
│   │   └── quiz.ts
│   ├── services/         # Services externes
│   │   └── pokeAPIService.ts
│   ├── middleware/       # Middlewares
│   └── index.ts          # Point d'entrée
└── package.json
```

## 🔌 API Endpoints

### Pokémon

- `GET /api/pokemon` - Liste paginée
- `GET /api/pokemon/:id` - Détails complets
- `GET /api/pokemon/search/:name` - Recherche
- `GET /api/pokemon/type/:type` - Filtrer par type
- `POST /api/pokemon/:id1/compare/:id2` - Comparer

### Équipes

- `GET /api/teams/user/:userId` - Équipes d'un utilisateur
- `POST /api/teams` - Créer une équipe
- `PUT /api/teams/:id` - Modifier une équipe
- `DELETE /api/teams/:id` - Supprimer une équipe

### Quiz

- `GET /api/quiz/random` - Question aléatoire
- `POST /api/quiz/submit` - Soumettre une réponse

## 🗄️ Base de Données

Le schéma Prisma définit les modèles suivants :

- **Team** : Équipes de Pokémon
- **TeamPokemon** : Pokémon dans une équipe

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
npm run dev      # Mode développement (nodemon)
npm run build    # Compiler TypeScript
npm start        # Production
npm run lint     # ESLint
```

## 📦 Dépendances Principales

- **express** - Framework web
- **prisma** - ORM
- **axios** - Requêtes HTTP vers PokéAPI
- **cors** - Gestion CORS
- **dotenv** - Variables d'environnement
- **typescript** - Typage statique

## 🌐 Service PokéAPI

Le backend utilise [PokéAPI](https://pokeapi.co) comme source de données :

- Données Pokémon en temps réel
- Pas de stockage local des Pokémon
- Cache en mémoire pour performances

## 🛠️ Configuration

Variables d'environnement (`.env`) :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pokedex"
PORT=3000
NODE_ENV=development
JWT_SECRET=secret_optionnel
```

## 📝 Développement

### Ajouter un Endpoint

1. Créer un controller dans `src/controllers/`
2. Créer une route dans `src/routes/`
3. Enregistrer la route dans `src/index.ts`

### Modifier le Schéma BDD

1. Éditer `prisma/schema.prisma`
2. Lancer `npx prisma migrate dev`
3. Générer le client : `npx prisma generate`

## 🐛 Debugging

```bash
# Logs détaillés
DEBUG=* npm run dev

# Vérifier la connexion BDD
npx prisma db pull
```
