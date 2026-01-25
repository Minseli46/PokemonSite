import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTheme } from './hooks/useTheme';
import Home from './pages/Home';
import PokemonDetails from './pages/PokemonDetails';
import QuizPage from './pages/QuizPage';
import ComparePage from './pages/ComparePage';
import TeamsPage from './pages/TeamsPage';
import BattlePage from './pages/BattlePage';
import EventsPage from './pages/EventsPage';
import FunTranslationsPage from './pages/FunTranslationsPage';
import { Sun, Moon, Menu, X } from 'lucide-react';
import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  const { mode, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
            <div className="container-custom">
              <div className="flex items-center justify-between h-16">
                <Link
                  to="/"
                  className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"
                >
                  Pokédex
                </Link>

                <div className="hidden md:flex items-center gap-6">
                  <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                    Accueil
                  </Link>
                  <Link to="/compare" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                    Comparer
                  </Link>
                  <Link to="/teams" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                    Équipes
                  </Link>
                  <Link to="/battle" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                    Combat
                  </Link>
                  <Link to="/events" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                    Événements
                  </Link>
                  <Link to="/fun" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                    Traductions
                  </Link>
                  <Link to="/quiz" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                    Quiz
                  </Link>
                  
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    aria-label="Toggle theme"
                  >
                    {mode === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700" />}
                  </button>
                </div>

                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

              {mobileMenuOpen && (
                <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col gap-4">
                    <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium">Accueil</Link>
                    <Link to="/compare" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium">Comparer</Link>
                    <Link to="/teams" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium">Équipes</Link>
                    <Link to="/battle" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium">Combat</Link>
                    <Link to="/events" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium">Événements</Link>
                    <Link to="/fun" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium">Traductions</Link>
                    <Link to="/quiz" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium">Quiz</Link>
                    <button onClick={() => { toggleTheme(); setMobileMenuOpen(false); }} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      {mode === 'dark' ? <><Sun className="w-5 h-5" />Mode clair</> : <><Moon className="w-5 h-5" />Mode sombre</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>

          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pokemon/:id" element={<PokemonDetails />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/battle" element={<BattlePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/fun" element={<FunTranslationsPage />} />
              <Route path="/quiz" element={<QuizPage />} />
            </Routes>
          </main>

          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
            <div className="container-custom py-8">
              <div className="text-center text-gray-600 dark:text-gray-400">
                <p className="mb-2">
                  Données fournies par <a href="https://pokeapi.co" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">PokéAPI</a>
                </p>
                <p className="text-sm">© 2026 Pokédex App - Fait avec ❤️ pour les fans de Pokémon</p>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
