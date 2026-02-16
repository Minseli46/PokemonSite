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

