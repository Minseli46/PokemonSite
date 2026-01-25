'use client'

import { useState, useRef, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Download, Palette, Sparkles } from 'lucide-react'

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
      </main>
    </div>
  )
}
