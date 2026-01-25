'use client'

import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import { API_CONFIG, type ApiPokemon, type PokemonListResponse } from '@/lib/api-config'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

// Hook pour la liste paginée de Pokémon depuis notre backend
export function useBackendPokemonList(limit = API_CONFIG.DEFAULT_LIMIT) {
  const getKey = (pageIndex: number, previousPageData: PokemonListResponse | null) => {
    if (previousPageData && previousPageData.results.length === 0) return null
    const offset = pageIndex * limit
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.POKEMON_LIST}?limit=${limit}&offset=${offset}`
  }

  const { data, error, size, setSize, isLoading, isValidating, mutate } = useSWRInfinite<PokemonListResponse>(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
    }
  )

  const pokemon = data ? data.flatMap(page => page.results) : []
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')
  const isEmpty = data?.[0]?.results.length === 0
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.results.length < limit)
  const total = data?.[0]?.count || 0

  return {
    pokemon,
    error,
    isLoading,
    isLoadingMore,
    isValidating,
    size,
    setSize,
    isReachingEnd,
    total,
    mutate,
  }
}

// Hook pour récupérer un Pokémon depuis notre backend
export function useBackendPokemon(idOrName: string | number | null) {
  const { data, error, isLoading, mutate } = useSWR<ApiPokemon>(
    idOrName ? `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.POKEMON_DETAIL.replace(':id', String(idOrName))}` : null,
    fetcher
  )

  return {
    pokemon: data,
    error,
    isLoading,
    mutate,
  }
}

// Hook pour rechercher des Pokémon
export function useBackendPokemonSearch(query: string) {
  const { data, error, isLoading } = useSWR<{ results: ApiPokemon[] }>(
    query ? `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.POKEMON_SEARCH}?name=${encodeURIComponent(query)}` : null,
    fetcher
  )

  return {
    results: data?.results || [],
    error,
    isLoading,
  }
}

// Hook pour comparer deux Pokémon
export function useBackendPokemonCompare(id1: number | null, id2: number | null) {
  const { data, error, isLoading } = useSWR<{
    pokemon1: ApiPokemon
    pokemon2: ApiPokemon
    comparison: {
      statDifferences: Record<string, number>
      typeAdvantages: {
        pokemon1Advantages: string[]
        pokemon2Advantages: string[]
      }
    }
  }>(
    id1 && id2 ? `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.POKEMON_COMPARE}?pokemon1Id=${id1}&pokemon2Id=${id2}` : null,
    fetcher
  )

  return {
    comparisonData: data,
    error,
    isLoading,
  }
}

// Hook pour les équipes d'un utilisateur
export function useBackendUserTeams(userId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<{ teams: any[] }>(
    userId ? `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_TEAMS.replace(':userId', userId)}` : null,
    fetcher
  )

  return {
    teams: data?.teams || [],
    error,
    isLoading,
    mutate,
  }
}

// Fonction pour créer une équipe
export async function createTeam(teamData: { userId?: string; name: string; pokemons: number[] }) {
  const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TEAMS}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(teamData),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Failed to create team')
  }

  return res.json()
}

// Hook pour le quiz
export function useBackendQuiz() {
  const { data, error, isLoading, mutate } = useSWR<{
    question: string
    options: string[]
    correctAnswer: string
    pokemonId: number
  }>(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.QUIZ}`,
    fetcher
  )

  return {
    quiz: data,
    error,
    isLoading,
    refreshQuiz: mutate,
  }
}
