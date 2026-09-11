import type { Response } from 'express';
import { prisma } from '../db';
import type { AuthenticatedRequest } from './auth';

/**
 * Retrieves quiz/practice questions from the database, redacting the correct answer index.
 */
export const getQuestions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const quizId = typeof req.query.quizId === 'string' ? req.query.quizId : undefined;
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || 20), 10)));

    const questions = await prisma.quizQuestion.findMany({
      where: quizId ? { quizId } : undefined,
      take: limit,
      orderBy: { order: 'asc' },
      select: {
        id: true,
        quizId: true,
        question: true,
        options: true,
        order: true,
        // Omit correctAnswer from client payload to prevent client-side answer leakage
      }
    });

    res.json({ questions });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch questions from database', details: err.message });
  }
};

/**
 * Evaluates candidate's question answer against database truth and scores the attempt.
 */
export const submitAnswer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { questionId, answer } = req.body;
    if (!questionId || typeof answer !== 'number') {
      res.status(400).json({ error: 'Valid questionId and numeric option answer index are required' });
      return;
    }

    const question = await prisma.quizQuestion.findUnique({
      where: { id: String(questionId) },
      include: { quiz: true }
    });

    if (!question) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    const isCorrect = question.correctAnswer === answer;
    const scoreEarned = isCorrect ? (question.quiz?.xpReward || 10) : 0;

    res.json({
      status: 'evaluated',
      questionId,
      submittedAnswer: answer,
      correct: isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || (isCorrect ? 'Correct choice!' : 'Incorrect option chosen.'),
      xpEarned: scoreEarned
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to evaluate answer', details: err.message });
  }
};
