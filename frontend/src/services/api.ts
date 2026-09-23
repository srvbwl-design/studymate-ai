import {
  User,
  Conversation,
  Note,
  Quiz,
  QuizSubmitResult,
  StudyPlan,
  DocumentItem,
  DashboardData,
} from '../types';

const API_BASE = '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('studymate_token');
  }

  public setToken(token: string) {
    localStorage.setItem('studymate_token', token);
  }

  public clearToken() {
    localStorage.removeItem('studymate_token');
    localStorage.removeItem('studymate_user');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearToken();
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
    }

    return data as T;
  }

  // --- Auth Endpoints ---
  async register(data: { name: string; email: string; password: string; confirmPassword: string }) {
    return this.request<{ message: string; user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<{ message: string; user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser() {
    return this.request<{ user: User }>('/auth/me');
  }

  async logout() {
    this.clearToken();
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
  }

  // --- Dashboard Endpoints ---
  async getDashboard() {
    return this.request<DashboardData>('/dashboard/stats');
  }

  // --- Tutor & Chat Endpoints ---
  async getConversations() {
    return this.request<{ conversations: Conversation[] }>('/conversations');
  }

  async getConversation(id: string) {
    return this.request<{ conversation: Conversation }>(`/conversations/${id}`);
  }

  async createConversation(title: string) {
    return this.request<{ conversation: Conversation }>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }

  async deleteConversation(id: string) {
    return this.request<{ message: string }>(`/conversations/${id}`, {
      method: 'DELETE',
    });
  }

  async sendChatMessage(payload: {
    conversationId?: string;
    message: string;
    difficulty?: string;
    topic?: string;
  }) {
    return this.request<{
      conversationId: string;
      userMessage: any;
      assistantMessage: any;
    }>('/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Explanation Endpoints ---
  async explainTopic(payload: { topic: string; difficulty: string; whatIKnow?: string }) {
    return this.request<{
      topic: string;
      difficulty: string;
      whatIKnow: string | null;
      explanation: string;
    }>('/explain', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Notes Endpoints ---
  async generateNotes(payload: { topic: string; difficulty: string; length: string }) {
    return this.request<{
      title: string;
      topic: string;
      difficulty: string;
      length: string;
      content: string;
    }>('/notes/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getNotes(params?: { search?: string; difficulty?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.difficulty) query.append('difficulty', params.difficulty);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ notes: Note[] }>(`/notes${queryString}`);
  }

  async getNote(id: string) {
    return this.request<{ note: Note }>(`/notes/${id}`);
  }

  async saveNote(payload: {
    title: string;
    topic: string;
    difficulty: string;
    length: string;
    content: string;
    tags?: string[];
  }) {
    return this.request<{ message: string; note: Note }>('/notes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateNote(id: string, payload: Partial<Note>) {
    return this.request<{ message: string; note: Note }>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteNote(id: string) {
    return this.request<{ message: string }>(`/notes/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Quizzes Endpoints ---
  async generateQuiz(payload: {
    topic: string;
    difficulty: string;
    questionsCount: number;
    questionType: string;
  }) {
    return this.request<{ message: string; quiz: Quiz }>('/quizzes/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getQuizzes() {
    return this.request<{ quizzes: Quiz[] }>('/quizzes');
  }

  async getQuiz(id: string, revealAnswers = false) {
    return this.request<{ quiz: Quiz }>(`/quizzes/${id}${revealAnswers ? '?revealAnswers=true' : ''}`);
  }

  async submitQuiz(id: string, answers: Record<string, string>) {
    return this.request<QuizSubmitResult>(`/quizzes/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  // --- Study Plans Endpoints ---
  async generateStudyPlan(payload: {
    subject: string;
    knowledgeLevel: string;
    difficulty: string;
    dailyTimeMinutes: number;
    durationDays: number;
    examDate?: string;
    extraTopics?: string;
  }) {
    return this.request<{ message: string; plan: StudyPlan }>('/study-plans/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getStudyPlans() {
    return this.request<{ plans: StudyPlan[] }>('/study-plans');
  }

  async getStudyPlan(id: string) {
    return this.request<{ plan: StudyPlan }>(`/study-plans/${id}`);
  }

  async toggleStudyPlanDay(planId: string, dayId: string, isCompleted: boolean) {
    return this.request<{ message: string; plan: StudyPlan }>(`/study-plans/${planId}/days/${dayId}`, {
      method: 'PATCH',
      body: JSON.stringify({ isCompleted }),
    });
  }

  async deleteStudyPlan(id: string) {
    return this.request<{ message: string }>(`/study-plans/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Documents Endpoints ---
  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<{ message: string; document: DocumentItem }>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async getDocuments() {
    return this.request<{ documents: DocumentItem[] }>('/documents');
  }

  async getDocument(id: string) {
    return this.request<{ document: DocumentItem }>(`/documents/${id}`);
  }

  async deleteDocument(id: string) {
    return this.request<{ message: string }>(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async askDocument(id: string, question: string) {
    return this.request<{
      documentId: string;
      documentName: string;
      question: string;
      answer: string;
    }>(`/documents/${id}/ask`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  }
}

export const api = new ApiClient();
