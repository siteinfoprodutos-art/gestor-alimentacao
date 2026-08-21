import React from 'react';
import {
  BarChart3,
  DollarSign,
  Settings as SettingsIcon,
  Database,
  X,
  Sparkles,
  Download,
  FlaskConical,
  Smartphone,
  Sun,
  Moon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { usePWA } from '../../context/PWAContext';
import { ActiveTab } from '../../types';

export const MoreMenuModal: React.FC = () => {
  const {
    isMoreMenuOpen,
    setIsMoreMenuOpen,
    activeTab,
    setActiveTab,
    settings,
    setIsSetupWizardOpen,
    theme,
    toggleTheme,
  } = useApp();
  const { isInstalled, setIsInstallModalOpen, setIsDiagnosticsModalOpen } = usePWA();

  if (!isMoreMenuOpen) return null;

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMoreMenuOpen(false);
  };

  const handleOpenSetupWizard = () => {
    setIsMoreMenuOpen(false);
    setIsSetupWizardOpen(true);
  };

  const handleOpenInstall = () => {
    setIsMoreMenuOpen(false);
    setIsInstallModalOpen(true);
  };

  const handleOpenDiagnostics = () => {
    setIsMoreMenuOpen(false);
    setIsDiagnosticsModalOpen(true);
  };

  const moreItems: { id: ActiveTab; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
    {
      id: 'finances',
      label: 'Financeiro',
      desc: 'Vendas, custos, despesas e fluxo de caixa',
      icon: DollarSign,
    },
    {
      id: 'reports',
      label: 'Relatórios & Exportações',
      desc: 'PDF, Excel, WhatsApp e impressão',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: 'Configurações',
      desc: 'Dados do negócio, recibos e personalização',
      icon: SettingsIcon,
    },
    {
      id: 'backup',
      label: 'Backup',
      desc: 'Exportar e importar dados do sistema',
      icon: Database,
    },
  ];

  return (
    <div
      id="more-menu-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end md:hidden animate-fade-in"
      onClick={() => setIsMoreMenuOpen(false)}
    >
      <div
        id="more-menu-sheet"
        className="bg-stone-900 border-t border-stone-800 rounded-t-3xl p-5 text-stone-100 shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div>
            <h3 className="font-heading font-bold text-lg text-white">Outras Seções</h3>
            <p className="text-xs text-stone-400">Gerenciamento completo do seu negócio</p>
          </div>
          <button
            onClick={() => setIsMoreMenuOpen(false)}
            className="p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-2.5">
          {moreItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl text-left transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                    : 'bg-stone-800/80 hover:bg-stone-800 text-stone-200'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl ${
                    isActive ? 'bg-white/20 text-white' : 'bg-stone-700/60 text-red-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{item.label}</div>
                  <div
                    className={`text-xs truncate ${
                      isActive ? 'text-white/80' : 'text-stone-400'
                    }`}
                  >
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* PWA Mobile Quick Actions */}
        <div className="pt-2 pb-1 border-t border-stone-800 space-y-2">
          {!isInstalled && (
            <button
              onClick={handleOpenInstall}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-300 font-bold text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-600 text-white">
                  <Download className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-white text-xs font-bold">Instalar Aplicativo no Celular</div>
                  <div className="text-[10px] text-red-300/80">Adicione à tela inicial (Android / iPhone)</div>
                </div>
              </div>
              <span className="text-xs text-red-400 font-bold">&rarr;</span>
            </button>
          )}

          <button
            onClick={handleOpenDiagnostics}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/60 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-emerald-400" />
              <span>Central de Testes PWA & Offline</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
              Testar
            </span>
          </button>
          <button
            onClick={handleOpenSetupWizard}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/60 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-400" />
              <span>Assistente de Configuração</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold">
              Primeiro Acesso
            </span>
          </button>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/60 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-blue-500" />
              )}
              <span>Tema Visual</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-700 text-stone-200 font-bold">
              {theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
            </span>
          </button>
        </div>

        {/* Demo Mode Notice */}
        {settings?.isDemoMode && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs flex items-center gap-2 mt-2">
            <Sparkles className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span className="leading-tight">
              Modo Demonstração ativo. Você pode limpar os dados de teste em Configurações.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
