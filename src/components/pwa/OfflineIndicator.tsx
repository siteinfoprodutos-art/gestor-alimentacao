import React from 'react';
import { WifiOff, Database } from 'lucide-react';
import { usePWA } from '../../context/PWAContext';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div
      id="pwa-offline-indicator"
      className="bg-amber-500/15 border-b border-amber-500/30 text-amber-300 px-4 py-2 text-xs font-semibold flex items-center justify-between gap-2 transition-all animate-fade-in"
    >
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <WifiOff className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
        <span className="truncate">
          <strong>Modo Offline Ativo:</strong> Todas as funções continuam operando e salvando localmente no seu aparelho.
        </span>
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-amber-400/80 ml-auto flex-shrink-0">
          <Database className="w-3.5 h-3.5" />
          <span>IndexedDB Ativo</span>
        </div>
      </div>
    </div>
  );
};
