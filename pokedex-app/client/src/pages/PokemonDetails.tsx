import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePokemon } from '../hooks/usePokemonAPI';
import ThreeDViewer from '../components/3DViewer';
import {
  formatPokemonId,
  formatPokemonName,
  getTypeColor,
  getTypeEmoji,
  formatHeight,
  formatWeight,
  formatStatName,
  getStatColor,
} from '../utils/helpers';
import { ArrowLeft, Heart, Maximize2 } from 'lucide-react';

const PokemonDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [show3D, setShow3D] = useState(false);

  const { data: pokemon, isLoading, error } = usePokemon(parseInt(id!));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="container-custom py-8">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          Pokémon non trouvé
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Bouton retour */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-outline mb-6 flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" />
        Retour
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colonne gauche - Image/3D */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {show3D ? (
              <div className="relative h-[500px]">
                <ThreeDViewer pokemonId={pokemon.pokemonId} />
                <button
                  onClick={() => setShow3D(false)}
                  className="absolute top-4 right-4 btn btn-primary"
                >
                  Voir en 2D
                </button>
              </div>
            ) : (
              <div className="relative p-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                <img
                  src={pokemon.artwork || pokemon.sprite}
                  alt={pokemon.name}
                  className="w-full max-w-md mx-auto drop-shadow-2xl"
                />
                <button
                  onClick={() => setShow3D(true)}
                  className="absolute bottom-4 right-4 btn btn-primary flex items-center gap-2"
                >
                  <Maximize2 className="w-5 h-5" />
                  Voir en 3D
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite - Détails */}
        <div className="space-y-6">
          {/* En-tête */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  #{formatPokemonId(pokemon.pokemonId)}
                </div>
                <h1 className="text-4xl font-bold">
                  {formatPokemonName(pokemon.name)}
                </h1>
              </div>
              <button className="btn btn-outline p-3">
                <Heart className="w-6 h-6" />
              </button>
            </div>

            {/* Types */}
            <div className="flex gap-2 flex-wrap mb-4">
              {pokemon.types.map((type) => (
                <span
                  key={type}
                  className="type-badge flex items-center gap-1"
                  style={{ backgroundColor: getTypeColor(type) }}
                >
                  <span>{getTypeEmoji(type)}</span>
                  <span className="capitalize">{type}</span>
                </span>
              ))}
            </div>

            {/* Infos de base */}
            <div className="grid grid-cols-2 gap-4">
              {pokemon.height && (
                <div className="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Taille</div>
                  <div className="text-lg font-bold">{formatHeight(pokemon.height)}</div>
                </div>
              )}
              {pokemon.weight && (
                <div className="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Poids</div>
                  <div className="text-lg font-bold">{formatWeight(pokemon.weight)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Statistiques */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Statistiques</h2>
            <div className="space-y-3">
              {pokemon.stats.map((stat) => {
                const percentage = (stat.base_stat / 255) * 100;
                return (
                  <div key={stat.stat.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">
                        {formatStatName(stat.stat.name)}
                      </span>
                      <span className="text-sm font-bold">{stat.base_stat}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="stat-bar"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: getStatColor(stat.base_stat),
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary-600">
                  {pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Capacités */}
          {pokemon.abilities && pokemon.abilities.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Capacités</h2>
              <div className="space-y-2">
                {pokemon.abilities.map((ability, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                  >
                    <span className="capitalize">
                      {ability.ability.name.replace('-', ' ')}
                    </span>
                    {ability.is_hidden && (
                      <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded">
                        Cachée
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Faiblesses */}
          {pokemon.weaknesses && Object.keys(pokemon.weaknesses).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Faiblesses & Résistances</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(pokemon.weaknesses)
                  .filter(([_, multiplier]) => multiplier !== 1)
                  .map(([type, multiplier]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between p-2 rounded-lg"
                      style={{
                        backgroundColor: getTypeColor(type) + '33',
                        borderLeft: `4px solid ${getTypeColor(type)}`,
                      }}
                    >
                      <span className="capitalize text-sm">{type}</span>
                      <span
                        className={`font-bold text-sm ${
                          multiplier > 1 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        ×{multiplier}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PokemonDetails;
