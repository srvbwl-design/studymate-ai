import { Response } from 'express';
import { prisma } from '../config';
import { AuthenticatedRequest } from '../types';

export async function getDashboardData(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;

    // Run parallel queries for dashboard aggregation
    const [
      conversationsCount,
      notesCount,
      quizzesCount,
      quizAttemptsCount,
      studyPlansCount,
      documentsCount,
      recentConversations,
      recentNotes,
      recentQuizzes,
      activeStudyPlans,
    ] = await Promise.all([
      prisma.conversation.count({ where: { userId } }),
      prisma.note.count({ where: { userId } }),
      prisma.quiz.count({ where: { userId } }),
      prisma.quizAttempt.count({ where: { userId } }),
      prisma.studyPlan.count({ where: { userId } }),
      prisma.document.count({ where: { userId } }),
      prisma.conversation.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 4,
        include: {
          _count: { select: { messages: true } },
        },
      }),
      prisma.note.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 4,
        select: {
          id: true,
          title: true,
          topic: true,
          difficulty: true,
          length: true,
          updatedAt: true,
          tags: true,
        },
      }),
      prisma.quiz.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 4,
        include: {
          attempts: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              score: true,
              totalQuestions: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.studyPlan.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        include: {
          _count: { select: { days: true } },
        },
      }),
    ]);

    // Unique topics studied (from notes + conversations + quizzes)
    const distinctNotes = await prisma.note.findMany({
      where: { userId },
      select: { topic: true },
      distinct: ['topic'],
    });

    const distinctQuizzes = await prisma.quiz.findMany({
      where: { userId },
      select: { topic: true },
      distinct: ['topic'],
    });

    const uniqueTopics = new Set([
      ...distinctNotes.map((n) => n.topic.toLowerCase().trim()),
      ...distinctQuizzes.map((q) => q.topic.toLowerCase().trim()),
    ]);

    res.status(200).json({
      studentName: req.user!.name,
      stats: {
        topicsStudied: Math.max(uniqueTopics.size, conversationsCount),
        notesCreated: notesCount,
        quizzesCompleted: quizAttemptsCount,
        studySessions: conversationsCount + quizAttemptsCount,
        studyPlansActive: studyPlansCount,
        documentsUploaded: documentsCount,
      },
      recentConversations,
      recentNotes,
      recentQuizzes,
      activeStudyPlans,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data.' });
  }
}
