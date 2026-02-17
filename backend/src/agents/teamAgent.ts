/**
 * Team Builder Agent 🛡️
 * 
 * Agent stratégique spécialisé dans la construction et l'analyse d'équipes Pokémon.
 * Il utilise le pattern Tool Calling de LangChain (adapté en TypeScript) :
 * 1. Le LLM reçoit le message + les tools disponibles
 * 2. Le LLM décide quels tools appeler via function calling
 * 3. On exécute les tools et on renvoie les résultats
 * 4. Le LLM synthétise une réponse finale
 */

import { chatCompletion } from './mistralClient';
import { pokemonToolDefinitions, pokemonToolExecutors } from './tools/pokemonTools';
import { teamToolDefinitions, teamToolExecutors } from './tools/teamTools';
import type { ChatMessage, ToolDefinition, ToolRegistry, AgentResponse, AgentAction } from './types';

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

// Tools disponibles pour cet agent
const AGENT_TOOLS: ToolDefinition[] = [
  ...pokemonToolDefinitions,
  ...teamToolDefinitions,
];

// Executors combinés
const TOOL_EXECUTORS: ToolRegistry = {
  ...pokemonToolExecutors,
  ...teamToolExecutors,
};

// ============================================
// EXÉCUTION DE L'AGENT
// ============================================

/**
 * Exécute le Team Agent avec gestion du tool calling loop
 * Implémente le pattern vu en cours avec handle_tool_calls
 */
export async function runTeamAgent(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<AgentResponse> {
  const toolsUsed: string[] = [];
  const actions: AgentAction[] = [];
  
  // Construire les messages
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  console.log('\n' + '='.repeat(60));
  console.log('🛡️ TEAM AGENT - Démarrage');
  console.log('='.repeat(60));
  console.log(`📝 Message: ${userMessage.substring(0, 100)}...`);

  // Boucle de tool calling (max 5 itérations pour éviter les boucles infinies)
  let maxIterations = 5;
  let isFirstCall = true;
  
  while (maxIterations > 0) {
    maxIterations--;

    const result = await chatCompletion({
      model: 'mistral-small-latest',
      messages,
      tools: AGENT_TOOLS,
      temperature: 0.4,
      maxTokens: 4096,
      toolChoice: isFirstCall ? 'any' : 'auto',
    });
    isFirstCall = false;

    // Si l'assistant a une réponse finale (pas de tool calls)
    if (result.toolCalls.length === 0) {
      console.log('✅ TEAM AGENT - Réponse finale générée');
      console.log(`📦 Actions collectées: ${actions.length}`);
      return {
        agent: 'team',
        message: result.content || 'Je n\'ai pas pu analyser votre équipe. Pouvez-vous reformuler ?',
        toolsUsed,
        actions: actions.length > 0 ? actions : undefined,
        conversationHistory: messages,
      };
    }

    // Traiter les tool calls (pattern handle_tool_calls du cours)
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

      // Exécuter le tool
      const executor = TOOL_EXECUTORS[functionName];
      let toolResult: string;

      if (executor) {
        try {
          toolResult = await executor(functionArgs);
          console.log(`✅ TOOL SUCCESS: ${toolResult.substring(0, 100)}...`);
          
          // Extract actions from tool results
          try {
            const parsed = JSON.parse(toolResult);
            if (parsed.__action_type === 'team_proposal' && !parsed.error) {
              // Deduplication: check if we already have a proposal with the same pokemon
              const newPokemonSet = (parsed.pokemon || []).map((p: any) => p.name).sort().join(',');
              const isDuplicate = actions.some(a => {
                if (a.type !== 'team_proposal') return false;
                const existingSet = (a.data as any).pokemon.map((p: any) => p.name).sort().join(',');
                return existingSet === newPokemonSet;
              });
              
              if (isDuplicate) {
                console.log(`⚠️ DUPLICATE SKIPPED: team_proposal "${parsed.team_name}" (same pokemon as existing proposal)`);
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
          } catch { /* not parseable, skip */ }
        } catch (error: any) {
          toolResult = JSON.stringify({ error: error.message });
          console.log(`❌ TOOL ERROR: ${error.message}`);
        }
      } else {
        toolResult = JSON.stringify({ error: `Tool "${functionName}" non trouvé` });
        console.log(`❌ TOOL NOT FOUND: ${functionName}`);
      }

      // Ajouter le résultat du tool aux messages
      messages.push({
        role: 'tool',
        content: toolResult,
        tool_call_id: toolCall.id,
        name: functionName,
      });
    }
  }

  // Si on sort de la boucle sans réponse
  return {
    agent: 'team',
    message: 'L\'analyse a pris trop de temps. Pouvez-vous simplifier votre demande ?',
    toolsUsed,
    actions: actions.length > 0 ? actions : undefined,
    conversationHistory: messages,
  };
}
