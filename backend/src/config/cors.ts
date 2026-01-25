import { CorsOptions } from 'cors';

/**
 * Configuration CORS
 */
export const corsConfig: CorsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
  optionsSuccessStatus: 200,
};
