'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { X, Users } from 'lucide-react'
import { useTeam } from '@/hooks/use-team'
import { Button } from '@/components/ui/button'
import { formatPokemonName } from '@/lib/pokemon'

export function TeamPreview() {
  const { team, removeFromTeam } = useTeam()

  if (team.length === 0) return null

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl"
    >
      <div className="bg-card border border-border rounded-2xl shadow-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Votre Équipe</span>
            <span className="text-sm text-muted-foreground">({team.length}/6)</span>
          </div>
          <Link href="/team">
            <Button size="sm" variant="default">
              Voir l'équipe
            </Button>
          </Link>
        </div>

        <div className="flex gap-2">
          {[...Array(6)].map((_, index) => {
            const pokemon = team[index]
            return (
              <div
                key={index}
                className="flex-1 aspect-square rounded-lg bg-secondary/50 border-2 border-dashed border-border flex items-center justify-center relative overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {pokemon ? (
                    <motion.div
                      key={pokemon.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-card rounded-lg border-2 border-solid border-primary/30"
                    >
                      <Image
                        src={pokemon.image || '/placeholder.svg'}
                        alt={pokemon.name}
                        width={60}
                        height={60}
                        className="object-contain"
                      />
                      <button
                        onClick={() => removeFromTeam(pokemon.id)}
                        className="absolute -top-1 -right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:scale-110 transition-transform"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <span className="absolute bottom-0.5 left-0 right-0 text-[10px] text-center font-medium truncate px-1 text-foreground">
                        {formatPokemonName(pokemon.name)}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-2xl text-muted-foreground/30"
                    >
                      {index + 1}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
