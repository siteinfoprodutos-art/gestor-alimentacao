import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const bgStyles = {
    success: 'bg-emerald-600 text-white border-emerald-500',
    info: 'bg-amber-600 text-white border-amber-500',
    warning: 'bg-orange-600 text-white border-orange-500',
    error: 'bg-red-600 text-white border-red-500',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
    info: <Info className="w-5 h-5 flex-shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 flex-shrink-0" />,
  };

  return (
    <div
      id="app-toast-container"
      className="fixed bottom-20 md:bottom-6 right-4 z-50 max-w-sm w-full animate-bounce-short pointer-events-none"
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium ${bgStyles[toast.type]}`}
      >
        {icons[toast.type]}
        <span className="flex-1 leading-snug">{toast.message}</span>
      </div>
    </div>
  );
};
