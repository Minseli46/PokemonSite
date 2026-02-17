import { useState, useCallback } from 'react'
import { API_CONFIG } from '@/lib/constants'

interface PokemonData {
  id: number
  name: string
  image: string
}

export function usePokemonSearch() {
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchPokemon = useCallback(async (searchTerm: string): Promise<PokemonData | null> => {
    if (!searchTerm.trim()) return null

    setIsSearching(true)
    setError(null)

    try {
      const term = searchTerm.toLowerCase().trim()
      const response = await fetch(`${API_CONFIG.POKEAPI_URL}/pokemon/${term}`)
      
      if (!response.ok) {
        throw new Error('Pokémon non trouvé')
      }

      const data = await response.json()
      
      return {
        id: data.id,
        name: data.name,
        image: data.sprites.other['official-artwork'].front_default || '',
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de recherche'
      setError(errorMessage)
      console.error('❌ Erreur recherche Pokémon:', err)
      return null
    } finally {
      setIsSearching(false)
    }
  }, [])

  const loadPokemonById = useCallback(async (id: number): Promise<PokemonData | null> => {
    return searchPokemon(id.toString())
  }, [searchPokemon])

  return {
    searchPokemon,
    loadPokemonById,
    isSearching,
    error,
  }
}
