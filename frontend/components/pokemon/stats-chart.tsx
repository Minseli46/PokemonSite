'use client'

import { motion } from 'framer-motion'
import type { PokemonStat } from '@/lib/pokemon'
import { formatStatName, STAT_COLORS } from '@/lib/pokemon'
import { cn } from '@/lib/utils'

interface StatsChartProps {
  stats: PokemonStat[]
  animated?: boolean
}

export function StatsChart({ stats, animated = true }: StatsChartProps) {
  const maxStat = 255

  return (
    <div className="space-y-3">
      {stats.map((stat, index) => {
        const percentage = (stat.base_stat / maxStat) * 100
        const statName = stat.stat.name

        return (
          <div key={statName} className="flex items-center gap-3">
            <span className="w-16 text-sm font-medium text-muted-foreground">
              {formatStatName(statName)}
            </span>
            <span className="w-10 text-sm font-bold text-foreground text-right">
              {stat.base_stat}
            </span>
            <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full", STAT_COLORS[statName] || 'bg-primary')}
                initial={animated ? { width: 0 } : { width: `${percentage}%` }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
              />
            </div>
          </div>
        )
      })}
      
      {/* Total */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <span className="w-16 text-sm font-medium text-muted-foreground">Total</span>
        <span className="w-10 text-sm font-bold text-primary text-right">
          {stats.reduce((acc, stat) => acc + stat.base_stat, 0)}
        </span>
        <div className="flex-1" />
      </div>
    </div>
  )
}
