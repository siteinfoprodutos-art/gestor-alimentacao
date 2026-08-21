import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, FileText, 
  Calendar, Printer, Download, Plus, AlertCircle, PieChart, BarChart
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TransactionModal } from './TransactionModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Transaction } from '../../types';

export const FinancesView: React.FC = () => {
  const { orders, transactions, settings } = useApp();
  
  const [filterPeriod, setFilterPeriod] = useState<'hoje' | '7dias' | '30dias' | 'mes_atual' | 'mes_anterior' | 'personalizado'>('mes_atual');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<'income'|'expense'>('expense');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Helper to filter dates
  const filterByDateRange = (dateStr: string, start: Date, end: Date) => {
    const d = new Date(dateStr);
    return d >= start && d <= end;
  };

  const getDatesForPeriod = (period: string) => {
    const now = new Date();
    let start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    if (period === '7dias') {
      start.setDate(now.getDate() - 7);
    } else if (period === '30dias') {
      start.setDate(now.getDate() - 30);
    } else if (period === 'mes_atual') {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    } else if (period === 'mes_anterior') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (period === 'personalizado' && customStartDate && customEndDate) {
      start = new Date(`${customStartDate}T00:00:00Z`);
      start.setMinutes(start.getMinutes() + start.getTimezoneOffset());
      end = new Date(`${customEndDate}T23:59:59Z`);
      end.setMinutes(end.getMinutes() + end.getTimezoneOffset());
    }
    return { start, end };
  };

  const currentPeriodDates = getDatesForPeriod(filterPeriod);
  
  // Previous period for comparison
  const getPrevPeriodDates = (period: string) => {
    const { start, end } = getDatesForPeriod(period);
    const duration = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - duration);
    return { start: prevStart, end: prevEnd };
  };
  const prevPeriodDates = getPrevPeriodDates(filterPeriod);

  // Computed Data
  const computeMetrics = (startDate: Date, endDate: Date) => {
    let faturamento = 0;
    let custosEstimados = 0;
    let despesas = 0;

    const paymentMethodsStats: Record<string, number> = {};
    const dailyFlow: Record<string, { faturamento: number; despesas: number }> = {};

    // 1. Process Orders (Faturamento & Custos)
    const validOrders = orders.filter(o => 
      (o.status === 'Concluído' || o.paymentStatus === 'Pago') && 
      filterByDateRange(o.createdAt, startDate, endDate)
    );

    validOrders.forEach(o => {
      faturamento += o.total;
      paymentMethodsStats[o.paymentMethod] = (paymentMethodsStats[o.paymentMethod] || 0) + o.total;
      
      const day = o.createdAt.split('T')[0];
      if (!dailyFlow[day]) dailyFlow[day] = { faturamento: 0, despesas: 0 };
      dailyFlow[day].faturamento += o.total;

      // Calculate product costs
      let orderCost = 0;
      o.items.forEach(item => {
        // approximate cost from items
        orderCost += item.cost * item.quantity;
      });
      custosEstimados += orderCost;
    });

    // 2. Process Transactions (Manual income & Expenses)
    const validTx = transactions.filter(t => filterByDateRange(t.date, startDate, endDate));
    validTx.forEach(t => {
      if (t.type === 'expense') {
        despesas += t.amount;
        const day = t.date.split('T')[0];
        if (!dailyFlow[day]) dailyFlow[day] = { faturamento: 0, despesas: 0 };
        dailyFlow[day].despesas += t.amount;
      } else if (t.type === 'income' && !t.orderId) {
        // Manual income not linked to an order
        faturamento += t.amount;
        paymentMethodsStats[t.paymentMethod || 'Outro'] = (paymentMethodsStats[t.paymentMethod || 'Outro'] || 0) + t.amount;
        
        const day = t.date.split('T')[0];
        if (!dailyFlow[day]) dailyFlow[day] = { faturamento: 0, despesas: 0 };
        dailyFlow[day].faturamento += t.amount;
      }
    });

    const lucroEstimado = faturamento - custosEstimados - despesas;
    const margemEstimada = faturamento > 0 ? (lucroEstimado / faturamento) * 100 : 0;

    return {
      faturamento,
      custosEstimados,
      despesas,
      lucroEstimado,
      margemEstimada,
      paymentMethodsStats,
      dailyFlow,
      validTx
    };
  };

  const currentMetrics = useMemo(() => computeMetrics(currentPeriodDates.start, currentPeriodDates.end), [orders, transactions, currentPeriodDates]);
  const prevMetrics = useMemo(() => computeMetrics(prevPeriodDates.start, prevPeriodDates.end), [orders, transactions, prevPeriodDates]);

  // Render change percentage
  const renderChange = (current: number, prev: number) => {
    if (prev === 0) return null;
    const diff = current - prev;
    const percent = (diff / prev) * 100;
    const isPositive = percent > 0;
    
    return (
      <div className={`flex items-center gap-1 text-[10px] font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {isPositive ? '+' : ''}{percent.toFixed(1)}%
      </div>
    );
  };

  // Convert daily flow for rendering
  const flowDays = Object.keys(currentMetrics.dailyFlow).sort();

  const handlePrint = () => {
    window.print();
  };

  const exportToCSV = () => {
    const rows = [
      ['RELATORIO FINANCEIRO - ' + (settings?.name || 'MEU NEGOCIO')], [''], ['Data', 'Tipo', 'Descrição', 'Categoria', 'Pagamento', 'Valor']
    ];
    
    currentMetrics.validTx.forEach(t => {
      rows.push([
        formatDate(t.date),
        t.type === 'income' ? 'Receita' : 'Despesa',
        t.description,
        t.category,
        t.paymentMethod || '-',
        t.amount.toFixed(2).replace('.', ',')
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(";")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_financeiro.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-fade-in">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-white">Financeiro</h1>
          <p className="text-sm text-stone-400">Controle simplificado de caixa e resultados</p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide no-print">
          {(['hoje', '7dias', '30dias', 'mes_atual', 'mes_anterior', 'personalizado'] as const).map(p => (
            <button
              key={p}
              onClick={() => setFilterPeriod(p)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl transition-all font-bold text-xs cursor-pointer ${
                filterPeriod === p ? 'bg-red-600 text-white shadow-md' : 'bg-stone-900 text-stone-400 border border-stone-800 hover:text-stone-200'
              }`}
            >
              {p === 'hoje' && 'Hoje'}
              {p === '7dias' && '7 Dias'}
              {p === '30dias' && '30 Dias'}
              {p === 'mes_atual' && 'Mês Atual'}
              {p === 'mes_anterior' && 'Mês Anterior'}
              {p === 'personalizado' && 'Personalizado'}
            </button>
          ))}
        </div>
      </div>

      {filterPeriod === 'personalizado' && (
        <div className="flex items-end gap-3 p-3 bg-stone-900 border border-stone-800 rounded-2xl max-w-sm no-print">
          <div className="flex-1">
            <label className="text-[10px] text-stone-400 font-semibold mb-1 block">Data Inicial</label>
            <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2 py-1.5 text-xs text-white" />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-stone-400 font-semibold mb-1 block">Data Final</label>
            <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2 py-1.5 text-xs text-white" />
          </div>
        </div>
      )}

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Revenue */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Faturamento</span>
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="z-10">
            <div className="text-xl md:text-2xl font-bold text-emerald-400">
              {formatCurrency(currentMetrics.faturamento)}
            </div>
            {renderChange(currentMetrics.faturamento, prevMetrics.faturamento)}
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Despesas</span>
            <div className="p-1.5 bg-red-500/20 text-red-400 rounded-lg">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="z-10">
            <div className="text-xl md:text-2xl font-bold text-white">
              {formatCurrency(currentMetrics.despesas)}
            </div>
            {renderChange(currentMetrics.despesas, prevMetrics.despesas)}
          </div>
        </div>

        {/* Estimated Costs */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Custos Est. (Produtos)</span>
            <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-white">
              {formatCurrency(currentMetrics.custosEstimados)}
            </div>
            <div className="text-[10px] text-stone-500">Baseado no custo un. dos itens vendidos</div>
          </div>
        </div>

        {/* Profit */}
        <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Lucro Estimado</span>
            <div className="p-1.5 bg-red-500/20 text-red-400 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="z-10">
            <div className="text-xl md:text-2xl font-bold text-red-400">
              {formatCurrency(currentMetrics.lucroEstimado)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-stone-300 bg-stone-900 px-1.5 py-0.5 rounded">
                Margem: {currentMetrics.margemEstimada.toFixed(1)}%
              </span>
              {renderChange(currentMetrics.lucroEstimado, prevMetrics.lucroEstimado)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Actions & Payment Methods */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 no-print">
            <button
              onClick={() => { setTxModalType('income'); setEditingTx(null); setIsTxModalOpen(true); }}
              className="flex flex-col items-center justify-center p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-2xl text-emerald-400 font-bold text-sm transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                <Plus className="w-4 h-4" />
              </div>
              Nova Receita
            </button>
            <button
              onClick={() => { setTxModalType('expense'); setEditingTx(null); setIsTxModalOpen(true); }}
              className="flex flex-col items-center justify-center p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl text-red-400 font-bold text-sm transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
                <Plus className="w-4 h-4" />
              </div>
              Nova Despesa
            </button>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-red-400" /> Formas de Pagamento
            </h3>
            
            <div className="space-y-3">
              {Object.entries(currentMetrics.paymentMethodsStats).length > 0 ? (
                (Object.entries(currentMetrics.paymentMethodsStats) as [string, number][])
                  .sort((a, b) => b[1] - a[1])
                  .map(([method, amount]) => {
                    const percent = (amount / currentMetrics.faturamento) * 100;
                    return (
                      <div key={method} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-stone-300">{method}</span>
                          <span className="text-white">{formatCurrency(amount)}</span>
                        </div>
                        <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-600 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-stone-500 text-right">{percent.toFixed(1)}%</div>
                      </div>
                    )
                  })
              ) : (
                <div className="text-xs text-stone-500 text-center py-4">Sem dados no período</div>
              )}
            </div>
          </div>
        </div>

        {/* Daily Flow Chart Placeholder (using HTML bars) */}
        <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart className="w-4 h-4 text-red-400" /> Fluxo Diário (Faturamento vs Despesas)
            </h3>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-1 h-48 mt-auto pb-2 relative border-b border-stone-800">
            {flowDays.length > 0 ? (
              flowDays.map(day => {
                const dayData = currentMetrics.dailyFlow[day];
                const maxVal = Math.max(...flowDays.map(d => Math.max(currentMetrics.dailyFlow[d].faturamento, currentMetrics.dailyFlow[d].despesas)));
                const scale = maxVal > 0 ? 100 / maxVal : 1;
                
                const fatH = dayData.faturamento * scale;
                const desH = dayData.despesas * scale;
                
                return (
                  <div key={day} className="flex flex-col justify-end items-center flex-1 group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-800 text-stone-200 text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10 shadow-lg border border-stone-700">
                      <div className="font-bold border-b border-stone-700 pb-1 mb-1">{formatDate(day)}</div>
                      <div className="text-emerald-400">Fat: {formatCurrency(dayData.faturamento)}</div>
                      <div className="text-red-400">Desp: {formatCurrency(dayData.despesas)}</div>
                    </div>
                    
                    <div className="flex items-end gap-0.5 w-full justify-center">
                      <div 
                        className="w-2 sm:w-4 bg-emerald-500/80 rounded-t-sm" 
                        style={{ height: `${Math.max(4, fatH)}%` }} 
                      />
                      <div 
                        className="w-2 sm:w-4 bg-red-500/80 rounded-t-sm" 
                        style={{ height: `${Math.max(4, desH)}%` }} 
                      />
                    </div>
                    <div className="text-[8px] sm:text-[10px] text-stone-500 mt-2 truncate w-full text-center">
                      {day.split('-')[2]}/{day.split('-')[1]}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-stone-500 text-xs">
                Nenhuma movimentação no período
              </div>
            )}
          </div>
          
          <div className="flex justify-center gap-4 mt-4 text-[10px] font-semibold text-stone-400">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-emerald-500 rounded-sm"></div> Faturamento</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-red-500 rounded-sm"></div> Despesas</div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-red-400" /> Movimentações (Despesas e Receitas Avulsas)
          </h3>
          <div className="flex items-center gap-2 no-print">
            <button onClick={exportToCSV} className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors" title="Exportar Excel (CSV)">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={handlePrint} className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors" title="Imprimir Relatório">
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-stone-800/60 max-h-96 overflow-y-auto">
          {currentMetrics.validTx.length > 0 ? (
            currentMetrics.validTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => (
              <div 
                key={tx.id} 
                className="p-3 sm:p-4 flex items-center justify-between hover:bg-stone-800/30 transition-colors cursor-pointer"
                onClick={() => {
                  setTxModalType(tx.type);
                  setEditingTx(tx);
                  setIsTxModalOpen(true);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {tx.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-stone-200">{tx.description}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-semibold text-stone-500 bg-stone-950 px-1.5 py-0.5 rounded border border-stone-800">
                        {tx.category}
                      </span>
                      <span className="text-[10px] text-stone-400">{formatDate(tx.date)}</span>
                      {tx.paymentMethod && <span className="text-[10px] text-stone-400">• {tx.paymentMethod}</span>}
                    </div>
                  </div>
                </div>
                <div className={`font-bold text-sm ${tx.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-stone-500 flex flex-col items-center gap-2">
              <AlertCircle className="w-6 h-6 text-stone-600" />
              Nenhuma movimentação manual registrada neste período.<br/>
              (As vendas concluídas entram automaticamente no faturamento acima)
            </div>
          )}
        </div>
      </div>

      <TransactionModal 
        isOpen={isTxModalOpen} 
        onClose={() => setIsTxModalOpen(false)} 
        type={txModalType} 
        editingTransaction={editingTx}
      />
    </div>
  );
};
