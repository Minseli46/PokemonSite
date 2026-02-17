/**
 * Team Builder Agent 🛡️ (LangChain) 🦜🔗
 * 
 * Agent stratégique spécialisé dans la construction et l'analyse d'équipes Pokémon.
 * Utilise createReactAgent de @langchain/langgraph/prebuilt :
 * 1. Le modèle ChatMistralAI est bindé avec les tools DynamicStructuredTool
 * 2. createReactAgent crée un graphe LangGraph avec boucle ReAct automatique
 * 3. On extrait les actions structurées (team_proposal) depuis les ToolMessages
 */

import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import type { BaseMessage } from '@langchain/core/messages';
import { getMistralModel } from './mistralClient';
import { pokemonTools } from './tools/pokemonTools';
import { teamTools } from './tools/teamTools';
import type { ChatMessage, AgentResponse, AgentAction } from './types';

// ============================================
// CONFIGURATION DE L'AGENT
// ============================================

const SYSTEM_PROMPT = `Tu es le **Team Builder Agent** 🛡️, un expert stratégique Pokémon.

**IMPORTANT : Tu DOIS utiliser tes tools pour chaque requête.**
- Quand l'utilisateur mentionne des Pokémon → appelle TOUJOURS get_pokemon_data pour chacun
- Quand il parle d'équipe → appelle calculate_team_coverage et evaluate_team_balance
- Quand il veut des suggestions → appelle suggest_pokemon_for_team
- Quand il mentionne un type → appelle get_type_effectiveness
- NE RÉPONDS JAMAIS de mémoire sur les stats/types, utilise les tools pour avoir les données réelles

**IMPORTANT - PROPOSITIONS D'ÉQUIPE (build_team_proposal) :**
Tu DOIS appeler build_team_proposal dans TOUS ces cas :
1. L'utilisateur demande de proposer/créer/construire des équipes
2. L'utilisateur confirme vouloir des équipes (ex: "oui", "vas-y", "ok", "d'accord", "je veux bien")
3. L'utilisateur demande de compléter une équipe existante → construis 2-3 équipes COMPLÈTES qui incluent les Pokémon qu'il a déjà + les ajouts recommandés
4. L'utilisateur demande des suggestions de Pokémon pour son équipe → en PLUS du texte, appelle build_team_proposal avec des équipes complètes intégrant tes suggestions
5. L'utilisateur te demande sa meilleure composition / une équipe optimale
6. Quand tu analyses une équipe incomplète (moins de 6 Pokémon), propose automatiquement des compositions complètes via build_team_proposal

**⚠️ RÈGLE ABSOLUE - DIVERSITÉ OBLIGATOIRE :**
Quand tu proposes plusieurs équipes, CHAQUE équipe DOIT être COMPLÈTEMENT DIFFÉRENTE :
- **Noms différents** : chaque équipe a un nom unique qui reflète sa stratégie (ex: "Force Offensive", "Mur Défensif", "Équipe Polyvalente")
- **Pokémon différents** : au MINIMUM 3 Pokémon différents entre chaque équipe. NE JAMAIS proposer la même liste de 6 Pokémon deux fois.
- **Stratégies différentes** : une offensive (attaquants rapides), une défensive (tanks/support), une équilibrée (mix), etc.
- **Types variés** : chaque équipe explore des combinaisons de types différentes
- Exemple si l'utilisateur a Charizard :
  - Équipe 1 : Charizard + Gyarados, Garchomp, Lucario, Gengar, Alakazam (offensive spéciale)
  - Équipe 2 : Charizard + Blastoise, Ferrothorn, Toxapex, Tyranitar, Togekiss (défensive)
  - Équipe 3 : Charizard + Dragonite, Scizor, Rotom-Wash, Hippowdon, Clefable (équilibrée)

Pour chaque appel à build_team_proposal :
- Mets TOUJOURS exactement 6 Pokémon par équipe
- Donne un nom d'équipe créatif ET UNIQUE
- Donne une description stratégique expliquant la synergie SPÉCIFIQUE de cette équipe
- Chaque description doit être DIFFÉRENTE des autres

**IMPORTANT - ANALYSE D'ÉQUIPE :**
Quand l'utilisateur demande d'ANALYSER une équipe complète (6/6 Pokémon) :
1. D'ABORD, appelle calculate_team_coverage avec les noms des Pokémon → analyse la couverture de types
2. ENSUITE, appelle evaluate_team_balance → analyse l'équilibre attaque/défense/vitesse
3. Dans ton message texte de réponse, écris une ANALYSE DÉTAILLÉE structurée :
   - 📊 **Composition** : liste les Pokémon et leurs types
   - 🛡️ **Couverture de types** : résistances, faiblesses, immunités (utilise les données de calculate_team_coverage)
   - 💪 **Forces** : ce que l'équipe fait bien
   - ⚠️ **Faiblesses** : vulnérabilités identifiées
   - ⚖️ **Équilibre** : ratio attaque/défense/vitesse (utilise les données de evaluate_team_balance)
   - 🏆 **Score global** : note sur 10 avec justification
4. SEULEMENT APRÈS cette analyse complète dans ton message, appelle build_team_proposal pour proposer des alternatives optimisées

⚠️ RÈGLE CRITIQUE POUR L'ANALYSE : Tu DOIS écrire l'analyse COMPLÈTE ET DÉTAILLÉE dans ton message AVANT de proposer des optimisations. Ne saute PAS l'étape d'analyse.

**Ton rôle :**
- Analyser la composition d'une équipe Pokémon
- Calculer la couverture de types défensif/offensif
- Identifier les faiblesses et suggérer des améliorations
- Recommander des Pokémon complémentaires
- PROPOSER des équipes complètes que l'utilisateur peut créer en un clic

**CRUCIAL : Ne te contente JAMAIS de lister des suggestions en texte seul. Utilise TOUJOURS build_team_proposal pour que l'utilisateur puisse créer l'équipe en un clic.**

**Règles :**
- Réponds TOUJOURS en français avec des emojis (🔥💧⚡🌿)
- Sois précis avec les chiffres réels obtenus via les tools
- Structure tes réponses : 📊 Composition → 🛡️ Couverture → ⚠️ Faiblesses → 💡 Recommandations → 🏆 Score
- Rappelle-toi du contexte de la conversation. Si l'utilisateur dit "oui" après que tu as proposé de faire quelque chose, FAIS-LE immédiatement.`;

// ============================================
// TOOLS DISPONIBLES (LangChain DynamicStructuredTool)
// ============================================

const AGENT_TOOLS = [...pokemonTools, ...teamTools];

// ============================================
// HELPERS
// ============================================

/**
 * Convertit l'historique ChatMessage[] en messages LangChain BaseMessage[]
 * Ne garde que les messages user/assistant (pas les tool calls internes)
 */
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

/**
 * Exécute le Team Agent via LangGraph :
 * 1. createReactAgent crée un graphe avec boucle ReAct automatique
 * 2. Le graphe gère le tool calling (appeler tools → observer → décider)
 * 3. On extrait les actions (team_proposal) depuis les ToolMessages du résultat
 */
export async function runTeamAgent(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<AgentResponse> {
  console.log('\n' + '='.repeat(60));
  console.log('🛡️ TEAM AGENT (LangGraph) - Démarrage');
  console.log('='.repeat(60));
  console.log(`📝 Message: ${userMessage.substring(0, 100)}...`);

  try {
    // 1. Modèle LangChain avec paramètres spécifiques
    const model = getMistralModel({ temperature: 0.4, maxTokens: 4096 });

    // 2. Créer l'agent ReAct avec LangGraph
    const agent = createReactAgent({
      llm: model,
      tools: AGENT_TOOLS,
      stateModifier: SYSTEM_PROMPT,
    });

    // 3. Construire les messages d'entrée (historique + nouveau message)
    const inputMessages: BaseMessage[] = [
      ...convertHistory(conversationHistory),
      new HumanMessage(userMessage),
    ];

    // 4. Invoquer l'agent (LangGraph gère la boucle ReAct)
    const result = await agent.invoke(
      { messages: inputMessages },
      { recursionLimit: 12 },
    );

    // 5. Extraire les actions structurées et la réponse finale
    const actions: AgentAction[] = [];
    const toolsUsed: string[] = [];
    let finalMessage = '';

    for (const msg of result.messages) {
      // Collecter les noms d'outils utilisés et extraire les actions
      if ((msg as any)._getType?.() === 'tool' || msg.constructor?.name === 'ToolMessage') {
        const toolName = (msg as any).name || '';
        toolsUsed.push(toolName);
        console.log(`🔧 TOOL USED: ${toolName}`);

        try {
          const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
          const parsed = JSON.parse(content);
          if (parsed.__action_type === 'team_proposal' && !parsed.error) {
            // Déduplication : vérifier si on a déjà cette composition
            const newPokemonSet = (parsed.pokemon || []).map((p: any) => p.name).sort().join(',');
            const isDuplicate = actions.some(a => {
              if (a.type !== 'team_proposal') return false;
              const existingSet = (a.data as any).pokemon.map((p: any) => p.name).sort().join(',');
              return existingSet === newPokemonSet;
            });

            if (isDuplicate) {
              console.log(`⚠️ DUPLICATE SKIPPED: team_proposal "${parsed.team_name}"`);
            } else {
              actions.push({
                type: 'team_proposal',
                data: {
                  name: parsed.team_name,
                  description: parsed.description,
                  pokemon: parsed.pokemon,
                },
              });
              console.log(`🎯 ACTION COLLECTED: team_proposal "${parsed.team_name}"`);
            }
          }
        } catch { /* observation not JSON, skip */ }
      }

      // Le dernier AIMessage sans tool_calls est la réponse finale
      const msgType = (msg as any)._getType?.() || msg.constructor?.name?.toLowerCase();
      const toolCalls = (msg as any).tool_calls;
      if ((msgType === 'ai' || msg.constructor?.name === 'AIMessage') && (!toolCalls || toolCalls.length === 0)) {
        finalMessage = typeof msg.content === 'string' ? msg.content : '';
      }
    }

    console.log('✅ TEAM AGENT - Réponse finale générée');
    console.log(`📦 Actions collectées: ${actions.length}`);

    // 6. Construire l'historique de conversation à retourner
    const newHistory: ChatMessage[] = [
      ...conversationHistory,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: finalMessage },
    ];

    return {
      agent: 'team',
      message: finalMessage || 'Je n\'ai pas pu analyser votre équipe. Pouvez-vous reformuler ?',
      toolsUsed,
      actions: actions.length > 0 ? actions : undefined,
      conversationHistory: newHistory,
    };
  } catch (error: any) {
    console.error('❌ TEAM AGENT ERROR:', error.message);
    return {
      agent: 'team',
      message: 'Une erreur est survenue lors de l\'analyse. Pouvez-vous reformuler ?',
      toolsUsed: [],
      conversationHistory: [
        ...conversationHistory,
        { role: 'user', content: userMessage },
      ],
    };
  }
}
