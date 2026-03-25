
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 w-[min(350px,calc(100vw-2rem))] p-4 rounded-xl shadow-2xl border animate-in fade-in slide-in-from-bottom-4 slide-in-from-right-4 duration-300 ${
              toast.type === 'success' ? 'bg-emerald-900 border-emerald-800 text-emerald-50'
              : toast.type === 'error' ? 'bg-red-900 border-red-800 text-red-50'
              : 'bg-slate-900 border-slate-800 text-slate-50'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle size={20} className="text-red-400 shrink-0" />}
            {toast.type === 'info' && <Info size={20} className="text-slate-400 shrink-0" />}
            
            <p className="text-sm font-medium leading-tight flex-grow">{toast.message}</p>
            
            <button onClick={() => removeToast(toast.id)} className="text-white/50 hover:text-white transition-colors shrink-0">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
