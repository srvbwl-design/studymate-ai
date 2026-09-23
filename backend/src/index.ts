import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config, prisma } from './config';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/authRoutes';
import chatRoutes from './routes/chatRoutes';
import explainRoutes from './routes/explainRoutes';
import notesRoutes from './routes/notesRoutes';
import quizzesRoutes from './routes/quizzesRoutes';
import studyPlansRoutes from './routes/studyPlansRoutes';
import documentsRoutes from './routes/documentsRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

const app = express();

// Security and utility middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: [config.frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'healthy',
      app: 'StudyMate AI Backend',
      version: '1.0.0',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'degraded',
      error: 'Database connection failed',
      details: err.message,
    });
  }
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes);
app.use('/api', explainRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/study-plans', studyPlansRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use(errorHandler);

// Start listening
const server = app.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(`🚀 StudyMate AI Backend running on port ${config.port}`);
  console.log(`🔗 Health check: http://localhost:${config.port}/health`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===============================================`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received. Closing HTTP server and database pool.');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

export default app;
