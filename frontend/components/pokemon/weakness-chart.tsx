'use client'

import { useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { useTypeEffectiveness } from '@/hooks/use-pokemon'
import { TypeBadge } from './type-badge'
import { POKEMON_TYPES } from '@/lib/pokemon'

interface WeaknessChartProps {
  types: string[]
}

export function WeaknessChart({ types }: WeaknessChartProps) {
  const { typeData: type1Data, isLoading: loading1 } = useTypeEffectiveness(types[0])
  const { typeData: type2Data, isLoading: loading2 } = useTypeEffectiveness(types[1] || '')

  const effectiveness = useMemo(() => {
    if (!type1Data) return null

    const multipliers: Record<string, number> = {}
    
    // Initialize all types with 1x
    POKEMON_TYPES.forEach(type => {
      multipliers[type] = 1
    })

    // Apply first type's weaknesses and resistances
    type1Data.double_damage_from.forEach(t => {
      multipliers[t.name] *= 2
    })
    type1Data.half_damage_from.forEach(t => {
      multipliers[t.name] *= 0.5
    })
    type1Data.no_damage_from.forEach(t => {
      multipliers[t.name] *= 0
    })

    // Apply second type's weaknesses and resistances if exists
    if (type2Data) {
      type2Data.double_damage_from.forEach(t => {
        multipliers[t.name] *= 2
      })
      type2Data.half_damage_from.forEach(t => {
        multipliers[t.name] *= 0.5
      })
      type2Data.no_damage_from.forEach(t => {
        multipliers[t.name] *= 0
      })
    }

    // Categorize by effectiveness
    const weakTo: string[] = []
    const resistantTo: string[] = []
    const immuneTo: string[] = []

    Object.entries(multipliers).forEach(([type, mult]) => {
      if (mult >= 2) weakTo.push(type)
      else if (mult > 0 && mult < 1) resistantTo.push(type)
      else if (mult === 0) immuneTo.push(type)
    })

    return { weakTo, resistantTo, immuneTo }
  }, [type1Data, type2Data])

  if (loading1 || loading2) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!effectiveness) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Weak to */}
      {effectiveness.weakTo.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Weak to (2x or 4x damage)</h4>
          <div className="flex flex-wrap gap-2">
            {effectiveness.weakTo.map(type => (
              <TypeBadge key={type} type={type} size="sm" />
            ))}
          </div>
        </div>
      )}

      {/* Resistant to */}
      {effectiveness.resistantTo.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Resistant to (0.5x or 0.25x damage)</h4>
          <div className="flex flex-wrap gap-2">
            {effectiveness.resistantTo.map(type => (
              <TypeBadge key={type} type={type} size="sm" />
            ))}
          </div>
        </div>
      )}

      {/* Immune to */}
      {effectiveness.immuneTo.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Immune to (0x damage)</h4>
          <div className="flex flex-wrap gap-2">
            {effectiveness.immuneTo.map(type => (
              <TypeBadge key={type} type={type} size="sm" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
