import { Response } from 'express';
import { prisma } from '../config';
import { AuthenticatedRequest } from '../types';
import { aiService } from '../services/aiService';
import { PROMPTS } from '../prompts';

export async function getConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    res.status(200).json({ conversations });
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations.' });
  }
}

export async function getConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const conversation = await prisma.conversation.findFirst({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found.' });
      return;
    }

    res.status(200).json({ conversation });
  } catch (error: any) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation details.' });
  }
}

export async function createConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { title } = req.body;

    const conversation = await prisma.conversation.create({
      data: {
        userId,
        title: title || 'New Study Session',
      },
    });

    res.status(201).json({ conversation });
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create new conversation.' });
  }
}

export async function deleteConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const conversation = await prisma.conversation.findFirst({
      where: { id, userId },
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found.' });
      return;
    }

    await prisma.conversation.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Conversation deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation.' });
  }
}

export async function sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    let { conversationId, message, difficulty, topic } = req.body;
    const currentDifficulty = difficulty || 'Intermediate';

    let conversation;

    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 15, // last 15 messages for multi-turn context
          },
        },
      });
    }

    // Auto-create conversation if none was provided or not found
    if (!conversation) {
      const generatedTitle = topic
        ? topic.slice(0, 45)
        : message.slice(0, 45) + (message.length > 45 ? '...' : '');

      conversation = await prisma.conversation.create({
        data: {
          userId,
          title: generatedTitle,
        },
        include: {
          messages: true,
        },
      });
      conversationId = conversation.id;
    }

    // 1. Save user message
    const userMsgRecord = await prisma.message.create({
      data: {
        conversationId,
        role: 'user',
        content: message,
      },
    });

    // 2. Build history for AI
    const history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = (
      conversation.messages || []
    ).map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));
    history.push({ role: 'user', content: message });

    // 3. Call AI
    const systemPrompt = PROMPTS.tutorSystem(currentDifficulty);
    const aiResponseText = await aiService.generateChat(history, systemPrompt);

    // 4. Save AI response
    const assistantMsgRecord = await prisma.message.create({
      data: {
        conversationId,
        role: 'assistant',
        content: aiResponseText,
      },
    });

    // 5. Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    res.status(200).json({
      conversationId,
      userMessage: userMsgRecord,
      assistantMessage: assistantMsgRecord,
    });
  } catch (error: any) {
    console.error('Error sending chat message:', error);
    res.status(500).json({ error: 'Failed to process message with AI Tutor.' });
  }
}
