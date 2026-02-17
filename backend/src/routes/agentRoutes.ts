/**
 * Routes API pour le système d'agents IA
 * 
 * Endpoints :
 * POST /api/agent/chat    → Orchestrateur (routage automatique)
 * POST /api/agent/team    → Team Agent direct
 * POST /api/agent/quiz    → Quiz Agent direct
 * POST /api/agent/wallpaper → Wallpaper Agent direct
 */

import { Router, Request, Response } from 'express';
import { orchestrate, runTeamAgent, runQuizAgent, runWallpaperAgent } from '../agents';
import type { AgentRequest } from '../agents';

const router = Router();

/**
 * POST /api/agent/chat
 * Point d'entrée principal - l'orchestrateur décide quel agent utiliser
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory, context } = req.body as AgentRequest;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Le champ "message" est requis',
      });
    }

    console.log('\n' + '='.repeat(70));
    console.log('🤖 API /agent/chat - Nouvelle requête');
    console.log('='.repeat(70));

    const response = await orchestrate(
      message,
      conversationHistory || [],
      context
    );

    res.json({
      success: true,
      data: {
        agent: response.agent,
        message: response.message,
        toolsUsed: response.toolsUsed,
        actions: response.actions || [],
      },
    });
  } catch (error: any) {
    console.error('❌ Agent Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur interne de l\'agent',
    });
  }
});

/**
 * POST /api/agent/team
 * Accès direct au Team Agent
 */
router.post('/team', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory } = req.body as AgentRequest;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Le champ "message" est requis' });
    }

    const response = await runTeamAgent(message, conversationHistory || []);

    res.json({
      success: true,
      data: {
        agent: response.agent,
        message: response.message,
        toolsUsed: response.toolsUsed,
        actions: response.actions || [],
      },
    });
  } catch (error: any) {
    console.error('❌ Team Agent Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/agent/quiz
 * Accès direct au Quiz Agent
 */
router.post('/quiz', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory } = req.body as AgentRequest;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Le champ "message" est requis' });
    }

    const response = await runQuizAgent(message, conversationHistory || []);

    res.json({
      success: true,
      data: {
        agent: response.agent,
        message: response.message,
        toolsUsed: response.toolsUsed,
        actions: response.actions || [],
      },
    });
  } catch (error: any) {
    console.error('❌ Quiz Agent Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/agent/wallpaper
 * Accès direct au Wallpaper Agent
 */
router.post('/wallpaper', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory } = req.body as AgentRequest;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Le champ "message" est requis' });
    }

    const response = await runWallpaperAgent(message, conversationHistory || []);

    res.json({
      success: true,
      data: {
        agent: response.agent,
        message: response.message,
        toolsUsed: response.toolsUsed,
        actions: response.actions || [],
      },
    });
  } catch (error: any) {
    console.error('❌ Wallpaper Agent Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/agent/health
 * Vérifie si l'agent est configuré
 */
router.get('/health', (_req: Request, res: Response) => {
  const hasApiKey = !!process.env.MISTRAL_API_KEY;
  res.json({
    status: hasApiKey ? 'ready' : 'missing_api_key',
    hasApiKey,
    agents: ['orchestrator', 'team', 'quiz', 'wallpaper'],
    message: hasApiKey
      ? '🤖 Système d\'agents IA opérationnel'
      : '⚠️ MISTRAL_API_KEY manquante dans backend/.env',
  });
});

export default router;
