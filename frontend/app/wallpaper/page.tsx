'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import NextImage from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Download, Palette, Sparkles, Bot, Check, X, Loader2, Wand2, Moon, Flame } from 'lucide-react'
import { useAgentAction } from '@/hooks/use-agent-action'
import type { AgentAction, WallpaperConfigAction } from '@/hooks/use-agent'
import { cn } from '@/lib/utils'

const patterns = [
  { value: 'gradient', label: 'Dégradé', icon: '🌈' },
  { value: 'dots', label: 'Points', icon: '⚪' },
  { value: 'waves', label: 'Vagues', icon: '🌊' },
  { value: 'geometric', label: 'Géométrique', icon: '🔶' },
]

const presetColors = [
  { name: 'Or', color: '#FFD700' },
  { name: 'Bleu', color: '#3B82F6' },
  { name: 'Rouge', color: '#EF4444' },
  { name: 'Vert', color: '#10B981' },
  { name: 'Violet', color: '#8B5CF6' },
  { name: 'Rose', color: '#EC4899' },
]

export default function WallpaperPage() {
  const [pokemonId, setPokemonId] = useState(25)
  const [pokemonName, setPokemonName] = useState('pikachu')
  const [backgroundColor, setBackgroundColor] = useState('#FFD700')
  const [pattern, setPattern] = useState<'gradient' | 'dots' | 'waves' | 'geometric'>('gradient')
  const [showName, setShowName] = useState(true)
  const [showId, setShowId] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // AI-generated wallpaper suggestions
  const [aiSuggestions, setAiSuggestions] = useState<WallpaperConfigAction['data'][]>([])
  const [appliedSuggestion, setAppliedSuggestion] = useState<number | null>(null)

  const handleAiActions = useCallback((actions: AgentAction[]) => {
    const wallpaperActions = actions.filter(a => a.type === 'wallpaper_config') as WallpaperConfigAction[]
    if (wallpaperActions.length > 0) {
      setAiSuggestions(wallpaperActions.map(a => a.data))
      setAppliedSuggestion(null)
    }
  }, [])

  const applyWallpaperConfig = useCallback((config: WallpaperConfigAction['data'], index?: number) => {
    setPokemonId(config.pokemonId)
    setPokemonName(config.pokemonName)
    setBackgroundColor(config.backgroundColor)
    setPattern(config.pattern as 'gradient' | 'dots' | 'waves' | 'geometric')
    setShowName(config.showName)
    setShowId(config.showId)
    if (index !== undefined) {
      setAppliedSuggestion(index)
    }
  }, [])

  // Hook IA contextuel
  const { trigger: triggerWallpaperAI, isLoading: aiLoading, error: aiError } = useAgentAction({
    agent: 'wallpaper',
    autoPrompt: `L'utilisateur est sur la page de création de fonds d'écran. Il a actuellement ${pokemonName} (#${pokemonId}) avec la couleur ${backgroundColor} et le motif ${pattern}. Propose-lui 2-3 thèmes de wallpaper variés et inspirants qu'il peut appliquer directement. Utilise suggest_wallpaper_theme pour chaque proposition.`,
    onActions: handleAiActions,
  })

  const generateWallpaper = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 1920
    canvas.height = 1080

    // Fond avec motif
    drawBackground(ctx, canvas.width, canvas.height)

    // Charger et dessiner le Pokémon
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`
    
    img.onload = () => {
      const size = 600
      const x = (canvas.width - size) / 2
      const y = (canvas.height - size) / 2 - 50
      ctx.drawImage(img, x, y, size, size)

      if (showName) {
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 80px Arial'
        ctx.textAlign = 'center'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowBlur = 10
        ctx.fillText(
          pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1),
          canvas.width / 2,
          canvas.height - 100
        )
      }

      if (showId) {
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '48px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(
          `#${pokemonId.toString().padStart(3, '0')}`,
          canvas.width / 2,
          canvas.height - 30
        )
      }
    }
  }

  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    switch (pattern) {
      case 'gradient':
        const gradient = ctx.createLinearGradient(0, 0, width, height)
        gradient.addColorStop(0, backgroundColor)
        gradient.addColorStop(1, darkenColor(backgroundColor))
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
        break

      case 'dots':
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
        for (let x = 0; x < width; x += 40) {
          for (let y = 0; y < height; y += 40) {
            ctx.beginPath()
            ctx.arc(x, y, 5, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        break

      case 'waves':
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.lineWidth = 3
        for (let i = 0; i < 10; i++) {
          ctx.beginPath()
          for (let x = 0; x < width; x += 10) {
            const y = Math.sin((x + i * 50) / 50) * 30 + height / 2
            if (x === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }
          ctx.stroke()
        }
        break

      case 'geometric':
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.lineWidth = 2
        for (let x = 0; x < width; x += 100) {
          for (let y = 0; y < height; y += 100) {
            ctx.strokeRect(x, y, 100, 100)
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(x + 100, y + 100)
            ctx.stroke()
          }
        }
        break
    }
  }

  const darkenColor = (color: string): string => {
    const hex = color.replace('#', '')
    const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - 50)
    const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - 50)
    const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - 50)
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  const downloadWallpaper = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `pokemon-wallpaper-${pokemonName}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  useEffect(() => {
    generateWallpaper()
  }, [pokemonId, backgroundColor, pattern, showName, showId])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-10 h-10 text-yellow-500" />
            Créateur de Fonds d'Écran Pokémon
          </h1>
          <p className="text-muted-foreground">
            Créez des fonds d'écran personnalisés avec vos Pokémon préférés
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          {/* Configuration */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pokémon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>ID du Pokémon</Label>
                  <Input
                    type="number"
                    value={pokemonId}
                    onChange={(e) => {
                      const id = parseInt(e.target.value) || 1
                      setPokemonId(id)
                    }}
                    min="1"
                    max="898"
                  />
                </div>
                <div>
                  <Label>Nom</Label>
                  <Input
                    value={pokemonName}
                    onChange={(e) => setPokemonName(e.target.value)}
                    placeholder="pikachu"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Couleur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {presetColors.map((preset) => (
                    <button
                      key={preset.color}
                      onClick={() => setBackgroundColor(preset.color)}
                      className={`h-12 rounded-lg border-2 transition-all ${
                        backgroundColor === preset.color
                          ? 'border-white scale-110'
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    />
                  ))}
                </div>
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="h-12"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Motif</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {patterns.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPattern(p.value as any)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        pattern === p.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{p.icon}</div>
                      <div className="text-sm font-medium">{p.label}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="showName"
                    checked={showName}
                    onChange={(e) => setShowName(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <Label htmlFor="showName" className="cursor-pointer">
                    Afficher le nom
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="showId"
                    checked={showId}
                    onChange={(e) => setShowId(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <Label htmlFor="showId" className="cursor-pointer">
                    Afficher le numéro
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Button onClick={downloadWallpaper} size="lg" className="w-full">
              <Download className="mr-2 h-5 w-5" />
              Télécharger (1920x1080)
            </Button>
          </div>

          {/* Prévisualisation */}
          <Card>
            <CardHeader>
              <CardTitle>Prévisualisation</CardTitle>
              <CardDescription>Résolution finale : 1920 x 1080 pixels</CardDescription>
            </CardHeader>
            <CardContent>
              <canvas
                ref={canvasRef}
                className="w-full h-auto rounded-lg shadow-2xl"
                style={{ maxHeight: '70vh' }}
              />
            </CardContent>
          </Card>
        </div>

        {/* AI-Generated Wallpaper Suggestions — Main Page Area */}
        {aiSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 space-y-6"
          >
            {/* AI Suggestions Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    Suggestions de l'IA
                    <Sparkles className="h-5 w-5 text-pink-500" />
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {aiSuggestions.length} thème{aiSuggestions.length > 1 ? 's' : ''} proposé{aiSuggestions.length > 1 ? 's' : ''} — Cliquez pour appliquer
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAiSuggestions([])
                  setAppliedSuggestion(null)
                }}
                className="text-muted-foreground hover:text-destructive gap-1"
              >
                <X className="h-4 w-4" />
                Fermer
              </Button>
            </div>

            {/* Suggestions Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {aiSuggestions.map((suggestion, idx) => {
                const isApplied = appliedSuggestion === idx

                return (
                  <motion.div
                    key={`ai-wallpaper-${idx}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      'bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer',
                      isApplied && 'ring-2 ring-green-500/50'
                    )}
                    onClick={() => applyWallpaperConfig(suggestion, idx)}
                  >
                    {/* Preview with background color */}
                    <div 
                      className="relative h-40 flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: suggestion.backgroundColor }}
                    >
                      {/* Pattern overlay */}
                      {suggestion.pattern === 'dots' && (
                        <div className="absolute inset-0 opacity-20"
                          style={{
                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                          }}
                        />
                      )}
                      {suggestion.pattern === 'waves' && (
                        <div className="absolute inset-0 opacity-15"
                          style={{
                            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 12px)`,
                          }}
                        />
                      )}
                      {suggestion.pattern === 'geometric' && (
                        <div className="absolute inset-0 opacity-15"
                          style={{
                            backgroundImage: `linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%)`,
                            backgroundSize: '40px 40px',
                          }}
                        />
                      )}
                      
                      {/* Pokémon image */}
                      {suggestion.pokemonImage && (
                        <div className="relative w-28 h-28 z-10">
                          <NextImage
                            src={suggestion.pokemonImage}
                            alt={suggestion.pokemonName}
                            fill
                            className="object-contain drop-shadow-lg"
                            sizes="112px"
                            unoptimized
                          />
                        </div>
                      )}

                      {/* Applied badge */}
                      {isApplied && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="px-4 py-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground capitalize">
                          {suggestion.pokemonName}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {suggestion.style}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {suggestion.description}
                      </p>
                      
                      {/* Color swatches */}
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-full border border-border" 
                          style={{ backgroundColor: suggestion.backgroundColor }}
                          title="Couleur de fond"
                        />
                        {suggestion.accentColor && (
                          <div 
                            className="w-6 h-6 rounded-full border border-border" 
                            style={{ backgroundColor: suggestion.accentColor }}
                            title="Couleur d'accent"
                          />
                        )}
                        <span className="text-[10px] text-muted-foreground ml-auto capitalize">
                          {suggestion.pattern}
                        </span>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <div className="px-4 py-3 border-t border-border">
                      <Button
                        className={cn(
                          'w-full gap-2',
                          isApplied && 'bg-green-600 hover:bg-green-700'
                        )}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          applyWallpaperConfig(suggestion, idx)
                        }}
                      >
                        {isApplied ? (
                          <>
                            <Check className="h-4 w-4" />
                            Thème appliqué !
                          </>
                        ) : (
                          <>
                            <Palette className="h-4 w-4" />
                            Appliquer ce thème
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* AI Wallpaper Assistant — Actions contextuelles */}
        <Card className="mt-8 border-pink-500/20 bg-gradient-to-r from-pink-500/5 to-rose-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center">
                <Bot className="h-4 w-4 text-pink-500" />
              </div>
              Designer IA
              {aiLoading && (
                <span className="flex items-center gap-1.5 text-sm font-normal text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Création...
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiError && (
              <p className="text-sm text-destructive mb-3">⚠️ {aiError}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-pink-500/30 hover:bg-pink-500/10 hover:text-pink-600"
                disabled={aiLoading}
                onClick={() => triggerWallpaperAI('Suggère-moi 3 thèmes de wallpaper Pokémon variés (feu, eau, électrique). Utilise suggest_wallpaper_theme pour chaque.')}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Suggérer 3 thèmes
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-red-500/30 hover:bg-red-500/10 hover:text-red-600"
                disabled={aiLoading}
                onClick={() => triggerWallpaperAI('Suggère-moi un fond d\'ecran avec un Pokémon de type Feu. Donne-moi les couleurs HEX, le motif idéal et le Pokémon parfait. Utilise suggest_wallpaper_theme.')}
              >
                <Flame className="h-3.5 w-3.5" />
                Thème Feu
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-600"
                disabled={aiLoading}
                onClick={() => triggerWallpaperAI('Je veux un fond d\'ecran sombre et mystérieux avec un Pokémon Ténèbres ou Spectre. Utilise suggest_wallpaper_theme.')}
              >
                <Moon className="h-3.5 w-3.5" />
                Thème Sombre
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-600"
                disabled={aiLoading}
                onClick={() => triggerWallpaperAI(`J'ai choisi ${pokemonName} avec la couleur ${backgroundColor} et le motif ${pattern}. Quelle combinaison optimale me recommandes-tu ? Utilise suggest_wallpaper_theme.`)}
              >
                <Wand2 className="h-3.5 w-3.5" />
                Harmoniser mon design
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
