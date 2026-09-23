import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = useCallback((msg: string) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg: string) => addToast(msg, 'error'), [addToast]);
  const info = useCallback((msg: string) => addToast(msg, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-slide-up ${
              t.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                : t.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-900 dark:text-indigo-200'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-indigo-500 shrink-0" />}
            <p className="text-sm font-medium flex-1">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
