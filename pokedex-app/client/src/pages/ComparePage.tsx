import React, { useState } from 'react';
import { useComparePokemon } from '../hooks/usePokemonAPI';
import { Search, ArrowLeftRight, TrendingUp, TrendingDown } from 'lucide-react';
import {
  formatPokemonName,
  formatPokemonId,
  getTypeColor,
  getTypeEmoji,
  formatStatName,
  getStatColor,
} from '../utils/helpers';

const ComparePage: React.FC = () => {
  const [pokemon1Id, setPokemon1Id] = useState<number | null>(null);
  const [pokemon2Id, setPokemon2Id] = useState<number | null>(null);
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');

  const { data, isLoading } = useComparePokemon(pokemon1Id, pokemon2Id);

  const handleCompare = async () => {
    // Essayer d'abord comme nom, puis comme ID
    const name1Lower = search1.toLowerCase().trim();
    const name2Lower = search2.toLowerCase().trim();
    
    let id1: number | null = null;
    let id2: number | null = null;

    // Pour Pokémon 1: essayer comme ID d'abord
    const parsedId1 = parseInt(search1);
    if (!isNaN(parsedId1) && parsedId1 > 0 && parsedId1 <= 898) {
      id1 = parsedId1;
    } else {
      // Sinon essayer comme nom via l'API
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name1Lower}`);
        if (response.ok) {
          const data = await response.json();
          id1 = data.id;
        }
      } catch (error) {
        console.error('Erreur recherche Pokémon 1:', error);
      }
    }

    // Pour Pokémon 2: essayer comme ID d'abord
    const parsedId2 = parseInt(search2);
    if (!isNaN(parsedId2) && parsedId2 > 0 && parsedId2 <= 898) {
      id2 = parsedId2;
    } else {
      // Sinon essayer comme nom via l'API
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name2Lower}`);
        if (response.ok) {
          const data = await response.json();
          id2 = data.id;
        }
      } catch (error) {
        console.error('Erreur recherche Pokémon 2:', error);
      }
    }

    if (id1 && id2) {
      setPokemon1Id(id1);
      setPokemon2Id(id2);
    }
  };

  const getStatComparison = (diff: number) => {
    if (diff > 0) return { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' };
    if (diff < 0) return { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' };
    return { icon: ArrowLeftRight, color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-700' };
  };

  return (
    <div className="container-custom py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Comparaison de Pokémon
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comparez les statistiques de deux Pokémon côte à côte
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-2">Premier Pokémon</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Ex: pikachu ou 25"
                value={search1}
                onChange={(e) => setSearch1(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Second Pokémon</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Ex: charizard ou 6"
                value={search2}
                onChange={(e) => setSearch2(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          <button
            onClick={handleCompare}
            disabled={!search1 || !search2}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Comparer
          </button>
        </div>
      </div>

      {/* Résultats de la comparaison */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="loading-spinner"></div>
        </div>
      )}

      {data && data.pokemon1 && data.pokemon2 && (
        <div className="space-y-6">
          {/* Cartes des Pokémon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[data.pokemon1, data.pokemon2].map((pokemon) => (
              <div key={pokemon.pokemonId} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="relative p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                  <div className="absolute top-4 right-4 bg-gray-900/60 text-white px-3 py-1 rounded-full text-sm font-bold">
                    #{formatPokemonId(pokemon.pokemonId)}
                  </div>
                  <img
                    src={pokemon.artwork || pokemon.sprite}
                    alt={pokemon.name}
                    className="w-full max-w-xs mx-auto drop-shadow-2xl"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-3xl font-bold mb-4">{formatPokemonName(pokemon.name)}</h2>
                  <div className="flex gap-2 flex-wrap">
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
                </div>
              </div>
            ))}
          </div>

          {/* Tableau de comparaison des stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Comparaison des statistiques</h2>
              
              <div className="space-y-4">
                {Object.entries(data.comparison).map(([statKey, values]: [string, any]) => {
                  const comparison = getStatComparison(values.difference);
                  const Icon = comparison.icon;
                  const maxValue = Math.max(values.pokemon1, values.pokemon2);

                  return (
                    <div key={statKey} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{formatStatName(statKey)}</span>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${comparison.bg}`}>
                          <Icon className={`w-4 h-4 ${comparison.color}`} />
                          <span className={`text-sm font-bold ${comparison.color}`}>
                            {Math.abs(values.difference)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{formatPokemonName(data.pokemon1.name)}</span>
                            <span className="font-bold">{values.pokemon1}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div
                              className="h-3 rounded-full transition-all duration-500"
                              style={{
                                width: `${(values.pokemon1 / maxValue) * 100}%`,
                                backgroundColor: getStatColor(values.pokemon1),
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{formatPokemonName(data.pokemon2.name)}</span>
                            <span className="font-bold">{values.pokemon2}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div
                              className="h-3 rounded-full transition-all duration-500"
                              style={{
                                width: `${(values.pokemon2 / maxValue) * 100}%`,
                                backgroundColor: getStatColor(values.pokemon2),
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total des stats */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Total {formatPokemonName(data.pokemon1.name)}
                    </div>
                    <div className="text-3xl font-bold text-primary-600">
                      {data.pokemon1.stats.reduce((sum: number, stat: any) => sum + stat.base_stat, 0)}
                    </div>
                  </div>
                  <div className="bg-secondary-50 dark:bg-secondary-900/20 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Total {formatPokemonName(data.pokemon2.name)}
                    </div>
                    <div className="text-3xl font-bold text-secondary-600">
                      {data.pokemon2.stats.reduce((sum: number, stat: any) => sum + stat.base_stat, 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommandation */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">💡 Analyse</h3>
            <p className="text-gray-700 dark:text-gray-300">
              {data.pokemon1.stats.reduce((s: number, stat: any) => s + stat.base_stat, 0) >
              data.pokemon2.stats.reduce((s: number, stat: any) => s + stat.base_stat, 0)
                ? `${formatPokemonName(data.pokemon1.name)} a des statistiques totales supérieures`
                : data.pokemon1.stats.reduce((s: number, stat: any) => s + stat.base_stat, 0) <
                  data.pokemon2.stats.reduce((s: number, stat: any) => s + stat.base_stat, 0)
                ? `${formatPokemonName(data.pokemon2.name)} a des statistiques totales supérieures`
                : 'Les deux Pokémon ont des statistiques totales égales'}
              , mais chacun a ses forces et faiblesses selon leur rôle au combat.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparePage;
