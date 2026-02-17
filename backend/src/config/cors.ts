import { CorsOptions } from 'cors';

/**
 * Configuration CORS - autorise les ports locaux du frontend
 */
const ALLOWED_ORIGINS = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (curl, Postman, etc.)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} non autorisée`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
