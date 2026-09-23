import React from 'react';
import { Menu, Sun, Moon, Sparkles, BookOpen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onOpenSidebar: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  title,
  subtitle,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && (
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick study button */}
        <Link
          to="/tutor"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-xs font-semibold border border-primary-200/50 dark:border-primary-800/50 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary-500" />
          <span>Ask Tutor</span>
        </Link>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* User initials badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-accent-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hidden md:inline">
            {user?.name?.split(' ')[0] || 'Alex'}
          </span>
        </div>
      </div>
    </header>
  );
};
