import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Quiz from '../components/Quiz';
import { quizAPI } from '../utils/api';
import { RotateCw, Play } from 'lucide-react';

const QuizPage: React.FC = () => {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [quizStarted, setQuizStarted] = useState(false);
  const [finalScore, setFinalScore] = useState<{ score: number; total: number } | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['quiz', difficulty],
    queryFn: () => quizAPI.generate(difficulty, 10),
    enabled: quizStarted,
  });

  const handleStart = () => {
    setQuizStarted(true);
    setFinalScore(null);
  };

  const handleComplete = (score: number, total: number) => {
    setFinalScore({ score, total });
  };

  const handleRestart = () => {
    setQuizStarted(false);
    setFinalScore(null);
  };

  if (!quizStarted) {
    return (
      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Quiz Pokémon 🎮</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Testez vos connaissances sur les Pokémon !
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Choisissez la difficulté</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    difficulty === level
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
                  }`}
                >
                  <div className="text-2xl mb-2">
                    {level === 'easy' && '😊'}
                    {level === 'medium' && '🤔'}
                    {level === 'hard' && '😰'}
                  </div>
                  <div className="font-bold text-lg capitalize">{level}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {level === 'easy' && 'Pour commencer'}
                    {level === 'medium' && 'Challenge moyen'}
                    {level === 'hard' && 'Pour les experts'}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleStart}
              className="btn btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
            >
              <Play className="w-6 h-6" />
              Commencer le quiz
            </button>
          </div>

          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="font-bold mb-2">ℹ️ À propos du quiz</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• 10 questions aléatoires</li>
              <li>• Questions sur les noms, types et silhouettes</li>
              <li>• Temps illimité pour répondre</li>
              <li>• Obtenez votre score à la fin !</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Génération du quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Quiz Pokémon</h1>
          <button
            onClick={handleRestart}
            className="btn btn-outline flex items-center gap-2"
          >
            <RotateCw className="w-5 h-5" />
            Recommencer
          </button>
        </div>

        {data?.questions && (
          <Quiz questions={data.questions} onComplete={handleComplete} />
        )}
      </div>
    </div>
  );
};

export default QuizPage;
