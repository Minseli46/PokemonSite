'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { SearchBar } from '@/components/pokemon/search-bar'
import { FilterPanel } from '@/components/pokemon/filter-panel'
import { PokemonGrid } from '@/components/pokemon/pokemon-grid'
import { TeamPreview } from '@/components/pokemon/team-preview'
import { usePokemonByType } from '@/hooks/use-pokemon'
import { useTeam } from '@/hooks/use-team'
import { AlertCircle, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null)

  const { pokemonList: typePokemon, isLoading: typeLoading } = usePokemonByType(selectedType || '')
  const { currentTeamId, getTeam } = useTeam()
  
  const currentTeam = currentTeamId ? getTeam(currentTeamId) : null

  const filteredByType = useMemo(() => {
    if (!selectedType || typeLoading) return undefined
    return typePokemon.map(p => ({ name: p.name, url: p.url }))
  }, [selectedType, typePokemon, typeLoading])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Indicateur équipe active */}
        {!currentTeamId && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Aucune équipe sélectionnée. Créez ou sélectionnez une équipe pour ajouter des Pokémon.
              </p>
            </div>
            <Link href="/teams">
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="h-4 w-4" />
                Gérer mes équipes
              </Button>
            </Link>
          </div>
        )}
        
        {currentTeam && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <p className="text-sm">
                Équipe active : <strong>{currentTeam.name}</strong> ({currentTeam.pokemon.length}/6 Pokémon)
              </p>
            </div>
            <Link href="/teams">
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="h-4 w-4" />
                Gérer mes équipes
              </Button>
            </Link>
          </div>
        )}
        
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
            Explorez le Monde des Pokémon
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Découvrez tous les Pokémon, créez l'équipe de vos rêves, comparez les statistiques et testez vos connaissances avec notre Pokédex interactif.
          </p>
        </section>

        {/* Search & Filters */}
        <section className="flex flex-col sm:flex-row gap-4 mb-8">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher par nom ou numéro..."
          />
          <FilterPanel
            selectedType={selectedType}
            selectedGeneration={selectedGeneration}
            onTypeChange={setSelectedType}
            onGenerationChange={setSelectedGeneration}
          />
        </section>

        {/* Pokemon Grid */}
        <PokemonGrid
          searchQuery={searchQuery}
          selectedType={selectedType}
          selectedGeneration={selectedGeneration}
          filteredPokemon={filteredByType}
        />
      </main>

      {/* Team Preview */}
      <TeamPreview />
    </div>
  )
}
