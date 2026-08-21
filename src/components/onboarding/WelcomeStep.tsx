import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Store,
  CheckCircle2,
  Database,
  Layers,
  ShoppingBag,
  PackageCheck,
  TrendingUp,
} from 'lucide-react';

interface WelcomeStepProps {
  onStartWizard: () => void;
  onLoadDemoMode: () => void;
  isDemoLoading?: boolean;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({
  onStartWizard,
  onLoadDemoMode,
  isDemoLoading = false,
}) => {
  return (
    <div id="onboarding-welcome-step" className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
          <Store className="w-4 h-4 text-red-400" />
          <span>Primeiro Acesso</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Bem-vindo.
        </h1>
        <p className="text-base sm:text-lg text-stone-300 max-w-xl mx-auto font-medium">
          Vamos configurar seu negócio em apenas 5 passos rápidos para você começar a faturar.
        </p>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 py-2">
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">PDV & Pedidos Rápidos</h4>
            <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
              Balcão, mesas, entregas e integração WhatsApp.
            </p>
          </div>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Estoque Inteligente</h4>
            <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
              Baixa automática em insumos e avisos de reposição.
            </p>
          </div>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Financeiro & Lucro</h4>
            <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
              Fluxo de caixa diário, CMV, margens e relatórios.
            </p>
          </div>
        </div>
      </div>

      {/* Main Choice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {/* Choice 1: Start Custom Setup */}
        <div
          id="btn-start-setup-wizard"
          onClick={onStartWizard}
          className="group relative bg-gradient-to-br from-red-950/40 via-stone-900 to-stone-900 border-2 border-red-600/50 hover:border-red-500 rounded-3xl p-6 cursor-pointer transition-all duration-200 shadow-xl hover:shadow-red-600/10 flex flex-col justify-between"
        >
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30">
                <Store className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-600/20 text-red-300 border border-red-500/30">
                Recomendado
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">
                Configurar meu negócio
              </h3>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Personalize o nome, logotipo, cadastre seus primeiros produtos, configure o estoque e lance sua primeira venda.
              </p>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="flex items-center gap-2 text-xs text-stone-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>5 passos simples e guiados (~2 minutos)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Sugestões inteligentes com 1 clique</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="button"
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 active:scale-[0.99] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 transition-all"
            >
              <span>Começar Configuração</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Choice 2: Demo Mode with Fictitious Data */}
        <div
          id="btn-load-demo-mode"
          onClick={onLoadDemoMode}
          className="group relative bg-stone-900 border border-stone-800 hover:border-amber-500/50 rounded-3xl p-6 cursor-pointer transition-all duration-200 shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between"
        >
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Modo Demonstração
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                Testar com dados fictícios
              </h3>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Carregue um cardápio completo de exemplo, clientes, estoque com alertas, vendas históricas e fluxo financeiro para testar.
              </p>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="flex items-center gap-2 text-xs text-stone-300">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Cardápio, estoque e gráficos pré-preenchidos</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-300">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Você pode limpar os dados e recomeçar quando quiser</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="button"
              disabled={isDemoLoading}
              className="w-full py-3 px-4 bg-stone-800 hover:bg-stone-700 active:scale-[0.99] text-stone-100 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-stone-700 transition-all group-hover:border-amber-500/40"
            >
              {isDemoLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span>Carregando demonstração...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Carregar Demonstração & Ir ao Painel</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
