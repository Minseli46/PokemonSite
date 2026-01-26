'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Trash2, Edit2, Check, X, Users, Swords, 
  ChevronRight, Sparkles 
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { TypeBadge } from '@/components/pokemon/type-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTeam, type Team } from '@/hooks/use-team'
import { formatPokemonName, formatPokemonId } from '@/lib/pokemon'

export default function TeamsPage() {
  const { teams, currentTeamId, createTeam, deleteTeam, renameTeam, selectTeam, removePokemonFromTeam } = useTeam()
  const [newTeamName, setNewTeamName] = useState('')
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

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
      </main>
    </div>
  )
}
