'use client'

/**
 * Hook unifié pour gérer les Pokémon
 * Utilise notre backend Express au lieu de PokéAPI directement
 */

import { useBackendPokemonList, useBackendPokemon } from './use-backend-api'
import { usePokemonByType, usePokemonByGeneration } from './use-pokemon'

// Hook principal pour la liste (utilise notre backend)
export function usePokemonList(limit = 20) {
  const { 
    pokemon, 
    error, 
    isLoading, 
    isLoadingMore, 
    size, 
    setSize, 
    isReachingEnd, 
    total 
  } = useBackendPokemonList(limit)

  return {
    pokemon,
    error,
    isLoading,
    isLoadingMore,
    isValidating: isLoading,
    size,
    setSize,
    isReachingEnd,
    total,
  }
}

// Hook pour un Pokémon individuel (utilise notre backend)
export function usePokemon(idOrName: string | number) {
  const { pokemon, error, isLoading } = useBackendPokemon(idOrName)
  
  return {
    pokemon,
    error,
    isLoading,
  }
}

// Ces hooks continuent d'utiliser PokéAPI directement
// car le backend ne gère pas encore les filtres par type/génération
export { usePokemonByType, usePokemonByGeneration }
