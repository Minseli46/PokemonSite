import React, { useState, useEffect } from 'react';
import { Quiz as QuizType } from '../utils/types';
import { shuffle } from '../utils/helpers';
import { CheckCircle, XCircle, RotateCw } from 'lucide-react';

interface QuizProps {
  questions: QuizType[];
  onComplete?: (score: number, total: number) => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswer = (answer: string) => {
    if (answered) return;

    setSelectedAnswer(answer);
    setAnswered(true);

    const isCorrect = answer === currentQuestion.answer;
    if (isCorrect) {
      setScore(score + 1);
    }

    // Passe à la question suivante après 1.5s
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setAnswered(false);
      } else {
        setShowResult(true);
        onComplete?.(isCorrect ? score + 1 : score, questions.length);
      }
    }, 1500);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setAnswered(false);
  };

  if (!currentQuestion && !showResult) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Aucune question disponible</p>
      </div>
    );
  }

  if (showResult) {
    const percentage = (score / questions.length) * 100;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Quiz terminé !</h2>
        
        <div className="mb-6">
          <div className="text-6xl font-bold text-primary-600 mb-2">
            {score}/{questions.length}
          </div>
          <div className="text-xl text-gray-600 dark:text-gray-400">
            {percentage.toFixed(0)}% de réussite
          </div>
        </div>

        <div className="mb-6">
          {percentage >= 80 ? (
            <p className="text-green-600 text-xl">🎉 Excellent travail !</p>
          ) : percentage >= 60 ? (
            <p className="text-blue-600 text-xl">👍 Pas mal !</p>
          ) : (
            <p className="text-orange-600 text-xl">💪 Continue à t'entraîner !</p>
          )}
        </div>

        <button
          onClick={handleRestart}
          className="btn btn-primary flex items-center gap-2 mx-auto"
        >
          <RotateCw className="w-5 h-5" />
          Recommencer
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Barre de progression */}
      <div className="h-2 bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full bg-primary-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Question {currentQuestionIndex + 1} / {questions.length}
          </div>
          <div className="text-sm font-semibold text-primary-600">
            Score: {score}
          </div>
        </div>

        {/* Image du Pokémon */}
        {currentQuestion.imageUrl && (
          <div className="mb-6 flex justify-center">
            <img
              src={currentQuestion.imageUrl}
              alt="Pokemon"
              className={`w-48 h-48 object-contain ${
                currentQuestion.isSilhouette ? 'brightness-0' : ''
              }`}
            />
          </div>
        )}

        {/* Question */}
        <h3 className="text-2xl font-bold mb-6 text-center">
          {currentQuestion.question}
        </h3>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQuestion.answer;
            const showCorrect = answered && isCorrect;
            const showIncorrect = answered && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={answered}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  showCorrect
                    ? 'bg-green-100 dark:bg-green-900/30 border-green-500'
                    : showIncorrect
                    ? 'bg-red-100 dark:bg-red-900/30 border-red-500'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                } disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>
                  {showCorrect && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                  {showIncorrect && (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Difficulté */}
        <div className="mt-6 text-center">
          <span className="inline-block px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-700">
            Difficulté: {currentQuestion.difficulty}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
