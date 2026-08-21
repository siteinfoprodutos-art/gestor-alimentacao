import React, { useState } from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { usePWA } from '../../context/PWAContext';

export const PWAUpdateNotification: React.FC = () => {
  const { hasUpdate, updateApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!hasUpdate || isDismissed) return null;

  const handleUpdate = () => {
    setIsUpdating(true);
    updateApp();
  };

  return (
    <aside
      aria-label="Atualização de Versão"
      id="pwa-update-banner"
      className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:max-w-md z-50 animate-bounce-short"
    >
      <div className="bg-stone-900/98 backdrop-blur-md border border-amber-500/40 rounded-2xl p-4 shadow-2xl text-stone-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 animate-spin-slow" />
          </div>
          <div className="min-w-0">
            <h4 className="font-heading font-bold text-sm text-white flex items-center gap-1.5 truncate">
              Nova versão disponível
            </h4>
            <p className="text-[11px] text-stone-400 truncate">
              Toque para carregar as melhorias mais recentes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="py-2 px-3.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? 'Atualizando...' : 'Atualizar agora'}</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            title="Lembrar depois"
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
