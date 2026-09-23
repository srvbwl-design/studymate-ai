import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('JWT_SECRET environment variable is strictly required in production'); })() : 'studymate-dev-fallback-secret-2025'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  llmApiKey: process.env.LLM_API_KEY || '',
  llmProvider: process.env.LLM_PROVIDER || 'gemini',
  llmModel: process.env.LLM_MODEL || 'gemini-1.5-flash',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/studymatedb?schema=public',
};

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
