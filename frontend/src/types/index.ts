export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
  messages?: Message[];
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  length: 'Short' | 'Medium' | 'Detailed';
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  quizId?: string;
  order: number;
  question: string;
  options: string[];
  correctAnswer?: string;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  createdAt: string;
  userAnswers?: Record<string, string>;
}

export interface Quiz {
  id: string;
  userId: string;
  title: string;
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questionType: 'MCQ' | 'True/False';
  questionsCount: number;
  createdAt: string;
  questions?: QuizQuestion[];
  attempts?: QuizAttempt[];
  _count?: {
    questions: number;
    attempts: number;
  };
}

export interface GradedQuestion extends QuizQuestion {
  studentAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizSubmitResult {
  message: string;
  attemptId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  scoreDisplay: string;
  questions: GradedQuestion[];
}

export interface StudyPlanDay {
  id: string;
  studyPlanId: string;
  dayNumber: number;
  title: string;
  topics: string[];
  durationMinutes: number;
  learningActivity: string;
  practiceActivity: string;
  revisionActivity: string;
  quizReview: string;
  isCompleted: boolean;
}

export interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  subject: string;
  knowledgeLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  dailyTimeMinutes: number;
  durationDays: number;
  examDate?: string | null;
  extraTopics?: string | null;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
  days?: StudyPlanDay[];
  _count?: {
    days: number;
  };
}

export interface DocumentItem {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  summary?: string;
  extractedText?: string;
  createdAt: string;
}

export interface DashboardStats {
  topicsStudied: number;
  notesCreated: number;
  quizzesCompleted: number;
  studySessions: number;
  studyPlansActive: number;
  documentsUploaded: number;
}

export interface DashboardData {
  studentName: string;
  stats: DashboardStats;
  recentConversations: Conversation[];
  recentNotes: Note[];
  recentQuizzes: Quiz[];
  activeStudyPlans: StudyPlan[];
}
