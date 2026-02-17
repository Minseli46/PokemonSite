'use client'

import { useState, useCallback, useRef } from 'react'

// ============================================
// TYPES
// ============================================

export type AgentType = 'orchestrator' | 'team' | 'quiz' | 'wallpaper'

// ============================================
// ACTION TYPES (structured data from agents)
// ============================================

export interface TeamProposalAction {
  type: 'team_proposal'
  data: {
    name: string
    description: string
    pokemon: Array<{
      id: number
      name: string
      image: string
      types: string[]
    }>
  }
}

export interface QuizQuestionAction {
  type: 'quiz_question'
  data: {
    question: string
    options: string[]
    correctAnswer: string
    explanation: string
    pokemonImage?: string
    pokemonName?: string
    hint?: string
    difficulty?: string
    mode?: string
  }
}

export interface WallpaperConfigAction {
  type: 'wallpaper_config'
  data: {
    pokemonId: number
    pokemonName: string
    pokemonImage: string
    backgroundColor: string
    pattern: string
    accentColor: string
    showName: boolean
    showId: boolean
    style: string
    description: string
  }
}

export type AgentAction = TeamProposalAction | QuizQuestionAction | WallpaperConfigAction

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  agent?: AgentType
  toolsUsed?: string[]
  actions?: AgentAction[]
  timestamp: number
}

interface AgentAPIResponse {
  success: boolean
  data?: {
    agent: AgentType
    message: string
    toolsUsed: string[]
    actions?: AgentAction[]
  }
  error?: string
}

// ============================================
// HOOK
// ============================================

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'

export function useAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastAgent, setLastAgent] = useState<AgentType | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  /**
   * Envoie un message à l'orchestrateur (routage automatique)
   */
  const sendMessage = useCallback(async (
    message: string,
    options?: {
      agent?: AgentType      // Forcer un agent spécifique
      context?: {
        currentTeam?: any
        currentPage?: string
      }
    }
  ) => {
    if (!message.trim()) return
    setError(null)

    // Référence mutable pour capturer l'état courant
    let messages = [] as ChatMessage[]

    // Ajouter le message utilisateur
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: Date.now(),
    }
    setMessages(prev => {
      messages = [...prev, userMsg]
      return messages
    })
    setIsLoading(true)

    // Déterminer l'endpoint
    const endpoint = options?.agent
      ? `/api/agent/${options.agent}`
      : '/api/agent/chat'

    try {
      abortRef.current = new AbortController()

      // Construire l'historique de conversation pour la mémoire
      // IMPORTANT: exclure le dernier message (userMsg qu'on vient d'ajouter)
      // car le backend l'ajoute séparément via le champ "message"
      const conversationHistory = messages
        .slice(0, -1) // Exclure le message utilisateur courant (évite la duplication)
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-10) // Garder les 10 derniers messages pour le contexte
        .map(m => ({ role: m.role, content: m.content }))

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationHistory,
          context: {
            ...options?.context,
            lastAgent: lastAgent,
          },
        }),
        signal: abortRef.current.signal,
      })

      const data: AgentAPIResponse = await response.json()

      if (data.success && data.data) {
        // Track which agent responded for conversation continuity
        setLastAgent(data.data.agent)
        
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.data.message,
          agent: data.data.agent,
          toolsUsed: data.data.toolsUsed,
          actions: data.data.actions && data.data.actions.length > 0 ? data.data.actions : undefined,
          timestamp: Date.now(),
        }
        setMessages(prev => [...prev, assistantMsg])
      } else {
        setError(data.error || 'Erreur inconnue')
        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ ${data.error || 'Une erreur est survenue. Vérifiez que le backend est lancé et que la clé MISTRAL_API_KEY est configurée.'}`,
          agent: 'orchestrator',
          timestamp: Date.now(),
        }
        setMessages(prev => [...prev, errorMsg])
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return

      const errorMessage = err.message.includes('fetch')
        ? 'Impossible de contacter le serveur. Vérifiez que le backend est lancé sur le port 3000.'
        : err.message

      setError(errorMessage)
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ ${errorMessage}`,
        agent: 'orchestrator',
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }, [lastAgent])

  /**
   * Vérifie la santé du système d'agents
   */
  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/agent/health`)
      return await response.json()
    } catch {
      return { status: 'unreachable', hasApiKey: false }
    }
  }, [])

  /**
   * Efface l'historique de conversation
   */
  const clearMessages = useCallback(() => {
    setMessages([])
    setLastAgent(null)
    setError(null)
  }, [])

  /**
   * Annule la requête en cours
   */
  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setIsLoading(false)
  }, [])

  return {
    messages,
    isLoading,
    error,
    lastAgent,
    sendMessage,
    clearMessages,
    cancel,
    checkHealth,
  }
}
