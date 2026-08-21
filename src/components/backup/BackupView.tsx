import React, { useState, useRef } from 'react';
import { Database, Download, Upload, AlertTriangle, FileJson, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportFullBackup, importFullBackup } from '../../services/database';

export const BackupView: React.FC = () => {
  const { toast, setToast, settings, handleUpdateSettings } = useApp();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<any>(null);
  const [importFileContent, setImportFileContent] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const jsonStr = await exportFullBackup();
      
      // Compress if possible (we can just download as .json)
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().split('T')[0];
      link.download = `backup_alstudio_gestao_${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setToast({ message: 'Backup exportado com sucesso!', type: 'success' });
    } catch (error) {
      console.error(error);
      setToast({ message: 'Erro ao exportar backup', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        
        // Basic validation
        if (!data.version || !data.exportedAt) {
          throw new Error('Arquivo de backup inválido');
        }

        setImportSummary({
          date: new Date(data.exportedAt).toLocaleString(),
          orders: data.orders?.length || 0,
          products: data.products?.length || 0,
          customers: data.customers?.length || 0,
          transactions: data.transactions?.length || 0,
          inventory: data.inventory?.length || 0,
        });
        setImportFileContent(content);
      } catch (error) {
        console.error(error);
        setToast({ message: 'Arquivo de backup inválido ou corrompido', type: 'error' });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confirmImport = async () => {
    try {
      setIsImporting(true);
      const success = await importFullBackup(importFileContent);
      if (success) {
        setToast({ message: 'Backup restaurado com sucesso! Recarregando...', type: 'success' });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error('Falha na restauração');
      }
    } catch (error) {
      console.error(error);
      setToast({ message: 'Erro ao restaurar backup', type: 'error' });
      setIsImporting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            💾 Backup & Dados
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Exporte ou restaure todos os dados do sistema
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Exportar Backup</h2>
              <p className="text-xs text-stone-400">Salvar dados no seu dispositivo</p>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-2 text-sm text-stone-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>Exporta todos os produtos, estoque, vendas e clientes</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-stone-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>Inclui financeiro, histórico e configurações</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-stone-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>Formato JSON padrão de fácil leitura</span>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-sm transition-colors disabled:opacity-50"
          >
            {isExporting ? 'Gerando...' : 'Gerar backup agora'}
          </button>

          <div className="mt-6 pt-6 border-t border-stone-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Backup automático local</p>
              <p className="text-xs text-stone-400">Exportar backup diariamente ao abrir o sistema</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings?.autoBackupLocal || false}
                onChange={async (e) => {
                  if (settings) {
                    await handleUpdateSettings({ ...settings, autoBackupLocal: e.target.checked });
                    setToast({ message: e.target.checked ? 'Backup automático ativado' : 'Backup automático desativado', type: 'success' });
                  }
                }}
              />
              <div className="w-11 h-6 bg-stone-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        {/* Import Card */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Restaurar Backup</h2>
              <p className="text-xs text-stone-400">Importar arquivo JSON</p>
            </div>
          </div>

          {!importSummary ? (
            <>
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-sm text-blue-400 text-center">
                    Selecione um arquivo .json gerado anteriormente por este sistema.
                  </p>
                </div>
              </div>

              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-colors"
              >
                Selecionar arquivo
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-2 text-sm text-stone-300">
                <p className="font-bold text-white border-b border-stone-800 pb-2 mb-2">
                  Resumo do Backup:
                </p>
                <div className="flex justify-between"><span>Data de criação:</span> <span>{importSummary.date}</span></div>
                <div className="flex justify-between"><span>Pedidos:</span> <span>{importSummary.orders}</span></div>
                <div className="flex justify-between"><span>Produtos:</span> <span>{importSummary.products}</span></div>
                <div className="flex justify-between"><span>Clientes:</span> <span>{importSummary.customers}</span></div>
                <div className="flex justify-between"><span>Transações:</span> <span>{importSummary.transactions}</span></div>
                <div className="flex justify-between"><span>Itens de Estoque:</span> <span>{importSummary.inventory}</span></div>
              </div>

              {!showConfirm ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setImportSummary(null);
                      setImportFileContent('');
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/20 transition-colors"
                  >
                    Restaurar
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-4">
                  <div className="flex gap-3 text-red-400">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-bold">Substituir dados atuais?</p>
                  </div>
                  <p className="text-xs text-red-400/80">
                    Esta ação apagará todos os dados atuais do sistema e os substituirá pelos dados do backup. Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowConfirm(false)}
                      disabled={isImporting}
                      className="flex-1 px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmImport}
                      disabled={isImporting}
                      className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors disabled:opacity-50"
                    >
                      {isImporting ? 'Restaurando...' : 'Sim, substituir'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
