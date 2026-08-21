import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  FileX,
  CreditCard,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';

export const DashboardView: React.FC = () => {
  const { orders, transactions, products, inventory, setActiveTab, currentSegment } = useApp();

  // ---------------------------------------------------------
  // 1. DATE HELPERS
  // ---------------------------------------------------------
  const now = new Date();
  
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
  const startOfLastWeekSameDay = new Date(startOfToday.getTime() - 7 * 86400000);
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const getMetricsForRange = (start: Date, end: Date) => {
    const periodOrders = orders.filter(
      (o) => o.status !== 'Cancelado' && new Date(o.createdAt) >= start && new Date(o.createdAt) <= end
    );
    
    const periodTx = transactions.filter(
      (t) => new Date(t.date) >= start && new Date(t.date) <= end
    );

    let faturamento = 0;
    let custosProdutos = 0;
    let totalVendas = periodOrders.length;
    let despesas = 0;

    periodOrders.forEach(o => {
      faturamento += o.total;
      o.items.forEach(item => {
        custosProdutos += (item.cost || 0) * item.quantity;
      });
    });

    periodTx.forEach(t => {
      if (t.type === 'expense') {
        despesas += t.amount;
      } else if (t.type === 'income' && !t.orderId) {
        faturamento += t.amount;
      }
    });

    const ticketMedio = totalVendas > 0 ? faturamento / totalVendas : 0;
    const lucroEstimado = faturamento - custosProdutos - despesas;
    const margem = faturamento > 0 ? (lucroEstimado / faturamento) * 100 : 0;

    return { faturamento, totalVendas, ticketMedio, custosProdutos, despesas, lucroEstimado, margem };
  };

  // ---------------------------------------------------------
  // 2. CALCULATE METRICS
  // ---------------------------------------------------------
  const todayEnd = new Date(startOfToday.getTime() + 86399999);
  const yesterdayEnd = new Date(startOfYesterday.getTime() + 86399999);
  const lastWeekSameDayEnd = new Date(startOfLastWeekSameDay.getTime() + 86399999);

  const metricsToday = getMetricsForRange(startOfToday, todayEnd);
  const metricsYesterday = getMetricsForRange(startOfYesterday, yesterdayEnd);
  const metricsLastWeekDay = getMetricsForRange(startOfLastWeekSameDay, lastWeekSameDayEnd);
  const metricsLastMonth = getMetricsForRange(startOfLastMonth, endOfLastMonth);

  // ---------------------------------------------------------
  // 3. ALERTS & INSIGHTS
  // ---------------------------------------------------------
  const productsWithoutRecipe = products.filter(p => p.cost === 0 && p.available);
  const lowStockItems = inventory.filter(i => i.currentQuantity <= i.minQuantity);
  
  // Calculate average daily expense in the last 30 days
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const expensesLast30Days = transactions
    .filter(t => t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo)
    .reduce((sum, t) => sum + t.amount, 0);
  const avgDailyExpense = expensesLast30Days / 30;
  
  const hasHighExpenseAlert = metricsToday.despesas > (avgDailyExpense * 1.5) && metricsToday.despesas > 0;
  const hasRevenueDropAlert = metricsToday.faturamento < metricsLastWeekDay.faturamento * 0.7 && metricsLastWeekDay.faturamento > 0;

  const insights: string[] = [];
  
  // Faturamento insight
  if (metricsToday.faturamento > metricsLastWeekDay.faturamento && metricsLastWeekDay.faturamento > 0) {
    const diff = ((metricsToday.faturamento - metricsLastWeekDay.faturamento) / metricsLastWeekDay.faturamento) * 100;
    insights.push(`Seu faturamento hoje está ${diff.toFixed(1)}% maior que a mesma data da semana passada.`);
  } else if (metricsToday.faturamento < metricsLastWeekDay.faturamento && metricsToday.faturamento > 0) {
    const diff = ((metricsLastWeekDay.faturamento - metricsToday.faturamento) / metricsLastWeekDay.faturamento) * 100;
    insights.push(`Atenção: faturamento ${diff.toFixed(1)}% menor que a mesma data da semana passada.`);
  }

  // Top product insight
  const todayOrders = orders.filter(o => o.status !== 'Cancelado' && new Date(o.createdAt) >= startOfToday);
  const productCounts: Record<string, number> = {};
  todayOrders.forEach(o => {
    o.items.forEach(i => {
      productCounts[i.name] = (productCounts[i.name] || 0) + i.quantity;
    });
  });
  
  const topProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0];
  if (topProduct && metricsToday.totalVendas > 0) {
    // percentage of total items sold today
    const totalItems = Object.values(productCounts).reduce((a, b) => a + b, 0);
    const perc = (topProduct[1] / totalItems) * 100;
    insights.push(`${topProduct[0]} representa ${perc.toFixed(1)}% dos itens vendidos hoje.`);
  }

  // Stock insight
  if (lowStockItems.length > 0) {
    insights.push(`${lowStockItems[0].name} está próximo ou abaixo do estoque mínimo definido.`);
  }

  // ---------------------------------------------------------
  // 4. CHART DATA
  // ---------------------------------------------------------
  // Last 7 days revenue
  const last7DaysData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date(startOfToday.getTime() - i * 86400000);
      const end = new Date(start.getTime() + 86399999);
      const m = getMetricsForRange(start, end);
      data.push({
        name: start.toLocaleDateString('pt-BR', { weekday: 'short' }),
        Faturamento: m.faturamento,
        Despesas: m.despesas,
        Lucro: m.lucroEstimado
      });
    }
    return data;
  }, [orders, transactions]);

  // Channels (this month)
  const channelsData = useMemo(() => {
    const mOrders = orders.filter(o => o.status !== 'Cancelado' && new Date(o.createdAt) >= startOfMonth);
    const cMap: Record<string, number> = {};
    mOrders.forEach(o => {
      const oName = o.origin || 'Outros';
      cMap[oName] = (cMap[oName] || 0) + o.total;
    });
    return Object.entries(cMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [orders]);
  
  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#64748b'];

  // ---------------------------------------------------------
  // RENDER HELPERS
  // ---------------------------------------------------------
  const renderComparison = (current: number, compare: number, suffix: string = '') => {
    if (compare === 0 && current === 0) return <span className="text-stone-500 text-[10px]">Sem dados p/ comparar</span>;
    if (compare === 0) return <span className="text-stone-500 text-[10px]">Sem dados no período ant.</span>;
    
    const diff = current - compare;
    const percent = (diff / compare) * 100;
    const isPositive = percent > 0;
    const isNeutral = percent === 0;

    return (
      <div className={`flex items-center gap-1 text-[10px] font-bold ${isNeutral ? 'text-stone-400' : isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
        {isNeutral ? '-' : isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {Math.abs(percent).toFixed(1)}% vs {suffix}
      </div>
    );
  };

  return (
    <div id="dashboard-premium" className="space-y-6 pb-20 md:pb-6 animate-fade-in">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
            Painel Gerencial
          </h1>
          <p className="text-sm text-stone-400 mt-1">Visão estratégica e resultados em tempo real</p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide no-print">
          <button onClick={() => setActiveTab('reports')} className="whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 font-bold text-xs hover:bg-stone-800 transition-colors">
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            Ver relatório
          </button>
          <button onClick={() => setActiveTab('reports')} className="whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 font-bold text-xs hover:bg-stone-800 transition-colors">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            Comparar período
          </button>
          <button onClick={() => setActiveTab('reports')} className="whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 font-bold text-xs hover:bg-stone-800 transition-colors">
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Exportar mês
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Today) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Faturamento (Hoje)</span>
            <DollarSign className="w-4 h-4 text-emerald-400 opacity-80" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">{formatCurrency(metricsToday.faturamento)}</div>
            <div className="mt-1">{renderComparison(metricsToday.faturamento, metricsYesterday.faturamento, 'Ontem')}</div>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Vendas (Hoje)</span>
            <ShoppingBag className="w-4 h-4 text-blue-400 opacity-80" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">{metricsToday.totalVendas}</div>
            <div className="mt-1">{renderComparison(metricsToday.totalVendas, metricsLastWeekDay.totalVendas, 'Semana Ant.')}</div>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Ticket Médio</span>
            <CreditCard className="w-4 h-4 text-amber-400 opacity-80" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">{formatCurrency(metricsToday.ticketMedio)}</div>
            <div className="mt-1">{renderComparison(metricsToday.ticketMedio, metricsLastMonth.ticketMedio, 'Mês Ant.')}</div>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Custos Est. (Hoje)</span>
            <Target className="w-4 h-4 text-orange-400 opacity-80" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">{formatCurrency(metricsToday.custosProdutos)}</div>
            <div className="mt-1 text-[10px] text-stone-500 leading-tight">Custo unit. dos produtos vendidos</div>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8" />
          <div className="flex items-center justify-between mb-2 relative z-10">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Lucro Est. (Hoje)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400 opacity-80" />
          </div>
          <div className="relative z-10">
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight">{formatCurrency(metricsToday.lucroEstimado)}</div>
            <div className="mt-1">{renderComparison(metricsToday.lucroEstimado, metricsYesterday.lucroEstimado, 'Ontem')}</div>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Margem (Hoje)</span>
            <PieChartIcon className="w-4 h-4 text-indigo-400 opacity-80" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">{metricsToday.margem.toFixed(1)}%</div>
            <div className="mt-1 text-[10px] text-stone-500 leading-tight">Margem de lucro sobre o faturamento</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Alerts & Insights */}
        <div className="space-y-6">
          {/* Alerts */}
          {((currentSegment.features.hasInventory && lowStockItems.length > 0) || (currentSegment.features.hasTechnicalSheet && productsWithoutRecipe.length > 0) || hasHighExpenseAlert || hasRevenueDropAlert) && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Alertas Operacionais
              </h2>
              <div className="flex flex-col gap-2">
                {currentSegment.features.hasInventory && lowStockItems.length > 0 && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 cursor-pointer hover:bg-red-500/20 transition-colors" onClick={() => setActiveTab('inventory')}>
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-400 leading-tight">{currentSegment.terminology.inventoryLabel} Baixo</p>
                      <p className="text-xs text-red-400/80 mt-1">{lowStockItems.length} itens precisam de reposição imediata.</p>
                    </div>
                  </div>
                )}
                {currentSegment.features.hasTechnicalSheet && productsWithoutRecipe.length > 0 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 cursor-pointer hover:bg-amber-500/20 transition-colors" onClick={() => setActiveTab('products')}>
                    <FileX className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-amber-400 leading-tight">Sem Ficha Técnica</p>
                      <p className="text-xs text-amber-400/80 mt-1">{productsWithoutRecipe.length} {currentSegment.terminology.productPlural.toLowerCase()} não possuem custo mapeado (Custo = R$ 0,00).</p>
                    </div>
                  </div>
                )}
                {hasHighExpenseAlert && (
                  <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-start gap-3">
                    <TrendingUp className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-orange-400 leading-tight">Despesas Acima da Média</p>
                      <p className="text-xs text-orange-400/80 mt-1">Os gastos de hoje estão 50% maiores que a média diária.</p>
                    </div>
                  </div>
                )}
                {hasRevenueDropAlert && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
                    <TrendingDown className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-blue-400 leading-tight">Queda de Faturamento</p>
                      <p className="text-xs text-blue-400/80 mt-1">Faturamento atual abaixo do registrado na mesma data da semana passada.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Insights */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Insights Baseados em Dados
            </h2>
            {insights.length > 0 ? (
              <ul className="space-y-3">
                {insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <p className="text-sm text-stone-300 leading-snug">{insight}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-stone-500 italic text-center py-4">Dados insuficientes para gerar insights inteligentes hoje.</p>
            )}
          </div>
        </div>

        {/* Right Column: Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart 1: Faturamento vs Lucro 7 Days */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5">
            <h2 className="text-sm font-bold text-white mb-6 flex items-center justify-between">
              Desempenho Diário (Últimos 7 dias)
              <div className="flex items-center gap-3 text-[10px] font-semibold text-stone-400">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Faturamento</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> Despesas</span>
              </div>
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7DaysData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#78716c' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#78716c' }} tickFormatter={(val) => `R$${val}`} />
                  <Tooltip 
                    cursor={{ fill: '#292524' }}
                    contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #292524', borderRadius: '16px', fontSize: '12px', color: '#fff' }}
                    formatter={(val: number) => formatCurrency(val)}
                  />
                  <Bar dataKey="Faturamento" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Canais de Venda (Mês) */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5">
            <h2 className="text-sm font-bold text-white mb-4">Canais de Venda (Mês Atual)</h2>
            {channelsData.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="h-48 w-full sm:w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={channelsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {channelsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #292524', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                        formatter={(val: number) => formatCurrency(val)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full sm:w-1/2 space-y-3">
                  {channelsData.map((c, idx) => {
                    const totalMonth = channelsData.reduce((acc, curr) => acc + curr.value, 0);
                    const percent = totalMonth > 0 ? (c.value / totalMonth) * 100 : 0;
                    return (
                      <div key={c.name} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                            <span className="text-xs font-semibold text-stone-300">{c.name}</span>
                          </div>
                          <span className="text-xs font-bold text-white">{formatCurrency(c.value)} ({percent.toFixed(0)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-xs text-stone-500 italic">
                Dados insuficientes para análise.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
