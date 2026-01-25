// Pokemon Types and Utilities

export interface Pokemon {
  id: number
  name: string
  types: PokemonType[]
  sprites: {
    front_default: string
    other: {
      'official-artwork': {
        front_default: string
      }
      home: {
        front_default: string
      }
    }
  }
  stats: PokemonStat[]
  height: number
  weight: number
  abilities: PokemonAbility[]
  species: {
    url: string
  }
}

export interface PokemonType {
  slot: number
  type: {
    name: string
    url: string
  }
}

export interface PokemonStat {
  base_stat: number
  stat: {
    name: string
  }
}

export interface PokemonAbility {
  ability: {
    name: string
  }
  is_hidden: boolean
}

export interface PokemonSpecies {
  evolution_chain: {
    url: string
  }
  flavor_text_entries: {
    flavor_text: string
    language: {
      name: string
    }
    version: {
      name: string
    }
  }[]
  genera: {
    genus: string
    language: {
      name: string
    }
  }[]
  generation: {
    name: string
    url: string
  }
}

export interface EvolutionChain {
  chain: EvolutionNode
}

export interface EvolutionNode {
  species: {
    name: string
    url: string
  }
  evolves_to: EvolutionNode[]
  evolution_details: {
    min_level?: number
    trigger: {
      name: string
    }
    item?: {
      name: string
    }
  }[]
}

export interface TypeEffectiveness {
  double_damage_from: { name: string }[]
  double_damage_to: { name: string }[]
  half_damage_from: { name: string }[]
  half_damage_to: { name: string }[]
  no_damage_from: { name: string }[]
  no_damage_to: { name: string }[]
}

export const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
] as const

export const GENERATIONS = [
  { id: 1, name: 'Generation I', range: [1, 151] },
  { id: 2, name: 'Generation II', range: [152, 251] },
  { id: 3, name: 'Generation III', range: [252, 386] },
  { id: 4, name: 'Generation IV', range: [387, 493] },
  { id: 5, name: 'Generation V', range: [494, 649] },
  { id: 6, name: 'Generation VI', range: [650, 721] },
  { id: 7, name: 'Generation VII', range: [722, 809] },
  { id: 8, name: 'Generation VIII', range: [810, 905] },
  { id: 9, name: 'Generation IX', range: [906, 1025] },
] as const

export const TYPE_COLORS: Record<string, string> = {
  normal: 'bg-type-normal',
  fire: 'bg-type-fire',
  water: 'bg-type-water',
  electric: 'bg-type-electric',
  grass: 'bg-type-grass',
  ice: 'bg-type-ice',
  fighting: 'bg-type-fighting',
  poison: 'bg-type-poison',
  ground: 'bg-type-ground',
  flying: 'bg-type-flying',
  psychic: 'bg-type-psychic',
  bug: 'bg-type-bug',
  rock: 'bg-type-rock',
  ghost: 'bg-type-ghost',
  dragon: 'bg-type-dragon',
  dark: 'bg-type-dark',
  steel: 'bg-type-steel',
  fairy: 'bg-type-fairy',
}

export const STAT_COLORS: Record<string, string> = {
  hp: 'bg-red-500',
  attack: 'bg-orange-500',
  defense: 'bg-yellow-500',
  'special-attack': 'bg-blue-500',
  'special-defense': 'bg-green-500',
  speed: 'bg-pink-500',
}

export const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SP.ATK',
  'special-defense': 'SP.DEF',
  speed: 'SPD',
}

export function formatPokemonId(id: number): string {
  return `#${id.toString().padStart(4, '0')}`
}

export function formatPokemonName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function formatStatName(name: string): string {
  return STAT_LABELS[name] || name.toUpperCase()
}

export function getPokemonImage(pokemon: Pokemon): string {
  return (
    pokemon.sprites.other['official-artwork'].front_default ||
    pokemon.sprites.other.home.front_default ||
    pokemon.sprites.front_default
  )
}

export function getGenerationFromId(id: number): typeof GENERATIONS[number] | undefined {
  return GENERATIONS.find(gen => id >= gen.range[0] && id <= gen.range[1])
}

export function getIdFromSpeciesUrl(url: string): number {
  const match = url.match(/\/pokemon-species\/(\d+)\//)
  return match ? parseInt(match[1], 10) : 0
}
