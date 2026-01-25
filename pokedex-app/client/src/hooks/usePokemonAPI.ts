import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pokemonAPI } from '../utils/api';
import type { Pokemon, PokemonListResponse } from '../utils/types';

/**
 * Hook pour récupérer une liste paginée de Pokémon
 */
export const usePokemonList = (limit = 20, offset = 0) => {
  return useQuery<PokemonListResponse>({
    queryKey: ['pokemons', limit, offset],
    queryFn: () => pokemonAPI.getList(limit, offset),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook pour récupérer les détails d'un Pokémon
 */
export const usePokemon = (id: number) => {
  return useQuery<Pokemon>({
    queryKey: ['pokemon', id],
    queryFn: () => pokemonAPI.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook pour rechercher des Pokémon par nom
 */
export const useSearchPokemon = (name: string) => {
  return useQuery({
    queryKey: ['pokemon-search', name],
    queryFn: () => pokemonAPI.search(name),
    enabled: name.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook pour filtrer les Pokémon par génération
 */
export const usePokemonByGeneration = (generation: number | null) => {
  return useQuery({
    queryKey: ['pokemon-generation', generation],
    queryFn: () => pokemonAPI.filterByGeneration(generation!),
    enabled: generation !== null,
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Hook pour comparer deux Pokémon
 */
export const useComparePokemon = (id1: number | null, id2: number | null) => {
  return useQuery({
    queryKey: ['pokemon-compare', id1, id2],
    queryFn: () => pokemonAPI.compare(id1!, id2!),
    enabled: !!id1 && !!id2,
  });
};
