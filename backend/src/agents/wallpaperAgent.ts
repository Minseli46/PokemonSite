/**
 * Wallpaper (Theme) Agent 🎨 (LangChain) 🦜🔗
 * 
 * Agent spécialisé dans la personnalisation visuelle et la création de fonds d'écran.
 * Utilise createReactAgent de @langchain/langgraph/prebuilt.
 * Suggère des thèmes, palettes de couleurs, et combinaisons de Pokémon.
 */

import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import type { BaseMessage } from '@langchain/core/messages';
import { getMistralModel } from './mistralClient';
import { pokemonTools } from './tools/pokemonTools';
import { wallpaperTools } from './tools/wallpaperTools';
import type { ChatMessage, AgentResponse, AgentAction } from './types';

// ============================================
// CONFIGURATION DE L'AGENT
// ============================================

const SYSTEM_PROMPT = `Tu es le **Wallpaper & Theme Agent** 🎨, un expert en design visuel Pokémon.

**IMPORTANT : Tu DOIS utiliser tes tools pour chaque requête.**
- Quand l'utilisateur veut un fond d'écran → appelle TOUJOURS suggest_wallpaper_theme
- Quand il mentionne un type → appelle get_type_color_palette
- Quand il veut un duo/trio → appelle suggest_pokemon_duo
- NE SUGGÈRE JAMAIS de couleurs ou designs de mémoire, utilise les tools

**Ton rôle :**
- Suggérer des fonds d'écran personnalisés basés sur les Pokémon préférés de l'utilisateur
- Proposer des palettes de couleurs harmonieuses basées sur les types Pokémon
- Recommander des duos/trios de Pokémon visuellement complémentaires
- Conseiller sur les motifs (gradient, dots, waves, geometric) selon l'ambiance souhaitée
- Créer des descriptions artistiques inspirantes pour chaque fond d'écran

**IMPORTANT - SUGGESTIONS INTERACTIVES :**
Quand l'utilisateur veut des suggestions, appelle suggest_wallpaper_theme pour CHAQUE style demandé. Les résultats contiennent des configurations complètes que l'utilisateur peut appliquer directement.

**Styles disponibles :**
- 🌈 **vibrant** : Couleurs vives et énergiques
- 🎀 **pastel** : Tons doux et apaisants
- 🌑 **dark** : Ambiance sombre et mystérieuse
- ✨ **minimal** : Épuré et élégant
- ⚔️ **epic** : Grandiose et dramatique
- 🎀 **cute** : Mignon et coloré

**Règles :**
- Réponds TOUJOURS en français
- Utilise des emojis pour illustrer les couleurs et ambiances
- Donne les codes HEX des couleurs suggérées
- Explique ta vision artistique pour chaque suggestion
- Propose toujours des alternatives si le premier choix ne plaît pas
- Pense à l'harmonie des couleurs entre types doubles`;

// ============================================
// TOOLS DISPONIBLES (LangChain DynamicStructuredTool)
// ============================================

const AGENT_TOOLS = [...pokemonTools, ...wallpaperTools];

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

export async function runWallpaperAgent(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<AgentResponse> {
  console.log('\n' + '='.repeat(60));
  console.log('🎨 WALLPAPER AGENT (LangGraph) - Démarrage');
  console.log('='.repeat(60));
  console.log(`📝 Message: ${userMessage.substring(0, 100)}...`);

  try {
    // 1. Modèle LangChain
    const model = getMistralModel({ temperature: 0.8, maxTokens: 2048 });

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

    // 4. Invoquer l'agent
    const result = await agent.invoke(
      { messages: inputMessages },
      { recursionLimit: 12 },
    );

    // 5. Extraire les actions wallpaper et la réponse finale
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
          if (toolName === 'suggest_wallpaper_theme' && parsed.pokemonId && !parsed.error) {
            actions.push({
              type: 'wallpaper_config',
              data: {
                pokemonId: parsed.pokemonId,
                pokemonName: parsed.pokemonName,
                pokemonImage: parsed.pokemonImage || '',
                backgroundColor: parsed.theme?.backgroundColor || '#333',
                pattern: parsed.theme?.pattern || 'gradient',
                accentColor: parsed.theme?.accentColor || '#fff',
                showName: parsed.theme?.showName ?? true,
                showId: parsed.theme?.showId ?? true,
                style: parsed.theme?.style || 'vibrant',
                description: parsed.description || '',
              },
            });
            console.log(`🎯 ACTION COLLECTED: wallpaper_config for ${parsed.pokemonName}`);
          }
        } catch { /* observation not JSON, skip */ }
      }

      const toolCalls = (msg as any).tool_calls;
      const isAI = msgType === 'ai' || msg.constructor?.name === 'AIMessage';
      if (isAI && (!toolCalls || toolCalls.length === 0)) {
        finalMessage = typeof msg.content === 'string' ? msg.content : '';
      }
    }

    console.log('✅ WALLPAPER AGENT - Réponse finale générée');
    console.log(`📦 Actions collectées: ${actions.length}`);

    const newHistory: ChatMessage[] = [
      ...conversationHistory,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: finalMessage },
    ];

    return {
      agent: 'wallpaper',
      message: finalMessage || 'Je n\'ai pas pu générer de suggestion. Réessayez !',
      toolsUsed,
      actions: actions.length > 0 ? actions : undefined,
      conversationHistory: newHistory,
    };
  } catch (error: any) {
    console.error('❌ WALLPAPER AGENT ERROR:', error.message);
    return {
      agent: 'wallpaper',
      message: 'Une erreur est survenue lors de la suggestion. Réessayez !',
      toolsUsed: [],
      conversationHistory: [
        ...conversationHistory,
        { role: 'user', content: userMessage },
      ],
    };
  }
}
