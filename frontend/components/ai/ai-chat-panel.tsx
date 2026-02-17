'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, Send, Trash2, Loader2, Wrench, ChevronDown, ChevronUp,
  MessageSquare, X, Minimize2, Maximize2, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAgent, type ChatMessage, type AgentType, type AgentAction, type WallpaperConfigAction } from '@/hooks/use-agent'
import { cn } from '@/lib/utils'
import { TeamProposalCard } from './team-proposal-card'
import { QuizCard } from './quiz-card'
import { WallpaperCard } from './wallpaper-card'

// ============================================
// PROPS
// ============================================

interface AIChatPanelProps {
  /** Which agent to force (team / quiz / wallpaper) */
  agent: AgentType
  /** Label shown in the header */
  title: string
  /** Placeholder for the input */
  placeholder?: string
  /** Extra context to send with each message */
  context?: Record<string, any>
  /** Quick action buttons shown above the input */
  quickActions?: { label: string; message: string }[]
  /** Accent color class (e.g. 'text-blue-500') */
  accentColor?: string
  /** Gradient for the header */
  headerGradient?: string
  /** Whether the panel starts expanded */
  defaultOpen?: boolean
  /** Icon component */
  icon?: React.ElementType
  /** Callback when a wallpaper config is applied */
  onApplyWallpaper?: (config: WallpaperConfigAction['data']) => void
  /** Callback to send structured actions to the main page instead of rendering them in the chat */
  onActions?: (actions: AgentAction[]) => void
  /** Auto-send this message when the component mounts (proactive agent) */
  initialMessage?: string
}

// ============================================
// MINI MESSAGE BUBBLE
// ============================================

function MiniMessage({ message, onApplyWallpaper, suppressActions }: { 
  message: ChatMessage
  onApplyWallpaper?: (config: WallpaperConfigAction['data']) => void
  suppressActions?: boolean 
}) {
  const isUser = message.role === 'user'
  const hasActions = message.actions && message.actions.length > 0

  return (
    <div className={cn('flex flex-col gap-2 max-w-[95%]', isUser ? 'ml-auto' : 'mr-auto')}>
      {/* Text bubble */}
      {message.content && (
        <div className={cn('flex gap-2', isUser ? 'flex-row-reverse' : '')}>
          <div
            className={cn(
              'rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap',
              isUser
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-muted text-foreground rounded-bl-sm'
            )}
          >
            {message.content}
          </div>
        </div>
      )}
      
      {/* When actions are forwarded to the main page, show a compact indicator */}
      {hasActions && suppressActions && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
            {message.actions!.length} résultat{message.actions!.length > 1 ? 's' : ''} affiché{message.actions!.length > 1 ? 's' : ''} sur la page ✨
          </span>
        </div>
      )}

      {/* Action cards (only when NOT suppressed, i.e. no onActions callback) */}
      {hasActions && !suppressActions && (
        <div className="flex flex-col gap-2 w-full">
          {/* Team proposals */}
          {message.actions!.filter(a => a.type === 'team_proposal').length > 0 && (
            <div className="flex flex-col gap-2">
              {message.actions!
                .filter(a => a.type === 'team_proposal')
                .map((action, i) => (
                  <TeamProposalCard
                    key={`team-${i}`}
                    proposal={(action as any).data}
                    index={i}
                  />
                ))}
            </div>
          )}

          {/* Quiz questions */}
          {message.actions!.filter(a => a.type === 'quiz_question').length > 0 && (
            <div className="flex flex-col gap-2">
              {message.actions!
                .filter(a => a.type === 'quiz_question')
                .map((action, i) => (
                  <QuizCard
                    key={`quiz-${i}`}
                    quiz={(action as any).data}
                    index={i}
                  />
                ))}
            </div>
          )}

          {/* Wallpaper configs */}
          {message.actions!.filter(a => a.type === 'wallpaper_config').length > 0 && (
            <div className="flex flex-col gap-2">
              {message.actions!
                .filter(a => a.type === 'wallpaper_config')
                .map((action, i) => (
                  <WallpaperCard
                    key={`wallpaper-${i}`}
                    config={(action as any).data}
                    index={i}
                    onApply={onApplyWallpaper}
                  />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// AI CHAT PANEL
// ============================================

export function AIChatPanel({
  agent,
  title,
  placeholder = 'Demandez à l\'IA...',
  context = {},
  quickActions = [],
  accentColor = 'text-purple-500',
  headerGradient = 'from-purple-500/20 to-indigo-500/20',
  defaultOpen = false,
  icon: Icon = Bot,
  onApplyWallpaper,
  onActions,
  initialMessage,
}: AIChatPanelProps) {
  const { messages, isLoading, sendMessage, clearMessages } = useAgent()
  const [input, setInput] = useState('')
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const lastForwardedRef = useRef<string | null>(null)
  const initialMessageSentRef = useRef(false)

  // Proactive: auto-send initial message on mount
  // Uses initialMessage as dep so the timer resets when Zustand hydrates from localStorage
  // (on first render teams=[] → "no teams", then hydration → correct message)
  useEffect(() => {
    if (initialMessage && !initialMessageSentRef.current && messages.length === 0 && !isLoading) {
      // Delay to let Zustand hydrate from localStorage before sending
      const timer = setTimeout(() => {
        if (!initialMessageSentRef.current) {
          initialMessageSentRef.current = true
          sendMessage(initialMessage, {
            agent,
            context: { ...context, currentPage: agent },
          })
        }
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [initialMessage]) // eslint-disable-line react-hooks/exhaustive-deps

  // Forward actions to parent page when onActions is provided
  useEffect(() => {
    if (!onActions) return
    // Find the most recent assistant message with actions
    const lastAssistantWithActions = [...messages]
      .reverse()
      .find(m => m.role === 'assistant' && m.actions && m.actions.length > 0)
    if (lastAssistantWithActions && lastAssistantWithActions.id !== lastForwardedRef.current) {
      lastForwardedRef.current = lastAssistantWithActions.id
      onActions(lastAssistantWithActions.actions!)
    }
  }, [messages, onActions])

  // Auto-scroll
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isMinimized])

  const handleSend = async (msg?: string) => {
    const text = msg || input
    if (!text.trim() || isLoading) return

    await sendMessage(text, {
      agent,
      context: { ...context, currentPage: agent },
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

  // Floating button when closed
  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3',
          'rounded-full shadow-lg border border-border',
          'bg-gradient-to-r', headerGradient,
          'backdrop-blur-sm hover:shadow-xl transition-shadow'
        )}
      >
        <Icon className={cn('h-5 w-5', accentColor)} />
        <span className="text-sm font-medium text-foreground">{title}</span>
        {messages.length > 0 && (
          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
            {messages.length}
          </span>
        )}
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={cn(
        'fixed bottom-6 right-6 z-50 w-[380px] max-h-[70vh]',
        'bg-background border border-border rounded-2xl shadow-2xl',
        'flex flex-col overflow-hidden',
        isMinimized && 'max-h-[52px]'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3',
          'bg-gradient-to-r border-b border-border cursor-pointer',
          headerGradient
        )}
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <Icon className={cn('h-5 w-5', accentColor)} />
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
        </div>
        <div className="flex items-center gap-1">
          {!isMinimized && messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => { e.stopPropagation(); clearMessages() }}
              title="Effacer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized) }}
          >
            {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => { e.stopPropagation(); setIsOpen(false) }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Body - hidden when minimized */}
      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3 min-h-[200px] max-h-[45vh]">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-6">
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  'bg-gradient-to-br', headerGradient
                )}>
                  <Icon className={cn('h-6 w-6', accentColor)} />
                </div>
                <p className="text-xs text-muted-foreground max-w-[240px]">
                  {placeholder}
                </p>

                {/* Quick Actions */}
                {quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-center mt-1">
                    {quickActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(action.message)}
                        className="text-[11px] bg-muted hover:bg-muted/80 text-foreground 
                          border border-border rounded-full px-2.5 py-1 transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <MiniMessage 
                    key={msg.id} 
                    message={msg} 
                    onApplyWallpaper={onApplyWallpaper}
                    suppressActions={!!onActions}
                  />
                ))}
                <AnimatePresence>
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-2 mr-auto"
                    >
                      <div className="bg-muted rounded-xl px-3 py-2 flex gap-1 items-center">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border px-3 py-2 flex gap-2 items-center">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="text-sm h-9"
              disabled={isLoading}
            />
            <Button
              size="icon"
              className="h-9 w-9 flex-shrink-0"
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </>
      )}
    </motion.div>
  )
}
