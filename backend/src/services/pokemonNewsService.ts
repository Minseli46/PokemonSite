import axios from 'axios';
import * as cheerio from 'cheerio';

export interface PokemonNews {
  id: string;
  title: string;
  date: string;
  category: string;
  description: string;
  url: string;
  imageUrl?: string;
}

const NEWS_URL = 'https://www.pokemon.com/fr/actus-pokemon';

export async function fetchPokemonNews(): Promise<PokemonNews[]> {
  try {
    const { data } = await axios.get(NEWS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const news: PokemonNews[] = [];

    // Scraper les articles depuis la page
    $('.common-article-card, .featured-article, article').each((index, element) => {
      const $el = $(element);
      
      // Extraire les informations
      const titleEl = $el.find('h2, h3, .title, .card-title').first();
      const linkEl = $el.find('a').first();
      const dateEl = $el.find('time, .date, .published-date').first();
      const categoryEl = $el.find('.category, .tag, .badge').first();
      const descEl = $el.find('p, .description, .excerpt').first();
      const imgEl = $el.find('img').first();

      const title = titleEl.text().trim();
      const url = linkEl.attr('href');
      const date = dateEl.text().trim() || dateEl.attr('datetime') || '';
      const category = categoryEl.text().trim() || 'Actualités';
      const description = descEl.text().trim();
      const imageUrl = imgEl.attr('src') || imgEl.attr('data-src');

      if (title && url) {
        const fullUrl = url.startsWith('http') ? url : `https://www.pokemon.com${url}`;
        
        news.push({
          id: `news-${index}-${Date.now()}`,
          title,
          date,
          category,
          description: description || title,
          url: fullUrl,
          imageUrl: imageUrl?.startsWith('http') ? imageUrl : imageUrl ? `https://www.pokemon.com${imageUrl}` : undefined,
        });
      }
    });

    // Si le scraping automatique ne fonctionne pas, retourner des données de fallback
    if (news.length === 0) {
      return getFallbackNews();
    }

    return news.slice(0, 20); // Limiter à 20 actualités
  } catch (error) {
    console.error('Error fetching Pokemon news:', error);
    return getFallbackNews();
  }
}

function getFallbackNews(): PokemonNews[] {
  // Données de fallback basées sur les actualités visibles
  return [
    {
      id: 'news-1',
      title: "Empiflor d'Erika, Méga-Nanméouïe-ex et d'autres cartes de Méga-Évolution – Héros Transcendants",
      date: '23 janvier 2026',
      category: 'Jeu de Cartes à Collectionner',
      description: 'Cette extension atteint des sommets.',
      url: 'https://www.pokemon.com/fr/actus-pokemon/empiflor-derika-mega-nanmeouie-ex-et-dautres-cartes-de-mega-evolution-heros-transcendants',
    },
    {
      id: 'news-2',
      title: "Les Pokémon Obscurs surgissent dans l'évènement Amitié solide : Offensive dans Pokémon GO",
      date: '23 janvier 2026',
      category: 'Jeux vidéo et applis',
      description: 'La Team GO Rocket entre en jeu. À vous de sauver la mise !',
      url: 'https://www.pokemon.com/fr/actus-pokemon/les-pokemon-obscurs-surgissent-dans-levenement-amitie-solide-offensive-dans-pokemon-go',
    },
    {
      id: 'news-3',
      title: 'JCC Pokémon : stratégies des decks du Passe de combat Méga-Évolution – Héros Transcendants',
      date: '22 janvier 2026',
      category: 'Jeu de Cartes à Collectionner',
      description: 'Découvrez les meilleures stratégies pour dominer avec les nouveaux decks.',
      url: 'https://www.pokemon.com/fr/strategie/jcc-pokemon-strategies-des-decks-du-passe-de-combat-mega-evolution-heros-transcendants',
    },
    {
      id: 'news-4',
      title: 'Remportez une Laggronite lors de la saison 6 des combats classés de Légendes Pokémon : Z-A',
      date: '22 janvier 2026',
      category: 'Jeux vidéo et applis',
      description: 'Participez aux combats classés pour obtenir cette récompense exclusive.',
      url: 'https://www.pokemon.com/fr/actus-pokemon/remportez-une-laggronite-lors-de-la-saison-6-des-combats-classes-de-legendes-pokemon-z-a',
    },
    {
      id: 'news-5',
      title: "Tortank, doté de l'Insigne Surpuissant, revient dans les raids Téracristal 7 étoiles",
      date: '22 janvier 2026',
      category: 'Jeux vidéo et applis',
      description: 'Affrontez ce puissant Pokémon dans les raids les plus difficiles.',
      url: 'https://www.pokemon.com/fr/actus-pokemon/tortank-dote-de-linsigne-surpuissant-revient-dans-les-raids-teracristal-7-etoiles',
    },
    {
      id: 'news-6',
      title: 'En avant pour la Parade Onirique du JCC Pokémon Pocket',
      date: '22 janvier 2026',
      category: 'Jeux vidéo et applis',
      description: 'Découvrez le nouvel événement dans Pokémon Pocket.',
      url: 'https://www.pokemon.com/fr/actus-pokemon/en-avant-pour-la-parade-onirique-du-jcc-pokemon-pocket',
    },
    {
      id: 'news-7',
      title: "Profitez de bonus et d'une chance de trouver Pâtachiot chromatique lors de l'évènement Amitié solide dans Pokémon GO",
      date: '20 janvier 2026',
      category: 'Jeux vidéo et applis',
      description: 'Ne manquez pas cet événement spécial avec de nombreux bonus.',
      url: 'https://www.pokemon.com/fr/actus-pokemon/profitez-de-bonus-et-dune-chance-de-trouver-patachiot-chromatique-lors-de-levenement-amitie-solide-dans-pokemon-go',
    },
    {
      id: 'news-8',
      title: "Avant-première des Championnats Internationaux d'Europe 2026, évènements annexes et plus",
      date: '20 janvier 2026',
      category: 'Jeux vidéo et applis',
      description: "Préparez-vous pour les plus grands championnats de l'année.",
      url: 'https://www.pokemon.com/fr/actus-pokemon/avant-premiere-des-championnats-internationaux-deurope-2026-evenements-annexes-et-plus',
    },
    {
      id: 'news-9',
      title: 'Évènement butin Méga-Latios-ex dans le Jeu de Cartes à Collectionner Pokémon Pocket',
      date: '17 janvier 2026',
      category: 'Jeux vidéo et applis',
      description: 'Collectez des récompenses exclusives pendant cet événement limité.',
      url: 'https://www.pokemon.com/fr/actus-pokemon/evenement-butin-mega-latios-ex-dans-le-jeu-de-cartes-a-collectionner-pokemon-pocket',
    },
  ];
}
