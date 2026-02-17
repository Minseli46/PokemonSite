/**
 * Outils spécifiques au Wallpaper Agent
 * Suggestions de thèmes, palettes de couleurs, combinaisons visuelles
 */

import axios from 'axios';
import { POKEAPI_BASE_URL } from '../../constants';
import type { ToolDefinition, ToolRegistry } from '../types';

// ============================================
// TOOL DEFINITIONS
// ============================================

export const wallpaperToolDefinitions: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'suggest_wallpaper_theme',
      description: 'Suggère un thème de fond d\'écran complet pour un Pokémon donné : couleur de fond, motif, palette, et description artistique.',
      parameters: {
        type: 'object',
        properties: {
          pokemon_name: {
            type: 'string',
            description: 'Le nom du Pokémon (en anglais)',
          },
          style: {
            type: 'string',
            description: 'Style souhaité (optionnel)',
            enum: ['vibrant', 'pastel', 'dark', 'minimal', 'epic', 'cute'],
          },
        },
        required: ['pokemon_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_type_color_palette',
      description: 'Retourne la palette de couleurs associée à un type Pokémon (couleur principale, secondaire, accent, fond clair, fond sombre).',
      parameters: {
        type: 'object',
        properties: {
          type_name: {
            type: 'string',
            description: 'Le type Pokémon',
            enum: [
              'normal', 'fire', 'water', 'electric', 'grass', 'ice',
              'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
              'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
            ],
          },
        },
        required: ['type_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'suggest_pokemon_duo',
      description: 'Suggère des duos ou trios de Pokémon visuellement complémentaires pour créer un fond d\'écran harmonieux.',
      parameters: {
        type: 'object',
        properties: {
          base_pokemon: {
            type: 'string',
            description: 'Le Pokémon de base autour duquel faire la suggestion',
          },
          theme: {
            type: 'string',
            description: 'Thème optionnel : contraste, harmonie, evolution, rival, legendary',
          },
        },
        required: ['base_pokemon'],
      },
    },
  },
];

// ============================================
// PALETTES DE COULEURS PAR TYPE
// ============================================

const TYPE_PALETTES: Record<string, {
  primary: string;
  secondary: string;
  accent: string;
  lightBg: string;
  darkBg: string;
  emoji: string;
}> = {
  normal: { primary: '#A8A878', secondary: '#C6C6A7', accent: '#6D6D4E', lightBg: '#F5F5DC', darkBg: '#3D3D2B', emoji: '⭐' },
  fire: { primary: '#F08030', secondary: '#F5AC78', accent: '#9C531F', lightBg: '#FFF3E0', darkBg: '#4A2000', emoji: '🔥' },
  water: { primary: '#6890F0', secondary: '#9DB7F5', accent: '#445E9C', lightBg: '#E3F2FD', darkBg: '#1A237E', emoji: '💧' },
  electric: { primary: '#F8D030', secondary: '#FAE078', accent: '#A1871F', lightBg: '#FFFDE7', darkBg: '#4A3C00', emoji: '⚡' },
  grass: { primary: '#78C850', secondary: '#A7DB8D', accent: '#4E8234', lightBg: '#E8F5E9', darkBg: '#1B5E20', emoji: '🌿' },
  ice: { primary: '#98D8D8', secondary: '#BCE6E6', accent: '#638D8D', lightBg: '#E0F7FA', darkBg: '#004D40', emoji: '❄️' },
  fighting: { primary: '#C03028', secondary: '#D67873', accent: '#7D1F1A', lightBg: '#FFEBEE', darkBg: '#4A0000', emoji: '🥊' },
  poison: { primary: '#A040A0', secondary: '#C183C1', accent: '#682A68', lightBg: '#F3E5F5', darkBg: '#3C003C', emoji: '☠️' },
  ground: { primary: '#E0C068', secondary: '#EBD69D', accent: '#927D44', lightBg: '#EFEBE9', darkBg: '#3E2723', emoji: '🌍' },
  flying: { primary: '#A890F0', secondary: '#C6B7F5', accent: '#6D5E9C', lightBg: '#EDE7F6', darkBg: '#311B92', emoji: '🦅' },
  psychic: { primary: '#F85888', secondary: '#FA92B2', accent: '#A13959', lightBg: '#FCE4EC', darkBg: '#4A0028', emoji: '🔮' },
  bug: { primary: '#A8B820', secondary: '#C6D16E', accent: '#6D7815', lightBg: '#F1F8E9', darkBg: '#33691E', emoji: '🐛' },
  rock: { primary: '#B8A038', secondary: '#D1C17D', accent: '#786824', lightBg: '#FFF8E1', darkBg: '#3C3000', emoji: '🪨' },
  ghost: { primary: '#705898', secondary: '#A292BC', accent: '#493963', lightBg: '#EDE7F6', darkBg: '#1A0033', emoji: '👻' },
  dragon: { primary: '#7038F8', secondary: '#A27DFA', accent: '#4924A1', lightBg: '#E8EAF6', darkBg: '#1A0066', emoji: '🐉' },
  dark: { primary: '#705848', secondary: '#A29288', accent: '#49392F', lightBg: '#EFEBE9', darkBg: '#1B1009', emoji: '🌑' },
  steel: { primary: '#B8B8D0', secondary: '#D1D1E0', accent: '#787887', lightBg: '#ECEFF1', darkBg: '#263238', emoji: '⚙️' },
  fairy: { primary: '#EE99AC', secondary: '#F4BDC9', accent: '#9B6470', lightBg: '#FCE4EC', darkBg: '#4A0028', emoji: '✨' },
};

// ============================================
// DUOS VISUELS CLASSIQUES
// ============================================

const CLASSIC_DUOS: Record<string, string[]> = {
  pikachu: ['eevee', 'jigglypuff', 'raichu'],
  charizard: ['blastoise', 'venusaur', 'dragonite'],
  eevee: ['pikachu', 'mew', 'sylveon'],
  mewtwo: ['mew', 'lucario', 'deoxys'],
  lucario: ['zoroark', 'mewtwo', 'greninja'],
  gardevoir: ['gallade', 'sylveon', 'gothitelle'],
  gengar: ['alakazam', 'mimikyu', 'haunter'],
  gyarados: ['charizard', 'dragonite', 'milotic'],
  umbreon: ['espeon', 'sylveon', 'glaceon'],
  greninja: ['lucario', 'cinderace', 'decidueye'],
};

// ============================================
// TOOL EXECUTORS
// ============================================

async function suggestWallpaperTheme(args: Record<string, any>): Promise<string> {
  try {
    const { pokemon_name, style = 'vibrant' } = args;
    
    const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon/${pokemon_name.toLowerCase()}`);
    const pokemon = response.data;

    const mainType = pokemon.types[0].type.name;
    const palette = TYPE_PALETTES[mainType] || TYPE_PALETTES.normal;
    const secondType = pokemon.types[1]?.type.name;
    const secondPalette = secondType ? TYPE_PALETTES[secondType] : null;

    // Choix du motif selon le style
    const patternMap: Record<string, string> = {
      vibrant: 'gradient',
      pastel: 'dots',
      dark: 'geometric',
      minimal: 'gradient',
      epic: 'waves',
      cute: 'dots',
    };

    // Ajustement des couleurs selon le style
    let backgroundColor = palette.primary;
    let accentColor = secondPalette?.primary || palette.accent;

    if (style === 'dark') {
      backgroundColor = palette.darkBg;
      accentColor = palette.primary;
    } else if (style === 'pastel') {
      backgroundColor = palette.lightBg;
      accentColor = palette.secondary;
    }

    const result = {
      pokemonId: pokemon.id,
      pokemonName: pokemon.name,
      pokemonImage: pokemon.sprites?.other?.['official-artwork']?.front_default,
      types: pokemon.types.map((t: any) => t.type.name),
      theme: {
        style,
        backgroundColor,
        accentColor,
        pattern: patternMap[style] || 'gradient',
        showName: style !== 'minimal',
        showId: style !== 'minimal' && style !== 'cute',
      },
      palette: {
        primary: palette.primary,
        secondary: palette.secondary,
        accent: palette.accent,
        emoji: palette.emoji,
        ...(secondPalette && {
          secondaryType: {
            primary: secondPalette.primary,
            secondary: secondPalette.secondary,
            emoji: secondPalette.emoji,
          },
        }),
      },
      description: `Un fond d'écran ${style} mettant en valeur ${pokemon.name} avec les couleurs du type ${mainType}${secondType ? ` et ${secondType}` : ''}.`,
    };

    return JSON.stringify(result);
  } catch (error: any) {
    return JSON.stringify({ error: `Pokémon "${args.pokemon_name}" non trouvé` });
  }
}

async function getTypeColorPalette(args: Record<string, any>): Promise<string> {
  const { type_name } = args;
  const palette = TYPE_PALETTES[type_name.toLowerCase()];

  if (!palette) {
    return JSON.stringify({ error: `Type "${type_name}" non reconnu` });
  }

  return JSON.stringify({
    type: type_name,
    ...palette,
    cssGradient: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
    complementary: getComplementaryColor(palette.primary),
  });
}

function getComplementaryColor(hex: string): string {
  const r = 255 - parseInt(hex.slice(1, 3), 16);
  const g = 255 - parseInt(hex.slice(3, 5), 16);
  const b = 255 - parseInt(hex.slice(5, 7), 16);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

async function suggestPokemonDuo(args: Record<string, any>): Promise<string> {
  try {
    const { base_pokemon, theme = 'harmonie' } = args;
    const baseName = base_pokemon.toLowerCase();

    // Vérifier que le Pokémon existe
    const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon/${baseName}`);
    const basePokemon = response.data;
    const baseTypes = basePokemon.types.map((t: any) => t.type.name);

    let suggestions: string[] = [];

    // Vérifier dans les duos classiques
    if (CLASSIC_DUOS[baseName]) {
      suggestions = [...CLASSIC_DUOS[baseName]];
    }

    // Compléter avec des suggestions thématiques
    if (theme === 'contraste') {
      // Pokémon de types opposés
      const contrastTypes: Record<string, string> = {
        fire: 'water', water: 'fire', grass: 'fire',
        electric: 'ground', psychic: 'dark', fairy: 'dragon',
        dragon: 'fairy', ghost: 'normal', ice: 'fire',
      };
      const contrastType = contrastTypes[baseTypes[0]];
      if (contrastType) {
        const typeRes = await axios.get(`${POKEAPI_BASE_URL}/type/${contrastType}`);
        const candidates = typeRes.data.pokemon
          .filter((p: any) => {
            const id = parseInt(p.pokemon.url.split('/').filter(Boolean).pop());
            return id <= 898; // Limiter aux Pokémon connus
          })
          .slice(0, 5)
          .map((p: any) => p.pokemon.name);
        suggestions = [...suggestions, ...candidates];
      }
    } else if (theme === 'evolution') {
      // Chaîne d'évolution
      try {
        const speciesRes = await axios.get(`${POKEAPI_BASE_URL}/pokemon-species/${baseName}`);
        const evoUrl = speciesRes.data.evolution_chain?.url;
        if (evoUrl) {
          const evoRes = await axios.get(evoUrl);
          const evos: string[] = [];
          const traverse = (node: any) => {
            evos.push(node.species.name);
            node.evolves_to?.forEach(traverse);
          };
          traverse(evoRes.data.chain);
          suggestions = [...suggestions, ...evos.filter(e => e !== baseName)];
        }
      } catch { /* skip */ }
    }

    // Dédupliquer et limiter
    suggestions = [...new Set(suggestions)].filter(s => s !== baseName).slice(0, 5);

    // Enrichir avec des données pour chaque suggestion
    const enriched = [];
    for (const name of suggestions.slice(0, 3)) {
      try {
        const res = await axios.get(`${POKEAPI_BASE_URL}/pokemon/${name}`);
        const types = res.data.types.map((t: any) => t.type.name);
        const mainPalette = TYPE_PALETTES[types[0]] || TYPE_PALETTES.normal;
        enriched.push({
          name,
          id: res.data.id,
          types,
          color: mainPalette.primary,
          image: res.data.sprites?.other?.['official-artwork']?.front_default,
        });
      } catch { /* skip */ }
    }

    return JSON.stringify({
      basePokemon: {
        name: baseName,
        id: basePokemon.id,
        types: baseTypes,
        color: (TYPE_PALETTES[baseTypes[0]] || TYPE_PALETTES.normal).primary,
        image: basePokemon.sprites?.other?.['official-artwork']?.front_default,
      },
      theme,
      suggestions: enriched,
    });
  } catch (error: any) {
    return JSON.stringify({ error: `Pokémon "${args.base_pokemon}" non trouvé` });
  }
}

// ============================================
// REGISTRY
// ============================================

export const wallpaperToolExecutors: ToolRegistry = {
  suggest_wallpaper_theme: suggestWallpaperTheme,
  get_type_color_palette: getTypeColorPalette,
  suggest_pokemon_duo: suggestPokemonDuo,
};
