import { useState, useCallback } from 'react'

interface AgentCallOptions {
  endpoint: 'team' | 'quiz' | 'wallpaper'
  actionType?: string
}

interface AgentResponse {
  success: boolean
  data: {
    agent: string
    message: string
    toolsUsed: string[]
    actions: any[]
  }
}

export function useAgentCall<T = any>({ endpoint, actionType }: AgentCallOptions) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T[] | null>(null)

  const callAgent = useCallback(async (message: string): Promise<T[] | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:3000/api/agent/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        throw new Error(`Erreur lors de l'appel à l'agent ${endpoint}`)
      }

      const result: AgentResponse = await response.json()
      console.log(`📦 Réponse de l'agent ${endpoint}:`, result)

      // Extraire les actions du bon type si spécifié
      const actions = actionType
        ? result.data?.actions?.filter((a: any) => a.type === actionType) || []
        : result.data?.actions || []

      console.log(`🎯 Actions extraites (${actionType || 'toutes'}):`, actions)

      if (actions.length === 0) {
        console.warn(`⚠️ Aucune action générée pour ${endpoint}`)
      }

      setData(actions)
      return actions

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      console.error(`❌ Erreur agent ${endpoint}:`, err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [endpoint, actionType])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return { 
    callAgent, 
    isLoading, 
    error, 
    data,
    reset 
  }
}
