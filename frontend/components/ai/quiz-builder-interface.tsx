'use client'

import { useState, useCallback, useMemo } from 'react'
import { Brain, HelpCircle, Zap, TrendingUp, Shuffle, Waypoints, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { ButtonGroup } from '@/components/ui/button-group'
import { useAgentCall } from '@/hooks/use-agent-call'
import { POKEMON_TYPES, POKEMON_GENERATIONS } from '@/lib/constants'

const QUIZ_MODES = [
  { id: 'name', label: 'Deviner le Nom', icon: HelpCircle, description: 'Identifiez le Pokémon par son apparence' },
  { id: 'type', label: 'Deviner le Type', icon: Zap, description: 'Trouvez le type du Pokémon' },
  { id: 'stat', label: 'Meilleure Stat', icon: TrendingUp, description: 'Devinez la statistique la plus élevée' },
  { id: 'evolution', label: 'Évolution', icon: Waypoints, description: 'Questions sur les évolutions' },
  { id: 'ability', label: 'Capacités', icon: Sparkles, description: 'Devinez les capacités spéciales' },
  { id: 'generation', label: 'Génération', icon: Shuffle, description: 'Questions sur les générations' },
]

const DIFFICULTIES = [
  { id: 'easy', label: 'Facile', description: 'Gen 1 (1-151)' },
  { id: 'medium', label: 'Moyen', description: 'Gen 1-4 (1-493)' },
  { id: 'hard', label: 'Difficile', description: 'Toutes (1-1025)' },
]

interface QuizBuilderInterfaceProps {
  onQuizGenerated?: (questions: any[]) => void
}

export function QuizBuilderInterface({ onQuizGenerated }: QuizBuilderInterfaceProps) {
  const [mode, setMode] = useState('name')
  const [difficulty, setDifficulty] = useState('easy')
  const [questionCount, setQuestionCount] = useState(5)
  const [themeType, setThemeType] = useState<string | null>(null)
  const [themeGeneration, setThemeGeneration] = useState<number | null>(null)

  const { callAgent, isLoading } = useAgentCall({ 
    endpoint: 'quiz', 
    actionType: 'quiz_question' 
  })

  const selectedModeLabel = useMemo(
    () => QUIZ_MODES.find(m => m.id === mode)?.label,
    [mode]
  )

  const buildMessage = useCallback(() => {
    let message = `Génère un quiz de ${questionCount} questions en mode "${selectedModeLabel}" avec une difficulté ${difficulty}.`

    if (themeType) {
      message += ` Concentre-toi uniquement sur les Pokémon de type ${themeType}.`
    }

    if (themeGeneration) {
      message += ` Utilise uniquement les Pokémon de la génération ${themeGeneration}.`
    }

    return message
  }, [questionCount, selectedModeLabel, difficulty, themeType, themeGeneration])

  const handleGenerateQuiz = useCallback(async () => {
    const message = buildMessage()
    console.log('🧠 Génération du quiz:', message)

    const questions = await callAgent(message)

    if (questions && questions.length > 0 && onQuizGenerated) {
      onQuizGenerated(questions)
    }
  }, [buildMessage, callAgent, onQuizGenerated])

  return (
    <Card className="border-purple-500/20 bg-purple-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-500" />
          Générateur de Quiz Pokémon
        </CardTitle>
        <CardDescription>
          Créez un quiz personnalisé avec vos préférences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode de Quiz */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Mode de Quiz</Label>
          <ButtonGroup 
            options={QUIZ_MODES}
            value={mode}
            onChange={setMode}
            columns={3}
          />
        </div>

        {/* Difficulté */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Difficulté</Label>
          <ButtonGroup 
            options={DIFFICULTIES}
            value={difficulty}
            onChange={setDifficulty}
            columns={3}
          />
        </div>

        {/* Nombre de Questions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Nombre de Questions</Label>
            <span className="text-2xl font-bold text-purple-500">{questionCount}</span>
          </div>
          <Slider
            value={[questionCount]}
            onValueChange={(value) => setQuestionCount(value[0])}
            min={3}
            max={20}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>3 questions</span>
            <span>20 questions</span>
          </div>
        </div>

        {/* Thème (Optionnel) */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Thème (Optionnel)</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm text-gray-400">Filtrer par Type</Label>
              <Select value={themeType || 'all'} onValueChange={(value) => setThemeType(value === 'all' ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {POKEMON_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-gray-400">Filtrer par Génération</Label>
              <Select
                value={themeGeneration?.toString() || 'all'}
                onValueChange={(value) => setThemeGeneration(value === 'all' ? null : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes générations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {POKEMON_GENERATIONS.map((gen) => (
                    <SelectItem key={gen.id} value={gen.id.toString()}>
                      {gen.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Bouton de Génération */}
        <Button
          onClick={handleGenerateQuiz}
          disabled={isLoading}
          className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5 mr-2" />
              Générer le Quiz
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
