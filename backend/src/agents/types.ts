/**
 * Types pour le système d'agents IA (LangChain) 🦜🔗
 * 
 * Avec LangChain, les tools sont définis via DynamicStructuredTool + Zod (pas besoin de ToolDefinition).
 * Les agents utilisent createToolCallingAgent + AgentExecutor (pas besoin de ToolCall/ToolRegistry).
 * Ce fichier garde uniquement les types métier : messages, actions, réponses d'agents.
 */

// ============================================
// MESSAGES
// ============================================

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

/**
 * Message de conversation simplifié.
 * Avec LangChain, tool_calls est géré en interne par AgentExecutor,
 * mais on garde le champ pour le filtrage dans convertHistory().
 */
export interface ChatMessage {
  role: MessageRole;
  content: string;
  name?: string;
  tool_calls?: any[];
  tool_call_id?: string;
}

// ============================================
// AGENT DEFINITIONS
// ============================================

export type AgentType = 'orchestrator' | 'team' | 'quiz' | 'wallpaper';

// ============================================
// AGENT ACTIONS (structured data for frontend interactivity)
// ============================================

export interface TeamProposalAction {
  type: 'team_proposal';
  data: {
    name: string;
    description: string;
    pokemon: Array<{
      id: number;
      name: string;
      image: string;
      types: string[];
    }>;
  };
}

export interface QuizQuestionAction {
  type: 'quiz_question';
  data: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    pokemonImage?: string;
    pokemonName?: string;
    hint?: string;
    difficulty?: string;
    mode?: string;
  };
}

export interface WallpaperConfigAction {
  type: 'wallpaper_config';
  data: {
    pokemonId: number;
    pokemonName: string;
    pokemonImage: string;
    backgroundColor: string;
    pattern: string;
    accentColor: string;
    showName: boolean;
    showId: boolean;
    style: string;
    description: string;
  };
}

export type AgentAction = TeamProposalAction | QuizQuestionAction | WallpaperConfigAction;

export interface AgentResponse {
  agent: AgentType;
  message: string;
  toolsUsed: string[];
  actions?: AgentAction[];
  data?: any;
  conversationHistory: ChatMessage[];
}

// ============================================
// ORCHESTRATOR
// ============================================

export interface OrchestratorDecision {
  targetAgent: AgentType;
  refinedQuery: string;
  reasoning: string;
}

// ============================================
// API REQUEST/RESPONSE
// ============================================

export interface AgentRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  context?: {
    currentTeam?: any;
    currentPage?: string;
    lastAgent?: AgentType;
  };
}

export interface AgentAPIResponse {
  success: boolean;
  data?: AgentResponse;
  error?: string;
}

// ============================================
// TEAM AGENT SPECIFIC
// ============================================

export interface TeamAnalysis {
  typesCovered: string[];
  typesUncovered: string[];
  weaknesses: Record<string, number>;
  resistances: Record<string, number>;
  roleBalance: {
    attackers: number;
    defenders: number;
    speedsters: number;
    tanks: number;
    special: number;
  };
  overallScore: number;
  suggestions: string[];
}

export interface PokemonSuggestion {
  id: number;
  name: string;
  types: string[];
  reason: string;
  fillsGap: string;
}

// ============================================
// QUIZ AGENT SPECIFIC
// ============================================

export interface AIQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  category: string;
  funFact?: string;
}

// ============================================
// WALLPAPER AGENT SPECIFIC
// ============================================

export interface WallpaperSuggestion {
  pokemonId: number;
  pokemonName: string;
  backgroundColor: string;
  pattern: 'gradient' | 'dots' | 'waves' | 'geometric';
  accentColor: string;
  showName: boolean;
  showId: boolean;
  theme: string;
  description: string;
}
