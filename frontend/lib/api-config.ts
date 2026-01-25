// Configuration de l'API
export const API_CONFIG = {
  // URL de notre backend Express
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  
  // Endpoints
  ENDPOINTS: {
    POKEMON_LIST: '/api/pokemons',
    POKEMON_DETAIL: '/api/pokemons/:id',
    POKEMON_SEARCH: '/api/pokemons/search',
    POKEMON_COMPARE: '/api/pokemons/compare',
    TEAMS: '/api/teams',
    TEAM_BY_ID: '/api/teams/:id',
    USER_TEAMS: '/api/teams/user/:userId',
    QUIZ: '/api/quiz',
  },
  
  // Configuration par défaut
  DEFAULT_LIMIT: 20,
  DEFAULT_TIMEOUT: 10000,
}

// Types pour notre API
export interface ApiPokemon {
  id: string
  pokemonId: number
  name: string
  types: string[]
  sprite: string
  artwork: string | null
  height: number
  weight: number
  stats: {
    stat: { name: string }
    base_stat: number
  }[]
  abilities: string[]
  species: string | null
  evolutionChain: any | null
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PokemonListResponse {
  results: ApiPokemon[]
  count: number
  page: number
  totalPages: number
}
