/**
 * Outils Pokémon pour les agents IA (LangChain) 🦜🔗
 * 
 * Chaque tool est un DynamicStructuredTool LangChain avec :
 * - Un schéma Zod pour les paramètres (validation automatique)
 * - Une fonction func() qui exécute la logique métier
 * - Un name + description utilisés par le LLM pour le function calling
 * 
 * Concept LangChain : @tool decorator → DynamicStructuredTool en TypeScript
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import axios from 'axios';
import { POKEAPI_BASE_URL } from '../../constants';

// ============================================
// ENUM DES TYPES (réutilisé dans les schémas Zod)
// ============================================

const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
] as const;

// ============================================
// LANGCHAIN TOOLS
// ============================================

export const getPokemonDataTool = new DynamicStructuredTool({
  name: 'get_pokemon_data',
  description: 'Récupère les données complètes d\'un Pokémon par son nom ou ID (stats, types, abilities, taille, poids). Utilise cette tool pour obtenir les informations de base de tout Pokémon.',
  schema: z.object({
    pokemon: z.string().describe('Le nom (en anglais, ex: pikachu) ou l\'ID du Pokémon'),
  }),
  func: async ({ pokemon }) => {
    try {
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
        height: data.height / 10,
        weight: data.weight / 10,
        base_experience: data.base_experience,
        sprite: data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default,
      };

      return JSON.stringify(result);
    } catch (error: any) {
      return JSON.stringify({ error: `Pokémon "${pokemon}" non trouvé` });
    }
  },
});

export const getTypeEffectivenessTool = new DynamicStructuredTool({
  name: 'get_type_effectiveness',
  description: 'Récupère les relations de type d\'un type Pokémon : faiblesses (double_damage_from), résistances (half_damage_from), immunités (no_damage_from), et types sur lesquels il est efficace.',
  schema: z.object({
    type_name: z.enum(POKEMON_TYPES).describe('Le nom du type en anglais'),
  }),
  func: async ({ type_name }) => {
    try {
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
      return JSON.stringify({ error: `Type "${type_name}" non trouvé` });
    }
  },
});

export const searchPokemonByTypeTool = new DynamicStructuredTool({
  name: 'search_pokemon_by_type',
  description: 'Recherche tous les Pokémon d\'un type donné. Retourne une liste de Pokémon avec leur nom et ID.',
  schema: z.object({
    type_name: z.enum(POKEMON_TYPES).describe('Le type Pokémon à rechercher (en anglais)'),
    limit: z.string().optional().default('10').describe('Nombre max de résultats (défaut: 10)'),
  }),
  func: async ({ type_name, limit }) => {
    try {
      const maxResults = parseInt(limit || '10') || 10;
      const response = await axios.get(`${POKEAPI_BASE_URL}/type/${type_name}`);

      const pokemonList = response.data.pokemon
        .slice(0, maxResults)
        .map((p: any) => {
          const urlParts = p.pokemon.url.split('/');
          const id = urlParts[urlParts.length - 2];
          return { id: parseInt(id), name: p.pokemon.name };
        });

      return JSON.stringify({ type: type_name, count: response.data.pokemon.length, pokemon: pokemonList });
    } catch (error: any) {
      return JSON.stringify({ error: `Type "${type_name}" non trouvé` });
    }
  },
});

export const getPokemonSpeciesInfoTool = new DynamicStructuredTool({
  name: 'get_pokemon_species_info',
  description: 'Récupère les informations d\'espèce d\'un Pokémon : description, genre, taux de capture, habitat, génération, chaîne d\'évolution.',
  schema: z.object({
    pokemon_id: z.string().describe('L\'ID du Pokémon'),
  }),
  func: async ({ pokemon_id }) => {
    try {
      const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon-species/${pokemon_id}`);
      const data = response.data;

      const frDescription = data.flavor_text_entries.find((e: any) => e.language.name === 'fr');
      const enDescription = data.flavor_text_entries.find((e: any) => e.language.name === 'en');
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
      return JSON.stringify({ error: `Espèce Pokémon ID "${pokemon_id}" non trouvée` });
    }
  },
});

// ============================================
// EXPORT : Liste de tous les tools Pokémon (pour LangChain)
// ============================================

export const pokemonTools = [
  getPokemonDataTool,
  getTypeEffectivenessTool,
  searchPokemonByTypeTool,
  getPokemonSpeciesInfoTool,
];
