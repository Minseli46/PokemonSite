'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Palette, Wand2, Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ButtonGroup } from '@/components/ui/button-group'
import { useAgentCall } from '@/hooks/use-agent-call'
import { usePokemonSearch } from '@/hooks/use-pokemon-search'
import { POPULAR_POKEMON } from '@/lib/constants'
import Image from 'next/image'

const STYLES = [
  { id: 'vibrant', label: 'Vibrant', icon: '🌈', description: 'Couleurs vives et énergiques' },
  { id: 'pastel', label: 'Pastel', icon: '🎀', description: 'Tons doux et apaisants' },
  { id: 'dark', label: 'Sombre', icon: '🌑', description: 'Ambiance sombre et mystérieuse' },
  { id: 'minimal', label: 'Minimal', icon: '✨', description: 'Épuré et élégant' },
  { id: 'epic', label: 'Épique', icon: '⚔️', description: 'Grandiose et dramatique' },
  { id: 'cute', label: 'Mignon', icon: '💖', description: 'Coloré et adorable' },
]

const PATTERNS = [
  { id: 'gradient', label: 'Dégradé', icon: '🌈' },
  { id: 'dots', label: 'Points', icon: '⚪' },
  { id: 'waves', label: 'Vagues', icon: '🌊' },
  { id: 'geometric', label: 'Géométrique', icon: '🔶' },
]

interface WallpaperBuilderInterfaceProps {
  onWallpaperGenerated?: (suggestions: any[]) => void
}

export function WallpaperBuilderInterface({ onWallpaperGenerated }: WallpaperBuilderInterfaceProps) {
  const [pokemonSearchTerm, setPokemonSearchTerm] = useState('')
  const [pokemonId, setPokemonId] = useState<number>(25) // Pikachu par défaut
  const [pokemonName, setPokemonName] = useState('pikachu')
  const [pokemonImage, setPokemonImage] = useState('')
  const [style, setStyle] = useState('vibrant')
  const [pattern, setPattern] = useState('gradient')
  const [showName, setShowName] = useState(true)
  const [showId, setShowId] = useState(true)
  const [suggestionsCount, setSuggestionsCount] = useState(3)

  const { callAgent, isLoading } = useAgentCall({ 
    endpoint: 'wallpaper', 
    actionType: 'wallpaper_config' 
  })

  const { searchPokemon, loadPokemonById, isSearching } = usePokemonSearch()

  // Charger le Pokémon initial
  useEffect(() => {
    const loadInitialPokemon = async () => {
      const data = await loadPokemonById(pokemonId)
      if (data) {
        setPokemonName(data.name)
        setPokemonImage(data.image)
      }
    }
    loadInitialPokemon()
  }, [pokemonId, loadPokemonById])

  const handleSearchPokemon = useCallback(async () => {
    if (!pokemonSearchTerm.trim()) return

    const data = await searchPokemon(pokemonSearchTerm)
    if (data) {
      setPokemonId(data.id)
      setPokemonName(data.name)
      setPokemonImage(data.image)
      setPokemonSearchTerm('')
    } else {
      alert('Pokémon non trouvé. Essayez avec un nom ou un ID.')
    }
  }, [pokemonSearchTerm, searchPokemon])

  const buildMessage = useCallback(() => {
    const styleLabel = STYLES.find(s => s.id === style)?.label || style
    const patternLabel = PATTERNS.find(p => p.id === pattern)?.label || pattern

    let message = `Génère ${suggestionsCount} suggestions de fonds d'écran pour ${pokemonName} avec un style ${styleLabel} et un motif ${patternLabel}.`

    if (showName) message += ' Affiche le nom du Pokémon.'
    if (showId) message += ' Affiche le numéro du Pokémon.'

    return message
  }, [suggestionsCount, pokemonName, style, pattern, showName, showId])

  const handleGenerateWallpapers = useCallback(async () => {
    const message = buildMessage()
    console.log('🎨 Génération des fonds d\'écran:', message)

    const suggestions = await callAgent(message)

    if (suggestions && suggestions.length > 0 && onWallpaperGenerated) {
      onWallpaperGenerated(suggestions)
    }
  }, [buildMessage, callAgent, onWallpaperGenerated])

  const popularPokemonOptions = useMemo(() => 
    POPULAR_POKEMON.map(p => ({ 
      value: p.id.toString(), 
      label: `${p.name} (#${p.id})` 
    })),
    []
  )

  return (
    <Card className="border-pink-500/20 bg-pink-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-6 h-6 text-pink-500" />
          Générateur de Fonds d'Écran Pokémon
        </CardTitle>
        <CardDescription>
          Créez des fonds d'écran personnalisés avec vos Pokémon préférés
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recherche de Pokémon */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Sélectionner un Pokémon</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Nom ou ID du Pokémon (ex: pikachu, 25)"
              value={pokemonSearchTerm}
              onChange={(e) => setPokemonSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchPokemon()}
              className="flex-1"
            />
            <Button
              onClick={handleSearchPokemon}
              disabled={isSearching || !pokemonSearchTerm.trim()}
              variant="outline"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {/* Prévisualisation du Pokémon */}
          {pokemonImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-700 bg-gray-800/50"
            >
              <Image
                src={pokemonImage}
                alt={pokemonName}
                width={80}
                height={80}
                className="object-contain"
              />
              <div>
                <div className="font-semibold text-lg capitalize">{pokemonName}</div>
                <div className="text-sm text-gray-400">#{pokemonId.toString().padStart(3, '0')}</div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sélection rapide par ID */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Ou sélectionner un favori</Label>
          <Select value={pokemonId.toString()} onValueChange={(value) => setPokemonId(parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un Pokémon" />
            </SelectTrigger>
            <SelectContent>
              {POPULAR_POKEMON.map((p) => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  {p.name} (#{p.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Style */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Style</Label>
          <ButtonGroup 
            options={STYLES}
            value={style}
            onChange={setStyle}
            columns={3}
          />
        </div>

        {/* Motif */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Motif de Fond</Label>
          <ButtonGroup 
            options={PATTERNS}
            value={pattern}
            onChange={setPattern}
            columns={4}
            variant="compact"
          />
        </div>

        {/* Options d'Affichage */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Options d'Affichage</Label>
          <div className="flex flex-col gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-name"
                checked={showName}
                onCheckedChange={(checked) => setShowName(checked as boolean)}
              />
              <label
                htmlFor="show-name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Afficher le nom du Pokémon
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-id"
                checked={showId}
                onCheckedChange={(checked) => setShowId(checked as boolean)}
              />
              <label
                htmlFor="show-id"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Afficher le numéro du Pokémon
              </label>
            </div>
          </div>
        </div>

        {/* Nombre de suggestions */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Nombre de Suggestions</Label>
          <Select
            value={suggestionsCount.toString()}
            onValueChange={(value) => setSuggestionsCount(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map(count => (
                <SelectItem key={count} value={count.toString()}>
                  {count} suggestion{count > 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bouton de Génération */}
        <Button
          onClick={handleGenerateWallpapers}
          disabled={isLoading || !pokemonName}
          className="w-full h-14 text-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              Générer {suggestionsCount} Suggestion{suggestionsCount > 1 ? 's' : ''}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
