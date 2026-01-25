'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Plus, X, ArrowUpDown, Loader2, Swords } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { TypeBadge } from '@/components/pokemon/type-badge'
import { SearchBar } from '@/components/pokemon/search-bar'
import { Button } from '@/components/ui/button'
import { usePokemon, usePokemonList } from '@/hooks/use-pokemon'
import { useTeam } from '@/hooks/use-team'
import {
  formatPokemonName,
  formatPokemonId,
  formatStatName,
  getPokemonImage,
  STAT_COLORS,
} from '@/lib/pokemon'
import type { Pokemon } from '@/lib/pokemon'
import { cn } from '@/lib/utils'

interface CompareSlotProps {
  pokemonName: string | null
  onSelect: (name: string) => void
  onClear: () => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  showSearch: boolean
  setShowSearch: (show: boolean) => void
}

function CompareSlot({
  pokemonName,
  onSelect,
  onClear,
  searchQuery,
  setSearchQuery,
  showSearch,
  setShowSearch,
}: CompareSlotProps) {
  const { pokemon, isLoading } = usePokemon(pokemonName || '')
  const { pokemon: allPokemon } = usePokemonList(151)
  const { team } = useTeam()

  const filteredPokemon = useMemo(() => {
    if (!searchQuery) return allPokemon.slice(0, 20)
    return allPokemon.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 20)
  }, [allPokemon, searchQuery])

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!pokemonName || !pokemon) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 min-h-[400px]">
        {showSearch ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search Pokemon..."
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Team quick select */}
            {team.length > 0 && !searchQuery && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">From your team:</p>
                <div className="flex flex-wrap gap-2">
                  {team.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelect(p.name)
                        setShowSearch(false)
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                      <Image
                        src={p.image || '/placeholder.svg'}
                        alt={p.name}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                      <span className="text-sm font-medium text-foreground">
                        {formatPokemonName(p.name)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search results */}
            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
              {filteredPokemon.map(p => (
                <button
                  key={p.name}
                  onClick={() => {
                    onSelect(p.name)
                    setShowSearch(false)
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left"
                >
                  <span className="text-sm font-medium text-foreground capitalize">
                    {formatPokemonName(p.name)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            className="w-full h-full min-h-[350px] flex flex-col items-center justify-center gap-4 border-2 border-dashed border-border rounded-xl hover:border-primary/50 hover:bg-secondary/30 transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <span className="text-muted-foreground font-medium">
              Select Pokemon
            </span>
          </button>
        )}
      </div>
    )
  }

  const imageUrl = getPokemonImage(pokemon)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      <div className="relative p-6 bg-secondary/30">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          onClick={onClear}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex flex-col items-center">
          <Image
            src={imageUrl || '/placeholder.svg'}
            alt={pokemon.name}
            width={150}
            height={150}
            className="object-contain"
          />
          <p className="text-sm font-mono text-muted-foreground mt-2">
            {formatPokemonId(pokemon.id)}
          </p>
          <h3 className="text-xl font-bold text-foreground">
            {formatPokemonName(pokemon.name)}
          </h3>
          <div className="flex gap-1 mt-2">
            {pokemon.types.map(t => (
              <TypeBadge key={t.type.name} type={t.type.name} size="sm" />
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-secondary/50 rounded-lg p-2 text-center">
            <p className="text-muted-foreground">Height</p>
            <p className="font-semibold text-foreground">{(pokemon.height / 10).toFixed(1)}m</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-2 text-center">
            <p className="text-muted-foreground">Weight</p>
            <p className="font-semibold text-foreground">{(pokemon.weight / 10).toFixed(1)}kg</p>
          </div>
        </div>

        <div className="text-sm text-center bg-secondary/50 rounded-lg p-2">
          <p className="text-muted-foreground">Base Stat Total</p>
          <p className="font-bold text-lg text-primary">
            {pokemon.stats.reduce((acc, s) => acc + s.base_stat, 0)}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function StatComparison({ pokemon1, pokemon2 }: { pokemon1: Pokemon | null; pokemon2: Pokemon | null }) {
  if (!pokemon1 && !pokemon2) return null

  const stats = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed']

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <ArrowUpDown className="h-5 w-5 text-primary" />
        Stats Comparison
      </h2>

      <div className="space-y-4">
        {stats.map(statName => {
          const stat1 = pokemon1?.stats.find(s => s.stat.name === statName)?.base_stat || 0
          const stat2 = pokemon2?.stats.find(s => s.stat.name === statName)?.base_stat || 0
          const maxStat = Math.max(stat1, stat2, 1)
          const winner = stat1 > stat2 ? 1 : stat2 > stat1 ? 2 : 0

          return (
            <div key={statName} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className={cn(
                  "font-medium",
                  winner === 1 && "text-primary"
                )}>
                  {stat1}
                </span>
                <span className="text-muted-foreground font-medium">
                  {formatStatName(statName)}
                </span>
                <span className={cn(
                  "font-medium",
                  winner === 2 && "text-primary"
                )}>
                  {stat2}
                </span>
              </div>
              <div className="flex gap-1 h-3">
                <div className="flex-1 flex justify-end">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stat1 / maxStat) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      "h-full rounded-l-full",
                      STAT_COLORS[statName] || 'bg-primary',
                      winner === 1 ? 'opacity-100' : 'opacity-50'
                    )}
                  />
                </div>
                <div className="flex-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stat2 / maxStat) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      "h-full rounded-r-full",
                      STAT_COLORS[statName] || 'bg-primary',
                      winner === 2 ? 'opacity-100' : 'opacity-50'
                    )}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Total comparison */}
      {pokemon1 && pokemon2 && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {pokemon1.stats.reduce((acc, s) => acc + s.base_stat, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div className="px-4">
              <Swords className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {pokemon2.stats.reduce((acc, s) => acc + s.base_stat, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default function ComparePage() {
  const [pokemon1Name, setPokemon1Name] = useState<string | null>(null)
  const [pokemon2Name, setPokemon2Name] = useState<string | null>(null)
  const [search1, setSearch1] = useState('')
  const [search2, setSearch2] = useState('')
  const [showSearch1, setShowSearch1] = useState(false)
  const [showSearch2, setShowSearch2] = useState(false)

  const { pokemon: pokemon1 } = usePokemon(pokemon1Name || '')
  const { pokemon: pokemon2 } = usePokemon(pokemon2Name || '')

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center justify-center gap-3">
            <Swords className="h-8 w-8 text-primary" />
            Compare Pokemon
          </h1>
          <p className="text-muted-foreground mt-2">
            Select two Pokemon to compare their stats side by side
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <CompareSlot
            pokemonName={pokemon1Name}
            onSelect={setPokemon1Name}
            onClear={() => setPokemon1Name(null)}
            searchQuery={search1}
            setSearchQuery={setSearch1}
            showSearch={showSearch1}
            setShowSearch={setShowSearch1}
          />
          <CompareSlot
            pokemonName={pokemon2Name}
            onSelect={setPokemon2Name}
            onClear={() => setPokemon2Name(null)}
            searchQuery={search2}
            setSearchQuery={setSearch2}
            showSearch={showSearch2}
            setShowSearch={setShowSearch2}
          />
        </div>

        {/* Stats Comparison */}
        {(pokemon1 || pokemon2) && (
          <StatComparison pokemon1={pokemon1 || null} pokemon2={pokemon2 || null} />
        )}
      </main>
    </div>
  )
}
