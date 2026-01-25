import React from 'react';
import { Pokemon } from '../utils/types';
import { formatPokemonId, formatPokemonName, getTypeColor, getTypeEmoji } from '../utils/helpers';

interface PokemonCardProps {
  pokemon: Pokemon;
  onClick?: () => void;
  selected?: boolean;
}

const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onClick, selected = false }) => {
  return (
    <div
      className={`pokemon-card bg-white dark:bg-gray-800 cursor-pointer ${
        selected ? 'ring-4 ring-primary-500' : ''
      }`}
      onClick={onClick}
    >
      {/* Badge ID */}
      <div className="absolute top-2 right-2 bg-gray-900/60 text-white px-2 py-1 rounded-full text-xs font-bold">
        #{formatPokemonId(pokemon.pokemonId)}
      </div>

      {/* Image */}
      <div className="relative p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
        <img
          src={pokemon.artwork || pokemon.sprite}
          alt={pokemon.name}
          className="w-full h-48 object-contain drop-shadow-lg"
          loading="lazy"
        />
      </div>

      {/* Informations */}
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
          {formatPokemonName(pokemon.name)}
        </h3>

        {/* Types */}
        <div className="flex gap-2 flex-wrap">
          {pokemon.types.map((type) => (
            <span
              key={type}
              className="type-badge flex items-center gap-1"
              style={{ backgroundColor: getTypeColor(type) }}
            >
              <span>{getTypeEmoji(type)}</span>
              <span>{type}</span>
            </span>
          ))}
        </div>

        {/* Stats principales */}
        {pokemon.stats && (
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="text-gray-500 dark:text-gray-400">HP</div>
              <div className="font-bold">
                {pokemon.stats.find((s) => s.stat.name === 'hp')?.base_stat || 0}
              </div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">ATK</div>
              <div className="font-bold">
                {pokemon.stats.find((s) => s.stat.name === 'attack')?.base_stat || 0}
              </div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">DEF</div>
              <div className="font-bold">
                {pokemon.stats.find((s) => s.stat.name === 'defense')?.base_stat || 0}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PokemonCard;
