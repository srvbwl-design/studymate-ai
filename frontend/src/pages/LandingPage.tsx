import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BotMessageSquare,
  BookOpenText,
  HelpCircle,
  CalendarCheck,
  MessagesSquare,
  FileSearch,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Brain,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      title: 'AI Tutor',
      desc: 'Engage in multi-turn study sessions calibrated to your exact difficulty level, from intuitive analogies to rigorous proofs.',
      icon: BotMessageSquare,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Smart Notes',
      desc: 'Transform any lecture topic into concise, exam-focused study notes complete with definitions, formulas, and cheat-sheets.',
      icon: BookOpenText,
      color: 'from-indigo-500 to-purple-600',
    },
    {
      title: 'AI Quizzes',
      desc: 'Generate active-recall MCQs and True/False questions with delayed answer reveals, instant scoring, and detailed explanations.',
      icon: HelpCircle,
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'Personalized Study Plans',
      desc: 'Build realistic day-by-day schedules balancing reading, practice, and revision with interactive day-completion progress tracking.',
      icon: CalendarCheck,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Multiple Conversations',
      desc: 'Keep separate chat threads organized for Operating Systems, Algorithms, Calculus, and Organic Chemistry with persistent history.',
      icon: MessagesSquare,
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'PDF Learning',
      desc: 'Upload course syllabi, lecture slides, and text notes to ask questions, extract summaries, and generate test questions grounded in your material.',
      icon: FileSearch,
      color: 'from-rose-500 to-red-600',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-primary-500 selection:text-white">
      {/* Public Navbar */}
      <nav className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              StudyMate AI
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-all shadow-sm"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-semibold text-sm transition-all shadow-md shadow-primary-500/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[600px] h-[600px] bg-gradient-to-tr from-primary-500/15 to-accent-500/15 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200/60 dark:border-primary-800/60 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-primary-500" />
            <span>AI-Powered Academic Assistant for College Students</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
            Your AI <span className="bg-gradient-to-r from-primary-600 via-indigo-500 to-accent-600 bg-clip-text text-transparent">Study Partner</span>
          </h1>

          <p className="text-lg sm:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-medium mb-10 leading-relaxed">
            Learn smarter. Understand faster. Study better.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-bold text-base shadow-lg shadow-primary-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-base shadow-xs transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              Log In to Workspace
            </Link>
          </div>

          {/* Quick Demo Preview Stats */}
          <div className="mt-14 pt-10 border-t border-slate-200/60 dark:border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div>
              <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">8-Part</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Structured Explanations</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">100%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Delayed Quiz Reveal</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">PDF/TXT</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Document Grounding</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">PDF & TXT</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">One-Click Exports</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-16 bg-white dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-2">
              Engineered For Academic Success
            </h2>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              Everything You Need to Ace Your Courses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <div
                  key={index}
                  className="group relative p-7 rounded-2xl bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 hover:border-primary-500/50 dark:hover:border-primary-500/50 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} text-white flex items-center justify-center shadow-md mb-5 group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center text-xs font-semibold text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform">
                    <span>Explore feature</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security & Reliability Banner */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-primary-900/10 via-slate-900/5 to-accent-900/10 dark:from-primary-950/40 dark:to-accent-950/30 border border-primary-500/20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Strict Security & Privacy Architecture</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Your Data Stays Protected and Isolated
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              API keys are strictly managed on the server. Every conversation, note, quiz attempt, and uploaded document is private and isolated to your authenticated account.
            </p>
          </div>
          <Link
            to="/register"
            className="shrink-0 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-md transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© 2026 StudyMate AI. Built for college students and lifelong learners.</p>
      </footer>
    </div>
  );
};
