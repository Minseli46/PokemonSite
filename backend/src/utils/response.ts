/**
 * Utilitaires pour la gestion des erreurs
 */

import { Response } from 'express';
import { ErrorResponse, SuccessResponse } from '../types';

/**
 * Envoie une réponse d'erreur
 */
export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  error?: any
): void {
  const response: ErrorResponse = {
    message,
  };

  if (process.env.NODE_ENV === 'development' && error) {
    response.error = error.message || error;
    if (error.stack) {
      response.stack = error.stack;
    }
  }

  res.status(statusCode).json(response);
}

/**
 * Envoie une réponse de succès
 */
export function sendSuccess<T = any>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): void {
  const response: SuccessResponse<T> = {
    success: true,
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (message) {
    response.message = message;
  }

  res.status(statusCode).json(response);
}

/**
 * Classe d'erreur personnalisée
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
