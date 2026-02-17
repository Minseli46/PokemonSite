/**
 * Outils spécifiques au Team Agent (LangChain) 🦜🔗
 * Analyse d'équipe, couverture de types, suggestions stratégiques
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

const ALL_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

async function fetchPokemonTypes(name: string): Promise<string[]> {
  try {
    const res = await axios.get(`${POKEAPI_BASE_URL}/pokemon/${name.trim().toLowerCase()}`);
    return res.data.types.map((t: any) => t.type.name);
  } catch {
    return [];
  }
}

async function fetchPokemonStats(name: string): Promise<Record<string, number>> {
  try {
    const res = await axios.get(`${POKEAPI_BASE_URL}/pokemon/${name.trim().toLowerCase()}`);
    const stats: Record<string, number> = {};
    res.data.stats.forEach((s: any) => {
      stats[s.stat.name] = s.base_stat;
    });
    return stats;
  } catch {
    return {};
  }
}

async function fetchTypeRelations(typeName: string) {
  try {
    const res = await axios.get(`${POKEAPI_BASE_URL}/type/${typeName}`);
    return res.data.damage_relations;
  } catch {
    return null;
  }
}

// Pokémon populaires par rôle pour les suggestions
const SUGGESTION_POOL: Record<string, { name: string; types: string[]; role: string }[]> = {
  attacker: [
    { name: 'garchomp', types: ['dragon', 'ground'], role: 'attacker' },
    { name: 'dragonite', types: ['dragon', 'flying'], role: 'attacker' },
    { name: 'lucario', types: ['fighting', 'steel'], role: 'attacker' },
    { name: 'gengar', types: ['ghost', 'poison'], role: 'attacker' },
    { name: 'alakazam', types: ['psychic'], role: 'attacker' },
    { name: 'infernape', types: ['fire', 'fighting'], role: 'attacker' },
    { name: 'hydreigon', types: ['dark', 'dragon'], role: 'attacker' },
    { name: 'volcarona', types: ['bug', 'fire'], role: 'attacker' },
  ],
  defender: [
    { name: 'blissey', types: ['normal'], role: 'defender' },
    { name: 'toxapex', types: ['poison', 'water'], role: 'defender' },
    { name: 'ferrothorn', types: ['grass', 'steel'], role: 'defender' },
    { name: 'skarmory', types: ['steel', 'flying'], role: 'defender' },
    { name: 'hippowdon', types: ['ground'], role: 'defender' },
    { name: 'corviknight', types: ['flying', 'steel'], role: 'defender' },
  ],
  speedster: [
    { name: 'weavile', types: ['dark', 'ice'], role: 'speedster' },
    { name: 'jolteon', types: ['electric'], role: 'speedster' },
    { name: 'aerodactyl', types: ['rock', 'flying'], role: 'speedster' },
    { name: 'cinderace', types: ['fire'], role: 'speedster' },
    { name: 'dragapult', types: ['dragon', 'ghost'], role: 'speedster' },
  ],
  tank: [
    { name: 'snorlax', types: ['normal'], role: 'tank' },
    { name: 'tyranitar', types: ['rock', 'dark'], role: 'tank' },
    { name: 'swampert', types: ['water', 'ground'], role: 'tank' },
    { name: 'metagross', types: ['steel', 'psychic'], role: 'tank' },
    { name: 'slowbro', types: ['water', 'psychic'], role: 'tank' },
  ],
};

// ============================================
// LANGCHAIN TOOLS
// ============================================

export const calculateTeamCoverageTool = new DynamicStructuredTool({
  name: 'calculate_team_coverage',
  description: 'Calcule la couverture de types d\'une équipe Pokémon. Analyse les faiblesses, résistances et immunités cumulées de l\'équipe. Prend une liste d\'IDs de Pokémon ou de noms.',
  schema: z.object({
    pokemon_list: z.string().describe('Liste de noms ou IDs de Pokémon séparés par des virgules (ex: "pikachu,charizard,blastoise")'),
  }),
  func: async ({ pokemon_list }) => {
    const pokemonNames = pokemon_list.split(',').map((n: string) => n.trim()).filter(Boolean);

    if (pokemonNames.length === 0) {
      return JSON.stringify({ error: 'Aucun Pokémon fourni' });
    }

    const teamTypes: Record<string, string[]> = {};
    for (const name of pokemonNames) {
      teamTypes[name] = await fetchPokemonTypes(name);
    }

    const weaknesses: Record<string, number> = {};
    const resistances: Record<string, number> = {};
    const immunities: Record<string, number> = {};
    const allTeamTypes = new Set<string>();

    for (const [, types] of Object.entries(teamTypes)) {
      types.forEach(t => allTeamTypes.add(t));
      for (const typeName of types) {
        const relations = await fetchTypeRelations(typeName);
        if (!relations) continue;
        relations.double_damage_from.forEach((t: any) => { weaknesses[t.name] = (weaknesses[t.name] || 0) + 1; });
        relations.half_damage_from.forEach((t: any) => { resistances[t.name] = (resistances[t.name] || 0) + 1; });
        relations.no_damage_from.forEach((t: any) => { immunities[t.name] = (immunities[t.name] || 0) + 1; });
      }
    }

    const offensiveCoverage: string[] = [];
    for (const typeName of allTeamTypes) {
      const relations = await fetchTypeRelations(typeName);
      if (relations) {
        relations.double_damage_to.forEach((t: any) => {
          if (!offensiveCoverage.includes(t.name)) offensiveCoverage.push(t.name);
        });
      }
    }

    const uncoveredTypes = ALL_TYPES.filter(t => !offensiveCoverage.includes(t));

    const result = {
      team: Object.entries(teamTypes).map(([name, types]) => ({ name, types })),
      defensiveWeaknesses: Object.entries(weaknesses).sort((a, b) => b[1] - a[1]).map(([type, count]) => ({ type, pokemonWeakCount: count })),
      defensiveResistances: Object.entries(resistances).sort((a, b) => b[1] - a[1]).map(([type, count]) => ({ type, pokemonResistCount: count })),
      immunities: Object.entries(immunities).map(([type, count]) => ({ type, count })),
      offensiveCoverage: offensiveCoverage.sort(),
      uncoveredTypes,
      coverageScore: Math.round((offensiveCoverage.length / ALL_TYPES.length) * 100),
    };

    return JSON.stringify(result);
  },
});

export const evaluateTeamBalanceTool = new DynamicStructuredTool({
  name: 'evaluate_team_balance',
  description: 'Évalue l\'équilibre des rôles dans une équipe (attaquants, défenseurs, speedsters, tanks, spécialistes). Donne un score global et des recommandations.',
  schema: z.object({
    pokemon_list: z.string().describe('Liste de noms ou IDs de Pokémon séparés par des virgules'),
  }),
  func: async ({ pokemon_list }) => {
    const pokemonNames = pokemon_list.split(',').map((n: string) => n.trim()).filter(Boolean);

    const roles = { attackers: 0, defenders: 0, speedsters: 0, tanks: 0, special: 0 };
    const pokemonRoles: Record<string, string> = {};

    for (const name of pokemonNames) {
      const stats = await fetchPokemonStats(name);
      if (Object.keys(stats).length === 0) continue;

      const hp = stats['hp'] || 0;
      const attack = stats['attack'] || 0;
      const defense = stats['defense'] || 0;
      const spAttack = stats['special-attack'] || 0;
      const spDefense = stats['special-defense'] || 0;
      const speed = stats['speed'] || 0;

      const maxStat = Math.max(attack, defense, spAttack, spDefense, speed, hp);
      let role: string;

      if (maxStat === speed && speed > 90) { role = 'speedster'; roles.speedsters++; }
      else if (maxStat === attack || maxStat === spAttack) {
        if (hp > 80 && (defense > 80 || spDefense > 80)) { role = 'tank'; roles.tanks++; }
        else { role = 'attacker'; roles.attackers++; }
      }
      else if (maxStat === defense || maxStat === spDefense) { role = 'defender'; roles.defenders++; }
      else if (maxStat === hp) { role = 'tank'; roles.tanks++; }
      else { role = 'special'; roles.special++; }

      pokemonRoles[name] = role;
    }

    const totalPokemon = pokemonNames.length;
    const idealDistribution = totalPokemon / 4;
    const variance = Object.values(roles).reduce((sum, count) => sum + Math.pow(count - idealDistribution, 2), 0) / Object.keys(roles).length;
    const balanceScore = Math.max(0, Math.round(100 - variance * 20));

    const result: any = {
      pokemonRoles,
      roleDistribution: roles,
      balanceScore,
      teamSize: totalPokemon,
      maxTeamSize: 6,
      recommendations: [] as string[],
    };

    if (roles.attackers === 0) result.recommendations.push('Votre équipe manque d\'attaquants offensifs');
    if (roles.defenders === 0) result.recommendations.push('Ajoutez un défenseur pour plus de solidité');
    if (roles.speedsters === 0) result.recommendations.push('Un Pokémon rapide serait utile pour frapper en premier');
    if (totalPokemon < 6) result.recommendations.push(`Vous pouvez encore ajouter ${6 - totalPokemon} Pokémon`);
    if (roles.attackers > 3) result.recommendations.push('Trop d\'attaquants, diversifiez les rôles');

    return JSON.stringify(result);
  },
});

export const suggestPokemonForTeamTool = new DynamicStructuredTool({
  name: 'suggest_pokemon_for_team',
  description: 'Suggère des Pokémon pour compléter une équipe en comblant les faiblesses de types et les rôles manquants. Retourne 3-5 suggestions avec justification.',
  schema: z.object({
    current_team: z.string().describe('Liste des Pokémon actuels dans l\'équipe (noms séparés par des virgules)'),
    preference: z.string().optional().default('équilibré').describe('Préférence optionnelle (ex: "offensif", "défensif", "équilibré", "gen1")'),
  }),
  func: async ({ current_team, preference }) => {
    const currentTeam = current_team.split(',').map((n: string) => n.trim().toLowerCase()).filter(Boolean);
    const pref = (preference || 'équilibré').toLowerCase();

    const currentTypes = new Set<string>();
    const currentRoles: Record<string, number> = { attacker: 0, defender: 0, speedster: 0, tank: 0 };

    for (const name of currentTeam) {
      const types = await fetchPokemonTypes(name);
      types.forEach(t => currentTypes.add(t));
      const stats = await fetchPokemonStats(name);
      const attack = Math.max(stats['attack'] || 0, stats['special-attack'] || 0);
      const defense = Math.max(stats['defense'] || 0, stats['special-defense'] || 0);
      const speed = stats['speed'] || 0;
      if (speed > 100) currentRoles.speedster++;
      else if (attack > defense) currentRoles.attacker++;
      else currentRoles.defender++;
    }

    const weaknessTypes = new Set<string>();
    for (const typeName of currentTypes) {
      const relations = await fetchTypeRelations(typeName);
      if (relations) {
        relations.double_damage_from.forEach((t: any) => weaknessTypes.add(t.name));
      }
    }

    const suggestions: any[] = [];
    const allCandidates = Object.values(SUGGESTION_POOL).flat();

    for (const candidate of allCandidates) {
      if (currentTeam.includes(candidate.name)) continue;
      if (suggestions.length >= 5) break;

      let score = 0;
      let reason = '';

      const newTypes = candidate.types.filter(t => !currentTypes.has(t));
      if (newTypes.length > 0) {
        score += newTypes.length * 30;
        reason = `Apporte le(s) type(s) ${newTypes.join(', ')} manquant(s)`;
      }

      const roleKey = candidate.role === 'speedster' ? 'speedster' : candidate.role;
      if (currentRoles[roleKey] === 0) {
        score += 25;
        reason += (reason ? ' + ' : '') + `Remplit le rôle de ${candidate.role}`;
      }

      if (pref.includes('offensif') && (candidate.role === 'attacker' || candidate.role === 'speedster')) score += 15;
      else if (pref.includes('défensif') && (candidate.role === 'defender' || candidate.role === 'tank')) score += 15;

      if (score > 0 || suggestions.length < 3) {
        suggestions.push({
          name: candidate.name, types: candidate.types, role: candidate.role,
          score, reason: reason || 'Bon choix polyvalent',
        });
      }
    }

    suggestions.sort((a, b) => b.score - a.score);

    return JSON.stringify({
      currentTeam, currentTypes: Array.from(currentTypes),
      slotsAvailable: 6 - currentTeam.length,
      suggestions: suggestions.slice(0, 5),
    });
  },
});

export const buildTeamProposalTool = new DynamicStructuredTool({
  name: 'build_team_proposal',
  description: 'Construit une proposition d\'équipe complète avec les données réelles de chaque Pokémon (id, image, types). Utilise cet outil pour créer des propositions interactives que l\'utilisateur peut directement ajouter à sa collection. Appelle cet outil UNE FOIS par proposition d\'équipe.',
  schema: z.object({
    team_name: z.string().describe('Le nom de l\'équipe proposée (ex: "Équipe Feu Ultime", "Les Dragons Légendaires")'),
    pokemon_names: z.string().describe('Les 6 noms de Pokémon séparés par des virgules (en anglais). Ex: "charizard,dragonite,garchomp,lucario,gengar,blastoise"'),
    description: z.string().describe('Une courte description de la stratégie et des points forts de cette équipe'),
  }),
  func: async ({ team_name, pokemon_names, description }) => {
    const names = pokemon_names.split(',').map((n: string) => n.trim().toLowerCase()).filter(Boolean);

    if (names.length === 0) {
      return JSON.stringify({ error: 'Aucun Pokémon fourni', __action_type: 'team_proposal' });
    }

    const pokemonData = await Promise.all(
      names.map(async (name: string) => {
        try {
          const res = await axios.get(`${POKEAPI_BASE_URL}/pokemon/${name}`);
          const p = res.data;
          return {
            id: p.id,
            name: p.name,
            image: p.sprites?.other?.['official-artwork']?.front_default || p.sprites?.front_default || '',
            types: p.types.map((t: any) => t.type.name),
          };
        } catch {
          return { id: 0, name, image: '', types: [] as string[] };
        }
      })
    );

    const result = {
      __action_type: 'team_proposal',
      team_name,
      description,
      pokemon: pokemonData,
    };

    console.log(`✅ Team proposal built: "${team_name}" with ${pokemonData.length} Pokémon`);
    return JSON.stringify(result);
  },
});

// ============================================
// EXPORT : Liste de tous les tools Team (pour LangChain)
// ============================================

export const teamTools = [
  calculateTeamCoverageTool,
  evaluateTeamBalanceTool,
  suggestPokemonForTeamTool,
  buildTeamProposalTool,
];
