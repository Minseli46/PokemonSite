'use client'

import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import type { Pokemon, PokemonSpecies, EvolutionChain, TypeEffectiveness } from '@/lib/pokemon'

const API_BASE = 'https://pokeapi.co/api/v2'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export function usePokemonList(limit = 20) {
  const getKey = (pageIndex: number, previousPageData: { results: unknown[] } | null) => {
    if (previousPageData && !previousPageData.results.length) return null
    return `${API_BASE}/pokemon?limit=${limit}&offset=${pageIndex * limit}`
  }

  const { data, error, size, setSize, isLoading, isValidating } = useSWRInfinite<{
    count: number
    results: { name: string; url: string }[]
  }>(getKey, fetcher)

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
  }
}

export function usePokemon(idOrName: string | number) {
  const { data, error, isLoading } = useSWR<Pokemon>(
    idOrName ? `${API_BASE}/pokemon/${idOrName}` : null,
    fetcher
  )

  return {
    pokemon: data,
    error,
    isLoading,
  }
}

export function usePokemonSpecies(idOrName: string | number) {
  const { data, error, isLoading } = useSWR<PokemonSpecies>(
    idOrName ? `${API_BASE}/pokemon-species/${idOrName}` : null,
    fetcher
  )

  return {
    species: data,
    error,
    isLoading,
  }
}

export function useEvolutionChain(url: string | null) {
  const { data, error, isLoading } = useSWR<EvolutionChain>(
    url,
    fetcher
  )

  return {
    evolutionChain: data,
    error,
    isLoading,
  }
}

export function useTypeEffectiveness(typeName: string) {
  const { data, error, isLoading } = useSWR<{ damage_relations: TypeEffectiveness }>(
    typeName ? `${API_BASE}/type/${typeName}` : null,
    fetcher
  )

  return {
    typeData: data?.damage_relations,
    error,
    isLoading,
  }
}

export function usePokemonByType(typeName: string) {
  const { data, error, isLoading } = useSWR<{
    pokemon: { pokemon: { name: string; url: string } }[]
  }>(
    typeName ? `${API_BASE}/type/${typeName}` : null,
    fetcher
  )

  return {
    pokemonList: data?.pokemon.map(p => p.pokemon) || [],
    error,
    isLoading,
  }
}

export function usePokemonByGeneration(generationId: number) {
  const { data, error, isLoading } = useSWR<{
    pokemon_species: { name: string; url: string }[]
  }>(
    generationId ? `${API_BASE}/generation/${generationId}` : null,
    fetcher
  )

  return {
    pokemonList: data?.pokemon_species || [],
    error,
    isLoading,
  }
}
