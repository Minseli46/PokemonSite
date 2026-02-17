/**
 * Quiz Agent 🧠
 * 
 * Agent spécialisé dans les quiz et trivia Pokémon.
 * Génère des questions, explique les réponses, donne des faits amusants.
 */

import { chatCompletion } from './mistralClient';
import { pokemonToolDefinitions, pokemonToolExecutors } from './tools/pokemonTools';
import { quizToolDefinitions, quizToolExecutors } from './tools/quizTools';
import type { ChatMessage, ToolDefinition, ToolRegistry, AgentResponse, AgentAction } from './types';

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

const AGENT_TOOLS: ToolDefinition[] = [
  ...pokemonToolDefinitions,
  ...quizToolDefinitions,
];

const TOOL_EXECUTORS: ToolRegistry = {
  ...pokemonToolExecutors,
  ...quizToolExecutors,
};

// ============================================
// EXÉCUTION DE L'AGENT
// ============================================

export async function runQuizAgent(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<AgentResponse> {
  const toolsUsed: string[] = [];
  const actions: AgentAction[] = [];

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  console.log('\n' + '='.repeat(60));
  console.log('🧠 QUIZ AGENT - Démarrage');
  console.log('='.repeat(60));
  console.log(`📝 Message: ${userMessage.substring(0, 100)}...`);

  let maxIterations = 5;
  let isFirstCall = true;

  while (maxIterations > 0) {
    maxIterations--;

    const result = await chatCompletion({
      model: 'mistral-small-latest',
      messages,
      tools: AGENT_TOOLS,
      temperature: 0.7,
      maxTokens: 2048,
      toolChoice: isFirstCall ? 'any' : 'auto',
    });
    isFirstCall = false;

    if (result.toolCalls.length === 0) {
      console.log('✅ QUIZ AGENT - Réponse finale générée');
      console.log(`📦 Actions collectées: ${actions.length}`);
      return {
        agent: 'quiz',
        message: result.content || 'Je n\'ai pas pu générer le quiz. Réessayez !',
        toolsUsed,
        actions: actions.length > 0 ? actions : undefined,
        conversationHistory: messages,
      };
    }

    messages.push({
      role: 'assistant',
      content: result.content || '',
      tool_calls: result.toolCalls,
    });

    for (const toolCall of result.toolCalls) {
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      console.log(`\n🔧 TOOL CALL: ${functionName}`);
      console.log(`   Args: ${JSON.stringify(functionArgs)}`);

      toolsUsed.push(functionName);

      const executor = TOOL_EXECUTORS[functionName];
      let toolResult: string;

      if (executor) {
        try {
          toolResult = await executor(functionArgs);
          console.log(`✅ TOOL SUCCESS: ${toolResult.substring(0, 100)}...`);
          
          // Extract quiz actions from tool results
          try {
            const parsed = JSON.parse(toolResult);
            if (functionName === 'generate_quiz_question' && parsed.question && !parsed.error) {
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
          } catch { /* not parseable, skip */ }
        } catch (error: any) {
          toolResult = JSON.stringify({ error: error.message });
          console.log(`❌ TOOL ERROR: ${error.message}`);
        }
      } else {
        toolResult = JSON.stringify({ error: `Tool "${functionName}" non trouvé` });
      }

      messages.push({
        role: 'tool',
        content: toolResult,
        tool_call_id: toolCall.id,
        name: functionName,
      });
    }
  }

  return {
    agent: 'quiz',
    message: 'Le quiz a rencontré un problème. Réessayez !',
    toolsUsed,
    actions: actions.length > 0 ? actions : undefined,
    conversationHistory: messages,
  };
}
