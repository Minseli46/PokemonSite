/**
 * Helper utilities pour la gestion des agents
 */

import { Request, Response, NextFunction } from 'express';
import type { AgentRequest, AgentResponse } from '../agents';

/**
 * Type pour les fonctions d'agents
 */
type AgentFunction = (message: string, conversationHistory?: any[], context?: any) => Promise<AgentResponse>;

/**
 * Wrapper générique pour les routes d'agents
 * Réduit le code dupliqué et centralise la gestion des erreurs
 */
export function createAgentHandler(agentFn: AgentFunction, agentName: string) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { message, conversationHistory, context } = req.body as AgentRequest;

      // Validation
      if (!message || typeof message !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Le champ "message" est requis',
        });
        return;
      }

      // Exécution de l'agent
      const response = await agentFn(message, conversationHistory || [], context);

      // Réponse standardisée
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
      console.error(`❌ ${agentName} Error:`, error.message);
      res.status(500).json({
        success: false,
        error: error.message || `Erreur interne de ${agentName}`,
      });
    }
  };
}

/**
 * Middleware pour logger les requêtes agents
 */
export function logAgentRequest(agentName: string) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    console.log('\n' + '='.repeat(70));
    console.log(`🤖 API /agent/${agentName} - Nouvelle requête`);
    console.log('='.repeat(70));
    next();
  };
}

