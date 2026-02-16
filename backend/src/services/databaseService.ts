import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from '../config';

class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = getPrismaClient();
  }

  /**
   * Récupère le client Prisma
   */
  getClient() {
    return this.prisma;
  }

  /**
   * Connecte à la base de données
   */
  async connect() {
    try {
      await this.prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Déconnecte de la base de données
   */
  async disconnect() {
    try {
      await this.prisma.$disconnect();
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
      throw error;
    }
  }

  /**
   * Sauvegarde ou met à jour un Pokémon dans la base de données
   */
  async savePokemon(pokemonData: any) {
    try {
      return await this.prisma.pokemon.upsert({
        where: { pokemonId: pokemonData.pokemonId },
        update: pokemonData,
        create: pokemonData,
      });
    } catch (error) {
      console.error('Error saving Pokemon:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les Pokémon (avec pagination)
   */
  async getAllPokemon(skip: number = 0, take: number = 20) {
    try {
      const [pokemon, total] = await Promise.all([
        this.prisma.pokemon.findMany({
          skip,
          take,
          orderBy: { pokemonId: 'asc' },
        }),
        this.prisma.pokemon.count(),
      ]);

      return { pokemon, total };
    } catch (error) {
      console.error('Error fetching all Pokemon:', error);
      throw error;
    }
  }

  /**
   * Récupère un Pokémon par ID
   */
  async getPokemonById(pokemonId: number) {
    try {
      return await this.prisma.pokemon.findUnique({
        where: { pokemonId },
      });
    } catch (error) {
      console.error(`Error fetching Pokemon ${pokemonId}:`, error);
      throw error;
    }
  }

  /**
   * Recherche des Pokémon par nom
   */
  async searchPokemonByName(name: string) {
    try {
      return await this.prisma.pokemon.findMany({
        where: {
          name: {
            contains: name.toLowerCase(),
            mode: 'insensitive',
          },
        },
        take: 20,
      });
    } catch (error) {
      console.error('Error searching Pokemon:', error);
      throw error;
    }
  }

  /**
   * Filtre les Pokémon par génération
   */
  async getPokemonByGeneration(generation: number) {
    try {
      return await this.prisma.pokemon.findMany({
        where: { generation },
        orderBy: { pokemonId: 'asc' },
      });
    } catch (error) {
      console.error(`Error fetching Pokemon from generation ${generation}:`, error);
      throw error;
    }
  }
}

export default new DatabaseService();
