import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BotMessageSquare,
  Sparkles,
  BookOpenText,
  HelpCircle,
  CalendarCheck,
  FileText,
  History,
  Settings,
  LogOut,
  GraduationCap,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Tutor', path: '/tutor', icon: BotMessageSquare },
    { name: 'Explain Topic', path: '/explain', icon: Sparkles },
    { name: 'Notes', path: '/notes', icon: BookOpenText },
    { name: 'Quizzes', path: '/quizzes', icon: HelpCircle },
    { name: 'Study Plans', path: '/study-plans', icon: CalendarCheck },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'History', path: '/history', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64 select-none">
      {/* Brand Logo Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <NavLink to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              StudyMate AI
            </span>
            <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              Student Workspace
            </span>
          </div>
        </NavLink>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User Footer & Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 shadow-xs mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {user?.name || 'Student'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen z-20">
        {content}
      </aside>

      {/* Mobile Drawer Backdrop and Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 shadow-xl z-50 animate-slide-right">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
