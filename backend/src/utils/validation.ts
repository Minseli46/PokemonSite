/**
 * Utilitaires de validation
 */

/**
 * Vérifie si un ID Pokémon est valide
 */
export function isValidPokemonId(id: any): boolean {
  const numId = Number(id);
  return !isNaN(numId) && numId > 0 && Number.isInteger(numId);
}

/**
 * Vérifie si une limite est valide
 */
export function isValidLimit(limit: any): boolean {
  const numLimit = Number(limit);
  return !isNaN(numLimit) && numLimit > 0 && numLimit <= 100;
}

/**
 * Vérifie si un offset est valide
 */
export function isValidOffset(offset: any): boolean {
  const numOffset = Number(offset);
  return !isNaN(numOffset) && numOffset >= 0;
}

/**
 * Sanitize une chaîne de caractères
 */
export function sanitizeString(str: string): string {
  return str.trim().toLowerCase();
}
