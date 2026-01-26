import { Request, Response, NextFunction } from 'express';
import pokeAPIService from '../services/pokeAPIService';
import databaseService from '../services/databaseService';

/**
 * Récupère une liste paginée de Pokémon
 */
export const getPokemonList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    // Essaie d'abord de récupérer depuis la base de données
    const { pokemon: cachedPokemon, total } = await databaseService.getAllPokemon(offset, limit);

    if (cachedPokemon.length > 0) {
      return res.json({
        results: cachedPokemon,
        count: total,
        next: offset + limit < total ? offset + limit : null,
        previous: offset > 0 ? Math.max(0, offset - limit) : null,
      });
    }

    // Si pas en cache, récupère depuis l'API
    const apiData = await pokeAPIService.getPokemonList(limit, offset);
    
    // Récupère les détails de chaque Pokémon et les sauvegarde
    const pokemonDetails = await Promise.all(
      apiData.results.map(async (p: any) => {
        const details = await pokeAPIService.getPokemonDetails(p.name);
        const pokemonData = {
          pokemonId: details.id,
          name: details.name,
          types: details.types.map((t: any) => t.type.name),
          sprite: details.sprites.front_default,
          artwork: details.sprites.other['official-artwork'].front_default,
          stats: details.stats,
          height: details.height,
          weight: details.weight,
          abilities: details.abilities,
          generation: Math.ceil(details.id / 151), // Approximation
        };
        
        await databaseService.savePokemon(pokemonData);
        return pokemonData;
      })
    );

    res.json({
      results: pokemonDetails,
      count: apiData.count,
      next: apiData.next,
      previous: apiData.previous,
    });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

/**
 * Récupère les détails d'un Pokémon
 */
export const getPokemonById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const pokemonId = parseInt(id);

    // Essaie d'abord depuis la base de données
    let pokemon = await databaseService.getPokemonById(pokemonId);

    if (!pokemon) {
      // Si pas en cache, récupère depuis l'API
      const details = await pokeAPIService.getPokemonDetails(pokemonId);
      const species = await pokeAPIService.getPokemonSpecies(pokemonId);
      
      // Récupère les évolutions
      let evolutions = null;
      if (species.evolution_chain?.url) {
        const evolutionChain = await pokeAPIService.getEvolutionChain(species.evolution_chain.url);
        evolutions = extractEvolutions(evolutionChain);
      }

      // Calcule les faiblesses
      const types = details.types.map((t: any) => t.type.name);
      const weaknesses = await pokeAPIService.calculateWeaknesses(types);

      pokemon = await databaseService.savePokemon({
        pokemonId: details.id,
        name: details.name,
        types,
        sprite: details.sprites.front_default,
        artwork: details.sprites.other['official-artwork'].front_default,
        stats: details.stats,
        evolutions,
        generation: Math.ceil(details.id / 151),
        height: details.height,
        weight: details.weight,
        abilities: details.abilities,
      });

      // Ajoute les faiblesses à la réponse
      res.json({ ...pokemon, weaknesses });
    } else {
      // Calcule les faiblesses si nécessaire
      const weaknesses = await pokeAPIService.calculateWeaknesses(pokemon.types);
      res.json({ ...pokemon, weaknesses });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Recherche des Pokémon par nom
 */
export const searchPokemon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.query;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name parameter is required' });
    }

    // Recherche d'abord dans la base de données
    let results = await databaseService.searchPokemonByName(name);

    if (results.length === 0) {
      // Si pas de résultats, recherche via l'API
      const apiResults = await pokeAPIService.searchPokemonByName(name);
      
      // Sauvegarde les résultats
      results = await Promise.all(
        apiResults.map(async (details: any) => {
          return await databaseService.savePokemon({
            pokemonId: details.id,
            name: details.name,
            types: details.types.map((t: any) => t.type.name),
            sprite: details.sprites.front_default,
            artwork: details.sprites.other['official-artwork'].front_default,
            stats: details.stats,
            generation: Math.ceil(details.id / 151),
            height: details.height,
            weight: details.weight,
            abilities: details.abilities,
          });
        })
      );
    }

    res.json({ results });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

/**
 * Filtre les Pokémon par génération
 */
export const filterByGeneration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { generation } = req.query;

    if (!generation) {
      return res.status(400).json({ error: 'Generation parameter is required' });
    }

    const gen = parseInt(generation as string);
    
    if (isNaN(gen) || gen < 1 || gen > 8) {
      return res.status(400).json({ error: 'Generation must be between 1 and 8' });
    }

    const results = await databaseService.getPokemonByGeneration(gen);

    res.json({ results });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

/**
 * Compare deux Pokémon
 */
export const comparePokemon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id1, id2 } = req.query;

    if (!id1 || !id2) {
      return res.status(400).json({ error: 'Both id1 and id2 parameters are required' });
    }

    const pokemonId1 = parseInt(id1 as string);
    const pokemonId2 = parseInt(id2 as string);

    // Récupère ou crée les Pokémon en utilisant getPokemonById qui gère le cache
    let [pokemon1, pokemon2] = await Promise.all([
      databaseService.getPokemonById(pokemonId1),
      databaseService.getPokemonById(pokemonId2),
    ]);

    // Si non trouvé en BD, récupère depuis l'API
    if (!pokemon1) {
      const details1 = await pokeAPIService.getPokemonDetails(pokemonId1);
      const species1 = await pokeAPIService.getPokemonSpecies(pokemonId1);
      
      let evolutions1 = null;
      if (species1.evolution_chain?.url) {
        const evolutionChain = await pokeAPIService.getEvolutionChain(species1.evolution_chain.url);
        evolutions1 = extractEvolutions(evolutionChain);
      }

      const types1 = details1.types.map((t: any) => t.type.name);
      
      pokemon1 = await databaseService.savePokemon({
        pokemonId: details1.id,
        name: details1.name,
        types: types1,
        sprite: details1.sprites.front_default,
        artwork: details1.sprites.other['official-artwork'].front_default,
        stats: details1.stats,
        evolutions: evolutions1,
        generation: Math.ceil(details1.id / 151),
        height: details1.height,
        weight: details1.weight,
        abilities: details1.abilities,
      });
    }

    if (!pokemon2) {
      const details2 = await pokeAPIService.getPokemonDetails(pokemonId2);
      const species2 = await pokeAPIService.getPokemonSpecies(pokemonId2);
      
      let evolutions2 = null;
      if (species2.evolution_chain?.url) {
        const evolutionChain = await pokeAPIService.getEvolutionChain(species2.evolution_chain.url);
        evolutions2 = extractEvolutions(evolutionChain);
      }

      const types2 = details2.types.map((t: any) => t.type.name);
      
      pokemon2 = await databaseService.savePokemon({
        pokemonId: details2.id,
        name: details2.name,
        types: types2,
        sprite: details2.sprites.front_default,
        artwork: details2.sprites.other['official-artwork'].front_default,
        stats: details2.stats,
        evolutions: evolutions2,
        generation: Math.ceil(details2.id / 151),
        height: details2.height,
        weight: details2.weight,
        abilities: details2.abilities,
      });
    }

    res.json({
      pokemon1,
      pokemon2,
      comparison: {
        hp: compareStat(pokemon1.stats, pokemon2.stats, 'hp'),
        attack: compareStat(pokemon1.stats, pokemon2.stats, 'attack'),
        defense: compareStat(pokemon1.stats, pokemon2.stats, 'defense'),
        specialAttack: compareStat(pokemon1.stats, pokemon2.stats, 'special-attack'),
        specialDefense: compareStat(pokemon1.stats, pokemon2.stats, 'special-defense'),
        speed: compareStat(pokemon1.stats, pokemon2.stats, 'speed'),
      },
    });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

/**
 * Fonction utilitaire pour extraire les évolutions
 */
function extractEvolutions(chain: any): any[] {
  const evolutions: any[] = [];
  
  const traverse = (node: any) => {
    evolutions.push({
      name: node.species.name,
      url: node.species.url,
    });
    
    if (node.evolves_to && node.evolves_to.length > 0) {
      node.evolves_to.forEach((evo: any) => traverse(evo));
    }
  };
  
  traverse(chain);
  return evolutions;
}

/**
 * Fonction utilitaire pour comparer une stat
 */
function compareStat(stats1: any, stats2: any, statName: string): any {
  const stat1 = stats1.find((s: any) => s.stat.name === statName);
  const stat2 = stats2.find((s: any) => s.stat.name === statName);
  
  return {
    pokemon1: stat1?.base_stat || 0,
    pokemon2: stat2?.base_stat || 0,
    difference: (stat1?.base_stat || 0) - (stat2?.base_stat || 0),
  };
}
