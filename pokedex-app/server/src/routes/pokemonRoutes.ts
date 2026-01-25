import { Router } from 'express';
import {
  getPokemonList,
  getPokemonById,
  searchPokemon,
  filterByGeneration,
  comparePokemon,
} from '../controllers/pokemonController';

const router = Router();

// Routes pour les Pokémon
router.get('/', getPokemonList);
router.get('/search', searchPokemon);
router.get('/filter', filterByGeneration);
router.get('/compare', comparePokemon);
router.get('/:id', getPokemonById);

export default router;
