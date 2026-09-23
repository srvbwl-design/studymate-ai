import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  BookOpenText,
  HelpCircle,
  CalendarCheck,
  FileText,
  MessagesSquare,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  BrainCircuit,
  Award,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardData } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.getDashboard();
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    {
      title: 'Explain a Topic',
      desc: 'Get an 8-part structured concept breakdown with real-world analogies',
      icon: Sparkles,
      path: '/explain',
      color: 'from-blue-600 to-indigo-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Generate Notes',
      desc: 'Create exam-friendly study notes with key formulas and revision cheat-sheets',
      icon: BookOpenText,
      path: '/notes',
      color: 'from-indigo-600 to-purple-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    },
    {
      title: 'Create Quiz',
      desc: 'Practice MCQs or True/False questions with delayed answers and instant scoring',
      icon: HelpCircle,
      path: '/quizzes',
      color: 'from-purple-600 to-pink-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Create Study Plan',
      desc: 'Personalized day-by-day learning schedule with progress tracking',
      icon: CalendarCheck,
      path: '/study-plans',
      color: 'from-emerald-600 to-teal-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Ask about a Document',
      desc: 'Upload PDF or TXT lecture notes and ask context-grounded questions',
      icon: FileText,
      path: '/documents',
      color: 'from-amber-600 to-orange-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-indigo-600 to-accent-600 p-6 sm:p-8 text-white shadow-xl shadow-primary-500/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider mb-3">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Study Session Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {getGreeting()}, {user?.name || 'Student'} 👋
            </h1>
            <p className="mt-1 text-sm sm:text-base text-primary-100 max-w-xl">
              Ready to learn smarter today? Select a study tool below or continue your recent topic.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/tutor"
              className="px-5 py-2.5 rounded-2xl bg-white text-primary-700 hover:bg-primary-50 font-bold text-sm shadow-md transition-all flex items-center gap-2 hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span>Open AI Tutor</span>
            </Link>
          </div>
        </div>

        {/* Ambient subtle light blur */}
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Topics Studied
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            {isLoading ? '...' : data?.stats.topicsStudied ?? 0}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Active learning curve</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Notes Created
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpenText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            {isLoading ? '...' : data?.stats.notesCreated ?? 0}
          </p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Saved in your notebook
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Quizzes Completed
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            {isLoading ? '...' : data?.stats.quizzesCompleted ?? 0}
          </p>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
            Active recall tests
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Study Sessions
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            {isLoading ? '...' : data?.stats.studySessions ?? 0}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            Continuous progress
          </p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Quick Study Actions</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">Choose a tool to begin</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                to={action.path}
                className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-primary-500/60 dark:hover:border-primary-500/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl ${action.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {action.desc}
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform">
                  <span>Start</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recents Section: Split 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Conversations */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <MessagesSquare className="w-4 h-4 text-primary-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Recent AI Tutor Conversations
              </h3>
            </div>
            <Link to="/tutor" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>

          <div className="space-y-2.5">
            {(!data?.recentConversations || data.recentConversations.length === 0) ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No conversations yet. Start learning by asking your first question.
              </div>
            ) : (
              data.recentConversations.map((conv) => (
                <Link
                  key={conv.id}
                  to={`/tutor?id=${conv.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                >
                  <div className="min-w-0 pr-3">
                    <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                      {conv.title}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(conv.updatedAt).toLocaleDateString()} • {conv._count?.messages || 0} messages
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Saved Study Notes */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <BookOpenText className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Saved Study Notes
              </h3>
            </div>
            <Link to="/notes" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>

          <div className="space-y-2.5">
            {(!data?.recentNotes || data.recentNotes.length === 0) ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No notes created yet. Generate your first topic note in seconds.
              </div>
            ) : (
              data.recentNotes.map((note) => (
                <Link
                  key={note.id}
                  to={`/notes?id=${note.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                >
                  <div className="min-w-0 pr-3">
                    <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                      {note.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-primary-600 dark:text-primary-400 font-medium">
                        {note.difficulty}
                      </span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Quizzes */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Recent Quizzes & Scores
              </h3>
            </div>
            <Link to="/quizzes" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>

          <div className="space-y-2.5">
            {(!data?.recentQuizzes || data.recentQuizzes.length === 0) ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No quizzes created yet. Test your understanding with an AI quiz.
              </div>
            ) : (
              data.recentQuizzes.map((quiz) => {
                const latestAttempt = quiz.attempts?.[0];
                return (
                  <Link
                    key={quiz.id}
                    to={`/quizzes?id=${quiz.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                        {quiz.title}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {quiz.questionsCount} questions • {quiz.difficulty}
                      </p>
                    </div>
                    {latestAttempt ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        Score: {latestAttempt.score} / {latestAttempt.totalQuestions}
                      </span>
                    ) : (
                      <span className="text-xs text-primary-600 font-semibold">Take Quiz</span>
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Active Study Plans */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Active Study Plans
              </h3>
            </div>
            <Link to="/study-plans" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {(!data?.activeStudyPlans || data.activeStudyPlans.length === 0) ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No study plans generated yet. Build your first day-by-day roadmap!
              </div>
            ) : (
              data.activeStudyPlans.map((plan) => (
                <Link
                  key={plan.id}
                  to={`/study-plans?id=${plan.id}`}
                  className="block p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                      {plan.title}
                    </p>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {plan.progressPercent}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${plan.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                    <span>{plan.durationDays} Days Duration</span>
                    <span>{plan.dailyTimeMinutes} min / day</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
