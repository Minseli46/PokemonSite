import React, { useState } from 'react';
import { usePokemonList } from '../hooks/usePokemonAPI';
import PokemonList from '../components/PokemonList';
import { useNavigate } from 'react-router-dom';
import type { Pokemon } from '../utils/types';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);

  const limit = 20;
  const offset = (page - 1) * limit;

  const { data, isLoading, error } = usePokemonList(limit, offset);

  const handlePokemonClick = (pokemon: Pokemon) => {
    navigate(`/pokemon/${pokemon.pokemonId}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleFilterGeneration = (generation: number | null) => {
    setSelectedGeneration(generation);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = data ? Math.ceil(data.count / limit) : 1;

  return (
    <div className="container-custom py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          Pokédex
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Explorez le monde des Pokémon
        </p>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
          Une erreur s'est produite lors du chargement des Pokémon.
        </div>
      )}

      <PokemonList
        pokemons={data?.results || []}
        loading={isLoading}
        onPokemonClick={handlePokemonClick}
        onSearch={handleSearch}
        onFilterGeneration={handleFilterGeneration}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Home;
