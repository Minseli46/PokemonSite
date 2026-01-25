import Link from 'next/link'
import { Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
          <Search className="h-12 w-12 text-muted-foreground" />
        </div>
        
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Pokemon Not Found
        </h1>
        <p className="text-muted-foreground mb-8">
          The Pokemon you are looking for seems to have escaped into the tall grass.
        </p>

        <Link href="/">
          <Button size="lg" className="gap-2">
            <Home className="h-5 w-5" />
            Return to Pokedex
          </Button>
        </Link>
      </div>
    </div>
  )
}
