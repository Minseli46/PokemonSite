'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Newspaper, Calendar, ExternalLink, Loader2, Tag, Sparkles } from 'lucide-react'
import { usePokemonNews } from '@/hooks/use-pokemon-news'
import { motion, AnimatePresence } from 'framer-motion'

export default function EventsPage() {
  const { news, isLoading, error } = usePokemonNews()

  console.log('EventsPage - Données:', { newsCount: news.length, isLoading, error })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="py-12 text-center">
              <p className="text-xl text-red-600 dark:text-red-400 mb-2">
                Erreur lors du chargement des actualités
              </p>
              <p className="text-sm text-muted-foreground">
                Impossible de récupérer les actualités. Vérifiez que le backend est démarré sur le port 3000.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {error?.message || 'Erreur inconnue'}
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Debug info - À SUPPRIMER EN PRODUCTION */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mb-6 bg-yellow-500/10 border-yellow-500/20">
            <CardContent className="py-4">
              <p className="text-sm font-mono">
                <strong>Debug:</strong> {news.length} actualité(s) chargée(s) | 
                Loading: {isLoading ? 'Oui' : 'Non'} | 
                API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/news
              </p>
            </CardContent>
          </Card>
        )}
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Newspaper className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">Actualités Pokémon</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Restez informé des dernières nouvelles officielles du monde Pokémon
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>Mis à jour automatiquement depuis Pokemon.com</span>
          </div>
        </div>

        {news.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Newspaper className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground mb-2">
                Aucune actualité disponible pour le moment
              </p>
              <p className="text-sm text-muted-foreground">
                Le backend a retourné 0 actualités. Vérifiez la console pour plus d'informations.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {news.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
                    {article.imageUrl && (
                      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    
                    <CardHeader className={!article.imageUrl ? 'bg-gradient-to-r from-primary to-secondary text-white' : ''}>
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4" />
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10">
                          {article.category}
                        </span>
                      </div>
                      <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                      {article.date && (
                        <CardDescription className={!article.imageUrl ? 'text-white/90' : ''}>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{article.date}</span>
                          </div>
                        </CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent className="pt-4 flex-1 flex flex-col justify-between">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {article.description}
                      </p>
                      <Button asChild className="w-full mt-auto">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Lire l'article
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <Card className="mt-12 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              À propos des actualités
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Les actualités sont récupérées automatiquement depuis le site officiel Pokemon.com</p>
            <p>• Les données sont mises à jour toutes les heures pour vous offrir les dernières nouvelles</p>
            <p>• Cliquez sur "Lire l'article" pour accéder à l'article complet sur le site officiel</p>
            <p>• Les actualités couvrent le JCC, les jeux vidéo, Pokémon GO et bien plus encore</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
