import { Request, Response, NextFunction } from 'express';
import databaseService from '../services/databaseService';
import pokeAPIService from '../services/pokeAPIService';

/**
 * Génère un quiz aléatoire
 */
export const generateQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { difficulty = 'medium', count = 10 } = req.query;
    
    const quizCount = Math.min(parseInt(count as string) || 10, 50);
    
    // Génère des questions aléatoires
    const questions = [];
    
    for (let i = 0; i < quizCount; i++) {
      const randomId = Math.floor(Math.random() * 898) + 1; // 898 Pokémon au total (Gen 1-8)
      const pokemon = await pokeAPIService.getPokemonDetails(randomId);
      
      // Choisit un type de question aléatoire
      const questionType = ['name', 'type', 'silhouette'][Math.floor(Math.random() * 3)];
      
      let question;
      switch (questionType) {
        case 'name':
          question = generateNameQuestion(pokemon);
          break;
        case 'type':
          question = generateTypeQuestion(pokemon);
          break;
        case 'silhouette':
          question = generateSilhouetteQuestion(pokemon);
          break;
        default:
          question = generateNameQuestion(pokemon);
      }
      
      questions.push(question);
    }
    
    res.json({ questions, difficulty, count: questions.length });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère des quiz sauvegardés
 */
export const getSavedQuizzes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { difficulty, limit = 10 } = req.query;
    
    const quizzes = await databaseService.getRandomQuizzes(
      parseInt(limit as string),
      difficulty as string | undefined
    );
    
    res.json({ quizzes });
  } catch (error) {
    next(error);
  }
};

/**
 * Sauvegarde un quiz
 */
export const saveQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { question, answer, options, difficulty, pokemonId, type } = req.body;
    
    if (!question || !answer || !options || !pokemonId || !type) {
      return res.status(400).json({ 
        error: 'question, answer, options, pokemonId, and type are required' 
      });
    }
    
    const quiz = await databaseService.saveQuiz({
      question,
      answer,
      options,
      difficulty: difficulty || 'medium',
      pokemonId,
      type,
    });
    
    res.status(201).json(quiz);
  } catch (error) {
    next(error);
  }
};

/**
 * Vérifie la réponse à une question
 */
export const checkAnswer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pokemonId, answer, questionType } = req.body;
    
    if (!pokemonId || !answer || !questionType) {
      return res.status(400).json({ 
        error: 'pokemonId, answer, and questionType are required' 
      });
    }
    
    const pokemon = await pokeAPIService.getPokemonDetails(pokemonId);
    let correct = false;
    let correctAnswer = '';
    
    switch (questionType) {
      case 'name':
        correctAnswer = pokemon.name;
        correct = answer.toLowerCase() === pokemon.name.toLowerCase();
        break;
      case 'type':
        correctAnswer = pokemon.types.map((t: any) => t.type.name).join(', ');
        correct = pokemon.types.some((t: any) => 
          t.type.name.toLowerCase() === answer.toLowerCase()
        );
        break;
      default:
        return res.status(400).json({ error: 'Invalid question type' });
    }
    
    res.json({ 
      correct, 
      correctAnswer,
      userAnswer: answer 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fonctions utilitaires pour générer différents types de questions
 */

function generateNameQuestion(pokemon: any) {
  // Génère 3 options incorrectes aléatoires
  const wrongOptions = [];
  for (let i = 0; i < 3; i++) {
    const randomId = Math.floor(Math.random() * 898) + 1;
    wrongOptions.push(`Pokemon ${randomId}`);
  }
  
  const options = [...wrongOptions, pokemon.name].sort(() => Math.random() - 0.5);
  
  return {
    question: `Quel est le nom de ce Pokémon ?`,
    answer: pokemon.name,
    options,
    pokemonId: pokemon.id,
    type: 'name',
    imageUrl: pokemon.sprites.front_default,
  };
}

function generateTypeQuestion(pokemon: any) {
  const types = ['normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 
                 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
  
  const correctTypes = pokemon.types.map((t: any) => t.type.name);
  const wrongTypes = types.filter(t => !correctTypes.includes(t))
                           .sort(() => Math.random() - 0.5)
                           .slice(0, 3);
  
  const options = [...wrongTypes, correctTypes[0]].sort(() => Math.random() - 0.5);
  
  return {
    question: `Quel est le type de ${pokemon.name} ?`,
    answer: correctTypes.join(', '),
    options,
    pokemonId: pokemon.id,
    type: 'type',
    imageUrl: pokemon.sprites.front_default,
  };
}

function generateSilhouetteQuestion(pokemon: any) {
  const wrongOptions = [];
  for (let i = 0; i < 3; i++) {
    const randomId = Math.floor(Math.random() * 898) + 1;
    wrongOptions.push(`Pokemon ${randomId}`);
  }
  
  const options = [...wrongOptions, pokemon.name].sort(() => Math.random() - 0.5);
  
  return {
    question: `Qui est ce Pokémon ? (silhouette)`,
    answer: pokemon.name,
    options,
    pokemonId: pokemon.id,
    type: 'silhouette',
    imageUrl: pokemon.sprites.front_default,
    isSilhouette: true,
  };
}
