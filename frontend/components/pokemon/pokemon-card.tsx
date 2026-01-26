'use client'

import React from "react"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Check, Loader2 } from 'lucide-react'
import { usePokemon } from '@/hooks/use-pokemon'
import { useTeam, type TeamPokemon } from '@/hooks/use-team'
import { formatPokemonId, formatPokemonName, TYPE_COLORS, getPokemonImage } from '@/lib/pokemon'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PokemonCardProps {
  name: string
  url?: string
}

export function PokemonCard({ name }: PokemonCardProps) {
  const { pokemon, isLoading } = usePokemon(name)
  const { currentTeamId, addPokemonToTeam, removePokemonFromTeam, getTeam } = useTeam()
  const [imageLoaded, setImageLoaded] = useState(false)

  if (isLoading || !pokemon) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-card border border-border">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const currentTeam = currentTeamId ? getTeam(currentTeamId) : null
  const inTeam = currentTeam ? currentTeam.pokemon.some(p => p.id === pokemon.id) : false
  const primaryType = pokemon.types[0]?.type.name || 'normal'
  const imageUrl = getPokemonImage(pokemon)

  const handleTeamAction = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!currentTeamId) return
    
    if (inTeam) {
      removePokemonFromTeam(currentTeamId, pokemon.id)
    } else {
      const teamPokemon: TeamPokemon = {
        id: pokemon.id,
        name: pokemon.name,
        image: imageUrl,
        types: pokemon.types.map(t => t.type.name),
      }
      addPokemonToTeam(currentTeamId, teamPokemon)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/pokemon/${pokemon.id}`}>
        <div className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
          {/* Background gradient based on type */}
          <div 
            className={cn(
              "absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20",
              TYPE_COLORS[primaryType]
            )} 
          />
          
          {/* Team button */}
          <Button
            size="icon"
            variant={inTeam ? "default" : "outline"}
            className={cn(
              "absolute top-2 right-2 z-10 h-8 w-8 rounded-full transition-opacity",
              currentTeamId ? "opacity-0 group-hover:opacity-100" : "opacity-0 pointer-events-none",
              inTeam && "opacity-100"
            )}
            onClick={handleTeamAction}
            disabled={!currentTeamId}
          >
            {inTeam ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>

          {/* Pokemon image */}
          <div className="relative aspect-square p-4">
            <div className={cn(
              "absolute inset-0 flex items-center justify-center",
              !imageLoaded && "animate-pulse"
            )}>
              {imageUrl && (
                <Image
                  src={imageUrl || "/placeholder.svg"}
                  alt={pokemon.name}
                  width={200}
                  height={200}
                  className={cn(
                    "object-contain transition-all duration-300 group-hover:scale-110",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                  onLoad={() => setImageLoaded(true)}
                  priority={pokemon.id <= 20}
                />
              )}
            </div>
          </div>

          {/* Info section */}
          <div className="relative p-4 pt-0">
            <p className="text-xs font-mono text-muted-foreground">
              {formatPokemonId(pokemon.id)}
            </p>
            <h3 className="font-semibold text-foreground mt-1 truncate">
              {formatPokemonName(pokemon.name)}
            </h3>
            
            {/* Types */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {pokemon.types.map(({ type }) => (
                <span
                  key={type.name}
                  className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded-full text-white",
                    TYPE_COLORS[type.name]
                  )}
                >
                  {type.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
