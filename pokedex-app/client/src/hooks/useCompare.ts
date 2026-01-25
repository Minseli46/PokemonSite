import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface PokemonComparison {
  pokemon1: {
    id: number;
    name: string;
    sprite: string;
    artwork: string;
    types: string[];
    stats: { stat: { name: string }; base_stat: number }[];
  };
  pokemon2: {
    id: number;
    name: string;
    sprite: string;
    artwork: string;
    types: string[];
    stats: { stat: { name: string }; base_stat: number }[];
  };
  statComparisons: {
    statName: string;
    pokemon1Value: number;
    pokemon2Value: number;
    difference: number;
    winner: string;
  }[];
  typeAdvantages: {
    pokemon1Advantages: string[];
    pokemon2Advantages: string[];
  };
}

export const useComparePokemon = (id1: number | null, id2: number | null) => {
  return useQuery<PokemonComparison>({
    queryKey: ['compare-pokemon', id1, id2],
    queryFn: async () => {
      if (!id1 || !id2) {
        throw new Error('Both Pokemon IDs are required');
      }
      const response = await axios.get(`${API_URL}/pokemons/compare`, {
        params: { id1, id2 },
      });
      return response.data;
    },
    enabled: !!id1 && !!id2,
  });
};
