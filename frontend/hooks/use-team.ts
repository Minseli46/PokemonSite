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
  // Système multi-équipes
  teams: Team[]
  currentTeamId: string | null
  
  // Méthodes pour compatibilité avec ancien système (utilisent l'équipe courante)
  team: TeamPokemon[]
  addToTeam: (pokemon: TeamPokemon) => boolean
  removeFromTeam: (id: number) => void
  clearTeam: () => void
  isInTeam: (id: number) => boolean
  
  // Méthodes multi-équipes
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
      // Système multi-équipes
      teams: [],
      currentTeamId: null,
      team: [],
      
      addToTeam: (pokemon) => {
        const { currentTeamId } = get()
        console.log('➕ addToTeam appelé:', { 
          currentTeamId, 
          pokemonId: pokemon.id,
          pokemonName: pokemon.name,
          hasTeamId: !!currentTeamId 
        })
        if (!currentTeamId) {
          console.log('❌ Pas d\'équipe sélectionnée')
          return false
        }
        return get().addPokemonToTeam(currentTeamId, pokemon)
      },
      
      removeFromTeam: (id) => {
        const { currentTeamId } = get()
        if (!currentTeamId) return
        get().removePokemonFromTeam(currentTeamId, id)
      },
      
      clearTeam: () => {
        const { currentTeamId } = get()
        if (!currentTeamId) return
        const updatedTeams = get().teams.map(t =>
          t.id === currentTeamId ? { ...t, pokemon: [] } : t
        )
        set({
          teams: updatedTeams,
          team: []
        })
      },
      
      isInTeam: (id) => {
        const { currentTeamId, teams } = get()
        if (!currentTeamId) return false
        const currentTeam = teams.find(t => t.id === currentTeamId)
        return currentTeam?.pokemon.some(p => p.id === id) || false
      },
      
      createTeam: (name) => {
        const newTeam: Team = {
          id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name,
          pokemon: [],
          createdAt: Date.now(),
        }
        set({ 
          teams: [...get().teams, newTeam], 
          currentTeamId: newTeam.id,
          team: [] // L'équipe est vide au début
        })
        return newTeam.id
      },
      
      deleteTeam: (teamId) => {
        const { teams, currentTeamId } = get()
        const newTeams = teams.filter(t => t.id !== teamId)
        const newCurrentTeamId = currentTeamId === teamId ? (newTeams[0]?.id || null) : currentTeamId
        const newCurrentTeam = newCurrentTeamId ? newTeams.find(t => t.id === newCurrentTeamId) : null
        
        set({
          teams: newTeams,
          currentTeamId: newCurrentTeamId,
          team: newCurrentTeam?.pokemon || []
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
        const selectedTeam = get().teams.find(t => t.id === teamId)
        console.log('🎯 selectTeam appelé:', { 
          teamId, 
          teamFound: !!selectedTeam,
          teamName: selectedTeam?.name,
          pokemonCount: selectedTeam?.pokemon.length,
          allTeams: get().teams.map(t => ({ id: t.id, name: t.name, count: t.pokemon.length }))
        })
        set({ 
          currentTeamId: teamId,
          team: selectedTeam?.pokemon || []
        })
        console.log('✅ Équipe sélectionnée. CurrentTeamId:', get().currentTeamId)
      },
      
      addPokemonToTeam: (teamId, pokemon) => {
        const team = get().teams.find(t => t.id === teamId)
        
        console.log('🔍 addPokemonToTeam appelé:', { 
          teamId, 
          pokemonId: pokemon.id, 
          pokemonName: pokemon.name,
          teamExists: !!team,
          teamSize: team?.pokemon.length,
          alreadyInTeam: team?.pokemon.some(p => p.id === pokemon.id)
        })
        
        if (!team) {
          console.log('❌ Équipe non trouvée')
          return false
        }
        if (team.pokemon.length >= 6) {
          console.log('❌ Équipe pleine (6/6)')
          return false
        }
        if (team.pokemon.some(p => p.id === pokemon.id)) {
          console.log('❌ Pokémon déjà dans l\'équipe')
          return false
        }
        
        const updatedTeams = get().teams.map(t =>
          t.id === teamId
            ? { ...t, pokemon: [...t.pokemon, pokemon] }
            : t
        )
        
        // Synchroniser team en même temps
        const currentTeam = get().currentTeamId === teamId 
          ? updatedTeams.find(t => t.id === teamId)
          : updatedTeams.find(t => t.id === get().currentTeamId)
        
        set({
          teams: updatedTeams,
          team: currentTeam?.pokemon || get().team
        })
        
        console.log('✅ Pokémon ajouté avec succès')
        return true
      },
      
      removePokemonFromTeam: (teamId, pokemonId) => {
        const updatedTeams = get().teams.map(t =>
          t.id === teamId
            ? { ...t, pokemon: t.pokemon.filter(p => p.id !== pokemonId) }
            : t
        )
        
        // Synchroniser team en même temps
        const currentTeam = get().currentTeamId === teamId 
          ? updatedTeams.find(t => t.id === teamId)
          : updatedTeams.find(t => t.id === get().currentTeamId)
        
        set({
          teams: updatedTeams,
          team: currentTeam?.pokemon || get().team
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
