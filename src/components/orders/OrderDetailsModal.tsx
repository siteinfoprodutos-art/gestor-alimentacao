import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Edit2,
  MapPin,
  MessageCircle,
  Phone,
  Printer,
  Trash2,
  X,
  Bike,
  PackageCheck,
  AlertOctagon,
  CreditCard,
  DollarSign,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OrderStatus } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { ReceiptPrintView } from './ReceiptPrintView';

export const OrderDetailsModal: React.FC = () => {
  const {
    selectedOrderForDetails,
    setSelectedOrderForDetails,
    settings,
    handleUpdateOrderStatus,
    handleDeleteOrder,
    setOrderForWhatsApp,
    setEditingOrder,
    setIsNewOrderOpen,
    handleSaveOrder,
  } = useApp();

  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('Cliente desistiu');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (!selectedOrderForDetails) return null;

  const order = selectedOrderForDetails;

  const statusSteps: OrderStatus[] = [
    'Novo',
    'Em preparo',
    'Pronto',
    'Saiu para entrega',
    'Concluído',
  ];

  const currentStepIdx = statusSteps.indexOf(order.status);

  const getNextStatus = (): OrderStatus | null => {
    if (order.status === 'Novo') return 'Em preparo';
    if (order.status === 'Em preparo') return 'Pronto';
    if (order.status === 'Pronto') {
      return order.type === 'Entrega' ? 'Saiu para entrega' : 'Concluído';
    }
    if (order.status === 'Saiu para entrega') return 'Concluído';
    return null;
  };

  const nextStatus = getNextStatus();

  const handleAdvanceStatus = async () => {
    if (nextStatus) {
      await handleUpdateOrderStatus(order.id, nextStatus);
    }
  };

  const handleTogglePaymentStatus = async () => {
    const updated = {
      ...order,
      paymentStatus: order.paymentStatus === 'Pago' ? ('Pendente' as const) : ('Pago' as const),
    };
    await handleSaveOrder(updated);
    setSelectedOrderForDetails(updated);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    setEditingOrder(order);
    setSelectedOrderForDetails(null);
    setIsNewOrderOpen(true);
  };

  const handleConfirmCancel = async () => {
    const updated = {
      ...order,
      status: 'Cancelado' as OrderStatus,
      cancelledAt: new Date().toISOString(),
      cancelReason,
    };
    await handleSaveOrder(updated);
    setSelectedOrderForDetails(updated);
    setIsCancelling(false);
  };

  const handleDelete = () => {
    setIsConfirmingDelete(true);
  };

  const originBadges: Record<string, string> = {
    WhatsApp: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    iFood: 'bg-red-500/20 text-red-400 border-red-500/30',
    Balcão: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Telefone: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Instagram: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
    Outro: 'bg-stone-500/20 text-stone-400 border-stone-500/30',
  };

  return (
    <>
      <div
        id="order-details-backdrop"
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in no-print"
        onClick={() => setSelectedOrderForDetails(null)}
      >
        <div
          id="order-details-modal"
          className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 text-stone-100 max-w-2xl w-full shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-stone-800 gap-2">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-heading font-extrabold text-2xl text-white">
                  Pedido #{order.orderNumber}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    originBadges[order.origin] || 'bg-stone-800 text-stone-300'
                  }`}
                >
                  {order.origin}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-800 text-stone-300 border border-stone-700">
                  {order.type}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                Registrado em {formatDateTime(order.createdAt)}
              </p>
            </div>

            <button
              onClick={() => setSelectedOrderForDetails(null)}
              className="p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Pipeline Visualizer */}
          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span className="font-semibold uppercase tracking-wider">Status Atual:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded ${
                  order.status === 'Concluído'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : order.status === 'Cancelado'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {order.status}
              </span>
            </div>

            {order.status !== 'Cancelado' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-1 pt-1">
                  {statusSteps.map((step, idx) => {
                    const isDone = currentStepIdx >= idx;
                    const isCurrent = currentStepIdx === idx;

                    return (
                      <button
                        key={step}
                        onClick={() => handleUpdateOrderStatus(order.id, step)}
                        className={`text-center py-2 px-1 rounded-xl transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-red-600 text-white font-bold shadow-md'
                            : isDone
                            ? 'bg-red-950/60 text-red-300 font-medium'
                            : 'bg-stone-900 text-stone-500 hover:bg-stone-800 hover:text-stone-300'
                        }`}
                      >
                        <div className="text-[10px] leading-tight sm:text-xs truncate">{step}</div>
                      </button>
                    );
                  })}
                </div>
                
                {isCancelling ? (
                  <div className="bg-red-950/40 border border-red-900/40 rounded-xl p-3 space-y-2 mt-2">
                    <label className="text-[11px] text-red-300 font-semibold uppercase tracking-wider block">
                      Motivo do Cancelamento
                    </label>
                    <select
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-2 text-xs text-stone-200 mb-2"
                    >
                      <option value="Cliente desistiu">Cliente desistiu</option>
                      <option value="Falta de produto">Falta de produto</option>
                      <option value="Erro no pedido">Erro no pedido</option>
                      <option value="Demora na entrega">Demora na entrega</option>
                      <option value="Outro">Outro</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={handleConfirmCancel}
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Confirmar Cancelamento
                      </button>
                      <button
                        onClick={() => setIsCancelling(false)}
                        className="px-3 bg-stone-800 hover:bg-stone-700 text-stone-300 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Voltar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsCancelling(true)}
                    className="text-[11px] font-bold text-red-500 hover:text-red-400 mt-2 ml-1 cursor-pointer"
                  >
                    Cancelar Pedido
                  </button>
                )}
              </div>
            ) : (
              <div className="p-2.5 bg-red-950/40 text-red-300 rounded-xl text-xs flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-red-400" />
                  <span className="font-bold">Este pedido foi cancelado.</span>
                </div>
                {order.cancelReason && (
                  <span className="pl-6 text-red-400">Motivo: {order.cancelReason}</span>
                )}
              </div>
            )}

            {/* Quick Advance Button */}
            {nextStatus && (
              <button
                id="advance-status-btn"
                onClick={handleAdvanceStatus}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer"
              >
                <span>Avançar para: {nextStatus}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Customer & Delivery Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-stone-950/70 border border-stone-800/80 rounded-2xl p-3.5 space-y-1.5">
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                Dados do Cliente
              </div>
              <div className="font-bold text-stone-100 text-base">{order.customerName}</div>
              <div className="flex items-center gap-2 text-xs text-stone-300">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>{order.customerPhone}</span>
              </div>
            </div>

            <div className="bg-stone-950/70 border border-stone-800/80 rounded-2xl p-3.5 space-y-1.5">
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                Entrega / Local
              </div>
              <div className="flex items-start gap-2 text-xs text-stone-200">
                <MapPin className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  {order.type === 'Entrega' ? (
                    order.customerAddress || 'Endereço não informado'
                  ) : (
                    <span className="font-semibold text-stone-300">
                      {order.type === 'Retirada' ? 'Retirada no Balcão' : 'Consumo no Balcão'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Itens do Pedido ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
            </div>

            <div className="bg-stone-950 border border-stone-800 rounded-2xl divide-y divide-stone-800/60 overflow-hidden">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-start justify-between gap-3 text-sm">
                  <div>
                    <div className="font-bold text-stone-100">
                      <span className="text-red-400 mr-2">{item.quantity}x</span>
                      {item.name}
                    </div>
                    {/* Item Customizations */}
                    <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-stone-400">
                      {item.size && (
                        <span className="bg-stone-900 border border-stone-700 px-1.5 py-0.5 rounded text-red-300 font-medium">
                          {item.size}
                        </span>
                      )}
                      {item.crust && (
                        <span className="bg-stone-900 border border-stone-700 px-1.5 py-0.5 rounded text-amber-300">
                          Borda: {item.crust}
                        </span>
                      )}
                      {item.addons && item.addons.length > 0 && (
                        <span className="bg-stone-900 border border-stone-700 px-1.5 py-0.5 rounded text-emerald-300">
                          + {item.addons.join(', ')}
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <div className="text-xs text-amber-300/90 italic mt-1">
                        Obs: {item.notes}
                      </div>
                    )}
                  </div>
                  <div className="font-semibold text-stone-200 flex-shrink-0">
                    {formatCurrency(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes (if any) */}
          {order.notes && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
              <span className="font-bold text-amber-300">Observações Gerais:</span> {order.notes}
            </div>
          )}

          {/* Financial Summary */}
          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-stone-400 text-xs">
              <span>Subtotal:</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-stone-400 text-xs">
                <span>Taxa de Entrega:</span>
                <span>{formatCurrency(order.deliveryFee)}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-400 text-xs font-medium">
                <span>Desconto Aplicado:</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg text-white pt-2 border-t border-stone-800">
              <span>Total do Pedido:</span>
              <span className="text-red-400">{formatCurrency(order.total)}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-800/60 text-xs">
              <div className="flex items-center gap-1.5 text-stone-300">
                <CreditCard className="w-4 h-4 text-stone-400" />
                <span>{order.paymentMethod}</span>
                {order.changeFor && (
                  <span className="text-stone-400">
                    (Troco p/ {formatCurrency(order.changeFor)}: {formatCurrency(order.changeFor - order.total)})
                  </span>
                )}
              </div>

              <button
                onClick={handleTogglePaymentStatus}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  order.paymentStatus === 'Pago'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {order.paymentStatus === 'Pago' ? '✓ Pago' : '⏳ Pendente'}
              </button>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            <button
              onClick={() => {
                setOrderForWhatsApp(order);
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={async () => {
                const text = `Pedido #${order.orderNumber} - ${order.customerName}\nTotal: ${formatCurrency(order.total)}`;
                if (navigator.share) {
                  try {
                    await navigator.share({
                      title: `Pedido #${order.orderNumber}`,
                      text: text,
                    });
                  } catch (e) {
                    console.log('Share error:', e);
                  }
                } else {
                  navigator.clipboard.writeText(text);
                  alert('Copiado para a área de transferência!');
                }
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Compartilhar</span>
            </button>

            <button
              onClick={async () => {
                const duplicatedOrder = {
                  ...order,
                  id: `ord-${Date.now()}`,
                  orderNumber: 0, // Will be generated
                  status: 'Novo' as const,
                  paymentStatus: 'Pendente' as const,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  completedAt: undefined,
                  cancelledAt: undefined,
                };
                setEditingOrder(duplicatedOrder);
                setSelectedOrderForDetails(null);
                setIsNewOrderOpen(true);
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700 transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Duplicar</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={handleEdit}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700 transition-colors cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
              <span>Editar</span>
            </button>
          </div>
          
          <div className="pt-2">
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 font-semibold text-xs border border-red-900/40 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir Pedido</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden printable receipt rendered in DOM for window.print() */}
      <ReceiptPrintView order={order} settings={settings} />

      {/* Delete Confirmation Modal Overlay */}
      {isConfirmingDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500 pb-3 border-b border-stone-800">
              <div className="p-2.5 bg-red-500/10 rounded-2xl border border-red-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Excluir Pedido #{order.orderNumber}</h3>
                <p className="text-xs text-stone-400">Esta ação não poderá ser desfeita.</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Tem certeza que deseja remover permanentemente este pedido do histórico de vendas?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsConfirmingDelete(false);
                  await handleDeleteOrder(order.id);
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/20 cursor-pointer"
              >
                Sim, Excluir Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
