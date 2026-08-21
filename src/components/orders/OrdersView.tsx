import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Filter,
  MessageCircle,
  Plus,
  Search,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order, OrderOrigin, OrderStatus } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export const OrdersView: React.FC = () => {
  const {
    orders,
    setIsNewOrderOpen,
    setSelectedOrderForDetails,
    setOrderForWhatsApp,
    currentSegment,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<string>('hoje');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterOrigin, setFilterOrigin] = useState<string>('todos');

  const todayStr = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    const isToday = orderDate.toDateString() === todayStr;
    const isYesterday = orderDate.toDateString() === yesterdayStr;

    // Period filter
    if (filterPeriod === 'hoje' && !isToday) return false;
    if (filterPeriod === 'ontem' && !isYesterday) return false;
    if (filterPeriod === '7dias' && orderDate < sevenDaysAgo) return false;
    if (filterPeriod === '30dias' && orderDate < thirtyDaysAgo) return false;

    // Status filter
    if (filterStatus !== 'todos' && order.status !== filterStatus) return false;

    // Origin filter
    if (filterOrigin !== 'todos' && order.origin !== filterOrigin) return false;

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.includes(q);
      const matchNum = order.orderNumber.toString().includes(q);
      const matchAddress = (order.customerAddress || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchNum && !matchAddress) return false;
    }

    return true;
  });

  const statusPills: Record<OrderStatus, string> = {
    Novo: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Em preparo': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Pronto: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Saiu para entrega': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    Concluído: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Cancelado: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const originBadges: Record<string, string> = {
    WhatsApp: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    iFood: 'bg-red-500/15 text-red-400 border-red-500/20',
    Balcão: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    Telefone: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    Instagram: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/20',
    Outro: 'bg-stone-500/15 text-stone-400 border-stone-500/20',
  };

  return (
    <div id="orders-view" className="space-y-5 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            📋 {currentSegment.terminology.salesLabel}
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Gerencie histórico e atendimentos do segmento de {currentSegment.name}
          </p>
        </div>
      </div>

      {/* Filter Period Tabs */}
      <div className="flex overflow-x-auto gap-2 bg-stone-900 p-1.5 rounded-2xl border border-stone-800 text-xs font-semibold scrollbar-hide">
        {(['hoje', 'ontem', '7dias', '30dias', 'todos'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setFilterPeriod(period)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl transition-all cursor-pointer ${
              filterPeriod === period
                ? 'bg-red-600 text-white font-bold shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {period === 'hoje' && 'Hoje'}
            {period === 'ontem' && 'Ontem'}
            {period === '7dias' && '7 Dias'}
            {period === '30dias' && '30 Dias'}
            {period === 'todos' && 'Todos'}
          </button>
        ))}
      </div>

      {/* Search & Select Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 bg-stone-900 border border-stone-800 p-3 rounded-2xl">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por cliente, telefone, endereço ou nº do pedido..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Status Dropdown */}
        <div className="sm:col-span-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
          >
            <option value="todos">Todos os Status</option>
            <option value="Novo">Novo</option>
            <option value="Em preparo">Em preparo</option>
            <option value="Pronto">Pronto</option>
            <option value="Saiu para entrega">Saiu para entrega</option>
            <option value="Concluído">Concluído</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        {/* Origin Dropdown */}
        <div className="sm:col-span-3">
          <select
            value={filterOrigin}
            onChange={(e) => setFilterOrigin(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
          >
            <option value="todos">Todas as Origens</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="iFood">iFood</option>
            <option value="Balcão">Balcão</option>
            <option value="Telefone">Telefone</option>
            <option value="Instagram">Instagram</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-10 text-center text-stone-400 space-y-2">
            <p className="text-sm font-semibold text-white">Nenhum pedido encontrado.</p>
            <p className="text-xs">
              Tente alterar os filtros.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrderForDetails(order)}
              className="bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-2xl p-4 sm:p-5 transition-all shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
            >
              {/* Left Info */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-heading font-extrabold text-lg text-white group-hover:text-red-400 transition-colors">
                    #{order.orderNumber}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      statusPills[order.status]
                    }`}
                  >
                    {order.status}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      originBadges[order.origin] || 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    {order.origin}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-stone-800 text-stone-300 border border-stone-700">
                    {order.type}
                  </span>
                </div>
                <div className="font-bold text-sm text-stone-100 truncate">
                  {order.customerName}{' '}
                  <span className="text-xs text-stone-400 font-normal">
                    ({order.customerPhone})
                  </span>
                </div>
                {order.type === 'Entrega' && order.customerAddress && (
                  <div className="text-xs text-stone-400 truncate max-w-xl">
                    📍 {order.customerAddress}
                  </div>
                )}
                {/* Items preview */}
                <div className="text-xs text-stone-300 truncate">
                  {order.items
                    .map((item) => `${item.quantity}x ${item.name}`)
                    .join(' • ')}
                </div>
              </div>
              {/* Right Info: Financials & Action Buttons */}
              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-800">
                <div className="text-left sm:text-right">
                  <div className="font-heading font-extrabold text-lg sm:text-xl text-red-400">
                    {formatCurrency(order.total)}
                  </div>
                  <div className="text-[11px] text-stone-400">
                    {order.paymentMethod} •{' '}
                    <span
                      className={
                        order.paymentStatus === 'Pago'
                          ? 'text-emerald-400 font-semibold'
                          : 'text-amber-400 font-semibold'
                      }
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    {formatDateTime(order.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOrderForWhatsApp(order);
                    }}
                    title="Enviar WhatsApp"
                    className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors border border-emerald-500/30"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <div className="p-2 text-stone-500 group-hover:text-stone-300 group-hover:translate-x-1 transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
