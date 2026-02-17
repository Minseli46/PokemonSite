'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sun, Moon, Users, Swords, HelpCircle, Menu, X, Newspaper, Sparkles, CircleSlash2, Bot } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/use-theme'
import { useTeam } from '@/hooks/use-team'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Pokedex', icon: null },
  { href: '/team', label: 'Équipe', icon: Users },
  { href: '/compare', label: 'Comparer', icon: CircleSlash2 },
  { href: '/battle', label: 'Combat', icon: Swords },
  { href: '/events', label: 'Actualités', icon: Newspaper },
  { href: '/wallpaper', label: 'Fond d\'écran', icon: Sparkles },
  { href: '/quiz', label: 'Quiz', icon: HelpCircle },
  { href: '/agent', label: 'IA Agent', icon: Bot },
]

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { team } = useTeam()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              className="relative"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-8 h-8 rounded-full bg-primary relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1/2 bg-primary" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-card" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-card border-2 border-foreground" />
                </div>
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-foreground -translate-y-1/2" />
              </div>
            </motion.div>
            <span className="font-bold text-xl text-foreground">Pokédex</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "gap-2",
                      isActive && "bg-secondary"
                    )}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    {item.label}
                    {item.href === '/team' && team.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                        {team.length}
                      </span>
                    )}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-border"
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-2",
                        isActive && "bg-secondary"
                      )}
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {item.label}
                      {item.href === '/team' && team.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                          {team.length}
                        </span>
                      )}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </motion.nav>
        )}
      </div>
    </header>
  )
}
