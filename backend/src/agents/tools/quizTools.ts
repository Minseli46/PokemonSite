/**
 * Outils spécifiques au Quiz Agent (LangChain) 🦜🔗
 * Génération de questions, faits intéressants, explications
 * 
 * Chaque tool est un DynamicStructuredTool avec schéma Zod.
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import axios from 'axios';
import { POKEAPI_BASE_URL } from '../../constants';

// ============================================
// HELPERS
// ============================================

const DIFFICULTY_RANGES: Record<string, [number, number]> = {
  easy: [1, 151],
  medium: [1, 493],
  hard: [1, 1025],
};

function getRandomId(range: [number, number]): number {
  return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
}

const ALL_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
];

// ============================================
// LANGCHAIN TOOLS
// ============================================

export const generateQuizQuestionTool = new DynamicStructuredTool({
  name: 'generate_quiz_question',
  description: 'Génère une question de quiz Pokémon avec 4 options et la réponse correcte. Modes: name (deviner le nom), type (deviner le type), stat (deviner la meilleure stat), evolution (deviner l\'évolution).',
  schema: z.object({
    mode: z.enum(['name', 'type', 'stat', 'evolution', 'ability', 'generation']).describe('Le mode de quiz'),
    difficulty: z.enum(['easy', 'medium', 'hard']).describe('La difficulté. easy = Gen 1 (1-151), medium = Gen 1-4 (1-493), hard = toutes (1-1025)'),
  }),
  func: async ({ mode, difficulty }) => {
    const range = DIFFICULTY_RANGES[difficulty] || DIFFICULTY_RANGES.easy;

    try {
      const targetId = getRandomId(range);
      const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon/${targetId}`);
      const pokemon = response.data;

      let question: string;
      let correctAnswer: string;
      let options: string[];

      switch (mode) {
        case 'type': {
          const mainType = pokemon.types[0].type.name;
          question = `Quel est le type principal de ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} ?`;
          correctAnswer = mainType;
          const wrongTypes = ALL_TYPES.filter(t => t !== mainType).sort(() => Math.random() - 0.5).slice(0, 3);
          options = [...wrongTypes, correctAnswer].sort(() => Math.random() - 0.5);
          break;
        }
        case 'stat': {
          const highestStat = pokemon.stats.reduce((a: any, b: any) => a.base_stat > b.base_stat ? a : b);
          question = `Quelle est la statistique la plus élevée de ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} ?`;
          correctAnswer = highestStat.stat.name;
          const wrongStats = pokemon.stats.filter((s: any) => s.stat.name !== correctAnswer).map((s: any) => s.stat.name).slice(0, 3);
          options = [...wrongStats, correctAnswer].sort(() => Math.random() - 0.5);
          break;
        }
        case 'generation': {
          let gen: number;
          if (targetId <= 151) gen = 1;
          else if (targetId <= 251) gen = 2;
          else if (targetId <= 386) gen = 3;
          else if (targetId <= 493) gen = 4;
          else if (targetId <= 649) gen = 5;
          else if (targetId <= 721) gen = 6;
          else if (targetId <= 809) gen = 7;
          else if (targetId <= 905) gen = 8;
          else gen = 9;

          question = `De quelle génération est ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} ?`;
          correctAnswer = `Génération ${gen}`;
          const allGens = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(g => g !== gen);
          const wrongGens = allGens.sort(() => Math.random() - 0.5).slice(0, 3);
          options = [...wrongGens.map(g => `Génération ${g}`), correctAnswer].sort(() => Math.random() - 0.5);
          break;
        }
        case 'ability': {
          const mainAbility = pokemon.abilities[0]?.ability.name || 'unknown';
          question = `Quelle est la capacité principale de ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} ?`;
          correctAnswer = mainAbility;
          const wrongAbilities: string[] = [];
          for (let i = 0; i < 3; i++) {
            const rndId = getRandomId(range);
            try {
              const rndRes = await axios.get(`${POKEAPI_BASE_URL}/pokemon/${rndId}`);
              const ability = rndRes.data.abilities[0]?.ability.name;
              if (ability && ability !== correctAnswer && !wrongAbilities.includes(ability)) {
                wrongAbilities.push(ability);
              }
            } catch { /* skip */ }
          }
          while (wrongAbilities.length < 3) wrongAbilities.push('pressure');
          options = [...wrongAbilities.slice(0, 3), correctAnswer].sort(() => Math.random() - 0.5);
          break;
        }
        default: { // name
          question = `Quel Pokémon possède l'ID #${targetId} ?`;
          correctAnswer = pokemon.name;
          const wrongNames: string[] = [];
          for (let i = 0; i < 3; i++) {
            const rndId = getRandomId(range);
            try {
              const rndRes = await axios.get(`${POKEAPI_BASE_URL}/pokemon/${rndId}`);
              if (rndRes.data.name !== correctAnswer && !wrongNames.includes(rndRes.data.name)) {
                wrongNames.push(rndRes.data.name);
              }
            } catch { /* skip */ }
          }
          options = [...wrongNames, correctAnswer].sort(() => Math.random() - 0.5);
          break;
        }
      }

      const result = {
        pokemonId: targetId,
        pokemonName: pokemon.name,
        pokemonImage: pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default,
        question,
        options,
        correctAnswer,
        mode,
        difficulty,
        hint: `Ce Pokémon est de type ${pokemon.types.map((t: any) => t.type.name).join('/')}`,
      };

      return JSON.stringify(result);
    } catch (error: any) {
      return JSON.stringify({ error: `Erreur lors de la génération de la question : ${error.message}` });
    }
  },
});

export const getPokemonTriviaTool = new DynamicStructuredTool({
  name: 'get_pokemon_trivia',
  description: 'Récupère des faits trivia intéressants sur un Pokémon spécifique : description, type, stats remarquables, taux de capture, etc.',
  schema: z.object({
    pokemon_name: z.string().describe('Le nom du Pokémon (en anglais)'),
  }),
  func: async ({ pokemon_name }) => {
    try {
      const [pokemonRes, speciesRes] = await Promise.all([
        axios.get(`${POKEAPI_BASE_URL}/pokemon/${pokemon_name.toLowerCase()}`),
        axios.get(`${POKEAPI_BASE_URL}/pokemon-species/${pokemon_name.toLowerCase()}`),
      ]);

      const pokemon = pokemonRes.data;
      const species = speciesRes.data;

      const frDesc = species.flavor_text_entries.find((e: any) => e.language.name === 'fr');
      const enDesc = species.flavor_text_entries.find((e: any) => e.language.name === 'en');

      const stats = pokemon.stats.map((s: any) => ({ name: s.stat.name, value: s.base_stat }));
      const bestStat = stats.reduce((a: any, b: any) => a.value > b.value ? a : b);
      const statTotal = stats.reduce((sum: number, s: any) => sum + s.value, 0);

      const result = {
        name: pokemon.name,
        id: pokemon.id,
        types: pokemon.types.map((t: any) => t.type.name),
        description: (frDesc || enDesc)?.flavor_text?.replace(/\n|\f/g, ' ') || 'N/A',
        height: `${pokemon.height / 10}m`,
        weight: `${pokemon.weight / 10}kg`,
        bestStat: { name: bestStat.name, value: bestStat.value },
        statTotal,
        captureRate: species.capture_rate,
        baseHappiness: species.base_happiness,
        isLegendary: species.is_legendary,
        isMythical: species.is_mythical,
        generation: species.generation.name,
        habitat: species.habitat?.name || 'inconnu',
        abilities: pokemon.abilities.map((a: any) => a.ability.name),
      };

      return JSON.stringify(result);
    } catch (error: any) {
      return JSON.stringify({ error: `Pokémon "${pokemon_name}" non trouvé` });
    }
  },
});

export const getGenerationInfoTool = new DynamicStructuredTool({
  name: 'get_generation_info',
  description: 'Récupère les informations sur une génération Pokémon : nombre de Pokémon, région, starters, etc.',
  schema: z.object({
    generation_id: z.string().describe('Le numéro de la génération (1-9)'),
  }),
  func: async ({ generation_id }) => {
    try {
      const response = await axios.get(`${POKEAPI_BASE_URL}/generation/${generation_id}`);
      const data = response.data;

      const REGIONS: Record<number, string> = {
        1: 'Kanto', 2: 'Johto', 3: 'Hoenn', 4: 'Sinnoh',
        5: 'Unova', 6: 'Kalos', 7: 'Alola', 8: 'Galar', 9: 'Paldea',
      };

      const STARTERS: Record<number, string[]> = {
        1: ['bulbasaur', 'charmander', 'squirtle'],
        2: ['chikorita', 'cyndaquil', 'totodile'],
        3: ['treecko', 'torchic', 'mudkip'],
        4: ['turtwig', 'chimchar', 'piplup'],
        5: ['snivy', 'tepig', 'oshawott'],
        6: ['chespin', 'fennekin', 'froakie'],
        7: ['rowlet', 'litten', 'popplio'],
        8: ['grookey', 'scorbunny', 'sobble'],
        9: ['sprigatito', 'fuecoco', 'quaxly'],
      };

      const genNum = parseInt(generation_id);

      const result = {
        id: genNum,
        name: data.name,
        region: REGIONS[genNum] || data.main_region?.name,
        totalPokemon: data.pokemon_species.length,
        starters: STARTERS[genNum] || [],
        samplePokemon: data.pokemon_species.slice(0, 10).map((p: any) => p.name),
      };

      return JSON.stringify(result);
    } catch (error: any) {
      return JSON.stringify({ error: `Génération "${generation_id}" non trouvée` });
    }
  },
});

// ============================================
// EXPORT : Liste de tous les tools Quiz (pour LangChain)
// ============================================

export const quizTools = [
  generateQuizQuestionTool,
  getPokemonTriviaTool,
  getGenerationInfoTool,
];
