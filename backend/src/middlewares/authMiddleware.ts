import { Request, Response, NextFunction } from 'express';

/**
 * Middleware optionnel - Placeholder pour une future authentification
 * Pour l'instant, laisse passer toutes les requêtes
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Pas d'authentification pour l'instant
  // Peut être implémenté plus tard si nécessaire
  next();
};
