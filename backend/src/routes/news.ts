import { Router, Request, Response } from 'express';
import { fetchPokemonNews } from '../services/pokemonNewsService';

const router = Router();

// GET /api/news - Récupérer les actualités Pokémon
router.get('/', async (_req: Request, res: Response) => {
  try {
    const news = await fetchPokemonNews();
    res.json({
      success: true,
      data: news,
      count: news.length,
    });
  } catch (error) {
    console.error('Error in news route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Pokemon news',
    });
  }
});

export default router;
