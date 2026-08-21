import React from 'react';
import {
  CheckCircle2,
  Store,
  Tag,
  Package,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react';
import { WizardState } from './types';

interface CompletionStepProps {
  state: WizardState;
  onGoToDashboard: () => void;
  isLoading?: boolean;
}

export const CompletionStep: React.FC<CompletionStepProps> = ({
  state,
  onGoToDashboard,
  isLoading = false,
}) => {
  return (
    <div id="onboarding-completion-step" className="space-y-6 text-center animate-fade-in py-2">
      {/* Celebration Icon */}
      <div className="relative inline-flex items-center justify-center">
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-xl shadow-emerald-500/10 animate-bounce">
          <Sparkles className="w-10 h-10" />
        </div>
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      </div>

      {/* Header Text */}
      <div className="space-y-2 max-w-lg mx-auto">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Tudo Pronto! Negócio Configurado.
        </h2>
        <p className="text-sm text-stone-300 font-medium leading-relaxed">
          Seu sistema <span className="text-white font-bold">{state.businessName}</span> está 100% pronto para registrar pedidos, controlar estoque e gerenciar o fluxo financeiro.
        </p>
      </div>

      {/* Summary Checklist Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left py-2">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center flex-shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{state.businessName}</p>
            <p className="text-[11px] text-stone-400 truncate">{state.category || 'Geral'}</p>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Tag className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white">
              {state.products.length} Produto(s)
            </p>
            <p className="text-[11px] text-stone-400">Cardápio ativo no PDV</p>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white">
              {state.inventory.length} Item(ns) no Estoque
            </p>
            <p className="text-[11px] text-stone-400">Monitoramento e alertas ativos</p>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white">
              {state.firstSale.shouldCreateSale && state.firstSale.selectedProductIds.length > 0
                ? 'Primeira Venda Lançada'
                : 'PDV Pronto para Vendas'}
            </p>
            <p className="text-[11px] text-stone-400">Fluxo de caixa sincronizado</p>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-4 max-w-sm mx-auto">
        <button
          type="button"
          id="btn-show-dashboard"
          disabled={isLoading}
          onClick={onGoToDashboard}
          className="w-full py-3.5 px-6 bg-red-600 hover:bg-red-500 active:scale-[0.99] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-600/30 transition-all cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Preparando seu painel...</span>
            </>
          ) : (
            <>
              <LayoutDashboard className="w-4 h-4" />
              <span>Mostrar Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
