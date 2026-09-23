import React from 'react';
import { Sparkles, Zap, Award } from 'lucide-react';

interface DifficultySelectorProps {
  value: 'Beginner' | 'Intermediate' | 'Advanced';
  onChange: (value: 'Beginner' | 'Intermediate' | 'Advanced') => void;
  label?: string;
  size?: 'sm' | 'md';
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  value,
  onChange,
  label = 'Difficulty Level',
  size = 'md',
}) => {
  const options = [
    { id: 'Beginner' as const, label: 'Beginner', icon: Sparkles, desc: 'Intuitive & analogies' },
    { id: 'Intermediate' as const, label: 'Intermediate', icon: Zap, desc: 'Technical & practical' },
    { id: 'Advanced' as const, label: 'Advanced', icon: Award, desc: 'Rigorous & edge cases' },
  ];

  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          {label}
        </label>
      )}
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`flex flex-col items-center justify-center rounded-xl border text-center transition-all ${
                size === 'sm' ? 'py-1.5 px-2' : 'py-2.5 px-3'
              } ${
                isSelected
                  ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-500 text-primary-700 dark:text-primary-300 shadow-sm ring-1 ring-primary-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`} />
                <span className="text-xs font-bold">{opt.label}</span>
              </div>
              {size === 'md' && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                  {opt.desc}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
