import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  MessagesSquare,
  BookOpenText,
  HelpCircle,
  CalendarCheck,
  FileText,
  Search,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardData } from '../types';

export const HistoryPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.getDashboard();
        setData(res);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Aggregate into unified chronological events
  interface HistoryEvent {
    id: string;
    type: 'conversation' | 'note' | 'quiz' | 'study_plan';
    title: string;
    subtitle: string;
    date: Date;
    link: string;
  }

  const events: HistoryEvent[] = [];

  if (data) {
    data.recentConversations.forEach((c) => {
      events.push({
        id: `conv-${c.id}`,
        type: 'conversation',
        title: c.title,
        subtitle: `${c._count?.messages || 0} messages exchanged`,
        date: new Date(c.updatedAt),
        link: `/tutor?id=${c.id}`,
      });
    });

    data.recentNotes.forEach((n) => {
      events.push({
        id: `note-${n.id}`,
        type: 'note',
        title: n.title,
        subtitle: `Topic: ${n.topic} • ${n.difficulty} • ${n.length}`,
        date: new Date(n.updatedAt),
        link: `/notes?id=${n.id}`,
      });
    });

    data.recentQuizzes.forEach((q) => {
      const attempt = q.attempts?.[0];
      events.push({
        id: `quiz-${q.id}`,
        type: 'quiz',
        title: q.title,
        subtitle: attempt
          ? `Attempted • Score: ${attempt.score}/${attempt.totalQuestions}`
          : `${q.questionsCount} questions • ${q.questionType}`,
        date: new Date(q.createdAt),
        link: `/quizzes?id=${q.id}`,
      });
    });

    data.activeStudyPlans.forEach((p) => {
      events.push({
        id: `plan-${p.id}`,
        type: 'study_plan',
        title: p.title,
        subtitle: `${p.progressPercent}% completed • ${p.durationDays} Days Duration`,
        date: new Date(p.updatedAt),
        link: `/study-plans?id=${p.id}`,
      });
    });
  }

  // Sort descending by date
  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  const filteredEvents = events.filter((e) => {
    const matchesFilter = filterType === 'all' || e.type === filterType;
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'conversation':
        return <MessagesSquare className="w-4 h-4 text-blue-600" />;
      case 'note':
        return <BookOpenText className="w-4 h-4 text-indigo-600" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-purple-600" />;
      case 'study_plan':
        return <CalendarCheck className="w-4 h-4 text-emerald-600" />;
      default:
        return <History className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search and Filters Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Study Timeline & Activity History
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review all your previous study sessions, notes, quizzes, and learning roadmaps
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'conversation', label: 'Conversations' },
            { id: 'note', label: 'Notes' },
            { id: 'quiz', label: 'Quizzes' },
            { id: 'study_plan', label: 'Study Plans' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                filterType === tab.id
                  ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-500 text-primary-700 dark:text-primary-300 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Items */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading timeline...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
            No activity matches your filter.
          </div>
        ) : (
          filteredEvents.map((event) => (
            <Link
              key={event.id}
              to={event.link}
              className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-primary-500/50 hover:shadow-xs transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0 pr-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {getBadgeIcon(event.type)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {event.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {event.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] text-slate-400 font-medium">
                  {event.date.toLocaleDateString()}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};
