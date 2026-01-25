import React, { useState } from 'react';
import { usePokemon } from '../hooks/usePokemonAPI';
import { Sparkles, Loader2 } from 'lucide-react';
import { funTranslationsService } from '../services/externalAPIs';
import { formatPokemonName, getTypeColor, getTypeEmoji } from '../utils/helpers';

type TranslationType = 'pirate' | 'yoda' | 'shakespeare';

const FunTranslationsPage: React.FC = () => {
  const [pokemonId, setPokemonId] = useState<number>(25); // Pikachu par défaut
  const [translationType, setTranslationType] = useState<TranslationType>('pirate');
  const [translatedName, setTranslatedName] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);

  const { data: pokemon, isLoading } = usePokemon(pokemonId);

  const handleTranslate = async () => {
    if (!pokemon) return;

    setIsTranslating(true);
    try {
      let result = '';
      const pokemonName = formatPokemonName(pokemon.name);

      switch (translationType) {
        case 'pirate':
          result = await funTranslationsService.translatePirate(pokemonName);
          break;
        case 'yoda':
          result = await funTranslationsService.translateYoda(pokemonName);
          break;
        case 'shakespeare':
          result = await funTranslationsService.translateShakespeare(pokemonName);
          break;
      }

      setTranslatedName(result);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedName('Erreur de traduction (limite d\'API atteinte)');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">✨ Traductions Amusantes</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Traduisez les noms de Pokémon en style pirate, Yoda ou Shakespeare !
        </p>
      </div>

      {/* Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Pokémon (ID)</label>
            <input
              type="number"
              value={pokemonId}
              onChange={(e) => setPokemonId(parseInt(e.target.value) || 1)}
              className="input"
              min="1"
              max="898"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Style de traduction</label>
            <select
              value={translationType}
              onChange={(e) => setTranslationType(e.target.value as TranslationType)}
              className="input"
            >
              <option value="pirate">🏴‍☠️ Pirate</option>
              <option value="yoda">🧙 Yoda</option>
              <option value="shakespeare">📜 Shakespeare</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleTranslate}
          disabled={isTranslating || isLoading}
          className="btn btn-primary mt-6 w-full flex items-center justify-center gap-2"
        >
          {isTranslating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Traduction en cours...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Traduire
            </>
          )}
        </button>
      </div>

      {/* Résultat */}
      {pokemon && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pokémon original */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-4">Original</h2>
            <img
              src={pokemon.artwork || pokemon.sprite}
              alt={pokemon.name}
              className="w-48 h-48 mx-auto object-contain mb-4"
            />
            <h3 className="text-3xl font-bold mb-2">{formatPokemonName(pokemon.name)}</h3>
            <div className="flex gap-2 justify-center">
              {pokemon.types.map((type) => (
                <span
                  key={type}
                  className="type-badge"
                  style={{ backgroundColor: getTypeColor(type) }}
                >
                  {getTypeEmoji(type)} {type}
                </span>
              ))}
            </div>
          </div>

          {/* Pokémon traduit */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-4">
              {translationType === 'pirate' && '🏴‍☠️ Version Pirate'}
              {translationType === 'yoda' && '🧙 Version Yoda'}
              {translationType === 'shakespeare' && '📜 Version Shakespeare'}
            </h2>
            <img
              src={pokemon.artwork || pokemon.sprite}
              alt={pokemon.name}
              className="w-48 h-48 mx-auto object-contain mb-4 filter drop-shadow-2xl"
            />
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 min-h-[80px] flex items-center justify-center">
              {translatedName ? (
                <h3 className="text-3xl font-bold">{translatedName}</h3>
              ) : (
                <p className="text-white/70">Cliquez sur "Traduire" pour voir la magie opérer ✨</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Avertissement API */}
      <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          ⚠️ Note importante
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          L'API FunTranslations a une limite de 5 requêtes par heure pour les comptes gratuits.
          Si vous voyez "Erreur de traduction", c'est que la limite est atteinte. Réessayez plus tard !
        </p>
      </div>
    </div>
  );
};

export default FunTranslationsPage;
