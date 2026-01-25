import React, { useState } from 'react';
import { Share2, Copy, Check, Download, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ShareTeamModalProps {
  teamId: string;
  teamName: string;
  onClose: () => void;
}

const ShareTeamModal: React.FC<ShareTeamModalProps> = ({ teamId, teamName, onClose }) => {
  const [shareCode, setShareCode] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const generateCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/share/team/${teamId}`);
      setShareCode(response.data.shareCode);
      setShareUrl(response.data.shareUrl);
      setExpiresAt(response.data.expiresAt);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la génération du code');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Share2 className="w-6 h-6 text-primary-600" />
            Partager l'équipe
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Équipe : <span className="font-bold">{teamName}</span>
          </p>
        </div>

        {!shareCode ? (
          <button
            onClick={generateCode}
            disabled={loading}
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Génération...
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                Générer un code de partage
              </>
            )}
          </button>
        ) : (
          <div className="space-y-4">
            {/* Code de partage */}
            <div>
              <label className="block text-sm font-medium mb-2">Code de partage</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareCode}
                  readOnly
                  className="input flex-1 font-mono text-2xl text-center tracking-wider"
                />
                <button
                  onClick={() => copyToClipboard(shareCode)}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copier
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* URL de partage */}
            <div>
              <label className="block text-sm font-medium mb-2">Lien de partage</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="input flex-1 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(shareUrl)}
                  className="btn btn-secondary"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Expiration */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    Expiration
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Ce code expirera le {formatExpiryDate(expiresAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Comment partager
              </h3>
              <ol className="text-sm space-y-1 list-decimal list-inside text-gray-700 dark:text-gray-300">
                <li>Copiez le code ou le lien</li>
                <li>Envoyez-le à vos amis</li>
                <li>Ils peuvent importer votre équipe depuis la page "Équipes"</li>
              </ol>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareTeamModal;
