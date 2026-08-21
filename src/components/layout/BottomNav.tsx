import React from 'react';
import {
  Home,
  Menu,
  Package,
  Tag,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, currentSegment, setIsMoreMenuOpen } = useApp();

  const isMoreActive =
    activeTab === 'customers' ||
    activeTab === 'finances' ||
    activeTab === 'reports' ||
    activeTab === 'settings';

  return (
    <nav
      id="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900/98 backdrop-blur-md border-t border-stone-800 px-2 py-1 text-stone-300 pb-[env(safe-area-inset-bottom,4px)] shadow-2xl"
    >
      <div className="grid grid-cols-4 items-center justify-items-center">
        {/* 1. Início */}
        <button
          id="mobile-nav-home"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-2 px-1 w-full text-center transition-colors cursor-pointer ${
            activeTab === 'dashboard' ? 'text-red-500 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Início</span>
        </button>

        {/* 2. Produtos / Serviços */}
        <button
          id="mobile-nav-products"
          onClick={() => setActiveTab('products')}
          className={`flex flex-col items-center justify-center py-2 px-1 w-full text-center transition-colors cursor-pointer ${
            activeTab === 'products' ? 'text-red-500 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Tag className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight truncate max-w-[85px]">{currentSegment.terminology.productPlural}</span>
        </button>

        {/* 3. Estoque (or Clientes if inventory disabled) */}
        {currentSegment.features.hasInventory ? (
          <button
            id="mobile-nav-inventory"
            onClick={() => setActiveTab('inventory')}
            className={`flex flex-col items-center justify-center py-2 px-1 w-full text-center transition-colors cursor-pointer ${
              activeTab === 'inventory' ? 'text-red-500 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Package className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight truncate max-w-[85px]">{currentSegment.terminology.inventoryLabel}</span>
          </button>
        ) : (
          <button
            id="mobile-nav-customers"
            onClick={() => setActiveTab('customers')}
            className={`flex flex-col items-center justify-center py-2 px-1 w-full text-center transition-colors cursor-pointer ${
              activeTab === 'customers' ? 'text-red-500 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Clientes</span>
          </button>
        )}

        {/* 4. Mais */}
        <button
          id="mobile-nav-more"
          onClick={() => setIsMoreMenuOpen(true)}
          className={`flex flex-col items-center justify-center py-2 px-1 w-full text-center transition-colors cursor-pointer ${
            isMoreActive ? 'text-red-500 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Mais</span>
        </button>
      </div>
    </nav>
  );
};
