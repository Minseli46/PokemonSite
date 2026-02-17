/**
 * Client Mistral AI via LangChain 🦜🔗
 * 
 * Utilise @langchain/mistralai pour instancier le modèle ChatMistralAI.
 * Ce wrapper fournit un singleton du modèle LangChain, utilisé ensuite
 * par les agents (createToolCallingAgent) et l'orchestrateur.
 * 
 * Concepts LangChain :
 * - ChatMistralAI : wrapper LLM qui gère le chat completion + tool calling
 * - .bindTools() : attache des tools au modèle pour le function calling
 * - .invoke() : envoie les messages et retourne une AIMessage
 */

import { ChatMistralAI } from '@langchain/mistralai';
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import type { ChatMessage } from './types';

// ============================================
// CLIENT SINGLETON (LangChain ChatMistralAI)
// ============================================

let defaultModel: ChatMistralAI | null = null;

/**
 * Retourne une instance ChatMistralAI.
 * Avec options → nouvelle instance (pour agents avec température/maxTokens spécifiques)
 * Sans options → singleton par défaut
 */
export function getMistralModel(options?: {
  temperature?: number;
  maxTokens?: number;
}): ChatMistralAI {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error(
      '❌ MISTRAL_API_KEY manquante ! Ajoutez-la dans backend/.env\n' +
      'Obtenez votre clé gratuite sur : https://console.mistral.ai/api-keys/'
    );
  }

  if (options) {
    return new ChatMistralAI({
      model: 'mistral-small-latest',
      apiKey,
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? 1024,
    });
  }

  if (!defaultModel) {
    defaultModel = new ChatMistralAI({
      model: 'mistral-small-latest',
      apiKey,
      temperature: 0.7,
      maxTokens: 1024,
    });
  }

  return defaultModel;
}

/**
 * Chat simple sans tools (pour l'orchestrateur, classification, réponse générale)
 * Convertit l'historique ChatMessage[] en messages LangChain (SystemMessage, HumanMessage, AIMessage)
 */
export async function simpleChat(
  systemPrompt: string,
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
): Promise<string> {
  const llm = getMistralModel({ temperature: 0.3 });

  const messages: (SystemMessage | HumanMessage | AIMessage)[] = [
    new SystemMessage(systemPrompt),
  ];

  for (const msg of conversationHistory) {
    if (msg.role === 'user') {
      messages.push(new HumanMessage(msg.content));
    } else if (msg.role === 'assistant') {
      messages.push(new AIMessage(msg.content));
    }
  }

  messages.push(new HumanMessage(userMessage));

  console.log(`\n📤 LLM CALL (simpleChat): ${messages.length} messages`);

  const response = await llm.invoke(messages);
  const content = typeof response.content === 'string' ? response.content : '';

  console.log(`📥 LLM RESPONSE: ${content.substring(0, 100)}...`);

  return content;
}
