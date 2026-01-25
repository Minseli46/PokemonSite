'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Pokemon } from '@/lib/pokemon'

export interface TeamPokemon {
  id: number
  name: string
  image: string
  types: string[]
}

interface TeamState {
  team: TeamPokemon[]
  addToTeam: (pokemon: TeamPokemon) => boolean
  removeFromTeam: (id: number) => void
  clearTeam: () => void
  isInTeam: (id: number) => boolean
}

export const useTeam = create<TeamState>()(
  persist(
    (set, get) => ({
      team: [],
      addToTeam: (pokemon) => {
        const currentTeam = get().team
        if (currentTeam.length >= 6) return false
        if (currentTeam.some(p => p.id === pokemon.id)) return false
        set({ team: [...currentTeam, pokemon] })
        return true
      },
      removeFromTeam: (id) => {
        set({ team: get().team.filter(p => p.id !== id) })
      },
      clearTeam: () => {
        set({ team: [] })
      },
      isInTeam: (id) => {
        return get().team.some(p => p.id === id)
      },
    }),
    {
      name: 'pokemon-team',
    }
  )
)
