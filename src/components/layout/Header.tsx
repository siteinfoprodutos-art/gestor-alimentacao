import React from 'react';
import { Moon, Store, Sun, Sparkles, Download, FlaskConical, WifiOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { usePWA } from '../../context/PWAContext';

export const Header: React.FC = () => {
  const {
    settings,
    theme,
    toggleTheme,
    setActiveTab,
    setIsSetupWizardOpen,
  } = useApp();

  const {
    isInstalled,
    isOnline,
    setIsInstallModalOpen,
    setIsDiagnosticsModalOpen,
  } = usePWA();

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 bg-stone-900/95 text-stone-100 backdrop-blur border-b border-stone-800 px-4 py-3 sm:px-6 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand / Business */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            {settings?.logo ? (
              <div className="w-10 h-10 rounded-xl bg-stone-950 flex items-center justify-center overflow-hidden border border-stone-800 flex-shrink-0 group-hover:scale-105 transition-transform">
                <img src={settings.logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform flex-shrink-0" 
                style={{ backgroundImage: `linear-gradient(to bottom right, ${settings?.primaryColor || '#ef4444'}, ${settings?.secondaryColor || '#b91c1c'})` }}
              >
                <Store className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-base sm:text-lg tracking-tight text-white truncate">
                  {settings?.name || 'AL Studio Gestão'}
                </span>
                {settings?.category && (
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-800 text-stone-300 border border-stone-700">
                    {settings.category}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-stone-400 truncate max-w-[200px] sm:max-w-xs">
                {settings?.slogan || 'Organize seu negócio de forma simples.'}
              </p>
            </div>
          </button>

          {settings?.isDemoMode && (
            <div
              title="Você está visualizando dados de demonstração. Você pode limpar nas Configurações."
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Modo Demo</span>
            </div>
          )}

          {!isOnline && (
            <div
              title="Você está desconectado da internet. Seus dados continuam gravando normalmente no aparelho."
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
            >
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span>Offline</span>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* PWA Install Button */}
          {!isInstalled && (
            <button
              id="header-install-pwa-btn"
              onClick={() => setIsInstallModalOpen(true)}
              title="Instalar aplicativo no celular ou computador"
              className="hidden xs:flex items-center gap-1.5 py-2 px-3 bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white rounded-xl text-xs font-bold transition-all border border-red-500/30 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-red-400 group-hover:text-white" />
              <span className="hidden sm:inline">Instalar App</span>
            </button>
          )}

          {/* Setup Wizard Button */}
          <button
            id="header-setup-wizard-btn"
            onClick={() => setIsSetupWizardOpen(true)}
            title="Assistente de Configuração Inicial (Primeiro Acesso / Demonstração)"
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-red-400 transition-colors border border-stone-700 cursor-pointer"
            aria-label="Assistente de Configuração Inicial"
          >
            <Sparkles className="w-4 h-4 text-red-400" />
          </button>

          {/* PWA Test Suite / Diagnostics */}
          <button
            id="header-pwa-diagnostics-btn"
            onClick={() => setIsDiagnosticsModalOpen(true)}
            title="Testes PWA: Instalação, Offline, Atualização e IndexedDB"
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors border border-stone-700 cursor-pointer"
            aria-label="Central de Testes PWA"
          >
            <FlaskConical className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Theme Switcher */}
          <button
            id="header-theme-toggle-btn"
            onClick={toggleTheme}
            title={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors border border-stone-700 cursor-pointer"
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
