/**
 * Constantes API
 */

/**
 * URL de base de l'API PokeAPI
 */
export const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

/**
 * Limites de pagination
 */
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0,
} as const;

/**
 * Timeout pour les requêtes API
 */
export const API_TIMEOUT = 5000;
