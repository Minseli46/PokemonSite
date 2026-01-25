import { Router } from 'express';
import {
  generateQuiz,
  getSavedQuizzes,
  saveQuiz,
  checkAnswer,
} from '../controllers/quizController';

const router = Router();

// Routes pour les quiz
router.get('/generate', generateQuiz);
router.get('/', getSavedQuizzes);
router.post('/', saveQuiz);
router.post('/check', checkAnswer);

export default router;
