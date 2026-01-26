'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBackendPokemon } from '@/hooks/use-backend-api'
import { useTeam } from '@/hooks/use-team'
import { Swords, Loader2, Users, Zap } from 'lucide-react'
import { formatPokemonName } from '@/lib/pokemon'

type BattleMode = 'pokemon' | 'team'

export default function BattlePage() {
  const { teams, currentTeamId, getTeam } = useTeam()
  const [battleMode, setBattleMode] = useState<BattleMode>('pokemon')
  
  // Récupérer l'équipe actuelle pour le combat Pokémon vs Pokémon
  const currentTeam = currentTeamId ? getTeam(currentTeamId) : null
  
  // Combat Pokémon vs Pokémon
  const [pokemon1Id, setPokemon1Id] = useState<number>(currentTeam?.pokemon[0]?.id || 25)
  const [pokemon2Id, setPokemon2Id] = useState<number>(currentTeam?.pokemon[1]?.id || 6)
  const { pokemon: pokemon1 } = useBackendPokemon(pokemon1Id)
  const { pokemon: pokemon2 } = useBackendPokemon(pokemon2Id)
  
  // Combat Équipe vs Équipe
  const [team1Id, setTeam1Id] = useState<string | null>(teams[0]?.id || null)
  const [team2Id, setTeam2Id] = useState<string | null>(teams[1]?.id || null)
  
  const [battleResult, setBattleResult] = useState<any>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  const simulatePokemonBattle = () => {
    if (!pokemon1 || !pokemon2) return

    setIsSimulating(true)
    setTimeout(() => {
      const p1Attack = pokemon1.stats.find(s => s.stat.name === 'attack')?.base_stat || 50
      const p1Defense = pokemon1.stats.find(s => s.stat.name === 'defense')?.base_stat || 50
      const p2Attack = pokemon2.stats.find(s => s.stat.name === 'attack')?.base_stat || 50
      const p2Defense = pokemon2.stats.find(s => s.stat.name === 'defense')?.base_stat || 50

      const damage1to2 = Math.max(1, Math.floor((p1Attack / p2Defense) * 50))
      const damage2to1 = Math.max(1, Math.floor((p2Attack / p1Defense) * 50))

      const p1HP = pokemon1.stats.find(s => s.stat.name === 'hp')?.base_stat || 100
      const p2HP = pokemon2.stats.find(s => s.stat.name === 'hp')?.base_stat || 100

      const turnsToDefeat1 = Math.ceil(p1HP / damage2to1)
      const turnsToDefeat2 = Math.ceil(p2HP / damage1to2)

      const winner = turnsToDefeat2 < turnsToDefeat1 ? pokemon1.name : pokemon2.name

      setBattleResult({ 
        type: 'pokemon',
        winner, 
        damage1to2, 
        damage2to1,
        fighter1: pokemon1.name,
        fighter2: pokemon2.name
      })
      setIsSimulating(false)
    }, 1000)
  }

  const simulateTeamBattle = () => {
    if (!team1Id || !team2Id) return
    
    const selectedTeam1 = teams.find(t => t.id === team1Id)
    const selectedTeam2 = teams.find(t => t.id === team2Id)
    
    if (!selectedTeam1 || !selectedTeam2) return
    if (selectedTeam1.pokemon.length === 0 || selectedTeam2.pokemon.length === 0) return

    setIsSimulating(true)
    setTimeout(() => {
      // Calcul simple : moyenne des stats d'attaque/défense de l'équipe
      const team1Power = selectedTeam1.pokemon.length * 50
      const team2Power = selectedTeam2.pokemon.length * 50
      
      const winner = team1Power >= team2Power ? selectedTeam1.name : selectedTeam2.name
      const winnerPokemon = team1Power >= team2Power ? selectedTeam1.pokemon.length : selectedTeam2.pokemon.length
      const loserPokemon = team1Power < team2Power ? selectedTeam1.pokemon.length : selectedTeam2.pokemon.length

      setBattleResult({
        type: 'team',
        winner,
        team1: selectedTeam1.name,
        team2: selectedTeam2.name,
        team1Pokemon: selectedTeam1.pokemon.length,
        team2Pokemon: selectedTeam2.pokemon.length,
        winnerPokemon,
        loserPokemon
      })
      setIsSimulating(false)
    }, 2000)
  }

  const team1 = teams.find(t => t.id === team1Id)
  const team2 = teams.find(t => t.id === team2Id)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
            <Swords className="w-10 h-10" />
            Simulateur de Combat
          </h1>
          <p className="text-muted-foreground">
            Simulez un combat entre Pokémon ou entre équipes
          </p>
        </div>

        <Tabs value={battleMode} onValueChange={(v) => setBattleMode(v as BattleMode)} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="pokemon" className="gap-2">
              <Zap className="h-4 w-4" />
              Pokémon vs Pokémon
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4" />
              Équipe vs Équipe
            </TabsTrigger>
          </TabsList>

          {/* Combat Pokémon vs Pokémon */}
          <TabsContent value="pokemon">
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Premier combattant</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentTeam && currentTeam.pokemon.length > 0 && (
                    <div className="mb-4">
                      <Label>Choisir depuis l'équipe actuelle ({currentTeam.name})</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {currentTeam.pokemon.map((pokemon) => (
                          <button
                            key={pokemon.id}
                            onClick={() => setPokemon1Id(pokemon.id)}
                            className={`p-2 border rounded-lg hover:border-primary transition-colors ${
                              pokemon1Id === pokemon.id ? 'border-primary bg-primary/10' : 'border-border'
                            }`}
                          >
                            <img
                              src={pokemon.image}
                              alt={pokemon.name}
                              className="w-full h-16 object-contain"
                            />
                            <p className="text-xs mt-1 capitalize truncate">{formatPokemonName(pokemon.name)}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <Label>Ou entrez un ID</Label>
                  <Input
                    type="number"
                    value={pokemon1Id}
                    onChange={(e) => setPokemon1Id(parseInt(e.target.value) || 1)}
                    min="1"
                    max="1025"
                  />
                  {pokemon1 && (
                    <div className="mt-4 text-center">
                      <img
                        src={pokemon1.artwork || pokemon1.sprite}
                        alt={pokemon1.name}
                        className="w-48 h-48 mx-auto"
                      />
                      <h3 className="text-xl font-bold capitalize">{formatPokemonName(pokemon1.name)}</h3>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Second combattant</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentTeam && currentTeam.pokemon.length > 0 && (
                    <div className="mb-4">
                      <Label>Choisir depuis l'équipe actuelle ({currentTeam.name})</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {currentTeam.pokemon.map((pokemon) => (
                          <button
                            key={pokemon.id}
                            onClick={() => setPokemon2Id(pokemon.id)}
                            className={`p-2 border rounded-lg hover:border-primary transition-colors ${
                              pokemon2Id === pokemon.id ? 'border-primary bg-primary/10' : 'border-border'
                            }`}
                          >
                            <img
                              src={pokemon.image}
                              alt={pokemon.name}
                              className="w-full h-16 object-contain"
                            />
                            <p className="text-xs mt-1 capitalize truncate">{formatPokemonName(pokemon.name)}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <Label>Ou entrez un ID</Label>
                  <Input
                    type="number"
                    value={pokemon2Id}
                    onChange={(e) => setPokemon2Id(parseInt(e.target.value) || 1)}
                    min="1"
                    max="1025"
                  />
                  {pokemon2 && (
                    <div className="mt-4 text-center">
                      <img
                        src={pokemon2.artwork || pokemon2.sprite}
                        alt={pokemon2.name}
                        className="w-48 h-48 mx-auto"
                      />
                      <h3 className="text-xl font-bold capitalize">{formatPokemonName(pokemon2.name)}</h3>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="text-center mb-8">
              <Button
                onClick={simulatePokemonBattle}
                disabled={!pokemon1 || !pokemon2 || isSimulating}
                size="lg"
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Combat en cours...
                  </>
                ) : (
                  <>
                    <Swords className="mr-2 h-4 w-4" />
                    Lancer le combat
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Combat Équipe vs Équipe */}
          <TabsContent value="team">
            {teams.length < 2 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Pas assez d'équipes</h3>
                  <p className="text-muted-foreground mb-4">
                    Créez au moins 2 équipes pour faire un combat d'équipe
                  </p>
                  <Button onClick={() => window.location.href = '/teams'}>
                    Créer des équipes
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 mb-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Première équipe</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Label htmlFor="team1-select">Sélectionnez une équipe</Label>
                      <select
                        id="team1-select"
                        aria-label="Sélectionnez la première équipe"
                        className="w-full mt-2 p-2 border rounded-lg bg-background"
                        value={team1Id || ''}
                        onChange={(e) => setTeam1Id(e.target.value)}
                      >
                        <option value="">Choisir une équipe...</option>
                        {teams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.pokemon.length}/6)
                          </option>
                        ))}
                      </select>
                      {team1 && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">{team1.name}</h4>
                          <div className="grid grid-cols-3 gap-2">
                            {team1.pokemon.map((p) => (
                              <div key={p.id} className="text-center">
                                <img src={p.image} alt={p.name} className="w-full h-16 object-contain" />
                                <p className="text-xs truncate">{formatPokemonName(p.name)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Deuxième équipe</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Label htmlFor="team2-select">Sélectionnez une équipe</Label>
                      <select
                        id="team2-select"
                        aria-label="Sélectionnez la deuxième équipe"
                        className="w-full mt-2 p-2 border rounded-lg bg-background"
                        value={team2Id || ''}
                        onChange={(e) => setTeam2Id(e.target.value)}
                      >
                        <option value="">Choisir une équipe...</option>
                        {teams.filter(t => t.id !== team1Id).map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.pokemon.length}/6)
                          </option>
                        ))}
                      </select>
                      {team2 && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">{team2.name}</h4>
                          <div className="grid grid-cols-3 gap-2">
                            {team2.pokemon.map((p) => (
                              <div key={p.id} className="text-center">
                                <img src={p.image} alt={p.name} className="w-full h-16 object-contain" />
                                <p className="text-xs truncate">{formatPokemonName(p.name)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center mb-8">
                  <Button
                    onClick={simulateTeamBattle}
                    disabled={!team1Id || !team2Id || isSimulating || team1?.pokemon.length === 0 || team2?.pokemon.length === 0}
                    size="lg"
                  >
                    {isSimulating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Combat en cours...
                      </>
                    ) : (
                      <>
                        <Users className="mr-2 h-4 w-4" />
                        Lancer le combat d'équipe
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Résultats */}
        {battleResult && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Résultat du combat</CardTitle>
            </CardHeader>
            <CardContent>
              {battleResult.type === 'pokemon' ? (
                <div className="text-center space-y-4">
                  <p className="text-3xl font-bold">
                    🏆 Victoire de <span className="capitalize">{formatPokemonName(battleResult.winner)}</span> !
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="font-semibold capitalize">{formatPokemonName(battleResult.fighter1)}</p>
                      <p className="text-sm text-muted-foreground">Dégâts infligés</p>
                      <p className="text-2xl font-bold">{battleResult.damage1to2}</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="font-semibold capitalize">{formatPokemonName(battleResult.fighter2)}</p>
                      <p className="text-sm text-muted-foreground">Dégâts infligés</p>
                      <p className="text-2xl font-bold">{battleResult.damage2to1}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-3xl font-bold">
                    🏆 Victoire de l'équipe <span className="capitalize">{battleResult.winner}</span> !
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="font-semibold">{battleResult.team1}</p>
                      <p className="text-sm text-muted-foreground">Pokémon</p>
                      <p className="text-2xl font-bold">{battleResult.team1Pokemon}</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="font-semibold">{battleResult.team2}</p>
                      <p className="text-sm text-muted-foreground">Pokémon</p>
                      <p className="text-2xl font-bold">{battleResult.team2Pokemon}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
