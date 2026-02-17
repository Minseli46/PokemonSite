'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, HelpCircle, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuizQuestionAction } from '@/hooks/use-agent'

// ============================================
// QUIZ CARD
// ============================================

interface QuizCardProps {
  quiz: QuizQuestionAction['data']
  index: number
}

export function QuizCard({ quiz, index }: QuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)

  const isAnswered = selectedAnswer !== null
  const isCorrect = selectedAnswer === quiz.correctAnswer
  const optionLabels = ['A', 'B', 'C', 'D']

  const handleSelect = (option: string) => {
    if (isAnswered) return
    setSelectedAnswer(option)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className="rounded-xl border border-border overflow-hidden bg-gradient-to-br from-background to-muted/30"
    >
      {/* Question Header */}
      <div className="px-3 py-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-b border-border">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-purple-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-foreground leading-snug">
            {quiz.question}
          </span>
        </div>
        {quiz.difficulty && (
          <div className="mt-1 flex gap-1.5">
            <span className={cn(
              'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
              quiz.difficulty === 'easy' && 'bg-green-500/20 text-green-600',
              quiz.difficulty === 'medium' && 'bg-yellow-500/20 text-yellow-600',
              quiz.difficulty === 'hard' && 'bg-red-500/20 text-red-600',
            )}>
              {quiz.difficulty === 'easy' ? 'Facile' : quiz.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
            </span>
          </div>
        )}
      </div>

      {/* Pokémon Image (if available) */}
      {quiz.pokemonImage && (
        <div className="flex justify-center py-2 bg-muted/20">
          <div className="relative w-16 h-16">
            <Image
              src={quiz.pokemonImage}
              alt={quiz.pokemonName || 'Pokémon'}
              fill
              className={cn(
                'object-contain transition-all',
                !isAnswered && 'brightness-0' // Silhouette mode if not answered
              )}
              sizes="64px"
              unoptimized
            />
          </div>
        </div>
      )}

      {/* Options */}
      <div className="px-3 py-2 flex flex-col gap-1.5">
        {quiz.options.map((option, i) => {
          const isSelected = selectedAnswer === option
          const isTheCorrect = option === quiz.correctAnswer
          
          let optionStyle = 'bg-muted/30 hover:bg-muted/60 border-transparent'
          if (isAnswered) {
            if (isTheCorrect) {
              optionStyle = 'bg-green-500/15 border-green-500/40 text-green-700 dark:text-green-400'
            } else if (isSelected && !isTheCorrect) {
              optionStyle = 'bg-red-500/15 border-red-500/40 text-red-700 dark:text-red-400'
            } else {
              optionStyle = 'bg-muted/20 border-transparent opacity-50'
            }
          }

          return (
            <button
              key={`${option}-${i}`}
              onClick={() => handleSelect(option)}
              disabled={isAnswered}
              className={cn(
                'flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left transition-all text-xs',
                optionStyle,
                !isAnswered && 'cursor-pointer active:scale-[0.98]'
              )}
            >
              <span className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                isAnswered && isTheCorrect ? 'bg-green-500 text-white' :
                isAnswered && isSelected && !isTheCorrect ? 'bg-red-500 text-white' :
                'bg-muted text-muted-foreground'
              )}>
                {isAnswered && isTheCorrect ? <CheckCircle2 className="h-3 w-3" /> :
                 isAnswered && isSelected && !isTheCorrect ? <XCircle className="h-3 w-3" /> :
                 optionLabels[i]}
              </span>
              <span className="capitalize leading-tight">{option}</span>
            </button>
          )
        })}
      </div>

      {/* Result / Hint */}
      <div className="px-3 py-2 border-t border-border">
        {isAnswered ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={cn(
              'text-[11px] leading-relaxed rounded-lg px-2.5 py-2',
              isCorrect ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-500/10 text-red-700 dark:text-red-400'
            )}
          >
            <div className="flex items-center gap-1.5 font-semibold mb-0.5">
              {isCorrect ? (
                <><CheckCircle2 className="h-3.5 w-3.5" /> Bonne réponse ! 🎉</>
              ) : (
                <><XCircle className="h-3.5 w-3.5" /> Raté ! La réponse était : <span className="capitalize">{quiz.correctAnswer}</span></>
              )}
            </div>
            {quiz.explanation && (
              <p className="opacity-80">{quiz.explanation}</p>
            )}
          </motion.div>
        ) : quiz.hint ? (
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <Lightbulb className="h-3 w-3" />
            {showHint ? quiz.hint : 'Voir l\'indice'}
          </button>
        ) : null}
      </div>
    </motion.div>
  )
}
