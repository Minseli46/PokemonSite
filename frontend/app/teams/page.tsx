'use client'

import { useState, useCallback, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Trash2, Edit2, Check, X, Users, Swords, 
  ChevronRight, Sparkles, Bot, Shield, Loader2, Wand2, Search, Zap
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { TypeBadge } from '@/components/pokemon/type-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTeam, type Team } from '@/hooks/use-team'
import { formatPokemonName, formatPokemonId } from '@/lib/pokemon'
import { useAgentAction } from '@/hooks/use-agent-action'
import type { AgentAction, TeamProposalAction } from '@/hooks/use-agent'
import { cn } from '@/lib/utils'

export default function TeamsPage() {
  const { teams, currentTeamId, createTeam, deleteTeam, renameTeam, selectTeam, removePokemonFromTeam, addPokemonToTeam } = useTeam()
  const [newTeamName, setNewTeamName] = useState('')
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // AI-generated team proposals
  const [aiProposals, setAiProposals] = useState<TeamProposalAction['data'][]>([])
  const [createdProposals, setCreatedProposals] = useState<Record<number, boolean>>({})
  const [creatingProposal, setCreatingProposal] = useState<number | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)

  const handleAiActions = useCallback((actions: AgentAction[]) => {
    const teamActions = actions.filter(a => a.type === 'team_proposal') as TeamProposalAction[]
    if (teamActions.length > 0) {
      setAiProposals(teamActions.map(a => a.data))
      setCreatedProposals({})
      setCreatingProposal(null)
    }
  }, [])

  const handleCreateProposal = useCallback(async (proposal: TeamProposalAction['data'], index: number) => {
    if (createdProposals[index] || creatingProposal === index) return
    setCreatingProposal(index)
    try {
      const teamId = createTeam(proposal.name)
      for (const pokemon of proposal.pokemon) {
        if (pokemon.id > 0) {
          addPokemonToTeam(teamId, {
            id: pokemon.id,
            name: pokemon.name,
            image: pokemon.image,
            types: pokemon.types,
          })
        }
      }
      selectTeam(teamId)
      setCreatedProposals(prev => ({ ...prev, [index]: true }))
    } catch (err) {
      console.error('Error creating team:', err)
    } finally {
      setCreatingProposal(null)
    }
  }, [createdProposals, creatingProposal, createTeam, addPokemonToTeam, selectTeam])

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) return
    createTeam(newTeamName.trim())
    setNewTeamName('')
    setIsCreating(false)
  }

  const handleRename = (teamId: string) => {
    if (!editingName.trim()) return
    renameTeam(teamId, editingName.trim())
    setEditingTeamId(null)
    setEditingName('')
  }

  const startEditing = (team: Team) => {
    setEditingTeamId(team.id)
    setEditingName(team.name)
  }

  const currentTeam = teams.find(t => t.id === currentTeamId)

  // Prompt IA contextuel basé sur l'état des équipes — cible l'équipe sélectionnée en priorité
  const autoPrompt = useMemo(() => {
    if (teams.length === 0) {
      return 'L\'utilisateur n\'a aucune équipe. Propose-lui 3 équipes Pokémon variées et équilibrées qu\'il peut créer en un clic. Utilise build_team_proposal pour chaque proposition.'
    }
    // Priorité 1 : l'équipe sélectionnée est incomplète
    if (currentTeam && currentTeam.pokemon.length > 0 && currentTeam.pokemon.length < 6) {
      const pokemonNames = currentTeam.pokemon.map(p => p.name).join(', ')
      return `L'équipe sélectionnée "${currentTeam.name}" est incomplète (${currentTeam.pokemon.length}/6 : ${pokemonNames}). Propose 2 compositions complètes pour cette équipe en gardant ses Pokémon actuels + en ajoutant des compléments optimaux. Utilise build_team_proposal.`
    }
    // Priorité 2 : l'équipe sélectionnée est vide
    if (currentTeam && currentTeam.pokemon.length === 0) {
      return `L'équipe sélectionnée "${currentTeam.name}" est vide (0/6). Propose 3 compositions complètes et variées pour remplir cette équipe. Utilise build_team_proposal.`
    }
    // Priorité 3 : pas d'équipe sélectionnée, mais des équipes vides/incomplètes existent
    const incompleteTeams = teams.filter(t => t.pokemon.length > 0 && t.pokemon.length < 6)
    if (incompleteTeams.length > 0) {
      const details = incompleteTeams.map(t => `"${t.name}" (${t.pokemon.length}/6 : ${t.pokemon.map(p => p.name).join(', ')})`).join(', ')
      return `Équipes incomplètes : ${details}. Propose des compositions complètes pour chacune en gardant leurs Pokémon actuels + en ajoutant des compléments. Utilise build_team_proposal.`
    }
    return undefined // pas d'auto-trigger si tout est complet
  }, [teams, currentTeam])

  // Hook IA contextuel (sans chat)
  const { trigger: triggerAI, isLoading: aiLoading, message: aiMessage, error: aiError } = useAgentAction({
    agent: 'team',
    autoPrompt,
    onActions: handleAiActions,
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Mes Équipes
            </h1>
            <p className="text-muted-foreground mt-1">
              {teams.length} équipe{teams.length > 1 ? 's' : ''} créée{teams.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/battle">
              <Button variant="default" className="gap-2">
                <Swords className="h-4 w-4" />
                Combats
              </Button>
            </Link>
          </div>
        </div>

        {/* Création d'équipe */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Créer une nouvelle équipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>Astuce :</strong> Sélectionnez une équipe en cliquant dessus, puis ajoutez des Pokémon depuis la page d'accueil en cliquant sur le bouton + sur les cartes Pokémon.
              </p>
            </div>
            {!isCreating ? (
              <Button onClick={() => setIsCreating(true)} className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle Équipe
              </Button>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Nom de l'équipe..."
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateTeam()}
                  autoFocus
                />
                <Button onClick={handleCreateTeam} size="icon">
                  <Check className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={() => {
                    setIsCreating(false)
                    setNewTeamName('')
                  }} 
                  size="icon" 
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Liste des équipes */}
        {teams.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
              <Users className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Aucune équipe créée
            </h2>
            <p className="text-muted-foreground mb-6">
              Créez votre première équipe pour commencer !
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {teams.map((team) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className={`overflow-hidden ${currentTeamId === team.id ? 'ring-2 ring-primary' : ''}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        {editingTeamId === team.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleRename(team.id)}
                              className="h-8"
                              autoFocus
                            />
                            <Button 
                              onClick={() => handleRename(team.id)} 
                              size="icon" 
                              className="h-8 w-8"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              onClick={() => setEditingTeamId(null)} 
                              size="icon" 
                              variant="ghost"
                              className="h-8 w-8"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <CardTitle className="text-lg">{team.name}</CardTitle>
                            <div className="flex items-center gap-1">
                              <Button
                                onClick={() => startEditing(team)}
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => deleteTeam(team.id)}
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {team.pokemon.length}/6 Pokémon
                      </p>
                    </CardHeader>
                    <CardContent>
                      {team.pokemon.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-sm text-muted-foreground">Équipe vide</p>
                          <Link href="/">
                            <Button variant="link" className="gap-2 mt-2">
                              <Sparkles className="h-4 w-4" />
                              Ajouter des Pokémon
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {team.pokemon.map((pokemon) => (
                            <div key={pokemon.id} className="relative group">
                              <div className="aspect-square bg-secondary/50 rounded-lg p-2 flex flex-col items-center justify-center">
                                <Image
                                  src={pokemon.image}
                                  alt={pokemon.name}
                                  width={60}
                                  height={60}
                                  className="object-contain"
                                />
                                <p className="text-xs truncate w-full text-center mt-1">
                                  {formatPokemonName(pokemon.name)}
                                </p>
                                <button
                                  onClick={() => removePokemonFromTeam(team.id, pokemon.id)}
                                  className="absolute top-1 right-1 bg-destructive/80 hover:bg-destructive rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3 text-destructive-foreground" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {Array.from({ length: 6 - team.pokemon.length }).map((_, i) => (
                            <div 
                              key={`empty-${i}`} 
                              className="aspect-square bg-secondary/20 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center"
                            >
                              <Plus className="h-6 w-6 text-muted-foreground/40" />
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-4 flex gap-2">
                        <Button
                          onClick={() => selectTeam(team.id)}
                          variant={currentTeamId === team.id ? 'default' : 'outline'}
                          className="flex-1 gap-2"
                          size="sm"
                        >
                          {currentTeamId === team.id ? (
                            <>
                              <Check className="h-4 w-4" />
                              Sélectionnée
                            </>
                          ) : (
                            'Sélectionner'
                          )}
                        </Button>
                        <Link href={`/teams/${team.id}`}>
                          <Button variant="outline" size="sm" className="gap-2">
                            Voir <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* AI-Generated Team Proposals — Main Page Area */}
        {aiProposals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 space-y-6"
          >
            {/* AI Proposals Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    Propositions de l'IA
                    <Sparkles className="h-5 w-5 text-blue-500" />
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {aiProposals.length} équipe{aiProposals.length > 1 ? 's' : ''} proposée{aiProposals.length > 1 ? 's' : ''} — Cliquez pour créer
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAiProposals([])
                  setCreatedProposals({})
                }}
                className="text-muted-foreground hover:text-destructive gap-1"
              >
                <X className="h-4 w-4" />
                Fermer
              </Button>
            </div>

            {/* Proposals Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {aiProposals.map((proposal, idx) => {
                const isCreated = createdProposals[idx]
                const isCreatingThis = creatingProposal === idx

                return (
                  <motion.div
                    key={`ai-proposal-${idx}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      'bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all',
                      isCreated && 'ring-2 ring-green-500/50'
                    )}
                  >
                    {/* Proposal Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                          {idx + 1}
                        </div>
                        <span className="text-base font-semibold text-foreground">
                          {proposal.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {proposal.pokemon.length}/6
                      </div>
                    </div>

                    {/* Description */}
                    <p className="px-4 py-2 text-sm text-muted-foreground leading-relaxed">
                      {proposal.description}
                    </p>

                    {/* Pokémon Grid */}
                    <div className="px-4 py-3 grid grid-cols-3 gap-2">
                      {proposal.pokemon.map((pokemon, i) => (
                        <div
                          key={`${pokemon.id}-${i}`}
                          className="flex flex-col items-center p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          {pokemon.image ? (
                            <div className="relative w-16 h-16">
                              <Image
                                src={pokemon.image}
                                alt={pokemon.name}
                                fill
                                className="object-contain"
                                sizes="64px"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                              <Shield className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <span className="text-xs font-medium text-foreground capitalize mt-1 truncate w-full text-center">
                            {formatPokemonName(pokemon.name)}
                          </span>
                          <div className="flex gap-1 mt-1">
                            {pokemon.types.map(type => (
                              <span
                                key={type}
                                className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground capitalize"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Create Button */}
                    <div className="px-4 py-3 border-t border-border">
                      <Button
                        className={cn(
                          'w-full gap-2',
                          isCreated && 'bg-green-600 hover:bg-green-700'
                        )}
                        onClick={() => handleCreateProposal(proposal, idx)}
                        disabled={isCreated || isCreatingThis}
                      >
                        {isCreated ? (
                          <>
                            <Check className="h-4 w-4" />
                            Équipe créée !
                          </>
                        ) : isCreatingThis ? (
                          'Création...'
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Créer cette équipe
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* AI Team Assistant — Actions contextuelles */}
        <Card className="mt-8 border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <Bot className="h-4 w-4 text-blue-500" />
              </div>
              Assistant IA
              {aiLoading && (
                <span className="flex items-center gap-1.5 text-sm font-normal text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Analyse en cours...
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiError && (
              <p className="text-sm text-destructive mb-3">⚠️ {aiError}</p>
            )}

            {/* Analyse textuelle de l'IA */}
            {(aiMessage || aiAnalysis) && !aiLoading && (
              <div className="mb-4 p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Bot className="h-4 w-4 text-blue-500" />
                    Analyse de l'IA
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAiAnalysis(null)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {aiMessage || aiAnalysis}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-600"
                disabled={aiLoading}
                onClick={() => triggerAI('Propose-moi 3 équipes compétitives variées avec 6 Pokémon chacune. Utilise build_team_proposal pour chaque proposition. Styles : offensive, défensive, équilibrée.')}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Proposer 3 équipes
              </Button>

              {currentTeam && currentTeam.pokemon.length > 0 && currentTeam.pokemon.length < 6 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-green-500/30 hover:bg-green-500/10 hover:text-green-600"
                  disabled={aiLoading}
                  onClick={() => triggerAI(`Mon équipe "${currentTeam.name}" a : ${currentTeam.pokemon.map(p => p.name).join(', ')}. Propose 2 compositions complètes pour la compléter en gardant ces Pokémon. Utilise build_team_proposal.`)}
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  Compléter « {currentTeam.name} »
                </Button>
              )}

              {currentTeam && currentTeam.pokemon.length === 6 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-600"
                  disabled={aiLoading}
                  onClick={() => {
                    setAiAnalysis(null)
                    triggerAI(`Analyse en détail mon équipe "${currentTeam.name}" composée de : ${currentTeam.pokemon.map(p => p.name).join(', ')}.

Étape 1 — ANALYSE DÉTAILLÉE (dans ton message texte) :
- 📊 Couverture des types : utilise calculate_team_coverage pour analyser les forces/faiblesses typiques
- ⚖️ Équilibre : utilise evaluate_team_balance pour évaluer l'équilibre attaque/défense/vitesse
- 🛡️ Forces de l'équipe
- ⚠️ Faiblesses et vulnérabilités
- 🏆 Score global sur 10

Étape 2 — OPTIMISATIONS (après l'analyse) :
Propose 2 alternatives optimisées via build_team_proposal qui corrigent les faiblesses identifiées.

IMPORTANT : Donne d'abord l'analyse complète dans ton message AVANT de proposer les alternatives.`)
                  }}
                >
                  <Search className="h-3.5 w-3.5" />
                  Analyser « {currentTeam.name} »
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-600"
                disabled={aiLoading}
                onClick={() => triggerAI('Propose-moi la meilleure équipe de 6 Pokémon avec une couverture de types parfaite et un bon équilibre attaque/défense. Utilise build_team_proposal.')}
              >
                <Zap className="h-3.5 w-3.5" />
                Meilleure équipe
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
