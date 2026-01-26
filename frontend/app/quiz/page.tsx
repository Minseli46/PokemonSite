'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HelpCircle, Trophy, RefreshCw, ChevronRight, 
  CheckCircle2, XCircle, Timer, Zap, Brain
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatPokemonName, getPokemonImage, GENERATIONS } from '@/lib/pokemon'
import type { Pokemon } from '@/lib/pokemon'
import { cn } from '@/lib/utils'

type QuizMode = 'name' | 'silhouette' | 'type' | 'stat'
type Difficulty = 'easy' | 'medium' | 'hard'

interface QuizQuestion {
  pokemon: Pokemon
  options: string[]
  correctAnswer: string
  mode: QuizMode
}

const QUIZ_MODES = [
  { id: 'name' as const, label: "Quel est ce Pokémon ?", icon: HelpCircle },
  { id: 'silhouette' as const, label: 'Défi Silhouette', icon: Brain },
  { id: 'type' as const, label: 'Maître des Types', icon: Zap },
]

const DIFFICULTIES: { id: Difficulty; label: string; range: [number, number]; timeLimit: number }[] = [
  { id: 'easy', label: 'Facile', range: [1, 151], timeLimit: 15 },
  { id: 'medium', label: 'Moyen', range: [1, 493], timeLimit: 12 },
  { id: 'hard', label: 'Difficile', range: [1, 1025], timeLimit: 10 },
]

async function fetchRandomPokemon(range: [number, number]): Promise<Pokemon> {
  const id = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0]
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
  return res.json()
}

async function generateQuestion(mode: QuizMode, difficulty: Difficulty): Promise<QuizQuestion> {
  const diffConfig = DIFFICULTIES.find(d => d.id === difficulty)!
  const pokemon = await fetchRandomPokemon(diffConfig.range)
  
  let correctAnswer: string
  let options: string[]

  switch (mode) {
    case 'name':
    case 'silhouette': {
      correctAnswer = pokemon.name
      // Generate wrong options
      const wrongOptions: string[] = []
      while (wrongOptions.length < 3) {
        const wrongPokemon = await fetchRandomPokemon(diffConfig.range)
        if (wrongPokemon.name !== correctAnswer && !wrongOptions.includes(wrongPokemon.name)) {
          wrongOptions.push(wrongPokemon.name)
        }
      }
      options = [...wrongOptions, correctAnswer].sort(() => Math.random() - 0.5)
      break
    }
    case 'type': {
      correctAnswer = pokemon.types[0].type.name
      const allTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy']
      const wrongOptions = allTypes
        .filter(t => !pokemon.types.some(pt => pt.type.name === t))
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
      options = [...wrongOptions, correctAnswer].sort(() => Math.random() - 0.5)
      break
    }
    case 'stat': {
      const highestStat = pokemon.stats.reduce((a, b) => 
        a.base_stat > b.base_stat ? a : b
      )
      correctAnswer = highestStat.stat.name
      const wrongOptions = pokemon.stats
        .filter(s => s.stat.name !== correctAnswer)
        .map(s => s.stat.name)
        .slice(0, 3)
      options = [...wrongOptions, correctAnswer].sort(() => Math.random() - 0.5)
      break
    }
    default:
      correctAnswer = pokemon.name
      options = [pokemon.name]
  }

  return { pokemon, options, correctAnswer, mode }
}

export default function QuizPage() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'result'>('menu')
  const [mode, setMode] = useState<QuizMode>('name')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [question, setQuestion] = useState<QuizQuestion | null>(null)
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState(0)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [totalQuestions] = useState(10)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15)
  const [streak, setStreak] = useState(0)

  const diffConfig = DIFFICULTIES.find(d => d.id === difficulty)!

  const loadQuestion = useCallback(async () => {
    setLoading(true)
    setSelectedAnswer(null)
    setShowResult(false)
    setTimeLeft(diffConfig.timeLimit)
    
    try {
      const newQuestion = await generateQuestion(mode, difficulty)
      setQuestion(newQuestion)
    } catch (error) {
      console.error('Failed to load question:', error)
    } finally {
      setLoading(false)
    }
  }, [mode, difficulty, diffConfig.timeLimit])

  const startGame = useCallback(async () => {
    setGameState('playing')
    setScore(0)
    setQuestionNumber(1)
    setStreak(0)
    await loadQuestion()
  }, [loadQuestion])

  const handleAnswer = useCallback((answer: string) => {
    if (showResult) return
    
    setSelectedAnswer(answer)
    setShowResult(true)

    const isCorrect = answer === question?.correctAnswer

    if (isCorrect) {
      setScore(prev => prev + (streak + 1) * 10)
      setStreak(prev => prev + 1)
      
      if (streak >= 2) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        })
      }
    } else {
      setStreak(0)
    }

    setTimeout(() => {
      if (questionNumber >= totalQuestions) {
        setGameState('result')
        if (score >= totalQuestions * 8) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          })
        }
      } else {
        setQuestionNumber(prev => prev + 1)
        loadQuestion()
      }
    }, 1500)
  }, [showResult, question, questionNumber, totalQuestions, loadQuestion, score, streak])

  // Timer effect
  useEffect(() => {
    if (gameState !== 'playing' || showResult || loading) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAnswer('')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState, showResult, loading, handleAnswer])

  const imageUrl = question ? getPokemonImage(question.pokemon) : null

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <AnimatePresence mode="wait">
          {/* Menu State */}
          {gameState === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center justify-center gap-3">
                  <HelpCircle className="h-8 w-8 text-primary" />
                  Quiz Pokémon
                </h1>
                <p className="text-muted-foreground mt-2">
                  Testez vos connaissances Pokémon !
                </p>
              </div>

              {/* Mode Selection */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-semibold text-foreground mb-4">Sélectionnez le Mode</h2>
                <div className="grid gap-3">
                  {QUIZ_MODES.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
                        mode === m.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <m.icon className={cn(
                        "h-6 w-6",
                        mode === m.id ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span className={cn(
                        "font-medium",
                        mode === m.id ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Selection */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-semibold text-foreground mb-4">Sélectionnez la Difficulté</h2>
                <div className="grid grid-cols-3 gap-3">
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setDifficulty(d.id)}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all text-center",
                        difficulty === d.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className={cn(
                        "font-medium block",
                        difficulty === d.id ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {d.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Gen {GENERATIONS.find(g => g.range[1] >= d.range[1])?.id || 1}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={startGame} size="lg" className="w-full gap-2">
                Démarrer le Quiz
                <ChevronRight className="h-5 w-5" />
              </Button>
            </motion.div>
          )}

          {/* Playing State */}
          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Progress */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Question {questionNumber}/{totalQuestions}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="font-bold text-foreground">{score}</span>
                </div>
              </div>

              <Progress value={(questionNumber / totalQuestions) * 100} className="h-2" />

              {/* Timer */}
              <div className="flex items-center justify-center gap-2">
                <Timer className={cn(
                  "h-5 w-5",
                  timeLeft <= 5 ? "text-destructive" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-2xl font-bold",
                  timeLeft <= 5 ? "text-destructive" : "text-foreground"
                )}>
                  {timeLeft}s
                </span>
              </div>

              {/* Streak */}
              {streak >= 2 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center gap-2"
                >
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-bold text-yellow-500">
                    {streak}x Streak!
                  </span>
                </motion.div>
              )}

              {/* Question Card */}
              <div className="bg-card border border-border rounded-xl p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
                  </div>
                ) : question && (
                  <>
                    {/* Pokemon Image */}
                    <div className="flex justify-center mb-6">
                      {imageUrl && (
                        <div className="relative w-48 h-48">
                          <Image
                            src={imageUrl || "/placeholder.svg"}
                            alt="Pokemon"
                            fill
                            className={cn(
                              "object-contain transition-all duration-300",
                              mode === 'silhouette' && !showResult && "brightness-0"
                            )}
                          />
                        </div>
                      )}
                    </div>

                    {/* Question Text */}
                    <p className="text-center text-lg font-medium text-foreground mb-6">
                      {mode === 'name' && "Quel est ce Pokémon ?"}
                      {mode === 'silhouette' && "Identifiez ce Pokémon !"}
                      {mode === 'type' && `Quel est le type principal de ${formatPokemonName(question.pokemon.name)} ?`}
                      {mode === 'stat' && `Quelle est la statistique la plus élevée de ${formatPokemonName(question.pokemon.name)} ?`}
                    </p>

                    {/* Options */}
                    <div className="grid grid-cols-2 gap-3">
                      {question.options.map(option => {
                        const isCorrect = option === question.correctAnswer
                        const isSelected = option === selectedAnswer
                        const showCorrect = showResult && isCorrect
                        const showWrong = showResult && isSelected && !isCorrect

                        return (
                          <button
                            key={option}
                            onClick={() => handleAnswer(option)}
                            disabled={showResult}
                            className={cn(
                              "p-4 rounded-lg border-2 transition-all font-medium capitalize",
                              showCorrect && "border-green-500 bg-green-500/20 text-green-500",
                              showWrong && "border-red-500 bg-red-500/20 text-red-500",
                              !showResult && "border-border hover:border-primary hover:bg-primary/10",
                              !showResult && "text-foreground"
                            )}
                          >
                            <span className="flex items-center justify-center gap-2">
                              {showCorrect && <CheckCircle2 className="h-5 w-5" />}
                              {showWrong && <XCircle className="h-5 w-5" />}
                              {formatPokemonName(option)}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Result State */}
          {gameState === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="bg-card border border-border rounded-xl p-8">
                <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Quiz Terminé !
                </h2>
                <p className="text-muted-foreground mb-6">
                  Vous avez marqué {score} points !
                </p>

                <div className="inline-flex items-center gap-4 bg-secondary rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{score}</p>
                    <p className="text-xs text-muted-foreground">Points</p>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {Math.round((score / (totalQuestions * 10)) * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Précision</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={startGame} size="lg" className="gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Rejouer
                </Button>
                <Button 
                  onClick={() => setGameState('menu')} 
                  variant="outline" 
                  size="lg"
                >
                  Changer de Mode
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
