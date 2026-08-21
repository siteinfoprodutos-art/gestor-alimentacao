import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  DollarSign,
  Tag,
  CreditCard,
  Smartphone,
  Package,
  AlertCircle,
  Sparkles,
  Share2,
  FileSpreadsheet,
  Layers,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  PrintableReportModal,
  ReportTemplateType,
} from './PrintableReportModal';
import {
  exportSalesToExcel,
  exportInventoryToExcel,
  exportFinancesToExcel,
  exportCostsToExcel,
  generateWhatsAppReportSummary,
  shareReportOnWhatsApp,
} from '../../utils/exportEngine';

type ReportPeriod = 'hoje' | '7dias' | '30dias' | 'mes_atual' | 'mes_anterior' | 'personalizado';

export const ReportsView: React.FC = () => {
  const { orders, transactions, inventory, products, categories, settings, setToast } = useApp();

  const [filterPeriod, setFilterPeriod] = useState<ReportPeriod>('mes_atual');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<ReportTemplateType>('financeiro');

  // Helper to filter dates
  const filterByDateRange = (dateStr: string, start: Date, end: Date) => {
    const d = new Date(dateStr);
    return d >= start && d <= end;
  };

  const getDatesForPeriod = (period: ReportPeriod) => {
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
      label = `Personalizado (${customStartDate} a ${customEndDate})`;
    }

    return { start, end, label };
  };

  const currentPeriodDates = useMemo(() => getDatesForPeriod(filterPeriod), [
    filterPeriod,
    customStartDate,
    customEndDate,
  ]);

  // Compute Report Data
  const reportData = useMemo(() => {
    const { start, end } = currentPeriodDates;

    let faturamento = 0;
    let custosEstimados = 0;
    let despesas = 0;
    let totalVendas = 0;
    let perdas = 0;

    const productsMap: Record<
      string,
      { name: string; qty: number; faturamento: number; custo: number }
    > = {};
    const channelsMap: Record<string, number> = {};
    const paymentsMap: Record<string, number> = {};

    // 1. Orders
    const validOrders = orders.filter(
      (o) => o.status !== 'Cancelado' && filterByDateRange(o.createdAt, start, end)
    );

    validOrders.forEach((o) => {
      faturamento += o.total;
      totalVendas += 1;

      const origin = o.origin || 'Outros';
      channelsMap[origin] = (channelsMap[origin] || 0) + o.total;

      const paymentMethod = o.paymentMethod || 'Outros';
      paymentsMap[paymentMethod] = (paymentsMap[paymentMethod] || 0) + o.total;

      let orderCost = 0;
      o.items.forEach((item) => {
        const itemCost = (item.cost || 0) * item.quantity;
        orderCost += itemCost;

        // Product stats
        if (!productsMap[item.productId]) {
          productsMap[item.productId] = { name: item.name, qty: 0, faturamento: 0, custo: 0 };
        }
        productsMap[item.productId].qty += item.quantity;
        productsMap[item.productId].faturamento += item.subtotal;
        productsMap[item.productId].custo += itemCost;
      });

      custosEstimados += orderCost;
    });

    // 2. Transactions (Manual income & Expenses)
    const validTx = transactions.filter((t) => filterByDateRange(t.date, start, end));
    validTx.forEach((t) => {
      if (t.type === 'expense') {
        despesas += t.amount;
        if (
          t.category.toLowerCase().includes('perda') ||
          t.category.toLowerCase().includes('desperd')
        ) {
          perdas += t.amount;
        }
      } else if (t.type === 'income' && !t.orderId) {
        faturamento += t.amount;
        const pMethod = t.paymentMethod || 'Outros';
        paymentsMap[pMethod] = (paymentsMap[pMethod] || 0) + t.amount;
      }
    });

    const lucroEstimado = faturamento - custosEstimados - despesas;
    const margemEstimada = faturamento > 0 ? (lucroEstimado / faturamento) * 100 : 0;

    // Convert Maps to Arrays
    const productsArray = Object.values(productsMap).map((p) => ({
      ...p,
      lucro: p.faturamento - p.custo,
      margem: p.faturamento > 0 ? ((p.faturamento - p.custo) / p.faturamento) * 100 : 0,
    }));

    const topSellingProducts = [...productsArray].sort((a, b) => b.qty - a.qty).slice(0, 5);
    const topProfitableProducts = [...productsArray].sort((a, b) => b.lucro - a.lucro).slice(0, 5);

    const channelsArray = Object.entries(channelsMap)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);

    const paymentsArray = Object.entries(paymentsMap)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);

    return {
      totalVendas,
      faturamento,
      custosEstimados,
      despesas,
      lucroEstimado,
      margemEstimada,
      perdas,
      topSellingProducts,
      topProfitableProducts,
      channelsArray,
      paymentsArray,
      validOrders,
    };
  }, [orders, transactions, currentPeriodDates]);

  // Inventory value calculation
  const totalInventoryValue = useMemo(() => {
    return inventory.reduce((sum, item) => sum + item.currentQuantity * (item.cost || 0), 0);
  }, [inventory]);

  // Open modal with specific report type
  const openReport = (type: ReportTemplateType) => {
    setSelectedReportType(type);
    setIsExportModalOpen(true);
  };

  // Direct Excel Exports
  const handleExportSales = () => {
    exportSalesToExcel(reportData.validOrders, settings, currentPeriodDates.label);
    setToast({ message: 'Planilha de Vendas exportada com sucesso!', type: 'success' });
  };

  const handleExportInventory = () => {
    exportInventoryToExcel(inventory, settings);
    setToast({ message: 'Planilha de Estoque exportada com sucesso!', type: 'success' });
  };

  const handleExportFinances = () => {
    const validTx = transactions.filter((t) =>
      filterByDateRange(t.date, currentPeriodDates.start, currentPeriodDates.end)
    );
    exportFinancesToExcel(validTx, settings, currentPeriodDates.label);
    setToast({ message: 'Planilha Financeira exportada com sucesso!', type: 'success' });
  };

  const handleExportCosts = () => {
    exportCostsToExcel(products, categories, orders, settings);
    setToast({ message: 'Planilha de Custos e Produtos exportada!', type: 'success' });
  };

  // Quick WhatsApp Share
  const handleQuickWhatsAppShare = () => {
    const lowStockMapped = inventory
      .filter((i) => i.currentQuantity <= i.minQuantity)
      .map((i) => ({
        name: i.name,
        current: i.currentQuantity,
        min: i.minQuantity,
        unit: i.unit,
      }));

    const text = generateWhatsAppReportSummary(
      'financeiro',
      {
        faturamento: reportData.faturamento,
        custos: reportData.custosEstimados,
        despesas: reportData.despesas,
        lucro: reportData.lucroEstimado,
        margem: reportData.margemEstimada,
        totalPedidos: reportData.totalVendas,
        ticketMedio: reportData.totalVendas > 0 ? reportData.faturamento / reportData.totalVendas : 0,
        topProducts: reportData.topSellingProducts.map((p) => ({
          name: p.name,
          qty: p.qty,
          total: p.faturamento,
        })),
        lowStockItems: lowStockMapped,
        periodLabel: currentPeriodDates.label,
      },
      settings
    );

    shareReportOnWhatsApp(text);
  };

  return (
    <div id="reports-view" className="space-y-6 pb-20 md:pb-6 animate-fade-in">
      {/* Header & Main Export Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white flex items-center gap-2 tracking-tight">
            📊 Relatórios & Exportações
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Gere relatórios em PDF, planilhas Excel e envie resumos pelo WhatsApp
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap no-print">
          <button
            onClick={() => openReport('financeiro')}
            className="flex items-center gap-1.5 py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Centro de Impressão & PDF</span>
          </button>

          <button
            onClick={handleQuickWhatsAppShare}
            className="flex items-center gap-1.5 py-2.5 px-3.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-green-600/20 transition-all cursor-pointer"
            title="Compartilhar resumo no WhatsApp sem API paga"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXPORTATION HUB - PDF & EXCEL QUICK ACCESS CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 no-print">
        {/* PDF & Printing Card */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-red-500/10 text-red-400">
                <Printer className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-heading font-bold text-sm text-white">
                  Documentos & Relatórios em PDF
                </h3>
                <p className="text-[11px] text-stone-400">
                  Layout A4 otimizado com cabeçalho, logo e dados do negócio
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => openReport('financeiro')}
              className="flex flex-col items-start p-2.5 rounded-xl bg-stone-950 hover:bg-stone-800/80 border border-stone-800 text-left transition-all group cursor-pointer"
            >
              <DollarSign className="w-4 h-4 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-stone-200">Resumo Financeiro</span>
              <span className="text-[10px] text-stone-500">DRE e margens</span>
            </button>

            <button
              onClick={() => openReport('mensal')}
              className="flex flex-col items-start p-2.5 rounded-xl bg-stone-950 hover:bg-stone-800/80 border border-stone-800 text-left transition-all group cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-stone-200">Relatório Mensal</span>
              <span className="text-[10px] text-stone-500">Visão periódica</span>
            </button>

            <button
              onClick={() => openReport('produtos')}
              className="flex flex-col items-start p-2.5 rounded-xl bg-stone-950 hover:bg-stone-800/80 border border-stone-800 text-left transition-all group cursor-pointer"
            >
              <Layers className="w-4 h-4 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-stone-200">Produtos</span>
              <span className="text-[10px] text-stone-500">Catálogo e preços</span>
            </button>

            <button
              onClick={() => openReport('estoque')}
              className="flex flex-col items-start p-2.5 rounded-xl bg-stone-950 hover:bg-stone-800/80 border border-stone-800 text-left transition-all group cursor-pointer"
            >
              <Package className="w-4 h-4 text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-stone-200">Estoque</span>
              <span className="text-[10px] text-stone-500">Insumos e níveis</span>
            </button>

            <button
              onClick={() => openReport('consumo')}
              className="flex flex-col items-start p-2.5 rounded-xl bg-stone-950 hover:bg-stone-800/80 border border-stone-800 text-left transition-all group cursor-pointer"
            >
              <FileText className="w-4 h-4 text-orange-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-stone-200">Consumo</span>
              <span className="text-[10px] text-stone-500">CMV e fichas</span>
            </button>

            <button
              onClick={() => openReport('despesas')}
              className="flex flex-col items-start p-2.5 rounded-xl bg-stone-950 hover:bg-stone-800/80 border border-stone-800 text-left transition-all group cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-red-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-stone-200">Despesas</span>
              <span className="text-[10px] text-stone-500">Contas e saídas</span>
            </button>
          </div>
        </div>

        {/* Excel & Spreadsheets Card */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <FileSpreadsheet className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-heading font-bold text-sm text-white">
                  Exportações para Excel (.csv / .xlsx)
                </h3>
                <p className="text-[11px] text-stone-400">
                  Planilhas compatíveis com Excel, Google Sheets e LibreOffice
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={handleExportSales}
              className="flex items-center justify-between p-3 rounded-xl bg-stone-950 hover:bg-stone-800/80 border border-stone-800 text-left transition-all group cursor-pointer"
            >
              <div>
                <span className="text-xs font-bold text-stone-200 block">Vendas (Excel)</span>
                <span className="text-[10px] text-stone-500">Pedidos, canais e totais</span>
              </div>
              <Download className="w-4 h-4 text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
            </button>

            <button
              onClick={handleExportInventory}
              className="flex items-center justify-between p-3 rounded-xl bg-stone-950 hover:bg-stone-800/80 border border-stone-800 text-left transition-all group cursor-pointer"
            >
              <div>
                <span className="text-xs font-bold text-stone-200 block">Estoque (Excel)</span>
                <span className="text-[10px] text-stone-500">Itens, custos e mínimos</span>
              </div>
              <Download className="w-4 h-4 text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
            </button>

            <button
              onClick={handleExportFinances}
              className="flex items-center justify-between p-3 rounded-xl bg-stone-950 hover:bg-stone-800/80 border border-stone-800 text-left transition-all group cursor-pointer"
            >
              <div>
                <span className="text-xs font-bold text-stone-200 block">Financeiro (Excel)</span>
                <span className="text-[10px] text-stone-500">Fluxo de caixa completo</span>
              </div>
              <Download className="w-4 h-4 text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
            </button>

            <button
              onClick={handleExportCosts}
              className="flex items-center justify-between p-3 rounded-xl bg-stone-950 hover:bg-stone-800/80 border border-stone-800 text-left transition-all group cursor-pointer"
            >
              <div>
                <span className="text-xs font-bold text-stone-200 block">Custos (Excel)</span>
                <span className="text-[10px] text-stone-500">Margens e fichas</span>
              </div>
              <Download className="w-4 h-4 text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Period Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-print">
        {(['hoje', '7dias', '30dias', 'mes_atual', 'mes_anterior', 'personalizado'] as const).map(
          (p) => (
            <button
              key={p}
              onClick={() => setFilterPeriod(p)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl transition-all font-bold text-xs cursor-pointer ${
                filterPeriod === p
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-stone-900 text-stone-400 border border-stone-800 hover:text-stone-200'
              }`}
            >
              {p === 'hoje' && 'Hoje'}
              {p === '7dias' && '7 Dias'}
              {p === '30dias' && '30 Dias'}
              {p === 'mes_atual' && 'Mês Atual'}
              {p === 'mes_anterior' && 'Mês Anterior'}
              {p === 'personalizado' && 'Personalizado'}
            </button>
          )
        )}
      </div>

      {filterPeriod === 'personalizado' && (
        <div className="flex items-end gap-3 p-3 bg-stone-900 border border-stone-800 rounded-2xl max-w-sm no-print animate-fade-in">
          <div className="flex-1">
            <label className="text-[10px] text-stone-400 font-semibold mb-1 block uppercase tracking-wider">
              Data Inicial
            </label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-stone-400 font-semibold mb-1 block uppercase tracking-wider">
              Data Final
            </label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col gap-1 shadow-lg">
          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            Vendas (Qtd)
          </span>
          <span className="text-xl md:text-2xl font-bold text-white">{reportData.totalVendas}</span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col gap-1 shadow-lg">
          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            Faturamento
          </span>
          <span className="text-xl md:text-2xl font-bold text-white">
            {formatCurrency(reportData.faturamento)}
          </span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col gap-1 shadow-lg">
          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            Custos + Despesas
          </span>
          <span className="text-xl md:text-2xl font-bold text-red-400">
            {formatCurrency(reportData.custosEstimados + reportData.despesas)}
          </span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col gap-1 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <Sparkles className="w-8 h-8 text-emerald-400" />
          </div>
          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider relative z-10">
            Lucro Estimado
          </span>
          <span className="text-xl md:text-2xl font-bold text-emerald-400 relative z-10">
            {formatCurrency(reportData.lucroEstimado)}
          </span>
          <span className="text-[10px] text-stone-400 mt-1 relative z-10">
            Margem: {reportData.margemEstimada.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Produtos Mais Vendidos */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-red-400" /> Produtos Mais Vendidos
          </h3>
          <div className="space-y-3">
            {reportData.topSellingProducts.length > 0 ? (
              reportData.topSellingProducts.map((p, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-stone-950 border border-stone-850"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center text-xs font-bold text-stone-400 flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-stone-200">{p.name}</div>
                      <div className="text-[10px] sm:text-xs text-stone-500">
                        {p.qty} unidades vendidas
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 sm:gap-1 items-center sm:items-end justify-between border-t sm:border-0 border-stone-800 pt-2 sm:pt-0">
                    <div className="flex gap-4 sm:gap-0 sm:flex-col sm:items-end">
                      <div className="flex flex-col sm:items-end">
                        <span className="text-[10px] text-stone-500 sm:hidden">Faturamento</span>
                        <span className="font-bold text-xs sm:text-sm text-white">
                          {formatCurrency(p.faturamento)}
                        </span>
                      </div>
                      <div className="flex flex-col sm:items-end">
                        <span className="text-[10px] text-stone-500 sm:hidden">Lucro</span>
                        <span className="font-bold text-xs text-emerald-400 sm:mt-0.5">
                          {formatCurrency(p.lucro)} ({p.margem.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-stone-500 text-center py-6 bg-stone-950 rounded-2xl border border-stone-800 border-dashed">
                Nenhum produto vendido no período
              </div>
            )}
          </div>
        </div>

        {/* Canais de Venda e Formas de Pagamento */}
        <div className="space-y-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Smartphone className="w-4 h-4 text-blue-400" /> Canais de Venda
            </h3>
            <div className="space-y-3">
              {reportData.channelsArray.length > 0 ? (
                reportData.channelsArray.map((c, idx) => {
                  const percent =
                    reportData.faturamento > 0 ? (c.total / reportData.faturamento) * 100 : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-stone-300">{c.name}</span>
                        <span className="text-white">{formatCurrency(c.total)}</span>
                      </div>
                      <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-stone-500 text-center py-4">Sem dados no período</div>
              )}
            </div>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-amber-400" /> Formas de Pagamento
            </h3>
            <div className="space-y-3">
              {reportData.paymentsArray.length > 0 ? (
                reportData.paymentsArray.map((p, idx) => {
                  const percent =
                    reportData.faturamento > 0 ? (p.total / reportData.faturamento) * 100 : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-stone-300">{p.name}</span>
                        <span className="text-white">{formatCurrency(p.total)}</span>
                      </div>
                      <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-stone-500 text-center py-4">Sem dados no período</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Outras Métricas (Perdas & Consumo) */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-orange-400" /> Perdas e Consumo
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-stone-800">
              <div>
                <div className="text-xs font-bold text-stone-200">Perdas Registradas</div>
                <div className="text-[10px] text-stone-400">Despesas em "Perdas"</div>
              </div>
              <div className="font-heading font-bold text-red-400 text-lg">
                {formatCurrency(reportData.perdas)}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs font-bold text-stone-200">Custos de Produto</div>
                <div className="text-[10px] text-stone-400">Consumo estimado nas vendas</div>
              </div>
              <div className="font-heading font-bold text-amber-400 text-lg">
                {formatCurrency(reportData.custosEstimados)}
              </div>
            </div>
          </div>
        </div>

        {/* Status do Estoque */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-emerald-400" /> Valor em Estoque
            </h3>
            <p className="text-[11px] text-stone-400 mb-4">
              Patrimônio atual em ingredientes e embalagens (baseado no custo unitário atual).
            </p>
          </div>
          <div className="text-3xl font-heading font-bold text-emerald-400">
            {formatCurrency(totalInventoryValue)}
          </div>
        </div>
      </div>

      {/* Printable Report / PDF Modal */}
      {isExportModalOpen && (
        <PrintableReportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          initialType={selectedReportType}
        />
      )}
    </div>
  );
};
