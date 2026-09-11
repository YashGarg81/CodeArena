import type { Request, Response } from 'express';

export const getQuestions = (req: Request, res: Response) => {
  // TODO: fetch from DB
  res.json({ questions: [] });
};

export const submitAnswer = (req: Request, res: Response) => {
  const { answer, questionId } = req.body;
  // TODO: trigger scoring service
  res.json({ status: 'received', answer, questionId });
};
