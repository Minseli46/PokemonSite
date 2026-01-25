import clsx, { ClassValue } from 'clsx';

/**
 * Combine des classes CSS de manière conditionnelle
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Capitalise la première lettre d'un string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formate le nom d'un Pokémon
 */
export function formatPokemonName(name: string): string {
  return name
    .split('-')
    .map(capitalize)
    .join(' ');
}

/**
 * Récupère la couleur associée à un type de Pokémon
 */
export function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
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
  };

  return colors[type.toLowerCase()] || '#777777';
}

/**
 * Récupère l'emoji associé à un type de Pokémon
 */
export function getTypeEmoji(type: string): string {
  const emojis: Record<string, string> = {
    normal: '⭐',
    fire: '🔥',
    water: '💧',
    electric: '⚡',
    grass: '🌿',
    ice: '❄️',
    fighting: '🥊',
    poison: '☠️',
    ground: '🌍',
    flying: '🦅',
    psychic: '🔮',
    bug: '🐛',
    rock: '🪨',
    ghost: '👻',
    dragon: '🐉',
    dark: '🌙',
    steel: '⚙️',
    fairy: '🧚',
  };

  return emojis[type.toLowerCase()] || '❓';
}

/**
 * Formate un nombre avec des zéros devant (ex: 001, 025)
 */
export function formatPokemonId(id: number): string {
  return id.toString().padStart(3, '0');
}

/**
 * Convertit les décimètres en mètres
 */
export function formatHeight(decimeters: number): string {
  const meters = decimeters / 10;
  return `${meters.toFixed(1)} m`;
}

/**
 * Convertit les hectogrammes en kilogrammes
 */
export function formatWeight(hectograms: number): string {
  const kilograms = hectograms / 10;
  return `${kilograms.toFixed(1)} kg`;
}

/**
 * Récupère le nom d'une stat formaté
 */
export function formatStatName(statName: string): string {
  const names: Record<string, string> = {
    hp: 'HP',
    attack: 'Attaque',
    defense: 'Défense',
    'special-attack': 'Att. Spé.',
    'special-defense': 'Déf. Spé.',
    speed: 'Vitesse',
  };

  return names[statName] || capitalize(statName);
}

/**
 * Calcule la couleur d'une barre de stat
 */
export function getStatColor(value: number): string {
  if (value >= 120) return '#22c55e'; // green
  if (value >= 90) return '#84cc16'; // lime
  if (value >= 60) return '#eab308'; // yellow
  if (value >= 30) return '#f97316'; // orange
  return '#ef4444'; // red
}

/**
 * Débounce une fonction
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Génère une URL pour le sprite d'un Pokémon
 */
export function getPokemonSpriteUrl(pokemonId: number, variant: 'default' | 'shiny' = 'default'): string {
  const baseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
  if (variant === 'shiny') {
    return `${baseUrl}/shiny/${pokemonId}.png`;
  }
  return `${baseUrl}/${pokemonId}.png`;
}

/**
 * Génère une URL pour le modèle 3D d'un Pokémon
 */
export function get3DModelUrl(pokemonId: number): string {
  // URL du projet Poké3D sur GitHub
  return `https://raw.githubusercontent.com/tobiasbu/poke3d/main/models/${formatPokemonId(pokemonId)}.glb`;
}

/**
 * Vérifie si un Pokémon est légendaire (basé sur son ID)
 */
export function isLegendary(pokemonId: number): boolean {
  const legendaryIds = [
    144, 145, 146, 150, 151, // Gen 1
    243, 244, 245, 249, 250, 251, // Gen 2
    377, 378, 379, 380, 381, 382, 383, 384, 385, 386, // Gen 3
    480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, // Gen 4
    494, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649, // Gen 5
    716, 717, 718, 719, 720, 721, // Gen 6
    772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 800, 801, 802, 807, 808, 809, // Gen 7
    888, 889, 890, 891, 892, 894, 895, 896, 897, 898, // Gen 8
  ];

  return legendaryIds.includes(pokemonId);
}

/**
 * Mélange un tableau (Fisher-Yates shuffle)
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
