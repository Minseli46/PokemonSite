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

  /**
   * Crée une équipe
   */
  async createTeam(userId: string | null, name: string, pokemons: number[]) {
    try {
      const data: any = {
        name,
        pokemons,
      };
      
      // N'ajouter userId que s'il est fourni
      if (userId) {
        data.userId = userId;
      }
      
      return await this.prisma.team.create({
        data,
      });
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  }

  /**
   * Récupère les équipes d'un utilisateur
   */
  async getUserTeams(userId: string) {
    try {
      return await this.prisma.team.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('Error fetching user teams:', error);
      throw error;
    }
  }

  /**
   * Met à jour une équipe
   */
  async updateTeam(teamId: string, name?: string, pokemons?: number[]) {
    try {
      return await this.prisma.team.update({
        where: { id: teamId },
        data: {
          ...(name && { name }),
          ...(pokemons && { pokemons }),
        },
      });
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  }

  /**
   * Supprime une équipe
   */
  async deleteTeam(teamId: string) {
    try {
      return await this.prisma.team.delete({
        where: { id: teamId },
      });
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  }

  /**
   * Crée ou récupère un utilisateur
   */
  async upsertUser(id: string, email: string, name?: string) {
    try {
      return await this.prisma.user.upsert({
        where: { id },
        update: { email, name },
        create: { id, email, name },
      });
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }

  /**
   * Ajoute un favori
   */
  async addFavorite(userId: string, pokemonId: number) {
    try {
      return await this.prisma.favorite.create({
        data: { userId, pokemonId },
      });
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  }

  /**
   * Supprime un favori
   */
  async removeFavorite(userId: string, pokemonId: number) {
    try {
      return await this.prisma.favorite.delete({
        where: {
          userId_pokemonId: {
            userId,
            pokemonId,
          },
        },
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  }

  /**
   * Récupère les favoris d'un utilisateur
   */
  async getUserFavorites(userId: string) {
    try {
      return await this.prisma.favorite.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      throw error;
    }
  }

  /**
   * Sauvegarde une question de quiz
   */
  async saveQuiz(quizData: any) {
    try {
      return await this.prisma.quiz.create({
        data: quizData,
      });
    } catch (error) {
      console.error('Error saving quiz:', error);
      throw error;
    }
  }

  /**
   * Récupère des questions de quiz aléatoires
   */
  async getRandomQuizzes(limit: number = 10, difficulty?: string) {
    try {
      const where = difficulty ? { difficulty } : {};
      
      // Prisma ne supporte pas ORDER BY RANDOM() directement, on utilise donc une approche alternative
      const totalQuizzes = await this.prisma.quiz.count({ where });
      const skip = Math.floor(Math.random() * Math.max(0, totalQuizzes - limit));
      
      return await this.prisma.quiz.findMany({
        where,
        take: limit,
        skip,
      });
    } catch (error) {
      console.error('Error fetching random quizzes:', error);
      throw error;
    }
  }
}

export default new DatabaseService();
