'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { AgentAction, AgentType } from './use-agent'

// ============================================
// TYPES
// ============================================

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

interface UseAgentActionOptions {
  /** Agent à cibler directement */
  agent: AgentType
  /** Message auto-envoyé au montage (après hydratation) */
  autoPrompt?: string
  /** Callback quand des actions arrivent */
  onActions?: (actions: AgentAction[]) => void
}

// ============================================
// HOOK - Actions contextuelles IA (sans chat)
// ============================================

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'

/**
 * Hook léger pour déclencher des actions IA contextuelles.
 * Pas de chat, pas d'historique — juste : prompt → actions + message.
 */
export function useAgentAction({ agent, autoPrompt, onActions }: UseAgentActionOptions) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [actions, setActions] = useState<AgentAction[]>([])
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const autoSentRef = useRef(false)
  const onActionsRef = useRef(onActions)
  onActionsRef.current = onActions

  /**
   * Déclenche une action IA avec un prompt spécifique
   */
  const trigger = useCallback(async (prompt: string) => {
    setError(null)
    setIsLoading(true)

    try {
      abortRef.current = new AbortController()

      const response = await fetch(`${BACKEND_URL}/api/agent/${agent}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          conversationHistory: [],
        }),
        signal: abortRef.current.signal,
      })

      const data: AgentAPIResponse = await response.json()

      if (data.success && data.data) {
        setMessage(data.data.message)
        const receivedActions = data.data.actions || []
        setActions(receivedActions)
        if (receivedActions.length > 0) {
          onActionsRef.current?.(receivedActions)
        }
      } else {
        setError(data.error || 'Erreur inconnue')
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return
      setError(
        err.message.includes('fetch')
          ? 'Impossible de contacter le serveur.'
          : err.message
      )
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }, [agent])

  /**
   * Auto-trigger au montage (avec délai pour l'hydratation Zustand)
   */
  useEffect(() => {
    if (autoPrompt && !autoSentRef.current) {
      const timer = setTimeout(() => {
        if (!autoSentRef.current) {
          autoSentRef.current = true
          trigger(autoPrompt)
        }
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [autoPrompt, trigger])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setIsLoading(false)
  }, [])

  const clear = useCallback(() => {
    setActions([])
    setMessage(null)
    setError(null)
  }, [])

  return {
    /** Déclenche une action IA */
    trigger,
    /** Annule la requête en cours */
    cancel,
    /** Efface les résultats */
    clear,
    /** L'agent est en train de réfléchir */
    isLoading,
    /** Message texte de l'agent */
    message,
    /** Actions structurées retournées */
    actions,
    /** Erreur éventuelle */
    error,
  }
}
