import { Response } from 'express';
import { prisma } from '../config';
import { AuthenticatedRequest } from '../types';
import { aiService } from '../services/aiService';
import { PROMPTS } from '../prompts';

export async function generateStudyPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const {
      subject,
      knowledgeLevel,
      difficulty,
      dailyTimeMinutes,
      durationDays,
      examDate,
      extraTopics,
    } = req.body;

    const prompt = PROMPTS.generateStudyPlan(
      subject,
      knowledgeLevel || 'Beginner',
      difficulty || 'Intermediate',
      dailyTimeMinutes || 120,
      durationDays || 7,
      examDate,
      extraTopics
    );

    const rawAiOutput = await aiService.generateCompletion(prompt);

    let parsed: any;
    try {
      const cleaned = rawAiOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.warn('Failed to parse AI study plan JSON directly, using fallback structure');
      parsed = JSON.parse(aiService['buildFallbackStudyPlanJSON'](prompt));
    }

    const plan = await prisma.studyPlan.create({
      data: {
        userId,
        title: parsed.title || `${durationDays}-Day ${subject} Study Plan`,
        subject,
        knowledgeLevel: knowledgeLevel || 'Beginner',
        difficulty: difficulty || 'Intermediate',
        dailyTimeMinutes: dailyTimeMinutes || 120,
        durationDays: durationDays || 7,
        examDate: examDate ? new Date(examDate) : null,
        extraTopics: extraTopics || null,
        progressPercent: 0,
        days: {
          create: (parsed.days || []).map((d: any, idx: number) => ({
            dayNumber: d.dayNumber || idx + 1,
            title: d.title || `Day ${idx + 1}`,
            topics: d.topics || [],
            durationMinutes: d.durationMinutes || dailyTimeMinutes || 120,
            learningActivity: d.learningActivity || 'Review textbook and video lectures.',
            practiceActivity: d.practiceActivity || 'Solve 5 practice problems.',
            revisionActivity: d.revisionActivity || 'Write key summary flashcards.',
            quizReview: d.quizReview || 'Take a short concept check quiz.',
            isCompleted: false,
          })),
        },
      },
      include: {
        days: {
          orderBy: { dayNumber: 'asc' },
        },
      },
    });

    res.status(201).json({
      message: 'Study plan generated successfully!',
      plan,
    });
  } catch (error: any) {
    console.error('Error generating study plan:', error);
    res.status(500).json({ error: 'Failed to generate study plan.' });
  }
}

export async function getStudyPlans(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;

    const plans = await prisma.studyPlan.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { days: true },
        },
      },
    });

    res.status(200).json({ plans });
  } catch (error: any) {
    console.error('Error fetching study plans:', error);
    res.status(500).json({ error: 'Failed to fetch study plans.' });
  }
}

export async function getStudyPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const plan = await prisma.studyPlan.findFirst({
      where: { id, userId },
      include: {
        days: {
          orderBy: { dayNumber: 'asc' },
        },
      },
    });

    if (!plan) {
      res.status(404).json({ error: 'Study plan not found.' });
      return;
    }

    res.status(200).json({ plan });
  } catch (error: any) {
    console.error('Error fetching study plan:', error);
    res.status(500).json({ error: 'Failed to fetch study plan details.' });
  }
}

export async function toggleDay(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id, dayId } = req.params;
    const { isCompleted } = req.body;

    const plan = await prisma.studyPlan.findFirst({
      where: { id, userId },
      include: { days: true },
    });

    if (!plan) {
      res.status(404).json({ error: 'Study plan not found.' });
      return;
    }

    const day = plan.days.find((d) => d.id === dayId);
    if (!day) {
      res.status(404).json({ error: 'Day schedule item not found.' });
      return;
    }

    // Update the specific day
    await prisma.studyPlanDay.update({
      where: { id: dayId },
      data: { isCompleted },
    });

    // Recalculate overall progress
    const totalDays = plan.days.length;
    const completedCount = plan.days.filter((d) => (d.id === dayId ? isCompleted : d.isCompleted)).length;
    const progressPercent = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

    const updatedPlan = await prisma.studyPlan.update({
      where: { id },
      data: {
        progressPercent,
        updatedAt: new Date(),
      },
      include: {
        days: {
          orderBy: { dayNumber: 'asc' },
        },
      },
    });

    res.status(200).json({
      message: 'Day completion status updated!',
      plan: updatedPlan,
    });
  } catch (error: any) {
    console.error('Error updating study day completion:', error);
    res.status(500).json({ error: 'Failed to update day status.' });
  }
}

export async function deleteStudyPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const plan = await prisma.studyPlan.findFirst({
      where: { id, userId },
    });

    if (!plan) {
      res.status(404).json({ error: 'Study plan not found.' });
      return;
    }

    await prisma.studyPlan.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Study plan deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting study plan:', error);
    res.status(500).json({ error: 'Failed to delete study plan.' });
  }
}
