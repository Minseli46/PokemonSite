/**
 * Wallpaper (Theme) Agent 🎨
 * 
 * Agent spécialisé dans la personnalisation visuelle et la création de fonds d'écran.
 * Suggère des thèmes, palettes de couleurs, et combinaisons de Pokémon.
 */

import { chatCompletion } from './mistralClient';
import { pokemonToolDefinitions, pokemonToolExecutors } from './tools/pokemonTools';
import { wallpaperToolDefinitions, wallpaperToolExecutors } from './tools/wallpaperTools';
import type { ChatMessage, ToolDefinition, ToolRegistry, AgentResponse, AgentAction } from './types';

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

const AGENT_TOOLS: ToolDefinition[] = [
  ...pokemonToolDefinitions,
  ...wallpaperToolDefinitions,
];

const TOOL_EXECUTORS: ToolRegistry = {
  ...pokemonToolExecutors,
  ...wallpaperToolExecutors,
};

// ============================================
// EXÉCUTION DE L'AGENT
// ============================================

export async function runWallpaperAgent(
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
  console.log('🎨 WALLPAPER AGENT - Démarrage');
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
      temperature: 0.8,
      maxTokens: 2048,
      toolChoice: isFirstCall ? 'any' : 'auto',
    });
    isFirstCall = false;

    if (result.toolCalls.length === 0) {
      console.log('✅ WALLPAPER AGENT - Réponse finale générée');
      console.log(`📦 Actions collectées: ${actions.length}`);
      return {
        agent: 'wallpaper',
        message: result.content || 'Je n\'ai pas pu générer de suggestion. Réessayez !',
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
          
          // Extract wallpaper actions from tool results
          try {
            const parsed = JSON.parse(toolResult);
            if (functionName === 'suggest_wallpaper_theme' && parsed.pokemonId && !parsed.error) {
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
    agent: 'wallpaper',
    message: 'La suggestion a rencontré un problème. Réessayez !',
    toolsUsed,
    actions: actions.length > 0 ? actions : undefined,
    conversationHistory: messages,
  };
}
