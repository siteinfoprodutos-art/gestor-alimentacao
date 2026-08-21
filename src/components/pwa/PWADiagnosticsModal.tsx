import React, { useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  RotateCw,
  X,
  Smartphone,
  WifiOff,
  RefreshCw,
  Database,
  ShieldCheck,
  HardDrive,
  Download,
  Layers,
  Sparkles,
} from 'lucide-react';
import { usePWA } from '../../context/PWAContext';
import { useApp } from '../../context/AppContext';

export const PWADiagnosticsModal: React.FC = () => {
  const {
    isDiagnosticsModalOpen,
    setIsDiagnosticsModalOpen,
    runPWATests,
    testResults,
    isTestingRunning,
    storageInfo,
    isOnline,
    isInstalled,
    checkForUpdates,
    installPWA,
  } = usePWA();
  const { settings, setToast } = useApp();

  // Run tests on first open if empty
  useEffect(() => {
    if (isDiagnosticsModalOpen && testResults.length === 0 && !isTestingRunning) {
      runPWATests();
    }
  }, [isDiagnosticsModalOpen, testResults.length, isTestingRunning, runPWATests]);

  if (!isDiagnosticsModalOpen) return null;

  const passedCount = testResults.filter((r) => r.status === 'success').length;
  const warningCount = testResults.filter((r) => r.status === 'warning').length;
  const errorCount = testResults.filter((r) => r.status === 'error').length;

  const handleSimulateUpdate = () => {
    setToast({
      message: 'Simulando detecção de nova versão do aplicativo...',
      type: 'info',
    });
    // Trigger update notification
    checkForUpdates();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />;
      case 'running':
        return <RotateCw className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0" />;
      default:
        return <Clock className="w-5 h-5 text-stone-500 flex-shrink-0" />;
    }
  };

  return (
    <div
      id="pwa-diagnostics-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={() => setIsDiagnosticsModalOpen(false)}
    >
      <div
        id="pwa-diagnostics-card"
        className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full p-6 text-stone-100 shadow-2xl space-y-6 relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsDiagnosticsModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-8">
          <div>
            <h2 className="font-heading font-extrabold text-xl text-white flex items-center gap-2">
              🧪 Central de Testes PWA & Offline
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              Validação de instalação, cache offline, atualização e persistência IndexedDB
            </p>
          </div>

          <button
            onClick={() => runPWATests()}
            disabled={isTestingRunning}
            className="py-2.5 px-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/20 flex items-center gap-2 transition-all cursor-pointer flex-shrink-0"
          >
            {isTestingRunning ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>{isTestingRunning ? 'Executando Testes...' : 'Executar Todos os Testes'}</span>
          </button>
        </div>

        {/* Quick System Status Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800">
            <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block mb-0.5">
              Instalação
            </span>
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  isInstalled ? 'bg-emerald-400' : 'bg-blue-400'
                }`}
              />
              <span className={isInstalled ? 'text-emerald-300' : 'text-stone-300'}>
                {isInstalled ? 'Standalone' : 'Navegador'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800">
            <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block mb-0.5">
              Rede
            </span>
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'
                }`}
              />
              <span className={isOnline ? 'text-emerald-300' : 'text-amber-300'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800">
            <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block mb-0.5">
              Service Worker
            </span>
            <div className="flex items-center gap-1.5 font-bold text-xs text-stone-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>v2.0 Ativo</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800">
            <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block mb-0.5">
              IndexedDB
            </span>
            <div className="flex items-center gap-1.5 font-bold text-xs text-stone-300">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>10 Tabelas</span>
            </div>
          </div>
        </div>

        {/* Test Results List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-400 px-1">
            <span className="font-bold text-stone-300">Resultados dos 4 Testes Principais:</span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-semibold">{passedCount} Aprovados</span>
              {warningCount > 0 && (
                <span className="text-amber-400 font-semibold">{warningCount} Avisos</span>
              )}
              {errorCount > 0 && (
                <span className="text-red-400 font-semibold">{errorCount} Falhas</span>
              )}
            </div>
          </div>

          {testResults.map((test) => (
            <div
              key={test.id}
              className={`p-4 rounded-2xl border transition-all ${
                test.status === 'success'
                  ? 'bg-emerald-950/20 border-emerald-900/40 text-stone-200'
                  : test.status === 'warning'
                  ? 'bg-amber-950/20 border-amber-900/40 text-stone-200'
                  : test.status === 'error'
                  ? 'bg-red-950/20 border-red-900/40 text-stone-200'
                  : 'bg-stone-950 border-stone-800 text-stone-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {getStatusIcon(test.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-white">{test.title}</h4>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        test.status === 'success'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : test.status === 'warning'
                          ? 'bg-amber-500/20 text-amber-300'
                          : test.status === 'error'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {test.status === 'success'
                        ? 'Aprovado'
                        : test.status === 'warning'
                        ? 'Atenção'
                        : test.status === 'error'
                        ? 'Erro'
                        : 'Em andamento'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-300 mt-1">{test.message}</p>

                  {test.details && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-stone-950/70 border border-stone-800/80 text-[11px] text-stone-400 font-mono leading-relaxed break-words">
                      {test.details}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Testing Actions */}
        <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Ações de Teste Rápido</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={installPWA}
              className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs font-semibold text-stone-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-red-400" />
              <span>Testar Instalação</span>
            </button>

            <button
              onClick={handleSimulateUpdate}
              className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs font-semibold text-stone-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Verificar Atualização</span>
            </button>

            <button
              onClick={() => {
                caches.keys().then((keys) => {
                  Promise.all(keys.map((k) => caches.delete(k))).then(() => {
                    setToast({ message: 'Caches limpos com sucesso!', type: 'success' });
                    runPWATests();
                  });
                });
              }}
              className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs font-semibold text-stone-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Limpar Cache SW</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => setIsDiagnosticsModalOpen(false)}
            className="py-2.5 px-6 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
