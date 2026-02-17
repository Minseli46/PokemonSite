'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, Send, Trash2, Users, HelpCircle, Sparkles,
  Loader2, Wrench, ChevronDown, Cpu, Zap
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useAgent, type ChatMessage, type AgentType } from '@/hooks/use-agent'
import { useTeam } from '@/hooks/use-team'
import { cn } from '@/lib/utils'

// ============================================
// CONFIGURATION
// ============================================

const AGENT_META: Record<AgentType, { label: string; icon: typeof Bot; color: string; gradient: string }> = {
  orchestrator: {
    label: 'Orchestrateur',
    icon: Cpu,
    color: 'text-purple-500',
    gradient: 'from-purple-500/20 to-indigo-500/20',
  },
  team: {
    label: 'Team Builder',
    icon: Users,
    color: 'text-blue-500',
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  quiz: {
    label: 'Quiz Master',
    icon: HelpCircle,
    color: 'text-amber-500',
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
  wallpaper: {
    label: 'Wallpaper Designer',
    icon: Sparkles,
    color: 'text-pink-500',
    gradient: 'from-pink-500/20 to-rose-500/20',
  },
}

const QUICK_PROMPTS = [
  { label: '🛡️ Analyse mon équipe', message: 'Analyse mon équipe actuelle et dis-moi ses forces et faiblesses', agent: 'team' as const },
  { label: '❓ Quiz Pokémon', message: 'Pose-moi une question quiz sur les Pokémon !', agent: 'quiz' as const },
  { label: '🎨 Wallpaper feu', message: 'Suggère-moi un thème de wallpaper pour un Pokémon de type feu', agent: 'wallpaper' as const },
  { label: '⚡ Pikachu stats', message: 'Donne-moi les stats détaillées de Pikachu', agent: undefined },
  { label: '🔥 Duo complémentaire', message: 'Suggère-moi un duo de Pokémon complémentaire visuellement', agent: 'wallpaper' as const },
  { label: '🧩 Type eau counter', message: 'Quels Pokémon sont efficaces contre le type eau ?', agent: 'team' as const },
]

// ============================================
// MESSAGE BUBBLE
// ============================================

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  const agentInfo = message.agent ? AGENT_META[message.agent] : null
  const AgentIcon = agentInfo?.icon || Bot

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'flex gap-3 max-w-[85%]',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1',
          isUser
            ? 'bg-primary text-primary-foreground'
            : `bg-gradient-to-br ${agentInfo?.gradient || 'from-muted to-muted'}`
        )}
      >
        {isUser ? (
          <span className="text-sm font-bold">U</span>
        ) : (
          <AgentIcon className={cn('h-4 w-4', agentInfo?.color || 'text-muted-foreground')} />
        )}
      </div>

      {/* Content */}
      <div className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
        {/* Agent badge */}
        {!isUser && agentInfo && (
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full bg-muted', agentInfo.color)}>
            {agentInfo.label}
          </span>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted text-foreground rounded-bl-md'
          )}
        >
          {message.content}
        </div>

        {/* Tools used */}
        {message.toolsUsed && message.toolsUsed.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.toolsUsed.map((tool, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground bg-muted/50 border border-border rounded-full px-2 py-0.5"
              >
                <Wrench className="h-2.5 w-2.5" />
                {tool}
              </span>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground">
          {new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  )
}

// ============================================
// TYPING INDICATOR
// ============================================

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex gap-3 mr-auto max-w-[85%]"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-indigo-500/20 mt-1">
        <Bot className="h-4 w-4 text-purple-500 animate-pulse" />
      </div>
      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5 items-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-muted-foreground/50"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function AgentPage() {
  const { messages, isLoading, sendMessage, clearMessages, checkHealth } = useAgent()
  const { team } = useTeam()
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'auto' | AgentType>('auto')
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Health check on mount
  useEffect(() => {
    checkHealth().then((res) => {
      setIsHealthy(res.status === 'ready' && res.hasApiKey)
    })
  }, [checkHealth])

  // Handle send
  const handleSend = async (msg?: string, forceAgent?: AgentType) => {
    const text = msg || input
    if (!text.trim() || isLoading) return

    const agent = forceAgent || (mode !== 'auto' ? mode : undefined)

    await sendMessage(text, {
      agent,
      context: {
        currentTeam: team.length > 0 ? team.map(p => ({ name: p.name, types: p.types })) : undefined,
        currentPage: 'agent',
      },
    })
    setInput('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">PokéAgent IA</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Posez vos questions sur les Pokémon — l&apos;orchestrateur vous redirige vers l&apos;agent spécialisé
          </p>

          {/* Health status */}
          {isHealthy !== null && (
            <div className={cn(
              'inline-flex items-center gap-1.5 mt-2 text-xs px-3 py-1 rounded-full',
              isHealthy ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'
            )}>
              <div className={cn('w-1.5 h-1.5 rounded-full', isHealthy ? 'bg-green-500' : 'bg-red-500')} />
              {isHealthy ? 'Système IA connecté' : 'Backend non disponible'}
            </div>
          )}
        </motion.div>

        {/* Mode Selector */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)} className="mb-4">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="auto" className="gap-1.5">
              <Cpu className="h-3.5 w-3.5" />
              Auto
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Équipe
            </TabsTrigger>
            <TabsTrigger value="quiz" className="gap-1.5">
              <HelpCircle className="h-3.5 w-3.5" />
              Quiz
            </TabsTrigger>
            <TabsTrigger value="wallpaper" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Wallpaper
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Chat Area */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-0">
            {/* Messages */}
            <div className="h-[60vh] overflow-y-auto px-4 py-4 flex flex-col gap-4">
              {messages.length === 0 ? (
                /* Empty state */
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-12">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center"
                  >
                    <Bot className="h-10 w-10 text-purple-500" />
                  </motion.div>

                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">
                      Bienvenue dans PokéAgent !
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Je suis un système multi-agent alimenté par Mistral AI.
                      Posez-moi une question ou choisissez un exemple ci-dessous.
                    </p>
                  </div>

                  {/* Agents showcase */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
                    {(['team', 'quiz', 'wallpaper'] as const).map((agentType) => {
                      const meta = AGENT_META[agentType]
                      const Icon = meta.icon
                      return (
                        <div
                          key={agentType}
                          className={cn(
                            'rounded-xl border p-3 bg-gradient-to-br text-center',
                            meta.gradient
                          )}
                        >
                          <Icon className={cn('h-6 w-6 mx-auto mb-1.5', meta.color)} />
                          <p className="text-xs font-medium text-foreground">{meta.label}</p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Quick prompts */}
                  <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                    {QUICK_PROMPTS.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(p.message, p.agent)}
                        className="text-xs bg-muted hover:bg-muted/80 text-foreground border border-border rounded-full px-3 py-1.5 transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Messages list */
                <>
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                  <AnimatePresence>
                    {isLoading && <TypingIndicator />}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Input area */}
            <div className="p-4 flex gap-2 items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={clearMessages}
                className="flex-shrink-0"
                title="Effacer la conversation"
                disabled={messages.length === 0}
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    mode === 'auto'
                      ? 'Posez votre question Pokémon...'
                      : `Question pour ${AGENT_META[mode].label}...`
                  }
                  className="pr-12"
                  disabled={isLoading}
                />
              </div>

              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 gap-1.5"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Envoyer
              </Button>
            </div>

            {/* Team context indicator */}
            {team.length > 0 && (
              <div className="px-4 pb-3 -mt-1">
                <p className="text-[10px] text-muted-foreground">
                  🎯 Contexte d&apos;équipe actif : {team.map(p => p.name).join(', ')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
