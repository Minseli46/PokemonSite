/**
 * Outils Pokémon pour les agents IA
 * Ces tools sont appelés par le LLM via le mécanisme de Function Calling
 * 
 * Concept du cours : @tool decorator → ici en TypeScript avec ToolDefinition + ToolExecutor
 */

import axios from 'axios';
import { POKEAPI_BASE_URL } from '../../constants';
import type { ToolDefinition, ToolExecutor, ToolRegistry } from '../types';

// ============================================
// TOOL DEFINITIONS (déclarations pour le LLM)
// ============================================

export const pokemonToolDefinitions: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'get_pokemon_data',
      description: 'Récupère les données complètes d\'un Pokémon par son nom ou ID (stats, types, abilities, taille, poids). Utilise cette tool pour obtenir les informations de base de tout Pokémon.',
      parameters: {
        type: 'object',
        properties: {
          pokemon: {
            type: 'string',
            description: 'Le nom (en anglais, ex: pikachu) ou l\'ID du Pokémon',
          },
        },
        required: ['pokemon'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_type_effectiveness',
      description: 'Récupère les relations de type d\'un type Pokémon : faiblesses (double_damage_from), résistances (half_damage_from), immunités (no_damage_from), et types sur lesquels il est efficace.',
      parameters: {
        type: 'object',
        properties: {
          type_name: {
            type: 'string',
            description: 'Le nom du type en anglais (fire, water, grass, electric, etc.)',
            enum: [
              'normal', 'fire', 'water', 'electric', 'grass', 'ice', 
              'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 
              'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
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
      name: 'search_pokemon_by_type',
      description: 'Recherche tous les Pokémon d\'un type donné. Retourne une liste de Pokémon avec leur nom et ID.',
      parameters: {
        type: 'object',
        properties: {
          type_name: {
            type: 'string',
            description: 'Le type Pokémon à rechercher (en anglais)',
            enum: [
              'normal', 'fire', 'water', 'electric', 'grass', 'ice', 
              'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 
              'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
            ],
          },
          limit: {
            type: 'string',
            description: 'Nombre max de résultats (défaut: 10)',
          },
        },
        required: ['type_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_pokemon_species_info',
      description: 'Récupère les informations d\'espèce d\'un Pokémon : description, genre, taux de capture, habitat, génération, chaîne d\'évolution.',
      parameters: {
        type: 'object',
        properties: {
          pokemon_id: {
            type: 'string',
            description: 'L\'ID du Pokémon',
          },
        },
        required: ['pokemon_id'],
      },
    },
  },
];

// ============================================
// TOOL EXECUTORS (implémentations réelles)
// ============================================

async function getPokemonData(args: Record<string, any>): Promise<string> {
  try {
    const { pokemon } = args;
    const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon/${pokemon.toString().toLowerCase()}`);
    const data = response.data;

    const result = {
      id: data.id,
      name: data.name,
      types: data.types.map((t: any) => t.type.name),
      stats: data.stats.map((s: any) => ({
        name: s.stat.name,
        base_stat: s.base_stat,
      })),
      abilities: data.abilities.map((a: any) => ({
        name: a.ability.name,
        is_hidden: a.is_hidden,
      })),
      height: data.height / 10, // en mètres
      weight: data.weight / 10, // en kg
      base_experience: data.base_experience,
      sprite: data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default,
    };

    return JSON.stringify(result);
  } catch (error: any) {
    return JSON.stringify({ error: `Pokémon "${args.pokemon}" non trouvé` });
  }
}

async function getTypeEffectiveness(args: Record<string, any>): Promise<string> {
  try {
    const { type_name } = args;
    const response = await axios.get(`${POKEAPI_BASE_URL}/type/${type_name}`);
    const relations = response.data.damage_relations;

    const result = {
      type: type_name,
      double_damage_from: relations.double_damage_from.map((t: any) => t.name),
      half_damage_from: relations.half_damage_from.map((t: any) => t.name),
      no_damage_from: relations.no_damage_from.map((t: any) => t.name),
      double_damage_to: relations.double_damage_to.map((t: any) => t.name),
      half_damage_to: relations.half_damage_to.map((t: any) => t.name),
      no_damage_to: relations.no_damage_to.map((t: any) => t.name),
    };

    return JSON.stringify(result);
  } catch (error: any) {
    return JSON.stringify({ error: `Type "${args.type_name}" non trouvé` });
  }
}

async function searchPokemonByType(args: Record<string, any>): Promise<string> {
  try {
    const { type_name, limit = '10' } = args;
    const maxResults = parseInt(limit) || 10;
    const response = await axios.get(`${POKEAPI_BASE_URL}/type/${type_name}`);
    
    const pokemonList = response.data.pokemon
      .slice(0, maxResults)
      .map((p: any) => {
        const urlParts = p.pokemon.url.split('/');
        const id = urlParts[urlParts.length - 2];
        return {
          id: parseInt(id),
          name: p.pokemon.name,
        };
      });

    return JSON.stringify({ type: type_name, count: response.data.pokemon.length, pokemon: pokemonList });
  } catch (error: any) {
    return JSON.stringify({ error: `Type "${args.type_name}" non trouvé` });
  }
}

async function getPokemonSpeciesInfo(args: Record<string, any>): Promise<string> {
  try {
    const { pokemon_id } = args;
    const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon-species/${pokemon_id}`);
    const data = response.data;

    // Description en français ou anglais
    const frDescription = data.flavor_text_entries.find(
      (e: any) => e.language.name === 'fr'
    );
    const enDescription = data.flavor_text_entries.find(
      (e: any) => e.language.name === 'en'
    );

    // Genre en français ou anglais
    const frGenus = data.genera.find((g: any) => g.language.name === 'fr');
    const enGenus = data.genera.find((g: any) => g.language.name === 'en');

    const result = {
      id: data.id,
      name: data.name,
      description: (frDescription || enDescription)?.flavor_text?.replace(/\n/g, ' ') || 'N/A',
      genus: (frGenus || enGenus)?.genus || 'N/A',
      generation: data.generation.name,
      capture_rate: data.capture_rate,
      base_happiness: data.base_happiness,
      habitat: data.habitat?.name || 'inconnu',
      is_legendary: data.is_legendary,
      is_mythical: data.is_mythical,
      evolution_chain_url: data.evolution_chain?.url,
    };

    return JSON.stringify(result);
  } catch (error: any) {
    return JSON.stringify({ error: `Espèce Pokémon ID "${args.pokemon_id}" non trouvée` });
  }
}

// ============================================
// REGISTRY (lie noms de tools → fonctions)
// ============================================

export const pokemonToolExecutors: ToolRegistry = {
  get_pokemon_data: getPokemonData,
  get_type_effectiveness: getTypeEffectiveness,
  search_pokemon_by_type: searchPokemonByType,
  get_pokemon_species_info: getPokemonSpeciesInfo,
};
