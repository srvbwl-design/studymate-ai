import { z } from 'zod';
import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

// Auth validation schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Chat / Tutor schemas
export const chatMessageSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1, 'Message cannot be empty'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Intermediate'),
  topic: z.string().optional(),
});

export const createConversationSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(100),
});

// Explanation schema
export const explainTopicSchema = z.object({
  topic: z.string().min(2, 'Topic must be at least 2 characters'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Intermediate'),
  whatIKnow: z.string().optional(),
});

// Notes schemas
export const generateNotesSchema = z.object({
  topic: z.string().min(2, 'Topic must be at least 2 characters'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Intermediate'),
  length: z.enum(['Short', 'Medium', 'Detailed']).default('Medium'),
});

export const saveNoteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  topic: z.string().min(1, 'Topic is required'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Intermediate'),
  length: z.enum(['Short', 'Medium', 'Detailed']).default('Medium'),
  content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()).default([]),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  length: z.enum(['Short', 'Medium', 'Detailed']).optional(),
});

// Quiz schemas
export const generateQuizSchema = z.object({
  topic: z.string().min(2, 'Topic is required'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Intermediate'),
  questionsCount: z.number().int().min(3).max(20).default(5),
  questionType: z.enum(['MCQ', 'True/False']).default('MCQ'),
});

export const submitQuizSchema = z.object({
  answers: z.record(z.string()), // { [questionId]: selectedOption }
});

// Study plan schemas
export const generateStudyPlanSchema = z.object({
  subject: z.string().min(2, 'Subject/topic is required'),
  knowledgeLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Intermediate'),
  dailyTimeMinutes: z.number().int().min(15).max(720).default(120),
  durationDays: z.number().int().min(1).max(60).default(7),
  examDate: z.string().optional(),
  extraTopics: z.string().optional(),
});

export const toggleDaySchema = z.object({
  isCompleted: z.boolean(),
});

// Document Q&A schema
export const askDocumentSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty'),
});
