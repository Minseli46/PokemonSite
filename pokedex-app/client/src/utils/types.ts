export interface Pokemon {
  id: number;
  pokemonId: number;
  name: string;
  types: string[];
  sprite: string;
  artwork?: string;
  stats: PokemonStat[];
  evolutions?: Evolution[];
  generation: number;
  height?: number;
  weight?: number;
  abilities?: Ability[];
  weaknesses?: Record<string, number>;
}

export interface PokemonStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

export interface Ability {
  ability: {
    name: string;
  };
  is_hidden: boolean;
}

export interface Evolution {
  name: string;
  url: string;
}

export interface Team {
  id: string;
  name: string;
  userId: string;
  pokemons: number[];
  createdAt: string;
  updatedAt: string;
  pokemonDetails?: Pokemon[];
}

export interface Quiz {
  id: string;
  question: string;
  answer: string;
  options: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  pokemonId: number;
  type: 'name' | 'type' | 'silhouette';
  imageUrl?: string;
  isSilhouette?: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export type ThemeMode = 'light' | 'dark';

export interface PokemonListResponse {
  results: Pokemon[];
  count: number;
  next: number | null;
  previous: number | null;
}
