import axios from 'axios';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

export interface PokemonType {
  type: {
    name: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
  };
  is_hidden: boolean;
}

export interface EvolutionChain {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolutionChain[];
}

export interface PokemonDetails {
  id: number;
  name: string;
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  height: number;
  weight: number;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  species: {
    url: string;
  };
}

class PokeAPIService {
  /**
   * Récupère une liste paginée de Pokémon
   */
  async getPokemonList(limit: number = 20, offset: number = 0): Promise<any> {
    try {
      const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon`, {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Pokemon list:', error);
      throw new Error('Failed to fetch Pokemon list from PokeAPI');
    }
  }

  /**
   * Récupère les détails d'un Pokémon par ID ou nom
   */
  async getPokemonDetails(idOrName: string | number): Promise<PokemonDetails> {
    try {
      const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon/${idOrName}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching Pokemon ${idOrName}:`, error);
      throw new Error(`Pokemon ${idOrName} not found`);
    }
  }

  /**
   * Récupère les informations d'espèce (pour les évolutions)
   */
  async getPokemonSpecies(id: number): Promise<any> {
    try {
      const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon-species/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching Pokemon species ${id}:`, error);
      throw new Error(`Pokemon species ${id} not found`);
    }
  }

  /**
   * Récupère la chaîne d'évolution
   */
  async getEvolutionChain(url: string): Promise<EvolutionChain> {
    try {
      const response = await axios.get(url);
      return response.data.chain;
    } catch (error) {
      console.error('Error fetching evolution chain:', error);
      throw new Error('Failed to fetch evolution chain');
    }
  }

  /**
   * Récupère les types de Pokémon
   */
  async getPokemonTypes(): Promise<any> {
    try {
      const response = await axios.get(`${POKEAPI_BASE_URL}/type`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Pokemon types:', error);
      throw new Error('Failed to fetch Pokemon types');
    }
  }

  /**
   * Récupère les faiblesses/résistances d'un type
   */
  async getTypeDetails(typeName: string): Promise<any> {
    try {
      const response = await axios.get(`${POKEAPI_BASE_URL}/type/${typeName}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching type ${typeName}:`, error);
      throw new Error(`Type ${typeName} not found`);
    }
  }

  /**
   * Recherche un Pokémon par nom (recherche partielle)
   */
  async searchPokemonByName(name: string): Promise<PokemonDetails[]> {
    try {
      // PokeAPI ne supporte pas la recherche partielle, on récupère donc une liste et on filtre
      const allPokemon = await this.getPokemonList(1000, 0);
      const filtered = allPokemon.results.filter((p: any) => 
        p.name.toLowerCase().includes(name.toLowerCase())
      );
      
      // Récupère les détails des Pokémon filtrés
      const details = await Promise.all(
        filtered.slice(0, 20).map((p: any) => this.getPokemonDetails(p.name))
      );
      
      return details;
    } catch (error) {
      console.error('Error searching Pokemon:', error);
      throw new Error('Failed to search Pokemon');
    }
  }

  /**
   * Récupère les Pokémon par génération
   */
  async getPokemonByGeneration(generation: number): Promise<any> {
    try {
      const response = await axios.get(`${POKEAPI_BASE_URL}/generation/${generation}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching generation ${generation}:`, error);
      throw new Error(`Generation ${generation} not found`);
    }
  }

  /**
   * Calcule les faiblesses d'un Pokémon basé sur ses types
   */
  async calculateWeaknesses(types: string[]): Promise<any> {
    try {
      const weaknesses: Record<string, number> = {};
      
      for (const typeName of types) {
        const typeDetails = await this.getTypeDetails(typeName);
        
        // Double damage from
        typeDetails.damage_relations.double_damage_from.forEach((t: any) => {
          weaknesses[t.name] = (weaknesses[t.name] || 1) * 2;
        });
        
        // Half damage from
        typeDetails.damage_relations.half_damage_from.forEach((t: any) => {
          weaknesses[t.name] = (weaknesses[t.name] || 1) * 0.5;
        });
        
        // No damage from
        typeDetails.damage_relations.no_damage_from.forEach((t: any) => {
          weaknesses[t.name] = 0;
        });
      }
      
      return weaknesses;
    } catch (error) {
      console.error('Error calculating weaknesses:', error);
      throw new Error('Failed to calculate weaknesses');
    }
  }
}

export default new PokeAPIService();
