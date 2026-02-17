/**
 * Orchestrator Agent 🎯
 * 
 * Agent principal qui route les requêtes vers le bon agent spécialiste.
 * Implémente le pattern d'orchestration Multi-Agent vu en cours :
 * 
 *                    Orchestrator
 *                         |
 *         ┌───────────────┼───────────────┐
 *         │               │               │
 *    Team Agent      Quiz Agent    Wallpaper Agent
 * 
 * L'orchestrateur utilise le LLM pour comprendre l'intention de l'utilisateur
 * et délègue au bon agent spécialiste (comme le generalist agent du cours).
 */

import { simpleChat } from './mistralClient';
import { runTeamAgent } from './teamAgent';
import { runQuizAgent } from './quizAgent';
import { runWallpaperAgent } from './wallpaperAgent';
import type { AgentType, AgentResponse, ChatMessage } from './types';

// ============================================
// CLASSIFICATION DES INTENTIONS
// ============================================

const CLASSIFICATION_PROMPT = `Tu es un routeur d'agents IA pour une application Pokédex.
Tu dois classer la requête de l'utilisateur dans EXACTEMENT UNE de ces catégories :

- **team** : Construction/analyse d'équipe, couverture de types, suggestions de Pokémon, stratégie, faiblesses d'équipe, composition d'équipe
- **quiz** : Quiz, questions, trivia, faits amusants, devinettes, test de connaissances, "qui est ce Pokémon", réponse à une question de quiz
- **wallpaper** : Fond d'écran, thème visuel, couleurs, palette, design, personnalisation d'apparence, image
- **general** : Tout ce qui ne correspond pas aux catégories ci-dessus (info Pokémon simple, salutations, etc.)

**IMPORTANT** : Si l'historique de conversation montre que l'utilisateur était dans un quiz, une analyse d'équipe, ou une discussion sur les wallpapers, et que le nouveau message est une réponse courte (option A/B/C/D, oui/non, un nom de Pokémon, etc.), alors classe-le dans la MÊME catégorie que la conversation en cours.

Réponds UNIQUEMENT avec le mot de la catégorie, rien d'autre.

Exemples :
- "Construis-moi une équipe autour de Pikachu" → team
- "Analyse mon équipe: charizard, blastoise, venusaur" → team
- "Quel Pokémon ajouter à mon équipe ?" → team
- "Si j'ajoute Garchomp ?" → team
- "Oui" (après une question d'équipe) → team
- "Pose-moi une question sur les Pokémon" → quiz
- "Quelle est la stat la plus haute de Mewtwo ?" → quiz  
- "Donne-moi un fun fact sur Pikachu" → quiz
- "A) Raichu" (réponse à un quiz) → quiz
- "C) Électrique" (réponse à un quiz) → quiz
- "Suggère un fond d'écran avec Gengar" → wallpaper
- "Quelle couleur va bien avec le type feu ?" → wallpaper
- "Un thème sombre pour mon wallpaper" → wallpaper
- "Le style dark" (suite conversation wallpaper) → wallpaper
- "Bonjour !" → general
- "Qui est Pikachu ?" → general`;

// ============================================
// RÉPONSE GÉNÉRALE (sans agent spécialiste)
// ============================================

const GENERAL_PROMPT = `Tu es **Pokédex AI** 🤖, l'assistant intelligent de l'application Pokédex.

Tu peux aider l'utilisateur de 3 manières principales :

1. 🛡️ **Team Builder** - Construire et analyser des équipes Pokémon
   → "Construis-moi une équipe autour de Pikachu"
   → "Analyse mon équipe: charizard, blastoise"
   
2. 🧠 **Quiz Master** - Quiz et trivia Pokémon
   → "Pose-moi une question de quiz"
   → "Donne-moi un fun fact sur Mewtwo"
   
3. 🎨 **Wallpaper Designer** - Créer des fonds d'écran personnalisés
   → "Suggère un thème pour un wallpaper Gengar"
   → "Quelle palette de couleurs pour le type eau ?"

Réponds en français, sois amical et utilise des emojis.
Si la question est simple (info sur un Pokémon, salutation), réponds directement.
Si la question correspond à un de tes 3 domaines, guide l'utilisateur vers le bon agent.`;

// ============================================
// ORCHESTRATEUR PRINCIPAL
// ============================================

/**
 * Route la requête vers le bon agent spécialiste
 * Pattern : Orchestration (generalist → specialist)
 */
export async function orchestrate(
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
  context?: { currentTeam?: any; currentPage?: string; lastAgent?: AgentType }
): Promise<AgentResponse> {
  console.log('\n' + '🎯'.repeat(30));
  console.log('🎯 ORCHESTRATOR - Analyse de la requête');
  console.log('🎯'.repeat(30));
  console.log(`📝 Message: "${userMessage}"`);
  console.log(`📌 Last agent: ${context?.lastAgent || 'none'}`);

  // Étape 1 : Classifier l'intention avec le LLM
  const classification = await classifyIntent(userMessage, conversationHistory, context);
  console.log(`🏷️ Classification: ${classification}`);

  // Étape 2 : Enrichir le message avec le contexte si nécessaire
  let enrichedMessage = userMessage;
  if (context?.currentTeam && classification === 'team') {
    const teamPokemon = context.currentTeam.pokemon?.map((p: any) => p.name).join(', ');
    if (teamPokemon) {
      enrichedMessage += `\n\n[Contexte: L'équipe actuelle de l'utilisateur "${context.currentTeam.name}" contient: ${teamPokemon}]`;
    }
  }

  // Étape 3 : Déléguer au bon agent spécialiste
  switch (classification) {
    case 'team':
      console.log('📤 Délégation → Team Agent 🛡️');
      return await runTeamAgent(enrichedMessage, conversationHistory);

    case 'quiz':
      console.log('📤 Délégation → Quiz Agent 🧠');
      return await runQuizAgent(enrichedMessage, conversationHistory);

    case 'wallpaper':
      console.log('📤 Délégation → Wallpaper Agent 🎨');
      return await runWallpaperAgent(enrichedMessage, conversationHistory);

    default:
      console.log('📤 Réponse générale (pas de délégation)');
      return await handleGeneralQuery(userMessage, conversationHistory);
  }
}

/**
 * Classifie l'intention via le LLM
 */
async function classifyIntent(
  message: string,
  conversationHistory: ChatMessage[] = [],
  context?: { currentPage?: string; lastAgent?: AgentType }
): Promise<AgentType | 'general'> {
  const lower = message.toLowerCase().trim();
  
  // === Détection de continuation de conversation ===
  // Si le dernier message vient d'un agent spécialiste et que le nouveau message
  // est court ou ressemble à une réponse, on reste sur le même agent
  const lastAgent = context?.lastAgent;
  if (lastAgent && lastAgent !== 'orchestrator') {
    const isShortReply = message.length < 80;
    const isQuizAnswer = /^\s*([a-d]\)|[a-d]\s*[:\-)]|option\s+[a-d]|réponse|vrai|faux|true|false)/i.test(lower);
    const isConfirmation = /^\s*(oui|non|ok|d'accord|bien sûr|exactement|je sais pas|aucune idée|suivant|next|encore|continue|plus|autre)/i.test(lower);
    const isPokemonName = /^\s*[a-zéèêëàâäôöùûüïî\-]+\s*$/i.test(lower) && lower.length < 30;
    
    if (isQuizAnswer || isConfirmation || (isShortReply && isPokemonName)) {
      console.log(`🔄 Continuation détectée → ${lastAgent} (short reply / answer / confirmation)`);
      return lastAgent;
    }
    
    // For other short messages, stay with the current agent unless there's a clear keyword for another
    if (isShortReply) {
      // Check if there's a clear keyword pointing to a DIFFERENT agent
      const hasTeamKeyword = /\b(équipe|team|compo|composition|faiblesse|couverture)\b/i.test(lower);
      const hasQuizKeyword = /\b(quiz|question|devin|trivia|fun\s?fact|qcm)\b/i.test(lower);
      const hasWallpaperKeyword = /\b(wallpaper|fond\s?d.?écran|thème|theme|palette|couleur)\b/i.test(lower);
      
      const switchCount = [hasTeamKeyword, hasQuizKeyword, hasWallpaperKeyword].filter(Boolean).length;
      
      // No clear switch keyword → stay with current agent
      if (switchCount === 0) {
        console.log(`🔄 Continuation détectée → ${lastAgent} (short message, no switch keyword)`);
        return lastAgent;
      }
    }
  }

  // === Heuristique rapide pour les cas évidents (économise un appel API) ===
  
  // Mots-clés forts pour le Team Agent
  if (/\b(équipe|team|compo|composition|faiblesse|couverture|synerg|stratég|tank|attaquant|défenseur)\b/i.test(lower)) {
    return 'team';
  }
  
  // Mots-clés forts pour le Quiz Agent
  if (/\b(quiz|question|devin|trivia|fun\s?fact|anecdote|test|qcm)\b/i.test(lower)) {
    return 'quiz';
  }
  
  // Mots-clés forts pour le Wallpaper Agent
  if (/\b(wallpaper|fond\s?d.?écran|thème|theme|palette|couleur|design|visuel|image)\b/i.test(lower)) {
    return 'wallpaper';
  }

  // Contexte de page comme indice
  if (context?.currentPage === 'teams') return 'team';
  if (context?.currentPage === 'quiz') return 'quiz';
  if (context?.currentPage === 'wallpaper') return 'wallpaper';

  // === Fallback : utiliser le LLM pour classifier avec le contexte de conversation ===
  try {
    // Construire un résumé du contexte pour aider le LLM
    let classificationMessage = message;
    if (conversationHistory.length > 0) {
      const recentContext = conversationHistory.slice(-4).map(m => `${m.role}: ${m.content?.substring(0, 100)}`).join('\n');
      classificationMessage = `Contexte récent de la conversation:\n${recentContext}\n\nNouveau message à classifier: ${message}`;
    }
    
    const result = await simpleChat(CLASSIFICATION_PROMPT, classificationMessage);
    const cleaned = result.trim().toLowerCase();
    
    if (['team', 'quiz', 'wallpaper'].includes(cleaned)) {
      return cleaned as AgentType;
    }
  } catch (error) {
    console.error('⚠️ Erreur de classification, fallback sur general');
  }

  return 'general';
}

/**
 * Gère les requêtes générales sans agent spécialiste
 */
async function handleGeneralQuery(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<AgentResponse> {
  const response = await simpleChat(GENERAL_PROMPT, userMessage, conversationHistory);

  return {
    agent: 'orchestrator',
    message: response || 'Bonjour ! Comment puis-je vous aider avec votre Pokédex ?',
    toolsUsed: [],
    conversationHistory: [
      ...conversationHistory,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: response },
    ],
  };
}
