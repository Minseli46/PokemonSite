import React, { useState } from 'react';
import { useUserTeams, useCreateTeam } from '../hooks/useTeam';
import Team from '../components/Team';
import ShareTeamModal from '../components/ShareTeamModal';
import { Plus, Users, Download, Share2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const TeamsPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedTeamToShare, setSelectedTeamToShare] = useState<{ id: string; name: string } | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);
  
  // TODO: Récupérer l'userId depuis Firebase Auth
  const userId = 'demo-user-123';
  
  const { data: teamsData, isLoading, refetch } = useUserTeams(userId);
  const createTeamMutation = useCreateTeam();

  const handleCreateTeam = async () => {
    if (newTeamName.trim()) {
      try {
        await createTeamMutation.mutateAsync({
          userId,
          name: newTeamName,
          pokemons: [],
        });
        setNewTeamName('');
        setShowCreateModal(false);
      } catch (error) {
        console.error('Error creating team:', error);
      }
    }
  };

  const handleImportTeam = async () => {
    if (!importCode.trim()) return;

    setImporting(true);
    setImportError('');

    try {
      await axios.post(`${API_URL}/share/${importCode.toUpperCase()}/import`, {
        userId,
      });
      setImportCode('');
      setShowImportModal(false);
      refetch();
    } catch (error: any) {
      setImportError(error.response?.data?.message || 'Code invalide ou expiré');
    } finally {
      setImporting(false);
    }
  };

  const handleShareTeam = (teamId: string, teamName: string) => {
    setSelectedTeamToShare({ id: teamId, name: teamName });
    setShowShareModal(true);
  };

  if (isLoading) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Mes Équipes</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gérez vos équipes de Pokémon
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Importer
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nouvelle équipe
            </button>
          </div>
        </div>
      </div>

      {/* Liste des équipes */}
      {teamsData?.teams && teamsData.teams.length > 0 ? (
        <div className="space-y-6">
          {teamsData.teams.map((team) => (
            <div key={team.id} className="relative">
              <Team team={team} />
              <button
                onClick={() => handleShareTeam(team.id, team.name)}
                className="absolute top-4 right-4 btn btn-secondary flex items-center gap-2 text-sm"
              >
                <Share2 className="w-4 h-4" />
                Partager
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Aucune équipe</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Créez votre première équipe pour commencer !
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Créer une équipe
          </button>
        </div>
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Créer une nouvelle équipe</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Nom de l'équipe</label>
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Ex: Équipe Feu"
                className="input"
                autoFocus
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTeamName('');
                }}
                className="btn btn-outline"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateTeam}
                disabled={!newTeamName.trim() || createTeamMutation.isPending}
                className="btn btn-primary disabled:opacity-50"
              >
                {createTeamMutation.isPending ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'importation */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Download className="w-6 h-6" />
              Importer une équipe
            </h2>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Code de partage</label>
              <input
                type="text"
                value={importCode}
                onChange={(e) => setImportCode(e.target.value.toUpperCase())}
                placeholder="Ex: A1B2C3D4"
                className="input font-mono text-center text-xl tracking-wider"
                autoFocus
                maxLength={8}
              />
              {importError && (
                <p className="text-red-500 text-sm mt-2">{importError}</p>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportCode('');
                  setImportError('');
                }}
                className="btn btn-outline"
              >
                Annuler
              </button>
              <button
                onClick={handleImportTeam}
                disabled={!importCode.trim() || importing}
                className="btn btn-primary disabled:opacity-50"
              >
                {importing ? 'Importation...' : 'Importer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de partage */}
      {showShareModal && selectedTeamToShare && (
        <ShareTeamModal
          teamId={selectedTeamToShare.id}
          teamName={selectedTeamToShare.name}
          onClose={() => {
            setShowShareModal(false);
            setSelectedTeamToShare(null);
          }}
        />
      )}
    </div>
  );
};

export default TeamsPage;
