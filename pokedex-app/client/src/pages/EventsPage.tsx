import React, { useEffect, useState } from 'react';
import { MapPin, Calendar, Users, ExternalLink } from 'lucide-react';
import { geolocationService } from '../services/externalAPIs';

interface PokemonEvent {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
}

const EventsPage: React.FC = () => {
  const [location, setLocation] = useState<{ city: string; country: string } | null>(null);
  const [events, setEvents] = useState<PokemonEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLocationAndEvents();
  }, []);

  const loadLocationAndEvents = async () => {
    try {
      setLoading(true);
      const userLocation = await geolocationService.getUserLocation();
      
      if (userLocation) {
        setLocation({
          city: userLocation.city,
          country: userLocation.country,
        });

        const pokemonEvents = await geolocationService.getPokemonEvents({
          city: userLocation.city,
          country: userLocation.country,
        });
        setEvents(pokemonEvents);
      }
    } catch (error) {
      console.error('Error loading location:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement de votre localisation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">🗺️ Événements Pokémon Locaux</h1>
        {location && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <MapPin className="w-5 h-5" />
            <span>
              Événements près de {location.city}, {location.country}
            </span>
          </div>
        )}
      </div>

      {events.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Aucun événement trouvé</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Il n'y a pas d'événements Pokémon prévus dans votre région pour le moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm">{formatEventDate(event.date)}</span>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {event.description}
                </p>

                <button className="btn btn-primary w-full flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  En savoir plus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Informations supplémentaires */}
      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">💡 À propos des événements</h2>
        <div className="space-y-2 text-gray-700 dark:text-gray-300">
          <p>
            • Les événements sont automatiquement filtrés selon votre localisation
          </p>
          <p>
            • Revenez régulièrement pour découvrir de nouveaux événements
          </p>
          <p>
            • Certains événements peuvent être en ligne ou hybrides
          </p>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
