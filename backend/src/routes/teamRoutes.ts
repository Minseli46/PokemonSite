import { Router } from 'express';
import {
  createTeam,
  getUserTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addPokemonToTeam,
  removePokemonFromTeam,
} from '../controllers/teamController';

const router = Router();

// Routes pour les équipes
router.post('/', createTeam);
router.get('/user/:userId', getUserTeams);
router.get('/:teamId', getTeamById);
router.put('/:teamId', updateTeam);
router.delete('/:teamId', deleteTeam);
router.post('/:teamId/pokemon', addPokemonToTeam);
router.delete('/:teamId/pokemon/:pokemonId', removePokemonFromTeam);

export default router;
