import { Response } from 'express';
import { prisma } from '../config';
import { AuthenticatedRequest } from '../types';
import { aiService } from '../services/aiService';
import { PROMPTS } from '../prompts';

export async function generateNotes(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { topic, difficulty, length } = req.body;

    const prompt = PROMPTS.generateNotes(topic, difficulty, length);
    const content = await aiService.generateCompletion(prompt);

    res.status(200).json({
      title: `${topic} Notes`,
      topic,
      difficulty,
      length,
      content,
    });
  } catch (error: any) {
    console.error('Error generating notes:', error);
    res.status(500).json({ error: 'Failed to generate study notes.' });
  }
}

export async function getNotes(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { search, difficulty } = req.query;

    const whereClause: any = { userId };

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { topic: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (difficulty && typeof difficulty === 'string' && difficulty !== 'All') {
      whereClause.difficulty = difficulty;
    }

    const notes = await prisma.note.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
    });

    res.status(200).json({ notes });
  } catch (error: any) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch saved notes.' });
  }
}

export async function getNote(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const note = await prisma.note.findFirst({
      where: { id, userId },
    });

    if (!note) {
      res.status(404).json({ error: 'Note not found.' });
      return;
    }

    res.status(200).json({ note });
  } catch (error: any) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: 'Failed to fetch note.' });
  }
}

export async function saveNote(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { title, topic, difficulty, length, content, tags } = req.body;

    const note = await prisma.note.create({
      data: {
        userId,
        title,
        topic,
        difficulty: difficulty || 'Intermediate',
        length: length || 'Medium',
        content,
        tags: tags || [],
      },
    });

    res.status(201).json({ message: 'Note saved successfully!', note });
  } catch (error: any) {
    console.error('Error saving note:', error);
    res.status(500).json({ error: 'Failed to save note.' });
  }
}

export async function updateNote(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { title, content, tags, difficulty, length } = req.body;

    const existing = await prisma.note.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Note not found.' });
      return;
    }

    const updated = await prisma.note.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(tags !== undefined && { tags }),
        ...(difficulty !== undefined && { difficulty }),
        ...(length !== undefined && { length }),
        updatedAt: new Date(),
      },
    });

    res.status(200).json({ message: 'Note updated successfully!', note: updated });
  } catch (error: any) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note.' });
  }
}

export async function deleteNote(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.note.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Note not found.' });
      return;
    }

    await prisma.note.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Note deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note.' });
  }
}
