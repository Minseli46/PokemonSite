import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamAPI } from '../utils/api';
import type { Team } from '../utils/types';

/**
 * Hook pour récupérer les équipes d'un utilisateur
 */
export const useUserTeams = (userId: string) => {
  return useQuery({
    queryKey: ['teams', userId],
    queryFn: () => teamAPI.getUserTeams(userId),
    enabled: !!userId,
  });
};

/**
 * Hook pour récupérer une équipe spécifique
 */
export const useTeam = (teamId: string) => {
  return useQuery<Team>({
    queryKey: ['team', teamId],
    queryFn: () => teamAPI.getById(teamId),
    enabled: !!teamId,
  });
};

/**
 * Hook pour créer une équipe
 */
export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, name, pokemons }: { userId: string; name: string; pokemons: number[] }) =>
      teamAPI.create(userId, name, pokemons),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.userId] });
    },
  });
};

/**
 * Hook pour mettre à jour une équipe
 */
export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: Partial<Team> }) =>
      teamAPI.update(teamId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team', data.id] });
      queryClient.invalidateQueries({ queryKey: ['teams', data.userId] });
    },
  });
};

/**
 * Hook pour supprimer une équipe
 */
export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: string) => teamAPI.delete(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

/**
 * Hook pour ajouter un Pokémon à une équipe
 */
export const useAddPokemonToTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, pokemonId }: { teamId: string; pokemonId: number }) =>
      teamAPI.addPokemon(teamId, pokemonId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team', data.id] });
    },
  });
};

/**
 * Hook pour retirer un Pokémon d'une équipe
 */
export const useRemovePokemonFromTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, pokemonId }: { teamId: string; pokemonId: number }) =>
      teamAPI.removePokemon(teamId, pokemonId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team', data.id] });
    },
  });
};
