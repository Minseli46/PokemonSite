'use client'

import { Filter, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { POKEMON_TYPES, GENERATIONS, TYPE_COLORS } from '@/lib/pokemon'
import { cn } from '@/lib/utils'

interface FilterPanelProps {
  selectedType: string | null
  selectedGeneration: number | null
  onTypeChange: (type: string | null) => void
  onGenerationChange: (generation: number | null) => void
}

export function FilterPanel({
  selectedType,
  selectedGeneration,
  onTypeChange,
  onGenerationChange,
}: FilterPanelProps) {
  const selectedGen = GENERATIONS.find(g => g.id === selectedGeneration)

  return (
    <div className="flex flex-wrap gap-2">
      {/* Type Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-11 gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            {selectedType ? (
              <span className="capitalize">{selectedType}</span>
            ) : (
              'Type'
            )}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 max-h-80 overflow-y-auto">
          <DropdownMenuLabel>Filtrer par Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onTypeChange(null)}>
            Tous les types
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {POKEMON_TYPES.map((type) => (
            <DropdownMenuItem
              key={type}
              onClick={() => onTypeChange(type)}
              className="flex items-center gap-2"
            >
              <span
                className={cn(
                  "w-3 h-3 rounded-full",
                  TYPE_COLORS[type]
                )}
              />
              <span className="capitalize">{type}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Generation Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-11 gap-2 bg-transparent">
            {selectedGen ? selectedGen.name : 'Génération'}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Filtrer par Génération</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onGenerationChange(null)}>
            All Generations
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {GENERATIONS.map((gen) => (
            <DropdownMenuItem
              key={gen.id}
              onClick={() => onGenerationChange(gen.id)}
              className="flex items-center justify-between"
            >
              <span>{gen.name}</span>
              <span className="text-xs text-muted-foreground">
                #{gen.range[0]}-{gen.range[1]}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters */}
      {(selectedType || selectedGeneration) && (
        <Button
          variant="ghost"
          className="h-11"
          onClick={() => {
            onTypeChange(null)
            onGenerationChange(null)
          }}
        >
          Clear Filters
        </Button>
      )}
    </div>
  )
}
