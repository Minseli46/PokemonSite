'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, Users, BarChart3, TrendingUp, 
  ChevronRight, Loader2, Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTeam, type Team } from '@/hooks/use-team'
import { TeamProposalCard } from './team-proposal-card'
import type { TeamProposalAction } from '@/hooks/use-agent'

// Types pour les critères de création
interface TeamCriteria {
  style: 'offensive' | 'defensive' | 'balanced' | 'speed' | 'stall'
  generation?: number
  requiredTypes?: string[]
  excludeTypes?: string[]
  includeLegendary: boolean
  includeMega: boolean
  teamSize: number
  description?: string
}

// Types pour l'analyse
interface TeamAnalysis {
  strengths: string[]
  weaknesses: string[]
  coverageScore: number
  balanceScore: number
  recommendations: string[]
  typeChart: Record<string, { weak: number, resist: number, immune: number }>
}

export function TeamBuilderInterface() {
  const { teams } = useTeam()
  const [activeTab, setActiveTab] = useState<'create' | 'analyze' | 'optimize'>('create')
  const [loading, setLoading] = useState(false)
  
  // État pour création d'équipe
  const [criteria, setCriteria] = useState<TeamCriteria>({
    style: 'balanced',
    includeLegendary: false,
    includeMega: false,
    teamSize: 6,
    requiredTypes: [],
    excludeTypes: [],
  })
  const [proposals, setProposals] = useState<TeamProposalAction['data'][]>([])

  // État pour analyse/optimisation
  const [selectedTeamId, setSelectedTeamId] = useState<string>('')
  const [analysis, setAnalysis] = useState<TeamAnalysis | null>(null)
  const [optimizations, setOptimizations] = useState<TeamProposalAction['data'][]>([])

  // ============================================
  // CRÉATION D'ÉQUIPE
  // ============================================
  const handleCreateTeams = async () => {
    setLoading(true)
    setProposals([])
    
    try {
      // Construire le message pour l'agent
      let message = `Crée 3 équipes Pokémon ${criteria.style === 'balanced' ? 'équilibrées' : 
                     criteria.style === 'offensive' ? 'offensives' : 
                     criteria.style === 'defensive' ? 'défensives' : 
                     criteria.style === 'speed' ? 'rapides' : 
                     'de stall'} avec exactement ${criteria.teamSize} Pokémon chacune.`
      
      if (criteria.generation) {
        message += ` Utilise uniquement des Pokémon de la génération ${criteria.generation}.`
      }
      
      if (criteria.requiredTypes && criteria.requiredTypes.length > 0) {
        message += ` Inclus obligatoirement les types : ${criteria.requiredTypes.join(', ')}.`
      }
      
      if (criteria.excludeTypes && criteria.excludeTypes.length > 0) {
        message += ` Évite les types : ${criteria.excludeTypes.join(', ')}.`
      }
      
      if (!criteria.includeLegendary) {
        message += ` N'inclus pas de Pokémon légendaires.`
      }
      
      if (criteria.description) {
        message += ` ${criteria.description}`
      }
      
      message += ` Chaque équipe doit être COMPLÈTEMENT DIFFÉRENTE des autres. Utilise build_team_proposal pour CHAQUE proposition.`

      const response = await fetch('http://localhost:3000/api/agent/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationHistory: [],
        }),
      })

      const result = await response.json()
      
      if (result.success && result.data.actions) {
        const teamActions = result.data.actions.filter((a: any) => a.type === 'team_proposal')
        setProposals(teamActions.map((a: any) => a.data))
      }
    } catch (error) {
      console.error('Erreur lors de la création des équipes:', error)
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // ANALYSE D'ÉQUIPE
  // ============================================
  const handleAnalyzeTeam = async () => {
    if (!selectedTeamId) return
    
    setLoading(true)
    setAnalysis(null)
    
    try {
      const team = teams.find(t => t.id === selectedTeamId)
      if (!team || team.pokemon.length === 0) return
      
      const pokemonNames = team.pokemon.map(p => p.name).join(', ')
      const message = `Analyse en détail cette équipe : ${pokemonNames}. 
                      Identifie ses forces, faiblesses, couverture de types, équilibre des rôles.
                      Donne un score de couverture et un score d'équilibre.
                      NE propose PAS de nouvelles équipes, analyse seulement.`

      const response = await fetch('http://localhost:3000/api/agent/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationHistory: [],
        }),
      })

      const result = await response.json()
      
      // Parser la réponse pour extraire l'analyse structurée
      // Pour l'instant, on affiche juste le message
      // TODO: créer un endpoint dédié qui retourne une analyse structurée
      console.log('Analyse:', result.data.message)
      
      // Simulation d'une analyse structurée
      setAnalysis({
        strengths: ['Bonne couverture offensive', 'Équilibre des types'],
        weaknesses: ['Faible contre type Électrique', 'Manque de défense spéciale'],
        coverageScore: 75,
        balanceScore: 68,
        recommendations: [
          'Ajouter un Pokémon de type Sol pour couvrir le type Électrique',
          'Remplacer un attaquant par un tank défensif',
        ],
        typeChart: {},
      })
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error)
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // OPTIMISATION D'ÉQUIPE
  // ============================================
  const handleOptimizeTeam = async () => {
    if (!selectedTeamId) return
    
    setLoading(true)
    setOptimizations([])
    
    try {
      const team = teams.find(t => t.id === selectedTeamId)
      if (!team) return
      
      const pokemonNames = team.pokemon.map(p => p.name).join(', ')
      const message = team.pokemon.length === 0
        ? `Propose 3 équipes complètes variées pour remplir l'équipe "${team.name}". Utilise build_team_proposal pour chaque.`
        : team.pokemon.length < 6
        ? `Cette équipe incomplète contient : ${pokemonNames}. 
           Propose 3 compositions COMPLÈTES différentes qui gardent ces Pokémon et ajoutent ${6 - team.pokemon.length} autres pour compléter à 6.
           Chaque proposition doit inclure les ${team.pokemon.length} Pokémon actuels + ${6 - team.pokemon.length} nouveaux.
           Utilise build_team_proposal pour CHAQUE proposition.`
        : `Optimise cette équipe complète : ${pokemonNames}. 
           Propose 3 variantes optimisées différentes en remplaçant 2-3 Pokémon pour améliorer la couverture.
           Utilise build_team_proposal pour chaque proposition.`

      const response = await fetch('http://localhost:3000/api/agent/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationHistory: [],
        }),
      })

      const result = await response.json()
      
      if (result.success && result.data.actions) {
        const teamActions = result.data.actions.filter((a: any) => a.type === 'team_proposal')
        setOptimizations(teamActions.map((a: any) => a.data))
      }
    } catch (error) {
      console.error('Erreur lors de l\'optimisation:', error)
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Créer Équipe
          </TabsTrigger>
          <TabsTrigger value="analyze" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analyser Équipe
          </TabsTrigger>
          <TabsTrigger value="optimize" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Optimiser Équipe
          </TabsTrigger>
        </TabsList>

        {/* ========== CRÉATION ========== */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Critères de Création
              </CardTitle>
              <CardDescription>
                Définissez les critères pour générer 3 propositions d'équipes différentes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Style */}
              <div className="space-y-2">
                <Label htmlFor="style">Style de Combat</Label>
                <Select
                  value={criteria.style}
                  onValueChange={(v: string) => setCriteria({ ...criteria, style: v as any })}
                >
                  <SelectTrigger id="style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offensive">🗡️ Offensive (Attaque rapide)</SelectItem>
                    <SelectItem value="defensive">🛡️ Défensive (Tank/Support)</SelectItem>
                    <SelectItem value="balanced">⚖️ Équilibrée (Mix attaque/défense)</SelectItem>
                    <SelectItem value="speed">⚡ Vitesse (Speedsters)</SelectItem>
                    <SelectItem value="stall">🐢 Stall (Usure)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Génération */}
              <div className="space-y-2">
                <Label htmlFor="generation">Génération (Optionnel)</Label>
                <Select
                  value={criteria.generation?.toString() || 'all'}
                  onValueChange={(v: string) => setCriteria({ ...criteria, generation: v === 'all' ? undefined : parseInt(v) })}
                >
                  <SelectTrigger id="generation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les générations</SelectItem>
                    <SelectItem value="1">Gen 1 (Kanto)</SelectItem>
                    <SelectItem value="2">Gen 2 (Johto)</SelectItem>
                    <SelectItem value="3">Gen 3 (Hoenn)</SelectItem>
                    <SelectItem value="4">Gen 4 (Sinnoh)</SelectItem>
                    <SelectItem value="5">Gen 5 (Unova)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Taille équipe */}
              <div className="space-y-2">
                <Label>Taille de l'équipe: {criteria.teamSize} Pokémon</Label>
                <Slider
                  value={[criteria.teamSize]}
                  onValueChange={([v]) => setCriteria({ ...criteria, teamSize: v })}
                  min={3}
                  max={6}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="legendary"
                    checked={criteria.includeLegendary}
                    onCheckedChange={(checked) => 
                      setCriteria({ ...criteria, includeLegendary: checked as boolean })
                    }
                  />
                  <Label htmlFor="legendary" className="cursor-pointer">
                    Autoriser les Pokémon légendaires
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mega"
                    checked={criteria.includeMega}
                    onCheckedChange={(checked) => 
                      setCriteria({ ...criteria, includeMega: checked as boolean })
                    }
                  />
                  <Label htmlFor="mega" className="cursor-pointer">
                    Autoriser les Méga-Évolutions
                  </Label>
                </div>
              </div>

              {/* Description libre */}
              <div className="space-y-2">
                <Label htmlFor="description">Instructions supplémentaires (Optionnel)</Label>
                <Input
                  id="description"
                  placeholder="Ex: Je veux une équipe avec Charizard, axée sur le type Feu..."
                  value={criteria.description || ''}
                  onChange={(e) => setCriteria({ ...criteria, description: e.target.value })}
                />
              </div>

              {/* Bouton générer */}
              <Button
                onClick={handleCreateTeams}
                disabled={loading}
                size="lg"
                className="w-full gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Générer 3 Équipes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Propositions */}
          {proposals.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Propositions Générées
              </h3>
              <div className="grid gap-4">
                {proposals.map((proposal, index) => (
                  <TeamProposalCard
                    key={index}
                    proposal={proposal}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ========== ANALYSE ========== */}
        <TabsContent value="analyze" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Analyser une Équipe
              </CardTitle>
              <CardDescription>
                Obtenez une analyse détaillée des forces et faiblesses de votre équipe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team-select">Sélectionnez une équipe</Label>
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                  <SelectTrigger id="team-select">
                    <SelectValue placeholder="Choisir une équipe..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name} ({team.pokemon.length}/6 Pokémon)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAnalyzeTeam}
                disabled={loading || !selectedTeamId}
                size="lg"
                className="w-full gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-5 w-5" />
                    Analyser l'Équipe
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Résultats d'analyse */}
          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle>Résultats de l'Analyse</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Scores */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {analysis.coverageScore}%
                    </div>
                    <div className="text-sm text-muted-foreground">Couverture de types</div>
                  </div>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {analysis.balanceScore}%
                    </div>
                    <div className="text-sm text-muted-foreground">Équilibre global</div>
                  </div>
                </div>

                {/* Forces */}
                <div>
                  <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                    ✅ Forces
                  </h4>
                  <ul className="space-y-1">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="text-sm">• {s}</li>
                    ))}
                  </ul>
                </div>

                {/* Faiblesses */}
                <div>
                  <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                    ⚠️ Faiblesses
                  </h4>
                  <ul className="space-y-1">
                    {analysis.weaknesses.map((w, i) => (
                      <li key={i} className="text-sm">• {w}</li>
                    ))}
                  </ul>
                </div>

                {/* Recommandations */}
                <div>
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                    💡 Recommandations
                  </h4>
                  <ul className="space-y-1">
                    {analysis.recommendations.map((r, i) => (
                      <li key={i} className="text-sm">• {r}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ========== OPTIMISATION ========== */}
        <TabsContent value="optimize" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Optimiser une Équipe
              </CardTitle>
              <CardDescription>
                Obtenez des suggestions pour améliorer votre équipe existante
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team-optimize">Sélectionnez une équipe</Label>
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                  <SelectTrigger id="team-optimize">
                    <SelectValue placeholder="Choisir une équipe..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name} ({team.pokemon.length}/6 Pokémon)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleOptimizeTeam}
                disabled={loading || !selectedTeamId}
                size="lg"
                className="w-full gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Optimisation en cours...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-5 w-5" />
                    Optimiser l'Équipe
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Propositions d'optimisation */}
          {optimizations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Propositions d'Optimisation
              </h3>
              <div className="grid gap-4">
                {optimizations.map((proposal, index) => (
                  <TeamProposalCard
                    key={index}
                    proposal={proposal}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
