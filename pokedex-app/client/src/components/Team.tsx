import React from 'react';
import { Team as TeamType, Pokemon } from '../utils/types';
import PokemonCard from './PokemonCard';
import { Trash2, Edit2 } from 'lucide-react';

interface TeamProps {
  team: TeamType;
  onRemovePokemon?: (pokemonId: number) => void;
  onEditTeam?: () => void;
  onDeleteTeam?: () => void;
}

const Team: React.FC<TeamProps> = ({
  team,
  onRemovePokemon,
  onEditTeam,
  onDeleteTeam,
}) => {
  const maxTeamSize = 6;
  const emptySlots = maxTeamSize - (team.pokemonDetails?.length || 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {team.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {team.pokemonDetails?.length || 0} / {maxTeamSize} Pokémon
          </p>
        </div>
        
        <div className="flex gap-2">
          {onEditTeam && (
            <button
              onClick={onEditTeam}
              className="btn btn-outline flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Modifier
            </button>
          )}
          {onDeleteTeam && (
            <button
              onClick={onDeleteTeam}
              className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          )}
        </div>
      </div>

      {/* Liste des Pokémon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.pokemonDetails?.map((pokemon) => (
          <div key={pokemon.pokemonId} className="relative">
            <PokemonCard pokemon={pokemon} />
            {onRemovePokemon && (
              <button
                onClick={() => onRemovePokemon(pokemon.pokemonId)}
                className="absolute top-2 left-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                title="Retirer du groupe"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        {/* Emplacements vides */}
        {Array.from({ length: emptySlots }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-full min-h-[200px] flex items-center justify-center"
          >
            <div className="text-center text-gray-400 dark:text-gray-500">
              <div className="text-4xl mb-2">+</div>
              <div className="text-sm">Emplacement libre</div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats d'équipe */}
      {team.pokemonDetails && team.pokemonDetails.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Stats de l'équipe</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">
                {team.pokemonDetails.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Pokémon
              </div>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-secondary-600">
                {new Set(team.pokemonDetails.flatMap((p) => p.types)).size}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Types différents
              </div>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(
                  team.pokemonDetails.reduce((sum, p) => {
                    const totalStats = p.stats.reduce((s, stat) => s + stat.base_stat, 0);
                    return sum + totalStats;
                  }, 0) / team.pokemonDetails.length
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Stats moyennes
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
