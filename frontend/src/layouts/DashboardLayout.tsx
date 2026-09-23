import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading StudyMate AI...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Get current page title dynamically
  const getPageMeta = () => {
    switch (location.pathname) {
      case '/dashboard':
        return { title: 'Dashboard', subtitle: 'Overview of your academic progress and tools' };
      case '/tutor':
        return { title: 'AI Tutor', subtitle: 'Interactive study conversations & conceptual Q&A' };
      case '/explain':
        return { title: 'Topic Explanations', subtitle: '8-part structured conceptual breakdowns' };
      case '/notes':
        return { title: 'Study Notes Generator', subtitle: 'Generate, edit, and export exam-ready notes' };
      case '/quizzes':
        return { title: 'Interactive Quizzes', subtitle: 'Test your knowledge with instant scoring & review' };
      case '/study-plans':
        return { title: 'Personalized Study Plans', subtitle: 'Day-by-day learning schedules with activity tracking' };
      case '/documents':
        return { title: 'Document Learning & PDF Q&A', subtitle: 'Upload lecture slides, notes, and ask questions' };
      case '/history':
        return { title: 'Learning History', subtitle: 'Chronological timeline of your study activities' };
      case '/settings':
        return { title: 'Settings & Preferences', subtitle: 'Account details and AI configuration' };
      default:
        return { title: 'StudyMate AI', subtitle: 'Intelligent College Study Assistant' };
    }
  };

  const meta = getPageMeta();

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          onOpenSidebar={() => setIsSidebarOpen(true)}
          title={meta.title}
          subtitle={meta.subtitle}
        />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
