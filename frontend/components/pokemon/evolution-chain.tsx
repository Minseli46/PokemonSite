'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { usePokemon, useEvolutionChain } from '@/hooks/use-pokemon'
import { formatPokemonName, getIdFromSpeciesUrl } from '@/lib/pokemon'
import type { EvolutionNode } from '@/lib/pokemon'

interface EvolutionChainProps {
  evolutionChainUrl: string | null
}

interface EvolutionStage {
  name: string
  id: number
  minLevel?: number
  trigger?: string
  item?: string
}

function flattenEvolutionChain(chain: EvolutionNode): EvolutionStage[][] {
  const stages: EvolutionStage[][] = []
  
  function traverse(node: EvolutionNode, depth: number) {
    const stage: EvolutionStage = {
      name: node.species.name,
      id: getIdFromSpeciesUrl(node.species.url),
      minLevel: node.evolution_details[0]?.min_level,
      trigger: node.evolution_details[0]?.trigger?.name,
      item: node.evolution_details[0]?.item?.name,
    }
    
    if (!stages[depth]) {
      stages[depth] = []
    }
    stages[depth].push(stage)
    
    node.evolves_to.forEach(evolution => {
      traverse(evolution, depth + 1)
    })
  }
  
  traverse(chain, 0)
  return stages
}

function EvolutionPokemon({ name, id, minLevel, trigger, item }: EvolutionStage & { showArrow?: boolean }) {
  const { pokemon, isLoading } = usePokemon(id)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  const imageUrl = pokemon?.sprites.other['official-artwork'].front_default ||
    pokemon?.sprites.other.home.front_default ||
    pokemon?.sprites.front_default

  return (
    <Link href={`/pokemon/${id}`}>
      <motion.div
        className="flex flex-col items-center group"
        whileHover={{ scale: 1.05 }}
      >
        <div className="relative w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-secondary transition-colors">
          {imageUrl && (
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={name}
              width={80}
              height={80}
              className="object-contain"
            />
          )}
        </div>
        <span className="mt-2 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {formatPokemonName(name)}
        </span>
        {(minLevel || trigger || item) && (
          <span className="text-xs text-muted-foreground mt-0.5">
            {minLevel && `Lv. ${minLevel}`}
            {trigger && trigger !== 'level-up' && !minLevel && formatPokemonName(trigger)}
            {item && formatPokemonName(item)}
          </span>
        )}
      </motion.div>
    </Link>
  )
}

export function EvolutionChainDisplay({ evolutionChainUrl }: EvolutionChainProps) {
  const { evolutionChain, isLoading, error } = useEvolutionChain(evolutionChainUrl)

  const stages = useMemo(() => {
    if (!evolutionChain) return []
    return flattenEvolutionChain(evolutionChain.chain)
  }, [evolutionChain])

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || stages.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No evolution data available
      </p>
    )
  }

  if (stages.length === 1 && stages[0].length === 1) {
    return (
      <div className="flex justify-center">
        <EvolutionPokemon {...stages[0][0]} />
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {stages.map((stage, stageIndex) => (
        <div key={stageIndex} className="flex items-center gap-4">
          {stageIndex > 0 && (
            <ArrowRight className="h-6 w-6 text-muted-foreground hidden sm:block" />
          )}
          <div className="flex flex-col gap-4">
            {stage.map((pokemon) => (
              <EvolutionPokemon key={pokemon.id} {...pokemon} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
