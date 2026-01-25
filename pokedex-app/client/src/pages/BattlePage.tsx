import React, { useState } from 'react';
import { usePokemon } from '../hooks/usePokemonAPI';
import { Swords, RefreshCw } from 'lucide-react';
import {
  formatPokemonName,
  getTypeColor,
  getTypeEmoji,
} from '../utils/helpers';

interface BattleResult {
  winner: string;
  damage1to2: number;
  damage2to1: number;
  effectiveness1: number;
  effectiveness2: number;
  log: string[];
}

const BattlePage: React.FC = () => {
  const [pokemon1Id, setPokemon1Id] = useState<number>(25); // Pikachu
  const [pokemon2Id, setPokemon2Id] = useState<number>(6);  // Charizard
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const { data: pokemon1 } = usePokemon(pokemon1Id);
  const { data: pokemon2 } = usePokemon(pokemon2Id);

  const calculateTypeEffectiveness = (attackerTypes: string[], defenderTypes: string[]): number => {
    const typeChart: Record<string, Record<string, number>> = {
      fire: { grass: 2, ice: 2, bug: 2, steel: 2, water: 0.5, fire: 0.5, rock: 0.5, dragon: 0.5 },
      water: { fire: 2, ground: 2, rock: 2, grass: 0.5, water: 0.5, dragon: 0.5, electric: 0.5 },
      grass: { water: 2, ground: 2, rock: 2, fire: 0.5, grass: 0.5, poison: 0.5, flying: 0.5, bug: 0.5, dragon: 0.5, steel: 0.5 },
      electric: { water: 2, flying: 2, grass: 0.5, electric: 0.5, dragon: 0.5, ground: 0 },
      // Ajoutez plus de types selon vos besoins
    };

    let effectiveness = 1;
    for (const attackType of attackerTypes) {
      for (const defendType of defenderTypes) {
        if (typeChart[attackType]?.[defendType]) {
          effectiveness *= typeChart[attackType][defendType];
        }
      }
    }
    return effectiveness;
  };

  const simulateBattle = () => {
    if (!pokemon1 || !pokemon2) return;

    setIsSimulating(true);
    const log: string[] = [];

    setTimeout(() => {
      const p1Attack = pokemon1.stats.find(s => s.stat.name === 'attack')?.base_stat || 50;
      const p1Defense = pokemon1.stats.find(s => s.stat.name === 'defense')?.base_stat || 50;
      const p2Attack = pokemon2.stats.find(s => s.stat.name === 'attack')?.base_stat || 50;
      const p2Defense = pokemon2.stats.find(s => s.stat.name === 'defense')?.base_stat || 50;

      const effectiveness1 = calculateTypeEffectiveness(pokemon1.types, pokemon2.types);
      const effectiveness2 = calculateTypeEffectiveness(pokemon2.types, pokemon1.types);

      log.push(`⚔️ Combat entre ${formatPokemonName(pokemon1.name)} et ${formatPokemonName(pokemon2.name)} !`);
      log.push('');

      const damage1to2 = Math.max(1, Math.floor((p1Attack / p2Defense) * 50 * effectiveness1));
      const damage2to1 = Math.max(1, Math.floor((p2Attack / p1Defense) * 50 * effectiveness2));

      log.push(`🎯 ${formatPokemonName(pokemon1.name)} attaque !`);
      log.push(`   Dégâts: ${damage1to2} (Efficacité: ${effectiveness1}x)`);
      log.push('');
      log.push(`🎯 ${formatPokemonName(pokemon2.name)} contre-attaque !`);
      log.push(`   Dégâts: ${damage2to1} (Efficacité: ${effectiveness2}x)`);
      log.push('');

      const p1HP = pokemon1.stats.find(s => s.stat.name === 'hp')?.base_stat || 100;
      const p2HP = pokemon2.stats.find(s => s.stat.name === 'hp')?.base_stat || 100;

      const turnsToDefeat1 = Math.ceil(p1HP / damage2to1);
      const turnsToDefeat2 = Math.ceil(p2HP / damage1to2);

      const winner = turnsToDefeat2 < turnsToDefeat1 ? pokemon1.name : pokemon2.name;

      log.push(`👑 ${formatPokemonName(winner)} remporte le combat !`);

      setBattleResult({
        winner,
        damage1to2,
        damage2to1,
        effectiveness1,
        effectiveness2,
        log,
      });
      setIsSimulating(false);
    }, 1000);
  };

  return (
    <div className="container-custom py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">⚔️ Simulateur de Combat</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Simulez un combat entre deux Pokémon
        </p>
      </div>

      {/* Sélection des Pokémon */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Premier combattant (ID)</label>
            <input
              type="number"
              value={pokemon1Id}
              onChange={(e) => setPokemon1Id(parseInt(e.target.value) || 1)}
              className="input"
              min="1"
              max="898"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Second combattant (ID)</label>
            <input
              type="number"
              value={pokemon2Id}
              onChange={(e) => setPokemon2Id(parseInt(e.target.value) || 1)}
              className="input"
              min="1"
              max="898"
            />
          </div>
        </div>
      </div>

      {/* Arène de combat */}
      {pokemon1 && pokemon2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Pokémon 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
              <img
                src={pokemon1.artwork || pokemon1.sprite}
                alt={pokemon1.name}
                className="w-48 h-48 mx-auto object-contain"
              />
              <h2 className="text-2xl font-bold mt-4">{formatPokemonName(pokemon1.name)}</h2>
              <div className="flex gap-2 justify-center mt-2">
                {pokemon1.types.map((type) => (
                  <span
                    key={type}
                    className="type-badge"
                    style={{ backgroundColor: getTypeColor(type) }}
                  >
                    {getTypeEmoji(type)} {type}
                  </span>
                ))}
              </div>
              <div className="mt-4 text-sm">
                <div>HP: {pokemon1.stats.find(s => s.stat.name === 'hp')?.base_stat}</div>
                <div>ATK: {pokemon1.stats.find(s => s.stat.name === 'attack')?.base_stat}</div>
                <div>DEF: {pokemon1.stats.find(s => s.stat.name === 'defense')?.base_stat}</div>
              </div>
            </div>

            {/* VS */}
            <div className="text-center">
              <button
                onClick={simulateBattle}
                disabled={isSimulating}
                className="btn btn-primary text-2xl px-8 py-6 flex items-center gap-3 mx-auto"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-8 h-8 animate-spin" />
                    Combat...
                  </>
                ) : (
                  <>
                    <Swords className="w-8 h-8" />
                    COMBAT !
                  </>
                )}
              </button>
            </div>

            {/* Pokémon 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
              <img
                src={pokemon2.artwork || pokemon2.sprite}
                alt={pokemon2.name}
                className="w-48 h-48 mx-auto object-contain"
              />
              <h2 className="text-2xl font-bold mt-4">{formatPokemonName(pokemon2.name)}</h2>
              <div className="flex gap-2 justify-center mt-2">
                {pokemon2.types.map((type) => (
                  <span
                    key={type}
                    className="type-badge"
                    style={{ backgroundColor: getTypeColor(type) }}
                  >
                    {getTypeEmoji(type)} {type}
                  </span>
                ))}
              </div>
              <div className="mt-4 text-sm">
                <div>HP: {pokemon2.stats.find(s => s.stat.name === 'hp')?.base_stat}</div>
                <div>ATK: {pokemon2.stats.find(s => s.stat.name === 'attack')?.base_stat}</div>
                <div>DEF: {pokemon2.stats.find(s => s.stat.name === 'defense')?.base_stat}</div>
              </div>
            </div>
          </div>

          {/* Résultats */}
          {battleResult && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">📊 Résultats du combat</h2>
              
              <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 border-2 border-yellow-500 rounded-lg p-6 mb-6 text-center">
                <div className="text-4xl mb-2">👑</div>
                <div className="text-2xl font-bold">
                  Vainqueur : {formatPokemonName(battleResult.winner)}
                </div>
              </div>

              <div className="space-y-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm">
                {battleResult.log.map((line, index) => (
                  <div key={index} className={line === '' ? 'h-2' : ''}>
                    {line}
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Dégâts infligés</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {battleResult.damage1to2} → {battleResult.damage2to1}
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Efficacité</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {battleResult.effectiveness1}x ↔ {battleResult.effectiveness2}x
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BattlePage;
