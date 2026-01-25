import React, { useState } from 'react';
import { Pokemon } from '../utils/types';
import PokemonCard from './PokemonCard';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface PokemonListProps {
  pokemons: Pokemon[];
  loading?: boolean;
  onPokemonClick?: (pokemon: Pokemon) => void;
  onSearch?: (query: string) => void;
  onFilterGeneration?: (generation: number | null) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const PokemonList: React.FC<PokemonListProps> = ({
  pokemons,
  loading = false,
  onPokemonClick,
  onSearch,
  onFilterGeneration,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleGenerationChange = (generation: number | null) => {
    setSelectedGeneration(generation);
    onFilterGeneration?.(generation);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des Pokémon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Recherche */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un Pokémon..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="input pl-10"
          />
        </div>

        {/* Filtre par génération */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={selectedGeneration || ''}
            onChange={(e) => handleGenerationChange(e.target.value ? parseInt(e.target.value) : null)}
            className="input pl-10 pr-8 appearance-none cursor-pointer"
          >
            <option value="">Toutes les générations</option>
            {Array.from({ length: 8 }, (_, i) => i + 1).map((gen) => (
              <option key={gen} value={gen}>
                Génération {gen}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste des Pokémon */}
      {pokemons.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Aucun Pokémon trouvé
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pokemons.map((pokemon) => (
            <PokemonCard
              key={pokemon.pokemonId}
              pokemon={pokemon}
              onClick={() => onPokemonClick?.(pokemon)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Précédent
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange?.(page)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === page
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Suivant
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PokemonList;
