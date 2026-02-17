/**
 * Types pour le système d'agents IA
 * Inspiré du pattern LangChain Tools + Multi-Agent Orchestration
 */

// ============================================
// TOOL DEFINITIONS (Format OpenAI/Mistral standard)
// ============================================

export interface ToolParameter {
  type: string;
  description: string;
  enum?: string[];
}

export interface ToolFunction {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, ToolParameter>;
    required: string[];
  };
}

export interface ToolDefinition {
  type: 'function';
  function: ToolFunction;
}

// ============================================
// MESSAGES (Format chat completions standard)
// ============================================

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface ChatMessage {
  role: MessageRole;
  content: string;
  name?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

// ============================================
// AGENT DEFINITIONS
// ============================================

export type AgentType = 'orchestrator' | 'team' | 'quiz' | 'wallpaper';

export interface AgentConfig {
  name: string;
  type: AgentType;
  description: string;
  systemPrompt: string;
  tools: ToolDefinition[];
  model: string;
}

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
// TOOL EXECUTION
// ============================================

export type ToolExecutor = (args: Record<string, any>) => Promise<string>;

export interface ToolRegistry {
  [toolName: string]: ToolExecutor;
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
