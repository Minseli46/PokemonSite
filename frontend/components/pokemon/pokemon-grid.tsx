'use client'

import { useEffect, useRef, useCallback, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { PokemonCard } from './pokemon-card'
import { usePokemonList } from '@/hooks/use-pokemon'
import { GENERATIONS } from '@/lib/pokemon'

interface PokemonGridProps {
  searchQuery: string
  selectedType: string | null
  selectedGeneration: number | null
  filteredPokemon?: { name: string; url: string }[]
}

export function PokemonGrid({
  searchQuery,
  selectedType,
  selectedGeneration,
  filteredPokemon,
}: PokemonGridProps) {
  const { pokemon, isLoading, isLoadingMore, setSize, isReachingEnd, size } = usePokemonList(24)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const generationRange = selectedGeneration
    ? GENERATIONS.find(g => g.id === selectedGeneration)?.range
    : null

  const displayPokemon = useMemo(() => {
    let list = filteredPokemon || pokemon

    // Filter by search query
    if (searchQuery) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.url?.match(/\/(\d+)\//)?.[1]?.includes(searchQuery)
      )
    }

    // Filter by generation (if using main list)
    if (generationRange && !filteredPokemon) {
      list = list.filter(p => {
        const id = parseInt(p.url?.match(/\/(\d+)\//)?.[1] || '0', 10)
        return id >= generationRange[0] && id <= generationRange[1]
      })
    }

    return list
  }, [filteredPokemon, pokemon, searchQuery, generationRange])

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && !isReachingEnd && !filteredPokemon && !selectedType) {
      setSize(size + 1)
    }
  }, [isLoadingMore, isReachingEnd, setSize, size, filteredPokemon, selectedType])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [handleLoadMore])

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (displayPokemon.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">No Pokemon found</p>
        <p className="text-muted-foreground text-sm mt-2">
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {displayPokemon.map((p) => (
          <PokemonCard key={p.name} name={p.name} url={p.url} />
        ))}
      </div>

      {/* Load more trigger */}
      {!filteredPokemon && !selectedType && !isReachingEnd && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isLoadingMore && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
        </div>
      )}
    </>
  )
}
