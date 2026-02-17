'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Palette, Check, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { WallpaperConfigAction } from '@/hooks/use-agent'

// ============================================
// WALLPAPER CARD
// ============================================

interface WallpaperCardProps {
  config: WallpaperConfigAction['data']
  index: number
  onApply?: (config: WallpaperConfigAction['data']) => void
}

export function WallpaperCard({ config, index, onApply }: WallpaperCardProps) {
  const [applied, setApplied] = useState(false)

  const handleApply = () => {
    if (applied) return
    onApply?.(config)
    setApplied(true)
  }

  // Pattern preview SVG
  const patternBg = getPatternStyle(config.pattern, config.backgroundColor, config.accentColor)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'rounded-xl border border-border overflow-hidden',
        'bg-gradient-to-br from-background to-muted/30',
        applied && 'ring-2 ring-green-500/50'
      )}
    >
      {/* Preview */}
      <div
        className="relative h-28 flex items-center justify-center overflow-hidden"
        style={patternBg}
      >
        {config.pokemonImage && (
          <div className="relative w-20 h-20 z-10 drop-shadow-lg">
            <Image
              src={config.pokemonImage}
              alt={config.pokemonName}
              fill
              className="object-contain"
              sizes="80px"
              unoptimized
            />
          </div>
        )}
        {config.showName && (
          <span
            className="absolute bottom-2 left-0 right-0 text-center text-xs font-bold capitalize z-10"
            style={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
          >
            {config.pokemonName}
            {config.showId && (
              <span className="ml-1 opacity-70">#{config.pokemonId.toString().padStart(3, '0')}</span>
            )}
          </span>
        )}
        
        {/* Style badge */}
        <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-black/40 text-white font-medium z-10">
          {config.style}
        </span>
      </div>

      {/* Info */}
      <div className="px-3 py-2">
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-2">
          {config.description}
        </p>

        {/* Color swatches */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <div
              className="w-4 h-4 rounded-full border border-border"
              style={{ backgroundColor: config.backgroundColor }}
              title={`Fond: ${config.backgroundColor}`}
            />
            <div
              className="w-4 h-4 rounded-full border border-border"
              style={{ backgroundColor: config.accentColor }}
              title={`Accent: ${config.accentColor}`}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">
            {config.pattern} • {config.backgroundColor}
          </span>
        </div>

        {/* Apply Button */}
        <Button
          size="sm"
          variant={applied ? 'default' : 'outline'}
          className={cn(
            'w-full h-7 text-xs font-medium gap-1.5',
            applied && 'bg-green-600 hover:bg-green-700'
          )}
          onClick={handleApply}
          disabled={applied}
        >
          {applied ? (
            <>
              <Check className="h-3 w-3" />
              Appliqué !
            </>
          ) : (
            <>
              <Wand2 className="h-3 w-3" />
              Appliquer ce thème
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}

// ============================================
// PATTERN STYLE HELPER
// ============================================

function getPatternStyle(
  pattern: string,
  bgColor: string,
  accentColor: string
): React.CSSProperties {
  const base: React.CSSProperties = { backgroundColor: bgColor }

  switch (pattern) {
    case 'gradient':
      return {
        background: `linear-gradient(135deg, ${bgColor}, ${accentColor})`,
      }
    case 'dots':
      return {
        ...base,
        backgroundImage: `radial-gradient(circle, ${accentColor}22 1px, transparent 1px)`,
        backgroundSize: '12px 12px',
      }
    case 'waves':
      return {
        background: `linear-gradient(180deg, ${bgColor} 0%, ${accentColor} 50%, ${bgColor} 100%)`,
      }
    case 'geometric':
      return {
        ...base,
        backgroundImage: `
          linear-gradient(30deg, ${accentColor}15 12%, transparent 12.5%, transparent 87%, ${accentColor}15 87.5%, ${accentColor}15),
          linear-gradient(150deg, ${accentColor}15 12%, transparent 12.5%, transparent 87%, ${accentColor}15 87.5%, ${accentColor}15),
          linear-gradient(30deg, ${accentColor}15 12%, transparent 12.5%, transparent 87%, ${accentColor}15 87.5%, ${accentColor}15),
          linear-gradient(150deg, ${accentColor}15 12%, transparent 12.5%, transparent 87%, ${accentColor}15 87.5%, ${accentColor}15)
        `,
        backgroundSize: '40px 70px',
        backgroundPosition: '0 0, 0 0, 20px 35px, 20px 35px',
      }
    default:
      return base
  }
}
