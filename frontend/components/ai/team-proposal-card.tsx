'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Plus, Check, Users, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTeam } from '@/hooks/use-team'
import { cn } from '@/lib/utils'
import type { TeamProposalAction } from '@/hooks/use-agent'

// ============================================
// TYPE COLORS
// ============================================

const TYPE_COLORS: Record<string, string> = {
  normal: 'bg-gray-400',
  fire: 'bg-orange-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-400',
  grass: 'bg-green-500',
  ice: 'bg-cyan-300',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-amber-600',
  flying: 'bg-indigo-300',
  psychic: 'bg-pink-500',
  bug: 'bg-lime-500',
  rock: 'bg-yellow-700',
  ghost: 'bg-purple-700',
  dragon: 'bg-indigo-600',
  dark: 'bg-gray-700',
  steel: 'bg-gray-400',
  fairy: 'bg-pink-300',
}

// ============================================
// TEAM PROPOSAL CARD
// ============================================

interface TeamProposalCardProps {
  proposal: TeamProposalAction['data']
  index: number
}

export function TeamProposalCard({ proposal, index }: TeamProposalCardProps) {
  const { createTeam, addPokemonToTeam, selectTeam } = useTeam()
  const [created, setCreated] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (created || isCreating) return
    setIsCreating(true)

    try {
      // Create the team
      const teamId = createTeam(proposal.name)

      // Add each Pokémon to the team
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

      // Select the new team as current
      selectTeam(teamId)
      setCreated(true)
    } catch (err) {
      console.error('Error creating team:', err)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'rounded-xl border border-border overflow-hidden',
        'bg-gradient-to-br from-background to-muted/30',
        created && 'ring-2 ring-green-500/50'
      )}
    >
      {/* Header */}
      <div className="px-3 py-2 bg-muted/50 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {index + 1}
          </div>
          <span className="text-sm font-semibold text-foreground truncate max-w-[160px]">
            {proposal.name}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          {proposal.pokemon.length}/6
        </div>
      </div>

      {/* Description */}
      <p className="px-3 py-1.5 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
        {proposal.description}
      </p>

      {/* Pokémon Grid */}
      <div className="px-2 py-1.5 grid grid-cols-3 gap-1.5">
        {proposal.pokemon.map((pokemon, i) => (
          <div
            key={`${pokemon.id}-${i}`}
            className="flex flex-col items-center p-1.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            {pokemon.image ? (
              <div className="relative w-10 h-10">
                <Image
                  src={pokemon.image}
                  alt={pokemon.name}
                  fill
                  className="object-contain"
                  sizes="40px"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Shield className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <span className="text-[9px] font-medium text-foreground capitalize mt-0.5 truncate w-full text-center">
              {pokemon.name}
            </span>
            <div className="flex gap-0.5 mt-0.5">
              {pokemon.types.map(type => (
                <span
                  key={type}
                  className={cn(
                    'w-2.5 h-2.5 rounded-full',
                    TYPE_COLORS[type] || 'bg-gray-400'
                  )}
                  title={type}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <div className="px-3 py-2 border-t border-border">
        <Button
          size="sm"
          className={cn(
            'w-full h-8 text-xs font-medium gap-1.5',
            created && 'bg-green-600 hover:bg-green-700'
          )}
          onClick={handleCreate}
          disabled={created || isCreating}
        >
          {created ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Équipe créée !
            </>
          ) : isCreating ? (
            'Création...'
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              Créer cette équipe
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}
