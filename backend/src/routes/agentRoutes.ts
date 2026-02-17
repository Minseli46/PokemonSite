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
import { createAgentHandler, logAgentRequest } from './agentHelpers';

const router = Router();

/**
 * POST /api/agent/chat
 * Point d'entrée principal - l'orchestrateur décide quel agent utiliser
 */
router.post('/chat', logAgentRequest('chat'), createAgentHandler(orchestrate, 'Orchestrator'));

/**
 * POST /api/agent/team
 * Accès direct au Team Agent
 */
router.post('/team', logAgentRequest('team'), createAgentHandler(runTeamAgent, 'Team Agent'));

/**
 * POST /api/agent/quiz
 * Accès direct au Quiz Agent
 */
router.post('/quiz', logAgentRequest('quiz'), createAgentHandler(runQuizAgent, 'Quiz Agent'));

/**
 * POST /api/agent/wallpaper
 * Accès direct au Wallpaper Agent
 */
router.post('/wallpaper', logAgentRequest('wallpaper'), createAgentHandler(runWallpaperAgent, 'Wallpaper Agent'));

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
