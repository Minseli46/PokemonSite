'use client'

import { cn } from '@/lib/utils'
import { TYPE_COLORS } from '@/lib/pokemon'

interface TypeBadgeProps {
  type: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function TypeBadge({ type, size = 'md', className }: TypeBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  return (
    <span
      className={cn(
        "font-medium rounded-full text-white capitalize inline-flex items-center justify-center",
        sizeClasses[size],
        TYPE_COLORS[type],
        className
      )}
    >
      {type}
    </span>
  )
}
