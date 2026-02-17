/**
 * Client Mistral AI - Wrapper pour l'API REST
 * Utilise le SDK @mistralai/mistralai (format OpenAI standard)
 * 
 * Ce client implémente les concepts vus en cours :
 * - Chat Completions (POST /v1/chat/completions)
 * - Tool/Function Calling
 * - Structured Outputs
 */

import { Mistral } from '@mistralai/mistralai';
import type { ChatMessage, ToolDefinition, ToolCall } from './types';

// ============================================
// CLIENT SINGLETON
// ============================================

let mistralClient: Mistral | null = null;

function getClient(): Mistral {
  if (!mistralClient) {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      throw new Error(
        '❌ MISTRAL_API_KEY manquante ! Ajoutez-la dans backend/.env\n' +
        'Obtenez votre clé gratuite sur : https://console.mistral.ai/api-keys/'
      );
    }
    mistralClient = new Mistral({ apiKey });
  }
  return mistralClient;
}

// ============================================
// CHAT COMPLETION WITH TOOLS
// ============================================

export interface MistralChatOptions {
  model?: string;
  messages: ChatMessage[];
  tools?: ToolDefinition[];
  temperature?: number;
  maxTokens?: number;
  toolChoice?: 'auto' | 'any' | 'none';
}

export interface MistralChatResult {
  content: string | null;
  toolCalls: ToolCall[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Envoie une requête Chat Completion à Mistral AI
 * Supporte le tool calling (function calling) comme vu en cours
 */
export async function chatCompletion(options: MistralChatOptions): Promise<MistralChatResult> {
  const client = getClient();
  const { 
    model = 'mistral-small-latest', 
    messages, 
    tools, 
    temperature = 0.7, 
    maxTokens = 1024,
    toolChoice = 'auto',
  } = options;

  try {
    // IMPORTANT: The Mistral SDK uses camelCase internally (toolCalls, toolCallId)
    // and converts to snake_case (tool_calls, tool_call_id) for the API.
    // We MUST use camelCase here or the SDK silently drops those properties!
    const mappedMessages = messages.map(m => {
      // Assistant message with tool calls
      if (m.role === 'assistant' && m.tool_calls && m.tool_calls.length > 0) {
        return {
          role: 'assistant' as const,
          content: m.content || '',
          toolCalls: m.tool_calls.map(tc => ({
            id: tc.id,
            type: 'function' as const,
            function: {
              name: tc.function.name,
              arguments: tc.function.arguments,
            },
          })),
        };
      }
      
      // Tool response message
      if (m.role === 'tool') {
        return {
          role: 'tool' as const,
          content: m.content,
          toolCallId: m.tool_call_id,
          name: m.name,
        };
      }
      
      // System / User messages
      return { role: m.role, content: m.content };
    });

    const requestParams: any = {
      model,
      messages: mappedMessages,
      temperature,
      max_tokens: maxTokens,
    };

    // Ajouter les tools si présents
    if (tools && tools.length > 0) {
      requestParams.tools = tools;
      requestParams.tool_choice = toolChoice;
    }

    console.log(`\n📤 LLM CALL: ${model} (${mappedMessages.length} messages${tools ? `, ${tools.length} tools, tool_choice=${requestParams.tool_choice}` : ''})`);
    if (mappedMessages.length > 3) {
      console.log('📤 Messages roles:', mappedMessages.map((m: any) => {
        if (m.role === 'assistant' && m.toolCalls) return `assistant(${m.toolCalls.length} toolCalls)`;
        if (m.role === 'tool') return `tool(${m.name},id=${m.toolCallId})`;
        return m.role;
      }).join(' → '));
    }
    
    const response = await client.chat.complete(requestParams);

    const choice = response.choices?.[0];
    console.log(`📥 RAW choice finish_reason=${choice?.finishReason}, has_tool_calls=${!!choice?.message?.toolCalls}, tool_calls_count=${choice?.message?.toolCalls?.length || 0}`);
    const toolCalls: ToolCall[] = [];

    if (choice?.message?.toolCalls) {
      for (const tc of choice.message.toolCalls) {
        console.log(`📥 RAW TOOL CALL: type=${tc.type}, id=${tc.id}, fn=${tc.function?.name}, keys=${Object.keys(tc).join(',')}`);
        if (tc.function) {
          toolCalls.push({
            id: tc.id || `call_${Date.now()}`,
            type: 'function',
            function: {
              name: tc.function.name,
              arguments: typeof tc.function.arguments === 'string' 
                ? tc.function.arguments 
                : JSON.stringify(tc.function.arguments),
            },
          });
        }
      }
    }

    const content = typeof choice?.message?.content === 'string' 
      ? choice.message.content 
      : null;

    console.log(`📥 LLM RESPONSE: ${content ? content.substring(0, 100) + '...' : `${toolCalls.length} tool call(s)`}`);

    if (toolCalls.length > 0) {
      console.log(`🔧 TOOL CALLS: ${toolCalls.map(tc => tc.function.name).join(', ')}`);
    }

    return {
      content,
      toolCalls,
      usage: {
        promptTokens: response.usage?.promptTokens || 0,
        completionTokens: response.usage?.completionTokens || 0,
        totalTokens: response.usage?.totalTokens || 0,
      },
    };
  } catch (error: any) {
    console.error('❌ Mistral API Error:', error.message);
    throw new Error(`Erreur Mistral AI: ${error.message}`);
  }
}

/**
 * Chat simple sans tools (pour l'orchestrateur)
 * Supporte l'historique de conversation pour la mémoire
 */
export async function simpleChat(
  systemPrompt: string,
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
  model = 'mistral-small-latest'
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  const result = await chatCompletion({
    model,
    messages,
    temperature: 0.3,
  });

  return result.content || '';
}
