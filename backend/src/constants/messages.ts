/**
 * Messages d'erreur
 */

export const ERROR_MESSAGES = {
  // Erreurs Pokémon
  POKEMON_NOT_FOUND: 'Pokémon non trouvé',
  POKEMON_FETCH_ERROR: 'Erreur lors de la récupération du Pokémon',
  POKEMON_LIST_FETCH_ERROR: 'Erreur lors de la récupération de la liste des Pokémon',
  
  // Erreurs validation
  INVALID_POKEMON_ID: 'ID de Pokémon invalide',
  INVALID_LIMIT: 'Limite invalide (max: 100)',
  INVALID_OFFSET: 'Offset invalide',
  
  // Erreurs base de données
  DATABASE_ERROR: 'Erreur de base de données',
  DATABASE_CONNECTION_ERROR: 'Erreur de connexion à la base de données',
  
  // Erreurs génériques
  INTERNAL_ERROR: 'Erreur interne du serveur',
  NOT_FOUND: 'Ressource non trouvée',
  BAD_REQUEST: 'Requête invalide',
  UNAUTHORIZED: 'Non autorisé',
} as const;

/**
 * Messages de succès
 */
export const SUCCESS_MESSAGES = {
  POKEMON_FOUND: 'Pokémon trouvé',
  POKEMON_LIST_FOUND: 'Liste des Pokémon récupérée',
  TEAM_CREATED: 'Équipe créée avec succès',
  TEAM_UPDATED: 'Équipe mise à jour',
  TEAM_DELETED: 'Équipe supprimée',
} as const;
