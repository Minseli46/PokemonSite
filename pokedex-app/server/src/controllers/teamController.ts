import { Request, Response, NextFunction } from 'express';
import databaseService from '../services/databaseService';

/**
 * Crée une nouvelle équipe
 */
export const createTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, name, pokemons } = req.body;

    if (!name || !pokemons || !Array.isArray(pokemons)) {
      return res.status(400).json({ 
        error: 'name and pokemons array are required' 
      });
    }

    if (pokemons.length > 6) {
      return res.status(400).json({ 
        error: 'A team can have maximum 6 Pokemon' 
      });
    }

    const team = await databaseService.createTeam(userId || null, name, pokemons);

    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère toutes les équipes d'un utilisateur
 */
export const getUserTeams = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const teams = await databaseService.getUserTeams(userId);

    res.json({ teams });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère une équipe spécifique avec les détails des Pokémon
 */
export const getTeamById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teamId } = req.params;

    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required' });
    }

    const team = await databaseService.getClient().team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Récupère les détails des Pokémon de l'équipe
    const pokemonDetails = await Promise.all(
      team.pokemons.map(id => databaseService.getPokemonById(id))
    );

    res.json({
      ...team,
      pokemonDetails: pokemonDetails.filter(p => p !== null),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Met à jour une équipe
 */
export const updateTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teamId } = req.params;
    const { name, pokemons } = req.body;

    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required' });
    }

    if (pokemons && (!Array.isArray(pokemons) || pokemons.length > 6)) {
      return res.status(400).json({ 
        error: 'pokemons must be an array with maximum 6 Pokemon' 
      });
    }

    const team = await databaseService.updateTeam(teamId, name, pokemons);

    res.json(team);
  } catch (error) {
    next(error);
  }
};

/**
 * Supprime une équipe
 */
export const deleteTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teamId } = req.params;

    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required' });
    }

    await databaseService.deleteTeam(teamId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Ajoute un Pokémon à une équipe
 */
export const addPokemonToTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teamId } = req.params;
    const { pokemonId } = req.body;

    if (!teamId || !pokemonId) {
      return res.status(400).json({ error: 'teamId and pokemonId are required' });
    }

    const team = await databaseService.getClient().team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.pokemons.includes(pokemonId)) {
      return res.status(400).json({ error: 'Pokemon already in team' });
    }

    if (team.pokemons.length >= 6) {
      return res.status(400).json({ error: 'Team is full (maximum 6 Pokemon)' });
    }

    const updatedTeam = await databaseService.updateTeam(
      teamId, 
      undefined, 
      [...team.pokemons, pokemonId]
    );

    res.json(updatedTeam);
  } catch (error) {
    next(error);
  }
};

/**
 * Retire un Pokémon d'une équipe
 */
export const removePokemonFromTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teamId, pokemonId } = req.params;

    if (!teamId || !pokemonId) {
      return res.status(400).json({ error: 'teamId and pokemonId are required' });
    }

    const team = await databaseService.getClient().team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const newPokemons = team.pokemons.filter(id => id !== parseInt(pokemonId));

    const updatedTeam = await databaseService.updateTeam(teamId, undefined, newPokemons);

    res.json(updatedTeam);
  } catch (error) {
    next(error);
  }
};
