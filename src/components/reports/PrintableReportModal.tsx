import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  FileSpreadsheet,
  Share2,
  Calendar,
  CheckCircle2,
  Copy,
  DollarSign,
  TrendingUp,
  Layers,
  Package,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateTime, formatDate, formatPhone } from '../../utils/formatters';
import {
  exportSalesToExcel,
  exportInventoryToExcel,
  exportFinancesToExcel,
  exportCostsToExcel,
  generateWhatsAppReportSummary,
  shareReportOnWhatsApp,
} from '../../utils/exportEngine';

export type ReportTemplateType =
  | 'financeiro'
  | 'mensal'
  | 'produtos'
  | 'estoque'
  | 'consumo'
  | 'despesas';

interface PrintableReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: ReportTemplateType;
}

export const PrintableReportModal: React.FC<PrintableReportModalProps> = ({
  isOpen,
  onClose,
  initialType = 'financeiro',
}) => {
  const { orders, transactions, inventory, products, categories, settings, setToast } = useApp();

  const [activeReportType, setActiveReportType] = useState<ReportTemplateType>(initialType);
  const [period, setPeriod] = useState<
    'hoje' | '7dias' | '30dias' | 'mes_atual' | 'mes_anterior' | 'personalizado'
  >('mes_atual');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [copied, setCopied] = useState(false);

  // Sync initialType when modal opens with a different one
  React.useEffect(() => {
    if (initialType) {
      setActiveReportType(initialType);
    }
  }, [initialType]);

  // Helper date calculation
  const periodData = useMemo(() => {
    const now = new Date();
    let start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    let label = 'Hoje';

    if (period === '7dias') {
      start = new Date(now.getTime() - 7 * 86400000);
      label = 'Últimos 7 dias';
    } else if (period === '30dias') {
      start = new Date(now.getTime() - 30 * 86400000);
      label = 'Últimos 30 dias';
    } else if (period === 'mes_atual') {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      label = `Mês Atual (${now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })})`;
    } else if (period === 'mes_anterior') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      label = `Mês Anterior (${prevMonthDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })})`;
    } else if (period === 'personalizado' && customStartDate && customEndDate) {
      start = new Date(`${customStartDate}T00:00:00`);
      end = new Date(`${customEndDate}T23:59:59`);
      label = `De ${formatDate(customStartDate)} até ${formatDate(customEndDate)}`;
    }

    return { start, end, label };
  }, [period, customStartDate, customEndDate]);

  // Filtered dataset
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= periodData.start && d <= periodData.end;
    });
  }, [orders, periodData]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= periodData.start && d <= periodData.end;
    });
  }, [transactions, periodData]);

  // Metrics computation
  const metrics = useMemo(() => {
    let faturamento = 0;
    let custosEstimados = 0;
    let totalVendas = 0;

    const validOrders = filteredOrders.filter((o) => o.status !== 'Cancelado');
    totalVendas = validOrders.length;

    validOrders.forEach((o) => {
      faturamento += o.total;
      o.items.forEach((item) => {
        custosEstimados += (item.cost || 0) * (item.quantity || 1);
      });
    });

    let totalDespesas = 0;
    const expenseCategories: Record<string, number> = {};

    filteredTransactions.forEach((tx) => {
      if (tx.type === 'expense') {
        totalDespesas += tx.amount;
        expenseCategories[tx.category] = (expenseCategories[tx.category] || 0) + tx.amount;
      }
    });

    const lucroEstimado = faturamento - (custosEstimados + totalDespesas);
    const margemEstimada = faturamento > 0 ? (lucroEstimado / faturamento) * 100 : 0;
    const ticketMedio = totalVendas > 0 ? faturamento / totalVendas : 0;

    // Top Selling Products in Period
    const prodSalesMap: Record<string, { name: string; qty: number; total: number; cost: number }> = {};
    validOrders.forEach((o) => {
      o.items.forEach((it) => {
        if (!prodSalesMap[it.productId]) {
          prodSalesMap[it.productId] = { name: it.name, qty: 0, total: 0, cost: 0 };
        }
        prodSalesMap[it.productId].qty += it.quantity;
        prodSalesMap[it.productId].total += it.subtotal;
        prodSalesMap[it.productId].cost += (it.cost || 0) * it.quantity;
      });
    });

    const topSelling = Object.values(prodSalesMap).sort((a, b) => b.qty - a.qty);

    // Stock alert items
    const lowStockItems = inventory.filter((i) => i.currentQuantity <= i.minQuantity);
    const totalInventoryValue = inventory.reduce(
      (acc, item) => acc + item.currentQuantity * (item.cost || 0),
      0
    );

    // Channels
    const channelsMap: Record<string, number> = {};
    validOrders.forEach((o) => {
      channelsMap[o.origin] = (channelsMap[o.origin] || 0) + o.total;
    });

    // Payments
    const paymentsMap: Record<string, number> = {};
    validOrders.forEach((o) => {
      paymentsMap[o.paymentMethod] = (paymentsMap[o.paymentMethod] || 0) + o.total;
    });

    return {
      faturamento,
      custosEstimados,
      totalDespesas,
      lucroEstimado,
      margemEstimada,
      totalVendas,
      ticketMedio,
      topSelling,
      lowStockItems,
      totalInventoryValue,
      expenseCategories,
      channelsMap,
      paymentsMap,
    };
  }, [filteredOrders, filteredTransactions, inventory]);

  if (!isOpen) return null;

  // Actions
  const handlePrint = () => {
    window.print();
  };

  const handleExcelExport = () => {
    if (activeReportType === 'estoque') {
      exportInventoryToExcel(inventory, settings);
      setToast({ message: 'Relatório de estoque exportado para Excel!', type: 'success' });
    } else if (activeReportType === 'despesas' || activeReportType === 'financeiro') {
      exportFinancesToExcel(filteredTransactions, settings, periodData.label);
      setToast({ message: 'Relatório financeiro exportado para Excel!', type: 'success' });
    } else if (activeReportType === 'produtos' || activeReportType === 'consumo') {
      exportCostsToExcel(products, categories, orders, settings);
      setToast({ message: 'Relatório de custos e produtos exportado!', type: 'success' });
    } else {
      exportSalesToExcel(filteredOrders, settings, periodData.label);
      setToast({ message: 'Relatório de vendas exportado para Excel!', type: 'success' });
    }
  };

  const getWhatsAppText = () => {
    const expensesArray = Object.entries(metrics.expenseCategories).map(([category, amount]) => ({
      category,
      amount: Number(amount),
    }));
    const lowStockMapped = metrics.lowStockItems.map((i) => ({
      name: i.name,
      current: i.currentQuantity,
      min: i.minQuantity,
      unit: i.unit,
    }));

    return generateWhatsAppReportSummary(
      activeReportType,
      {
        faturamento: metrics.faturamento,
        custos: metrics.custosEstimados,
        despesas: metrics.totalDespesas,
        lucro: metrics.lucroEstimado,
        margem: metrics.margemEstimada,
        totalPedidos: metrics.totalVendas,
        ticketMedio: metrics.ticketMedio,
        topProducts: metrics.topSelling,
        lowStockItems: lowStockMapped,
        expensesByCategory: expensesArray,
        periodLabel: periodData.label,
      },
      settings
    );
  };

  const handleShareWhatsApp = () => {
    const text = getWhatsAppText();
    shareReportOnWhatsApp(text);
  };

  const handleCopyText = () => {
    const text = getWhatsAppText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setToast({ message: 'Texto do relatório copiado!', type: 'success' });
    setTimeout(() => setCopied(false), 2000);
  };

  const reportTabs: { id: ReportTemplateType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'financeiro', label: 'Resumo Financeiro', icon: DollarSign },
    { id: 'mensal', label: 'Relatório Mensal', icon: TrendingUp },
    { id: 'produtos', label: 'Produtos & Cardápio', icon: Layers },
    { id: 'estoque', label: 'Estoque & Insumos', icon: Package },
    { id: 'consumo', label: 'Consumo & CMV', icon: FileText },
    { id: 'despesas', label: 'Despesas & Contas', icon: AlertTriangle },
  ];

  return (
    <div
      id="printable-report-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        id="printable-report-modal-card"
        className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-5xl text-stone-100 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar (Hidden on print) */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 no-print">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-red-600/20 text-red-500 rounded-lg">
                <Printer className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-heading text-white">
                Centro de Exportação & Impressão
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Gere documentos em PDF, planilhas Excel ou envie relatórios pelo WhatsApp
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-all cursor-pointer"
              title="Imprimir ou Salvar em PDF (A4)"
            >
              <Printer className="w-4 h-4" />
              <span>PDF / Imprimir</span>
            </button>

            <button
              onClick={handleExcelExport}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer"
              title="Baixar planilha para Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition-all cursor-pointer"
              title="Compartilhar no WhatsApp"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter and Tab Selection Bar (Hidden on print) */}
        <div className="px-4 sm:px-5 py-3 bg-stone-950 border-b border-stone-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 no-print">
          {/* Report Template Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {reportTabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeReportType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveReportType(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-2 self-end lg:self-auto flex-wrap">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="bg-stone-900 border border-stone-800 text-stone-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="hoje">Hoje</option>
              <option value="7dias">Últimos 7 dias</option>
              <option value="30dias">Últimos 30 dias</option>
              <option value="mes_atual">Mês Atual</option>
              <option value="mes_anterior">Mês Anterior</option>
              <option value="personalizado">Personalizado</option>
            </select>

            {period === 'personalizado' && (
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-stone-900 border border-stone-800 text-stone-200 text-[11px] rounded-lg px-2 py-1"
                />
                <span className="text-stone-400 text-xs">até</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-stone-900 border border-stone-800 text-stone-200 text-[11px] rounded-lg px-2 py-1"
                />
              </div>
            )}
          </div>
        </div>

        {/* Modal Body / Document Preview Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-950/60">
          {/* A4 PAPER PREVIEW CONTAINER */}
          <div
            id="printable-report"
            className="bg-white text-stone-900 rounded-2xl shadow-xl p-6 sm:p-8 max-w-4xl mx-auto border border-stone-200 text-xs sm:text-sm font-sans"
          >
            {/* Header: Business Logo, Name, Contacts, Emission Date */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-stone-900 pb-5 mb-6 gap-4">
              <div className="flex items-center gap-4">
                {settings?.logo ? (
                  <img
                    src={settings.logo}
                    alt="Logo"
                    className="w-14 h-14 object-cover rounded-xl border border-stone-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold text-lg">
                    {settings?.name ? settings.name.charAt(0).toUpperCase() : 'AL'}
                  </div>
                )}
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-950 font-heading">
                    {settings?.name || 'AL Studio Gestão'}
                  </h1>
                  {settings?.slogan && (
                    <p className="text-xs text-stone-500 italic">{settings.slogan}</p>
                  )}
                  <p className="text-xs text-stone-600 mt-0.5">
                    {settings?.address && `${settings.address}, `}
                    {settings?.city && `${settings.city} `}
                    {settings?.state && `- ${settings.state}`}
                  </p>
                  {(settings?.phone || settings?.whatsapp) && (
                    <p className="text-xs text-stone-600">
                      Telefone / WhatsApp: {formatPhone(settings?.phone || settings?.whatsapp || '')}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100 w-full sm:w-auto">
                <div className="inline-block px-3 py-1 bg-stone-100 rounded-lg text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                  {activeReportType === 'financeiro' && 'Resumo Financeiro'}
                  {activeReportType === 'mensal' && 'Relatório Mensal'}
                  {activeReportType === 'produtos' && 'Catálogo de Produtos'}
                  {activeReportType === 'estoque' && 'Posição de Estoque'}
                  {activeReportType === 'consumo' && 'Consumo & CMV'}
                  {activeReportType === 'despesas' && 'Relatório de Despesas'}
                </div>
                <div className="text-xs text-stone-500">
                  <span className="font-semibold text-stone-700">Período:</span> {periodData.label}
                </div>
                <div className="text-[11px] text-stone-400">
                  Emissão: {new Date().toLocaleString('pt-BR')}
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 1. RESUMO FINANCEIRO & RELATÓRIO MENSAL */}
            {/* ========================================================================= */}
            {(activeReportType === 'financeiro' || activeReportType === 'mensal') && (
              <div className="space-y-6">
                {/* Highlights KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-[10px] font-bold uppercase text-stone-500 block">
                      Faturamento Bruto
                    </span>
                    <span className="text-lg font-black text-stone-900">
                      {formatCurrency(metrics.faturamento)}
                    </span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">
                      {metrics.totalVendas} vendas no período
                    </span>
                  </div>

                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-[10px] font-bold uppercase text-stone-500 block">
                      Custos de Produtos (CMV)
                    </span>
                    <span className="text-lg font-black text-amber-700">
                      {formatCurrency(metrics.custosEstimados)}
                    </span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">
                      {metrics.faturamento > 0
                        ? `${((metrics.custosEstimados / metrics.faturamento) * 100).toFixed(1)}% do total`
                        : '0%'}
                    </span>
                  </div>

                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-[10px] font-bold uppercase text-stone-500 block">
                      Despesas Operacionais
                    </span>
                    <span className="text-lg font-black text-red-700">
                      {formatCurrency(metrics.totalDespesas)}
                    </span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">
                      Contas e despesas fixas
                    </span>
                  </div>

                  <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                      Lucro Líquido Estimado
                    </span>
                    <span className="text-lg font-black text-emerald-700">
                      {formatCurrency(metrics.lucroEstimado)}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 block mt-0.5">
                      Margem: {metrics.margemEstimada.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Additional Commercial Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-stone-200">
                    <h3 className="font-bold text-xs uppercase text-stone-700 mb-3 flex items-center justify-between">
                      <span>Canais de Venda</span>
                      <span>Total</span>
                    </h3>
                    <div className="space-y-1.5 text-xs">
                      {Object.entries(metrics.channelsMap).length > 0 ? (
                        Object.entries(metrics.channelsMap).map(([ch, val]) => (
                          <div key={ch} className="flex justify-between py-1 border-b border-stone-100">
                            <span className="text-stone-700 font-medium">{ch}</span>
                            <span className="font-bold text-stone-900">{formatCurrency(Number(val))}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-stone-400 italic text-xs py-2">Sem vendas no período</p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-stone-200">
                    <h3 className="font-bold text-xs uppercase text-stone-700 mb-3 flex items-center justify-between">
                      <span>Formas de Pagamento</span>
                      <span>Total</span>
                    </h3>
                    <div className="space-y-1.5 text-xs">
                      {Object.entries(metrics.paymentsMap).length > 0 ? (
                        Object.entries(metrics.paymentsMap).map(([pay, val]) => (
                          <div key={pay} className="flex justify-between py-1 border-b border-stone-100">
                            <span className="text-stone-700 font-medium">{pay}</span>
                            <span className="font-bold text-stone-900">{formatCurrency(Number(val))}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-stone-400 italic text-xs py-2">Sem pagamentos no período</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Selling Products in Period */}
                <div>
                  <h3 className="font-bold text-xs uppercase text-stone-700 mb-2">
                    Produtos Mais Vendidos no Período
                  </h3>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b-2 border-stone-300 bg-stone-100 text-stone-700">
                        <th className="py-2 px-2 font-bold">Produto</th>
                        <th className="py-2 px-2 text-center font-bold">Qtd Vendida</th>
                        <th className="py-2 px-2 text-right font-bold">Faturamento</th>
                        <th className="py-2 px-2 text-right font-bold">Custo Estimado</th>
                        <th className="py-2 px-2 text-right font-bold">Lucro Bruto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.topSelling.length > 0 ? (
                        metrics.topSelling.slice(0, 10).map((p, idx) => (
                          <tr key={idx} className="border-b border-stone-200">
                            <td className="py-2 px-2 font-medium text-stone-900">{p.name}</td>
                            <td className="py-2 px-2 text-center text-stone-700">{p.qty} un</td>
                            <td className="py-2 px-2 text-right font-bold text-stone-900">
                              {formatCurrency(p.total)}
                            </td>
                            <td className="py-2 px-2 text-right text-stone-600">
                              {formatCurrency(p.cost)}
                            </td>
                            <td className="py-2 px-2 text-right font-bold text-emerald-700">
                              {formatCurrency(p.total - p.cost)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-stone-400 italic">
                            Nenhuma venda registrada no período selecionado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. PRODUTOS & CARDÁPIO */}
            {/* ========================================================================= */}
            {activeReportType === 'produtos' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs">
                  <span>
                    Total de Itens Cadastrados: <strong>{products.length}</strong>
                  </span>
                  <span>
                    Categorias: <strong>{categories.length}</strong>
                  </span>
                </div>

                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-stone-300 bg-stone-100 text-stone-700">
                      <th className="py-2 px-2 font-bold">Produto</th>
                      <th className="py-2 px-2 font-bold">Categoria</th>
                      <th className="py-2 px-2 text-right font-bold">Preço de Venda</th>
                      <th className="py-2 px-2 text-right font-bold">Custo Unit.</th>
                      <th className="py-2 px-2 text-right font-bold">Lucro Unit.</th>
                      <th className="py-2 px-2 text-center font-bold">Margem</th>
                      <th className="py-2 px-2 text-center font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => {
                      const cost = p.cost || 0;
                      const price = p.price || 0;
                      const profit = price - cost;
                      const margin = price > 0 ? (profit / price) * 100 : 0;
                      return (
                        <tr key={p.id} className="border-b border-stone-200">
                          <td className="py-2 px-2 font-medium text-stone-900">
                            <div>{p.name}</div>
                            {p.description && (
                              <div className="text-[10px] text-stone-500 truncate max-w-xs">
                                {p.description}
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-2 text-stone-600">{p.category}</td>
                          <td className="py-2 px-2 text-right font-bold text-stone-900">
                            {formatCurrency(price)}
                          </td>
                          <td className="py-2 px-2 text-right text-stone-600">
                            {formatCurrency(cost)}
                          </td>
                          <td className="py-2 px-2 text-right font-bold text-emerald-700">
                            {formatCurrency(profit)}
                          </td>
                          <td className="py-2 px-2 text-center text-stone-700">
                            {margin.toFixed(1)}%
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.available
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-stone-200 text-stone-600'
                              }`}
                            >
                              {p.available ? 'Ativo' : 'Pausado'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. ESTOQUE & INSUMOS */}
            {/* ========================================================================= */}
            {activeReportType === 'estoque' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-[10px] font-bold uppercase text-stone-500 block">
                      Itens Cadastrados
                    </span>
                    <span className="text-base font-bold text-stone-900">
                      {inventory.length} insumos
                    </span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="text-[10px] font-bold uppercase text-amber-800 block">
                      Estoque Baixo / Crítico
                    </span>
                    <span className="text-base font-bold text-amber-900">
                      {metrics.lowStockItems.length} itens precisando reposição
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                      Valor Imobilizado em Estoque
                    </span>
                    <span className="text-base font-bold text-emerald-900">
                      {formatCurrency(metrics.totalInventoryValue)}
                    </span>
                  </div>
                </div>

                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-stone-300 bg-stone-100 text-stone-700">
                      <th className="py-2 px-2 font-bold">Item / Insumo</th>
                      <th className="py-2 px-2 font-bold">Categoria</th>
                      <th className="py-2 px-2 text-center font-bold">Estoque Atual</th>
                      <th className="py-2 px-2 text-center font-bold">Mínimo</th>
                      <th className="py-2 px-2 text-right font-bold">Custo Unit.</th>
                      <th className="py-2 px-2 text-right font-bold">Total em Estoque</th>
                      <th className="py-2 px-2 text-center font-bold">Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => {
                      const totalItem = item.currentQuantity * (item.cost || 0);
                      const isLow = item.currentQuantity <= item.minQuantity;
                      const isZero = item.currentQuantity <= 0;
                      return (
                        <tr key={item.id} className="border-b border-stone-200">
                          <td className="py-2 px-2 font-medium text-stone-900">{item.name}</td>
                          <td className="py-2 px-2 text-stone-600">{item.category || 'Geral'}</td>
                          <td className="py-2 px-2 text-center font-bold text-stone-900">
                            {item.currentQuantity} {item.unit}
                          </td>
                          <td className="py-2 px-2 text-center text-stone-500">
                            {item.minQuantity} {item.unit}
                          </td>
                          <td className="py-2 px-2 text-right text-stone-600">
                            {formatCurrency(item.cost || 0)}
                          </td>
                          <td className="py-2 px-2 text-right font-bold text-stone-900">
                            {formatCurrency(totalItem)}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isZero
                                  ? 'bg-red-100 text-red-800'
                                  : isLow
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isZero ? 'ZERADO' : isLow ? 'BAIXO' : 'OK'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 4. CONSUMO & CMV */}
            {/* ========================================================================= */}
            {activeReportType === 'consumo' && (
              <div className="space-y-4">
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Faturamento no Período:</span>
                    <span className="font-bold text-stone-900">
                      {formatCurrency(metrics.faturamento)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Custo Total de Mercadoria Vendida (CMV):</span>
                    <span className="font-bold text-amber-800">
                      {formatCurrency(metrics.custosEstimados)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-stone-200 pt-2 font-bold">
                    <span>Percentual de Consumo sobre Vendas (CMV %):</span>
                    <span className="text-emerald-700">
                      {metrics.faturamento > 0
                        ? `${((metrics.custosEstimados / metrics.faturamento) * 100).toFixed(1)}%`
                        : '0%'}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-xs uppercase text-stone-700">
                  Consumo e Custo por Item Vendido
                </h3>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-stone-300 bg-stone-100 text-stone-700">
                      <th className="py-2 px-2 font-bold">Item Comercializado</th>
                      <th className="py-2 px-2 text-center font-bold">Qtd Vendida</th>
                      <th className="py-2 px-2 text-right font-bold">Custo Estimado Unit.</th>
                      <th className="py-2 px-2 text-right font-bold">Custo Total Consumido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.topSelling.length > 0 ? (
                      metrics.topSelling.map((p, idx) => (
                        <tr key={idx} className="border-b border-stone-200">
                          <td className="py-2 px-2 font-medium text-stone-900">{p.name}</td>
                          <td className="py-2 px-2 text-center text-stone-700">{p.qty} un</td>
                          <td className="py-2 px-2 text-right text-stone-600">
                            {formatCurrency(p.qty > 0 ? p.cost / p.qty : 0)}
                          </td>
                          <td className="py-2 px-2 text-right font-bold text-stone-900">
                            {formatCurrency(p.cost)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-stone-400 italic">
                          Sem vendas e consumo no período
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 5. DESPESAS */}
            {/* ========================================================================= */}
            {activeReportType === 'despesas' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-red-50 p-4 rounded-xl border border-red-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-red-800 block">
                      Total de Despesas no Período
                    </span>
                    <span className="text-xl font-black text-red-900">
                      {formatCurrency(metrics.totalDespesas)}
                    </span>
                  </div>
                  <span className="text-xs text-red-700">
                    {filteredTransactions.filter((t) => t.type === 'expense').length} lançamentos
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-xs text-stone-700 uppercase mb-2">
                    Resumo por Categoria de Gasto
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {Object.entries(metrics.expenseCategories).map(([cat, amt]) => (
                      <div key={cat} className="flex justify-between p-1.5 bg-white rounded border border-stone-200">
                        <span className="text-stone-600">{cat}:</span>
                        <span className="font-bold text-stone-900">{formatCurrency(Number(amt))}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-stone-300 bg-stone-100 text-stone-700">
                      <th className="py-2 px-2 font-bold">Data</th>
                      <th className="py-2 px-2 font-bold">Descrição</th>
                      <th className="py-2 px-2 font-bold">Categoria</th>
                      <th className="py-2 px-2 font-bold">Pagamento</th>
                      <th className="py-2 px-2 text-right font-bold">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions
                      .filter((t) => t.type === 'expense')
                      .map((tx) => (
                        <tr key={tx.id} className="border-b border-stone-200">
                          <td className="py-2 px-2 text-stone-600">{formatDateTime(tx.date)}</td>
                          <td className="py-2 px-2 font-medium text-stone-900">{tx.description}</td>
                          <td className="py-2 px-2 text-stone-600">{tx.category}</td>
                          <td className="py-2 px-2 text-stone-600">{tx.paymentMethod || 'Outro'}</td>
                          <td className="py-2 px-2 text-right font-bold text-red-700">
                            {formatCurrency(tx.amount)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Document Footer */}
            <div className="mt-8 pt-4 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-center text-[10px] text-stone-400 gap-2">
              <span>AL Studio Gestão • Sistema de Gestão Empresarial 100% Offline</span>
              <span>Documento emitido em {new Date().toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="p-4 bg-stone-900 border-t border-stone-800 flex items-center justify-between no-print">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado!' : 'Copiar Resumo em Texto'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
