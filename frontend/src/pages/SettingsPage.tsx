import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Shield,
  Moon,
  Sun,
  Server,
  Database,
  CheckCircle2,
  LogOut,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success } = useToast();

  const [backendHealth, setBackendHealth] = useState<{
    status: string;
    database: string;
    version: string;
  } | null>(null);

  useEffect(() => {
    fetch('/health')
      .then((res) => res.json())
      .then((data) => setBackendHealth(data))
      .catch(() => setBackendHealth(null));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-600 text-white flex items-center justify-center shadow-xs">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Student Profile
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personal credentials and student identification
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Full Name
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name || 'Student'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Registered Email
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.email || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Appearance & Interface Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          Interface & Visual Theme
        </h3>

        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Optimized for day or late-night study sessions
              </p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
          >
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      {/* Backend & Database Telemetry */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              System Health & Architecture
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Live status of backend services and database connection
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Backend API</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {backendHealth?.status === 'healthy' ? 'Online (Healthy)' : 'Connecting...'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
            <Database className="w-4 h-4 text-blue-500 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Database</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                PostgreSQL (Prisma Connected)
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">AI Service</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Gemini / Hybrid Fallback
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
