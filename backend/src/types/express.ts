import { Request, Response, NextFunction } from 'express';

/**
 * Interface pour les requêtes avec userId optionnel
 */
export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Type pour les handlers de route
 */
export type RouteHandler = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<void> | void;

/**
 * Type pour les handlers de route avec authentification
 */
export type AuthRouteHandler = (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => Promise<void> | void;

/**
 * Interface pour les réponses d'erreur
 */
export interface ErrorResponse {
  message: string;
  error?: string;
  stack?: string;
}

/**
 * Interface pour les réponses de succès
 */
export interface SuccessResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}
