'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBackendPokemon } from '@/hooks/use-backend-api'
import { Swords, Loader2 } from 'lucide-react'

export default function BattlePage() {
  const [pokemon1Id, setPokemon1Id] = useState<number>(25)
  const [pokemon2Id, setPokemon2Id] = useState<number>(6)
  const [battleResult, setBattleResult] = useState<any>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  const { pokemon: pokemon1 } = useBackendPokemon(pokemon1Id)
  const { pokemon: pokemon2 } = useBackendPokemon(pokemon2Id)

  const simulateBattle = () => {
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

      setBattleResult({ winner, damage1to2, damage2to1 })
      setIsSimulating(false)
    }, 1000)
  }

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
            Simulez un combat entre deux Pokémon
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Premier combattant</CardTitle>
            </CardHeader>
            <CardContent>
              <Label>ID du Pokémon</Label>
              <Input
                type="number"
                value={pokemon1Id}
                onChange={(e) => setPokemon1Id(parseInt(e.target.value) || 1)}
                min="1"
                max="898"
              />
              {pokemon1 && (
                <div className="mt-4 text-center">
                  <img
                    src={pokemon1.artwork || pokemon1.sprite}
                    alt={pokemon1.name}
                    className="w-48 h-48 mx-auto"
                  />
                  <h3 className="text-xl font-bold capitalize">{pokemon1.name}</h3>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Second combattant</CardTitle>
            </CardHeader>
            <CardContent>
              <Label>ID du Pokémon</Label>
              <Input
                type="number"
                value={pokemon2Id}
                onChange={(e) => setPokemon2Id(parseInt(e.target.value) || 1)}
                min="1"
                max="898"
              />
              {pokemon2 && (
                <div className="mt-4 text-center">
                  <img
                    src={pokemon2.artwork || pokemon2.sprite}
                    alt={pokemon2.name}
                    className="w-48 h-48 mx-auto"
                  />
                  <h3 className="text-xl font-bold capitalize">{pokemon2.name}</h3>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-center mb-8">
          <Button
            onClick={simulateBattle}
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

        {battleResult && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Résultat du combat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-3xl font-bold">
                  🏆 Victoire de <span className="capitalize">{battleResult.winner}</span> !
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="font-semibold capitalize">{pokemon1?.name}</p>
                    <p className="text-sm text-muted-foreground">Dégâts infligés</p>
                    <p className="text-2xl font-bold">{battleResult.damage1to2}</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="font-semibold capitalize">{pokemon2?.name}</p>
                    <p className="text-sm text-muted-foreground">Dégâts infligés</p>
                    <p className="text-2xl font-bold">{battleResult.damage2to1}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
