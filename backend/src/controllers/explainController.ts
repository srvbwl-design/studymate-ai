import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { aiService } from '../services/aiService';
import { PROMPTS } from '../prompts';

export async function explainTopic(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { topic, difficulty, whatIKnow } = req.body;

    const prompt = PROMPTS.explainTopic(topic, difficulty, whatIKnow);
    const systemPrompt = PROMPTS.tutorSystem(difficulty);

    const explanation = await aiService.generateCompletion(prompt, systemPrompt);

    res.status(200).json({
      topic,
      difficulty,
      whatIKnow: whatIKnow || null,
      explanation,
    });
  } catch (error: any) {
    console.error('Error generating explanation:', error);
    res.status(500).json({ error: 'Failed to generate topic explanation.' });
  }
}
