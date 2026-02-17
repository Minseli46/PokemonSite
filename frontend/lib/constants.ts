// Constantes Pokémon réutilisables

export const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
] as const

export type PokemonType = typeof POKEMON_TYPES[number]

export const POKEMON_GENERATIONS = [
  { id: 1, name: 'Gen 1 - Kanto', range: [1, 151] },
  { id: 2, name: 'Gen 2 - Johto', range: [152, 251] },
  { id: 3, name: 'Gen 3 - Hoenn', range: [252, 386] },
  { id: 4, name: 'Gen 4 - Sinnoh', range: [387, 493] },
  { id: 5, name: 'Gen 5 - Unova', range: [494, 649] },
  { id: 6, name: 'Gen 6 - Kalos', range: [650, 721] },
  { id: 7, name: 'Gen 7 - Alola', range: [722, 809] },
  { id: 8, name: 'Gen 8 - Galar', range: [810, 905] },
  { id: 9, name: 'Gen 9 - Paldea', range: [906, 1025] },
] as const

export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
}

export const API_CONFIG = {
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000',
  POKEAPI_URL: 'https://pokeapi.co/api/v2',
  SPRITE_BASE_URL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork',
} as const

// Pokémon populaires pour quick select
export const POPULAR_POKEMON = [
  { id: 25, name: 'Pikachu' },
  { id: 6, name: 'Charizard' },
  { id: 94, name: 'Gengar' },
  { id: 151, name: 'Mew' },
  { id: 150, name: 'Mewtwo' },
  { id: 149, name: 'Dragonite' },
  { id: 248, name: 'Tyranitar' },
  { id: 445, name: 'Garchomp' },
  { id: 448, name: 'Lucario' },
  { id: 643, name: 'Reshiram' },
  { id: 658, name: 'Greninja' },
  { id: 700, name: 'Sylveon' },
  { id: 812, name: 'Rillaboom' },
  { id: 815, name: 'Cinderace' },
  { id: 818, name: 'Inteleon' },
  { id: 1008, name: 'Miraidon' },
] as const
