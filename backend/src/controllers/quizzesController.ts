import { Response } from 'express';
import { prisma } from '../config';
import { AuthenticatedRequest } from '../types';
import { aiService } from '../services/aiService';
import { PROMPTS } from '../prompts';

export async function generateQuiz(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { topic, difficulty, questionsCount, questionType } = req.body;

    const count = questionsCount || 5;
    const qType = questionType || 'MCQ';
    const diff = difficulty || 'Intermediate';

    const prompt = PROMPTS.generateQuiz(topic, diff, count, qType);
    const rawAiOutput = await aiService.generateCompletion(prompt);

    // Parse JSON
    let parsed: any;
    try {
      // Clean possible markdown code fences
      const cleaned = rawAiOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.warn('Failed to parse AI quiz JSON directly, using fallback structure');
      parsed = JSON.parse(aiService['buildFallbackQuizJSON'](prompt));
    }

    // Persist Quiz and Questions in PostgreSQL
    const quiz = await prisma.quiz.create({
      data: {
        userId,
        title: parsed.title || `${topic} Quiz`,
        topic,
        difficulty: diff,
        questionType: qType,
        questionsCount: parsed.questions?.length || count,
        questions: {
          create: (parsed.questions || []).map((q: any, idx: number) => ({
            order: q.order || idx + 1,
            question: q.question,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || 'No explanation provided.',
          })),
        },
      },
      include: {
        questions: {
          select: {
            id: true,
            order: true,
            question: true,
            options: true,
            // DO NOT EXPOSE correctAnswer and explanation during quiz taking!
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    res.status(201).json({
      message: 'Quiz generated successfully!',
      quiz,
    });
  } catch (error: any) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: 'Failed to generate quiz.' });
  }
}

export async function getQuizzes(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;

    const quizzes = await prisma.quiz.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { questions: true, attempts: true },
        },
        attempts: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            score: true,
            totalQuestions: true,
            createdAt: true,
          },
        },
      },
    });

    res.status(200).json({ quizzes });
  } catch (error: any) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes.' });
  }
}

export async function getQuiz(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { revealAnswers } = req.query;

    const quiz = await prisma.quiz.findFirst({
      where: { id, userId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        attempts: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found.' });
      return;
    }

    // Hide answers if revealAnswers is not true and there are no completed attempts
    const shouldReveal = revealAnswers === 'true' || quiz.attempts.length > 0;

    const sanitizedQuestions = quiz.questions.map((q) => ({
      id: q.id,
      order: q.order,
      question: q.question,
      options: q.options,
      ...(shouldReveal && {
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }),
    }));

    res.status(200).json({
      quiz: {
        ...quiz,
        questions: sanitizedQuestions,
      },
    });
  } catch (error: any) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Failed to fetch quiz details.' });
  }
}

export async function submitQuiz(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { answers } = req.body; // Map: { [questionId]: selectedAnswer }

    const quiz = await prisma.quiz.findFirst({
      where: { id, userId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found.' });
      return;
    }

    let score = 0;
    const totalQuestions = quiz.questions.length;

    const gradedQuestions = quiz.questions.map((q) => {
      const studentAnswer = answers[q.id] || null;
      const isCorrect = studentAnswer !== null && studentAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

      if (isCorrect) {
        score += 1;
      }

      return {
        id: q.id,
        order: q.order,
        question: q.question,
        options: q.options,
        studentAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    // Save Attempt to Database
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: quiz.id,
        userId,
        score,
        totalQuestions,
        userAnswers: answers,
      },
    });

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    res.status(200).json({
      message: 'Quiz submitted and graded successfully!',
      attemptId: attempt.id,
      score,
      totalQuestions,
      percentage,
      scoreDisplay: `${score} / ${totalQuestions}`,
      questions: gradedQuestions,
    });
  } catch (error: any) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Failed to grade quiz submission.' });
  }
}
