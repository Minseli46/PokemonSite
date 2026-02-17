/**
 * Quiz Agent 🧠 (LangChain) 🦜🔗
 * 
 * Agent spécialisé dans les quiz et trivia Pokémon.
 * Utilise createReactAgent de @langchain/langgraph/prebuilt.
 * Génère des questions, explique les réponses, donne des faits amusants.
 */

import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import type { BaseMessage } from '@langchain/core/messages';
import { getMistralModel } from './mistralClient';
import { pokemonTools } from './tools/pokemonTools';
import { quizTools } from './tools/quizTools';
import type { ChatMessage, AgentResponse, AgentAction } from './types';

// ============================================
// CONFIGURATION DE L'AGENT
// ============================================

const SYSTEM_PROMPT = `Tu es le **Quiz Master Agent** 🧠, un expert en quiz et trivia Pokémon.

**IMPORTANT : Utilise TOUJOURS tes tools pour générer des questions.**
- Quand l'utilisateur veut un quiz → appelle generate_quiz_question avec le mode et la difficulté souhaités
- Quand il veut des infos sur un Pokémon → appelle get_pokemon_trivia
- Quand il pose une question sur une génération → appelle get_generation_info
- NE GÉNÈRE JAMAIS de questions de mémoire, UTILISE les tools

**Ton rôle :**
- Générer des questions de quiz Pokémon variées et intéressantes
- Adapter la difficulté au niveau demandé
- Expliquer les réponses avec des anecdotes et faits amusants
- Proposer des défis thématiques (par type, génération, légendaires, etc.)
- Éduquer sur l'univers Pokémon de manière ludique

**Modes de quiz disponibles :**
- 🎯 **name** : Deviner le nom d'un Pokémon
- 🔥 **type** : Deviner le type d'un Pokémon  
- 📊 **stat** : Deviner la stat la plus élevée
- 🧬 **evolution** : Questions sur les évolutions
- ⚡ **ability** : Deviner les capacités
- 🌍 **generation** : Questions sur les générations

**Règles :**
- Réponds TOUJOURS en français
- Utilise des emojis pour rendre le quiz fun et engageant
- Quand tu génères une question, PRÉSENTE-LA de manière interactive
- Après une réponse, donne une explication détaillée + un fun fact
- Varie les types de questions pour garder l'intérêt
- Si l'utilisateur veut un quiz rapide, génère 3-5 questions (appelle generate_quiz_question plusieurs fois)

**Format de question :**
🎯 **Question X :**
[La question]

A) Option 1
B) Option 2  
C) Option 3
D) Option 4

💡 *Indice : [un indice subtil]*`;

// ============================================
// TOOLS DISPONIBLES (LangChain DynamicStructuredTool)
// ============================================

const AGENT_TOOLS = [...pokemonTools, ...quizTools];

// ============================================
// HELPERS
// ============================================

function convertHistory(history: ChatMessage[]): BaseMessage[] {
  return history
    .filter(m => (m.role === 'user' || m.role === 'assistant') && !m.tool_calls)
    .map(m => {
      if (m.role === 'user') return new HumanMessage(m.content);
      return new AIMessage(m.content);
    });
}

// ============================================
// EXÉCUTION DE L'AGENT (LangGraph createReactAgent)
// ============================================

export async function runQuizAgent(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<AgentResponse> {
  console.log('\n' + '='.repeat(60));
  console.log('🧠 QUIZ AGENT (LangGraph) - Démarrage');
  console.log('='.repeat(60));
  console.log(`📝 Message: ${userMessage.substring(0, 100)}...`);

  try {
    // 1. Modèle LangChain
    const model = getMistralModel({ temperature: 0.7, maxTokens: 2048 });

    // 2. Créer l'agent ReAct avec LangGraph
    const agent = createReactAgent({
      llm: model,
      tools: AGENT_TOOLS,
      stateModifier: SYSTEM_PROMPT,
    });

    // 3. Construire les messages d'entrée
    const inputMessages: BaseMessage[] = [
      ...convertHistory(conversationHistory),
      new HumanMessage(userMessage),
    ];

    // 4. Invoquer l'agent (LangGraph gère la boucle ReAct)
    const result = await agent.invoke(
      { messages: inputMessages },
      { recursionLimit: 12 },
    );

    // 5. Extraire les actions quiz et la réponse finale
    const actions: AgentAction[] = [];
    const toolsUsed: string[] = [];
    let finalMessage = '';

    for (const msg of result.messages) {
      const msgType = (msg as any)._getType?.() || msg.constructor?.name?.toLowerCase();
      const isTool = msgType === 'tool' || msg.constructor?.name === 'ToolMessage';

      if (isTool) {
        const toolName = (msg as any).name || '';
        toolsUsed.push(toolName);
        console.log(`🔧 TOOL USED: ${toolName}`);

        try {
          const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
          const parsed = JSON.parse(content);
          if (toolName === 'generate_quiz_question' && parsed.question && !parsed.error) {
            actions.push({
              type: 'quiz_question',
              data: {
                question: parsed.question,
                options: parsed.options,
                correctAnswer: parsed.correctAnswer,
                explanation: parsed.hint || '',
                pokemonImage: parsed.pokemonImage,
                pokemonName: parsed.pokemonName,
                hint: parsed.hint,
                difficulty: parsed.difficulty,
                mode: parsed.mode,
              },
            });
            console.log(`🎯 ACTION COLLECTED: quiz_question`);
          }
        } catch { /* observation not JSON, skip */ }
      }

      const toolCalls = (msg as any).tool_calls;
      const isAI = msgType === 'ai' || msg.constructor?.name === 'AIMessage';
      if (isAI && (!toolCalls || toolCalls.length === 0)) {
        finalMessage = typeof msg.content === 'string' ? msg.content : '';
      }
    }

    console.log('✅ QUIZ AGENT - Réponse finale générée');
    console.log(`📦 Actions collectées: ${actions.length}`);

    const newHistory: ChatMessage[] = [
      ...conversationHistory,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: finalMessage },
    ];

    return {
      agent: 'quiz',
      message: finalMessage || 'Je n\'ai pas pu générer le quiz. Réessayez !',
      toolsUsed,
      actions: actions.length > 0 ? actions : undefined,
      conversationHistory: newHistory,
    };
  } catch (error: any) {
    console.error('❌ QUIZ AGENT ERROR:', error.message);
    return {
      agent: 'quiz',
      message: 'Une erreur est survenue lors de la génération du quiz. Réessayez !',
      toolsUsed: [],
      conversationHistory: [
        ...conversationHistory,
        { role: 'user', content: userMessage },
      ],
    };
  }
}
