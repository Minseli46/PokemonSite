'use client'

import { use, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Plus, Check, Ruler, Weight, Sparkles, Loader2 } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { TypeBadge } from '@/components/pokemon/type-badge'
import { StatsChart } from '@/components/pokemon/stats-chart'
import { EvolutionChainDisplay } from '@/components/pokemon/evolution-chain'
import { WeaknessChart } from '@/components/pokemon/weakness-chart'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePokemon, usePokemonSpecies } from '@/hooks/use-pokemon'
import { useTeam, type TeamPokemon } from '@/hooks/use-team'
import { formatPokemonId, formatPokemonName, getPokemonImage, TYPE_COLORS } from '@/lib/pokemon'
import { cn } from '@/lib/utils'

export default function PokemonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const pokemonId = parseInt(id, 10)
  const { pokemon, isLoading, error } = usePokemon(pokemonId)
  const { species, isLoading: speciesLoading } = usePokemonSpecies(pokemonId)
  const { addToTeam, removeFromTeam, isInTeam } = useTeam()
  const [imageLoaded, setImageLoaded] = useState(false)

  if (isLoading || speciesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error || !pokemon) {
    notFound()
  }

  const primaryType = pokemon.types[0]?.type.name || 'normal'
  const imageUrl = getPokemonImage(pokemon)
  const inTeam = isInTeam(pokemon.id)

  const flavorText = species?.flavor_text_entries
    .find(entry => entry.language.name === 'en')
    ?.flavor_text.replace(/\f/g, ' ')

  const genus = species?.genera.find(g => g.language.name === 'en')?.genus

  const handleTeamAction = () => {
    if (inTeam) {
      removeFromTeam(pokemon.id)
    } else {
      const teamPokemon: TeamPokemon = {
        id: pokemon.id,
        name: pokemon.name,
        image: imageUrl,
        types: pokemon.types.map(t => t.type.name),
      }
      addToTeam(teamPokemon)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Pokedex
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            {pokemonId > 1 && (
              <Link href={`/pokemon/${pokemonId - 1}`}>
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {pokemonId < 1025 && (
              <Link href={`/pokemon/${pokemonId + 1}`}>
                <Button variant="outline" size="icon">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Image & Basic Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Pokemon Card */}
            <div className={cn(
              "relative rounded-3xl p-8 overflow-hidden",
              "bg-card border border-border"
            )}>
              {/* Background Type Color */}
              <div className={cn(
                "absolute inset-0 opacity-10",
                TYPE_COLORS[primaryType]
              )} />

              {/* Pokemon Number */}
              <div className="relative">
                <span className="text-6xl md:text-8xl font-bold text-foreground/5 absolute -top-4 -left-2">
                  {formatPokemonId(pokemon.id)}
                </span>
              </div>

              {/* Pokemon Image */}
              <div className="relative aspect-square flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {imageUrl && (
                    <Image
                      src={imageUrl || "/placeholder.svg"}
                      alt={pokemon.name}
                      width={400}
                      height={400}
                      className={cn(
                        "object-contain drop-shadow-2xl transition-opacity",
                        imageLoaded ? "opacity-100" : "opacity-0"
                      )}
                      onLoad={() => setImageLoaded(true)}
                      priority
                    />
                  )}
                </motion.div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Ruler className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Height</p>
                  <p className="font-semibold text-foreground">{(pokemon.height / 10).toFixed(1)} m</p>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Weight className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-semibold text-foreground">{(pokemon.weight / 10).toFixed(1)} kg</p>
                </div>
              </div>
            </div>

            {/* Abilities */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Abilities
              </h3>
              <div className="flex flex-wrap gap-2">
                {pokemon.abilities.map(({ ability, is_hidden }) => (
                  <span
                    key={ability.name}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium",
                      is_hidden
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-secondary text-foreground"
                    )}
                  >
                    {formatPokemonName(ability.name)}
                    {is_hidden && <span className="ml-1 text-xs">(Hidden)</span>}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-mono text-muted-foreground">
                  {formatPokemonId(pokemon.id)}
                </p>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  {formatPokemonName(pokemon.name)}
                </h1>
                {genus && (
                  <p className="text-muted-foreground mt-1">{genus}</p>
                )}
              </div>
              <Button
                onClick={handleTeamAction}
                variant={inTeam ? "default" : "outline"}
                className="gap-2"
              >
                {inTeam ? (
                  <>
                    <Check className="h-4 w-4" />
                    In Team
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add to Team
                  </>
                )}
              </Button>
            </div>

            {/* Types */}
            <div className="flex gap-2">
              {pokemon.types.map(({ type }) => (
                <TypeBadge key={type.name} type={type.name} size="lg" />
              ))}
            </div>

            {/* Description */}
            {flavorText && (
              <p className="text-muted-foreground leading-relaxed">
                {flavorText}
              </p>
            )}

            {/* Tabs */}
            <Tabs defaultValue="stats" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="stats">Stats</TabsTrigger>
                <TabsTrigger value="evolution">Evolution</TabsTrigger>
                <TabsTrigger value="weakness">Weakness</TabsTrigger>
              </TabsList>
              
              <TabsContent value="stats" className="mt-6">
                <div className="bg-card border border-border rounded-xl p-6">
                  <StatsChart stats={pokemon.stats} />
                </div>
              </TabsContent>

              <TabsContent value="evolution" className="mt-6">
                <div className="bg-card border border-border rounded-xl p-6">
                  <EvolutionChainDisplay
                    evolutionChainUrl={species?.evolution_chain.url || null}
                  />
                </div>
              </TabsContent>

              <TabsContent value="weakness" className="mt-6">
                <div className="bg-card border border-border rounded-xl p-6">
                  <WeaknessChart types={pokemon.types.map(t => t.type.name)} />
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
