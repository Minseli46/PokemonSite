import axios from 'axios';

const FUNTRANSLATIONS_API = 'https://api.funtranslations.com/translate';
const OPENTDB_API = 'https://opentdb.com/api.php';
const IPGEOLOCATION_API = 'https://api.ipgeolocation.io/ipgeo';

/**
 * Service pour FunTranslations API
 * Traduit du texte de manière humoristique (pirate, yoda, etc.)
 */
export const funTranslationsService = {
  /**
   * Traduit un nom de Pokémon en style pirate
   */
  async translatePirate(text: string): Promise<string> {
    try {
      const response = await axios.get(`${FUNTRANSLATIONS_API}/pirate.json`, {
        params: { text },
      });
      return response.data.contents.translated;
    } catch (error) {
      console.error('FunTranslations error:', error);
      // Retourner le texte original en cas d'erreur (rate limit)
      return text;
    }
  },

  /**
   * Traduit un nom de Pokémon en style Yoda
   */
  async translateYoda(text: string): Promise<string> {
    try {
      const response = await axios.get(`${FUNTRANSLATIONS_API}/yoda.json`, {
        params: { text },
      });
      return response.data.contents.translated;
    } catch (error) {
      console.error('FunTranslations error:', error);
      return text;
    }
  },

  /**
   * Traduit un nom de Pokémon en style Shakespeare
   */
  async translateShakespeare(text: string): Promise<string> {
    try {
      const response = await axios.get(`${FUNTRANSLATIONS_API}/shakespeare.json`, {
        params: { text },
      });
      return response.data.contents.translated;
    } catch (error) {
      console.error('FunTranslations error:', error);
      return text;
    }
  },
};

/**
 * Service pour Open Trivia Database
 * Génère des questions de quiz aléatoires
 */
export const openTriviaService = {
  /**
   * Récupère des questions de quiz aléatoires
   */
  async getQuizQuestions(amount: number = 10, difficulty?: 'easy' | 'medium' | 'hard') {
    try {
      const params: any = {
        amount,
        type: 'multiple',
      };
      if (difficulty) {
        params.difficulty = difficulty;
      }

      const response = await axios.get(OPENTDB_API, { params });
      
      return response.data.results.map((q: any) => ({
        question: decodeHTMLEntities(q.question),
        correctAnswer: decodeHTMLEntities(q.correct_answer),
        incorrectAnswers: q.incorrect_answers.map(decodeHTMLEntities),
        category: q.category,
        difficulty: q.difficulty,
      }));
    } catch (error) {
      console.error('OpenTDB error:', error);
      return [];
    }
  },
};

/**
 * Service pour IP Geolocation
 * Obtient la localisation de l'utilisateur
 */
export const geolocationService = {
  /**
   * Obtient les informations de géolocalisation
   * Note: Nécessite une clé API (à configurer dans .env)
   */
  async getUserLocation(apiKey?: string) {
    try {
      if (!apiKey) {
        // Fallback sur l'API gratuite ipapi.co
        const response = await axios.get('https://ipapi.co/json/');
        return {
          city: response.data.city,
          country: response.data.country_name,
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          timezone: response.data.timezone,
        };
      }

      const response = await axios.get(IPGEOLOCATION_API, {
        params: { apiKey },
      });

      return {
        city: response.data.city,
        country: response.data.country_name,
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        timezone: response.data.time_zone.name,
      };
    } catch (error) {
      console.error('Geolocation error:', error);
      return null;
    }
  },

  /**
   * Génère des événements Pokémon fictifs basés sur la localisation
   */
  async getPokemonEvents(location: { city: string; country: string }) {
    // Simulation d'événements locaux (dans une vraie app, ce serait une API dédiée)
    return [
      {
        id: 1,
        title: `Tournoi Pokémon à ${location.city}`,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: location.city,
        description: 'Venez affronter les meilleurs dresseurs de la région !',
      },
      {
        id: 2,
        title: 'Échange de cartes Pokémon',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        location: location.city,
        description: 'Rencontrez d\'autres collectionneurs et échangez vos cartes.',
      },
      {
        id: 3,
        title: `Compétition ${location.country}`,
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        location: location.country,
        description: 'Championnat national - inscriptions ouvertes !',
      },
    ];
  },
};

/**
 * Décode les entités HTML (utilisé pour Open Trivia Database)
 */
function decodeHTMLEntities(text: string): string {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}
