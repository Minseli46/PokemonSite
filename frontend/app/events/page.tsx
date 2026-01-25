'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, ExternalLink, Loader2 } from 'lucide-react'

interface PokemonEvent {
  id: number
  title: string
  date: string
  location: string
  description: string
}

export default function EventsPage() {
  const [location, setLocation] = useState<{ city: string; country: string } | null>(null)
  const [events, setEvents] = useState<PokemonEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLocationAndEvents()
  }, [])

  const loadLocationAndEvents = async () => {
    try {
      setLoading(true)
      
      // Récupérer la localisation de l'utilisateur
      const locationRes = await fetch('https://ipapi.co/json/')
      if (locationRes.ok) {
        const data = await locationRes.json()
        setLocation({
          city: data.city || 'Paris',
          country: data.country_name || 'France',
        })
        
        // Événements fictifs pour la démo
        const mockEvents: PokemonEvent[] = [
          {
            id: 1,
            title: 'Tournoi Pokémon International',
            date: '2026-03-15',
            location: `${data.city || 'Paris'}, ${data.country_name || 'France'}`,
            description: 'Rejoignez-nous pour le plus grand tournoi Pokémon de l\'année !',
          },
          {
            id: 2,
            title: 'Rencontre des Dresseurs',
            date: '2026-02-20',
            location: `${data.city || 'Paris'}, ${data.country_name || 'France'}`,
            description: 'Échangez vos Pokémon et rencontrez d\'autres dresseurs passionnés.',
          },
          {
            id: 3,
            title: 'Festival Pokémon GO',
            date: '2026-04-10',
            location: `${data.city || 'Paris'}, ${data.country_name || 'France'}`,
            description: 'Événement spécial avec des Pokémon rares et des bonus exclusifs.',
          },
        ]
        
        setEvents(mockEvents)
      }
    } catch (error) {
      console.error('Error loading location:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">🗺️ Événements Pokémon Locaux</h1>
          {location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-5 h-5" />
              <span>
                Événements près de {location.city}, {location.country}
              </span>
            </div>
          )}
        </div>

        {events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-xl text-muted-foreground">
                Aucun événement trouvé dans votre région
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white">
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription className="text-white/90 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm">
                      {new Date(event.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="mb-4">{event.description}</p>
                  <Button asChild className="w-full">
                    <a
                      href={`https://www.google.com/search?q=pokemon+event+${encodeURIComponent(event.title)}+${encodeURIComponent(event.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      En savoir plus
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-12">
          <CardHeader>
            <CardTitle>💡 À propos des événements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>• Les événements sont automatiquement filtrés selon votre localisation</p>
            <p>• Revenez régulièrement pour découvrir de nouveaux événements</p>
            <p>• Certains événements peuvent être en ligne ou hybrides</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
