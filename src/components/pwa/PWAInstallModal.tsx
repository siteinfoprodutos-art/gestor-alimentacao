import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
  X,
  Laptop,
  Sparkles,
  Zap,
  WifiOff,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { usePWA } from '../../context/PWAContext';
import { useApp } from '../../context/AppContext';

export const PWAInstallModal: React.FC = () => {
  const {
    isInstallModalOpen,
    setIsInstallModalOpen,
    isIOS,
    isAndroid,
    isInstalled,
    installPWA,
  } = usePWA();
  const { settings } = useApp();

  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>(
    isIOS ? 'ios' : isAndroid ? 'android' : 'desktop'
  );

  if (!isInstallModalOpen) return null;

  const appName = settings?.name || 'AL Studio Gestão';
  const logoUrl = settings?.logo || '/icon.svg';

  return (
    <div
      id="pwa-install-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={() => setIsInstallModalOpen(false)}
    >
      <div
        id="pwa-install-modal-card"
        className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 text-stone-100 shadow-2xl space-y-5 relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsInstallModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* App Header Header */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-14 h-14 rounded-2xl bg-stone-950 border border-stone-800 p-1.5 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-extrabold text-lg sm:text-xl text-white tracking-tight">
                {appName}
              </h2>
              {isInstalled && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Instalado
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Instale na tela inicial do seu celular ou computador
            </p>
          </div>
        </div>

        {/* Benefits Pill Grid */}
        <div className="grid grid-cols-3 gap-2 py-2">
          <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-850 flex flex-col items-center text-center gap-1">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-bold text-stone-200">Acesso Instantâneo</span>
            <span className="text-[9px] text-stone-500">Abre como App nativo</span>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-850 flex flex-col items-center text-center gap-1">
            <WifiOff className="w-4 h-4 text-blue-400" />
            <span className="text-[11px] font-bold text-stone-200">100% Offline</span>
            <span className="text-[9px] text-stone-500">Sem gastar internet</span>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-850 flex flex-col items-center text-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-bold text-stone-200">Dados Seguros</span>
            <span className="text-[9px] text-stone-500">Gravados no aparelho</span>
          </div>
        </div>

        {/* Platform Selection Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-950 rounded-2xl border border-stone-800">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'android'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Share className="w-3.5 h-3.5" />
            <span>iPhone / iPad</span>
          </button>

          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'desktop'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Computador</span>
          </button>
        </div>

        {/* ======================================================= */}
        {/* ANDROID VIEW */}
        {/* ======================================================= */}
        {activeTab === 'android' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
              <div className="flex items-center gap-2 text-stone-200 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-red-400" />
                <span>Instalação Rápida no Android</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Clique no botão abaixo para adicionar o aplicativo diretamente à tela inicial do seu celular com a logo e nome do seu estabelecimento.
              </p>

              <button
                id="btn-install-app-android"
                onClick={installPWA}
                className="w-full py-3.5 px-5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Instalar aplicativo</span>
              </button>
            </div>

            <div className="space-y-2 text-xs text-stone-400">
              <div className="font-semibold text-stone-300">Se o botão acima não abrir:</div>
              <ol className="list-decimal list-inside space-y-1 text-stone-400 pl-1">
                <li>Abra o menu do Chrome tocando nos <strong>3 pontinhos (⋮)</strong> no canto superior direito.</li>
                <li>Selecione a opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
                <li>Confirme para finalizar a instalação.</li>
              </ol>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* IPHONE (iOS Safari) VIEW */}
        {/* ======================================================= */}
        {activeTab === 'ios' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
              <div className="flex items-center gap-2 text-stone-200 font-bold text-sm">
                <Share className="w-4 h-4 text-blue-400" />
                <span>Instruções para iPhone & iPad (Safari)</span>
              </div>
              <p className="text-xs text-stone-400">
                Siga os 3 passos simples abaixo para instalar na tela inicial:
              </p>

              <div className="space-y-3 pt-1">
                {/* Step 1 */}
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-extrabold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-stone-200 block">Toque no botão Compartilhar</span>
                    <span className="text-stone-400">
                      Localizado na barra inferior do Safari (ícone de um quadrado com seta para cima: <strong>⎋ / 📤</strong>).
                    </span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-extrabold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-stone-200 block">Adicionar à Tela de Início</span>
                    <span className="text-stone-400">
                      Role o menu para baixo e toque na opção com o símbolo <strong>( ➕ ) Adicionar à Tela de Início</strong>.
                    </span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-extrabold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-stone-200 block">Confirme em "Adicionar"</span>
                    <span className="text-stone-400">
                      Toque em <strong>Adicionar</strong> no canto superior direito. O ícone aparecerá instantaneamente como um App nativo!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* DESKTOP VIEW */}
        {/* ======================================================= */}
        {activeTab === 'desktop' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
              <div className="flex items-center gap-2 text-stone-200 font-bold text-sm">
                <Laptop className="w-4 h-4 text-emerald-400" />
                <span>Instalar no Computador (Windows / Mac / Linux)</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Utilize o sistema como um programa de computador independente, com janela própria e atalho na barra de tarefas ou área de trabalho.
              </p>

              <button
                onClick={installPWA}
                className="w-full py-3 px-4 bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold text-xs rounded-xl border border-stone-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Instalar no Computador</span>
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-stone-400">
              <div className="font-semibold text-stone-300">Como instalar manualmente no Chrome / Edge:</div>
              <p className="text-stone-400">
                Procure o ícone de instalação (computador com seta ou <strong>⬇️</strong>) no canto direito da barra de endereço do navegador e clique em <strong>Instalar</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setIsInstallModalOpen(false)}
            className="py-2.5 px-5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
