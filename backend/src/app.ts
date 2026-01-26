import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { corsConfig } from './config';
import pokemonRoutes from './routes/pokemonRoutes';
import newsRoutes from './routes/news';
import { errorHandler, notFoundHandler } from './middlewares/errorMiddleware';
import { optionalAuth } from './middlewares/authMiddleware';

// Charge les variables d'environnement
dotenv.config();

const app: Application = express();

// Middlewares globaux
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware d'authentification optionnel
app.use(optionalAuth);

// Routes
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to Pokédex API',
    version: '1.0.0',
    endpoints: {
      pokemons: '/api/pokemons',
      news: '/api/news',
    },
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/pokemons', pokemonRoutes);
app.use('/api/news', newsRoutes);

// Gestion des erreurs
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
