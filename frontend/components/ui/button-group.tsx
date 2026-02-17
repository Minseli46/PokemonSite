'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Option {
  id: string
  label: string
  icon?: LucideIcon | string
  description?: string
}

interface ButtonGroupProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  columns?: 2 | 3 | 4 | 6
  variant?: 'default' | 'compact'
}

export function ButtonGroup({ 
  options, 
  value, 
  onChange, 
  columns = 3,
  variant = 'default' 
}: ButtonGroupProps) {
  return (
    <div className={cn(
      "grid gap-2",
      columns === 2 && "grid-cols-2",
      columns === 3 && "grid-cols-3",
      columns === 4 && "grid-cols-4",
      columns === 6 && "grid-cols-6",
    )}>
      {options.map((option) => {
        const isSelected = value === option.id
        const Icon = typeof option.icon !== 'string' ? option.icon : null

        return (
          <motion.button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative p-3 rounded-lg border-2 transition-all text-left",
              isSelected
                ? "border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20"
                : "border-gray-700 bg-gray-800/50 hover:border-purple-500/50",
              variant === 'compact' && "p-2"
            )}
          >
            <div className="flex items-center gap-2">
              {Icon && <Icon className="w-5 h-5" />}
              {typeof option.icon === 'string' && (
                <span className="text-xl">{option.icon}</span>
              )}
              <span className="font-medium">{option.label}</span>
            </div>
            {option.description && variant !== 'compact' && (
              <p className="text-xs text-gray-400 mt-1">{option.description}</p>
            )}
            {isSelected && (
              <motion.div
                layoutId="selected-indicator"
                className="absolute inset-0 rounded-lg border-2 border-purple-500"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
