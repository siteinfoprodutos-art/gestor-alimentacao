import React from 'react';
import {
  BarChart3,
  DollarSign,
  Package,
  Tag,
  Settings as SettingsIcon,
  Database,
  LayoutDashboard,
  Users,
  AlertTriangle,
  Download,
  FlaskConical,
  Smartphone,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { usePWA } from '../../context/PWAContext';
import { ActiveTab } from '../../types';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, inventory, currentSegment, setIsSetupWizardOpen, theme, toggleTheme } = useApp();
  const { isInstalled, setIsInstallModalOpen, setIsDiagnosticsModalOpen } = usePWA();

  const lowStockCount = inventory.filter(
    (i) => i.currentQuantity <= i.minQuantity
  ).length;

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'products',
      label: currentSegment.terminology.productPlural,
      icon: Tag,
    },
    {
      id: 'customers',
      label: 'Clientes',
      icon: Users,
    },
    ...(currentSegment.features.hasInventory
      ? [
          {
            id: 'inventory' as ActiveTab,
            label: currentSegment.terminology.inventoryLabel,
            icon: Package,
            badge: lowStockCount > 0 ? lowStockCount : undefined,
            badgeColor: 'bg-amber-500 text-stone-900',
          },
        ]
      : []),
    {
      id: 'finances',
      label: 'Financeiro',
      icon: DollarSign,
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: SettingsIcon,
    },
    {
      id: 'backup',
      label: 'Backup',
      icon: Database,
    },
  ];

  return (
    <aside
      id="desktop-sidebar"
      className="hidden md:flex flex-col w-64 bg-stone-900 border-r border-stone-800 text-stone-200 select-none flex-shrink-0 h-[calc(100vh-61px)] sticky top-[61px]"
    >
      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
          Menu Principal
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group cursor-pointer ${
                isActive
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20 font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-white' : 'text-stone-300 group-hover:text-red-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    item.badgeColor || 'bg-stone-700 text-stone-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Low Stock Warning Box (if any) */}
      {lowStockCount > 0 && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          <div className="flex items-center gap-2 font-semibold mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Alerta de Estoque</span>
          </div>
          <p className="text-stone-400 text-[11px] leading-relaxed">
            {lowStockCount} {lowStockCount === 1 ? 'item atingiu' : 'itens atingiram'} o estoque mínimo.
          </p>
          <button
            onClick={() => setActiveTab('inventory')}
            className="mt-2 text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
          >
            Ver estoque &rarr;
          </button>
        </div>
      )}

      {/* Footer / PWA Actions & AL Studio Branding */}
      <div className="p-3 border-t border-stone-800 text-[11px] text-stone-400 space-y-2">
        {!isInstalled && (
          <button
            onClick={() => setIsInstallModalOpen(true)}
            className="w-full py-2 px-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 rounded-xl border border-red-500/20 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar Aplicativo</span>
          </button>
        )}

        <button
          onClick={() => setIsDiagnosticsModalOpen(true)}
          className="w-full py-1.5 px-3 bg-stone-800/60 hover:bg-stone-800 text-stone-300 hover:text-white rounded-xl border border-stone-700/60 text-[11px] font-semibold flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Testes PWA & Offline</span>
          </div>
          <FlaskConical className="w-3.5 h-3.5 text-stone-400" />
        </button>

        <button
          onClick={() => setIsSetupWizardOpen(true)}
          className="w-full py-1.5 px-3 bg-stone-800/60 hover:bg-stone-800 text-stone-300 hover:text-red-400 rounded-xl border border-stone-700/60 text-[11px] font-semibold flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5 text-red-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Assistente Inicial</span>
          </div>
          <span className="text-[10px] text-stone-500">Configurar</span>
        </button>

        <button
          onClick={toggleTheme}
          className="w-full py-1.5 px-3 bg-stone-800/60 hover:bg-stone-800 text-stone-300 hover:text-white rounded-xl border border-stone-700/60 text-[11px] font-semibold flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-blue-500" />
            )}
            <span>{theme === 'dark' ? 'Tema Escuro' : 'Tema Claro'}</span>
          </div>
          <span className="text-[10px] text-stone-500">Alternar</span>
        </button>

        <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5 px-1">
          <span>AL Studio Gestão</span>
          <span>v2.0 PWA</span>
        </div>
      </div>
    </aside>
  );
};
