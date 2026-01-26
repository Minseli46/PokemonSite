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

export interface Team {
  id: string
  name: string
  pokemon: TeamPokemon[]
  createdAt: number
}

interface TeamState {
  // Équipe courante (pour compatibilité avec ancien système)
  team: TeamPokemon[]
  addToTeam: (pokemon: TeamPokemon) => boolean
  removeFromTeam: (id: number) => void
  clearTeam: () => void
  isInTeam: (id: number) => boolean
  
  // Système multi-équipes
  teams: Team[]
  currentTeamId: string | null
  createTeam: (name: string) => string
  deleteTeam: (teamId: string) => void
  renameTeam: (teamId: string, newName: string) => void
  selectTeam: (teamId: string) => void
  addPokemonToTeam: (teamId: string, pokemon: TeamPokemon) => boolean
  removePokemonFromTeam: (teamId: string, pokemonId: number) => void
  getTeam: (teamId: string) => Team | undefined
}

export const useTeam = create<TeamState>()(
  persist(
    (set, get) => ({
      // Ancien système (équipe par défaut)
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
      
      // Nouveau système multi-équipes
      teams: [],
      currentTeamId: null,
      
      createTeam: (name) => {
        const newTeam: Team = {
          id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name,
          pokemon: [],
          createdAt: Date.now(),
        }
        set({ teams: [...get().teams, newTeam], currentTeamId: newTeam.id })
        return newTeam.id
      },
      
      deleteTeam: (teamId) => {
        const { teams, currentTeamId } = get()
        const newTeams = teams.filter(t => t.id !== teamId)
        set({
          teams: newTeams,
          currentTeamId: currentTeamId === teamId ? (newTeams[0]?.id || null) : currentTeamId
        })
      },
      
      renameTeam: (teamId, newName) => {
        set({
          teams: get().teams.map(t =>
            t.id === teamId ? { ...t, name: newName } : t
          )
        })
      },
      
      selectTeam: (teamId) => {
        set({ currentTeamId: teamId })
      },
      
      addPokemonToTeam: (teamId, pokemon) => {
        const team = get().teams.find(t => t.id === teamId)
        if (!team) return false
        if (team.pokemon.length >= 6) return false
        if (team.pokemon.some(p => p.id === pokemon.id)) return false
        
        set({
          teams: get().teams.map(t =>
            t.id === teamId
              ? { ...t, pokemon: [...t.pokemon, pokemon] }
              : t
          )
        })
        return true
      },
      
      removePokemonFromTeam: (teamId, pokemonId) => {
        set({
          teams: get().teams.map(t =>
            t.id === teamId
              ? { ...t, pokemon: t.pokemon.filter(p => p.id !== pokemonId) }
              : t
          )
        })
      },
      
      getTeam: (teamId) => {
        return get().teams.find(t => t.id === teamId)
      },
    }),
    {
      name: 'pokemon-team',
    }
  )
)
