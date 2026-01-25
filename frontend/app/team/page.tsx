'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, ExternalLink, BarChart3, Box, Users, Sparkles } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { TypeBadge } from '@/components/pokemon/type-badge'
import { Button } from '@/components/ui/button'
import { useTeam } from '@/hooks/use-team'
import { formatPokemonName, formatPokemonId } from '@/lib/pokemon'

// Dynamic import for 3D scene to avoid SSR issues
const Team3DScene = dynamic(
  () => import('@/components/team/team-3d-scene').then(mod => mod.Team3DScene),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] md:h-[600px] rounded-2xl bg-secondary flex items-center justify-center">
        <p className="text-muted-foreground">Loading 3D Scene...</p>
      </div>
    )
  }
)

export default function TeamPage() {
  const { team, removeFromTeam, clearTeam } = useTeam()
  const [viewMode, setViewMode] = useState<'3d' | 'list'>('3d')

  // Calculate team type coverage
  const typeCoverage = team.reduce((acc, pokemon) => {
    pokemon.types.forEach(type => {
      acc[type] = (acc[type] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Votre Équipe
            </h1>
            <p className="text-muted-foreground mt-1">
              {team.length}/6 Pokémon sélectionnés
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === '3d' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('3d')}
                className="rounded-none gap-2"
              >
                <Box className="h-4 w-4" />
                Vue 3D
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Vue Liste
              </Button>
            </div>

            {team.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={clearTeam}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Vider l'équipe
              </Button>
            )}
          </div>
        </div>

        {team.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
              <Users className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Aucun Pokémon dans votre équipe
            </h2>
            <p className="text-muted-foreground mb-6">
              Commencez à ajouter des Pokémon depuis le Pokédex pour créer votre équipe de rêve !
            </p>
            <Link href="/">
              <Button className="gap-2">
                <Sparkles className="h-4 w-4" />
                Parcourir les Pokémon
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* 3D View */}
            {viewMode === '3d' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <Team3DScene team={team} />
              </motion.div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
              >
                <AnimatePresence>
                  {team.map((pokemon, index) => (
                    <motion.div
                      key={pokemon.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
                    >
                      <div className="relative w-20 h-20 rounded-lg bg-secondary/50 flex items-center justify-center">
                        <Image
                          src={pokemon.image || '/placeholder.svg'}
                          alt={pokemon.name}
                          width={80}
                          height={80}
                          className="object-contain"
                        />
                        <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-muted-foreground">
                          {formatPokemonId(pokemon.id)}
                        </p>
                        <h3 className="font-semibold text-foreground truncate">
                          {formatPokemonName(pokemon.name)}
                        </h3>
                        <div className="flex gap-1 mt-1">
                          {pokemon.types.map(type => (
                            <TypeBadge key={type} type={type} size="sm" />
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <Link href={`/pokemon/${pokemon.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeFromTeam(pokemon.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Type Coverage */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Type Coverage
              </h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(typeCoverage).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-2">
                    <TypeBadge type={type} size="sm" />
                    <span className="text-sm text-muted-foreground">x{count}</span>
                  </div>
                ))}
              </div>
              {Object.keys(typeCoverage).length === 0 && (
                <p className="text-muted-foreground">Add Pokemon to see type coverage</p>
              )}
            </motion.div>

            {/* Compare Button */}
            {team.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 text-center"
              >
                <Link href="/compare">
                  <Button size="lg" className="gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Compare Team Pokemon
                  </Button>
                </Link>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
