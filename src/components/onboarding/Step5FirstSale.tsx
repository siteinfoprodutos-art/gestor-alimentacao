import React from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Check,
  CreditCard,
  Banknote,
  QrCode,
  User,
  Phone,
  Truck,
  Store,
  Clock,
  Sparkles,
} from 'lucide-react';
import { OrderType, PaymentMethod } from '../../types';
import { WizardFirstSale, WizardProductItem } from './types';
import { formatCurrency } from '../../utils/formatters';

interface Step5FirstSaleProps {
  firstSale: WizardFirstSale;
  setFirstSale: React.Dispatch<React.SetStateAction<WizardFirstSale>>;
  products: WizardProductItem[];
  onFinish: () => void;
  onBack: () => void;
}

export const Step5FirstSale: React.FC<Step5FirstSaleProps> = ({
  firstSale,
  setFirstSale,
  products,
  onFinish,
  onBack,
}) => {
  const handleToggleProduct = (productId: string) => {
    setFirstSale((prev) => {
      const existing = prev.selectedProductIds.find((p) => p.productId === productId);
      if (existing) {
        return {
          ...prev,
          selectedProductIds: prev.selectedProductIds.filter((p) => p.productId !== productId),
        };
      } else {
        return {
          ...prev,
          selectedProductIds: [...prev.selectedProductIds, { productId, quantity: 1 }],
          shouldCreateSale: true,
        };
      }
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setFirstSale((prev) => {
      const existing = prev.selectedProductIds.find((p) => p.productId === productId);
      if (!existing) {
        if (delta > 0) {
          return {
            ...prev,
            selectedProductIds: [...prev.selectedProductIds, { productId, quantity: 1 }],
            shouldCreateSale: true,
          };
        }
        return prev;
      }

      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        return {
          ...prev,
          selectedProductIds: prev.selectedProductIds.filter((p) => p.productId !== productId),
        };
      }

      return {
        ...prev,
        selectedProductIds: prev.selectedProductIds.map((p) =>
          p.productId === productId ? { ...p, quantity: newQty } : p
        ),
      };
    });
  };

  // Calculations
  let subtotal = 0;
  firstSale.selectedProductIds.forEach((item) => {
    const prod = products.find((p) => p.id === item.productId);
    if (prod) {
      subtotal += prod.price * item.quantity;
    }
  });

  const total = Math.max(0, subtotal + (firstSale.type === 'Entrega' ? firstSale.deliveryFee : 0) - firstSale.discount);

  return (
    <div id="onboarding-step-5" className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
          <span>Passo 5 de 5</span>
          <span className="text-stone-600">•</span>
          <span>Venda Inaugural</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Faça sua Primeira Venda no PDV
        </h2>
        <p className="text-sm text-stone-400">
          Experimente o fluxo de venda rápido. Ao confirmar, o pedido será registrado no seu financeiro e no histórico de clientes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Product Selection for Sale */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
              1. Selecione os itens do pedido
            </label>
            <span className="text-[11px] text-stone-400">
              {firstSale.selectedProductIds.length} item(ns) selecionado(s)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {products.map((prod) => {
              const selectedItem = firstSale.selectedProductIds.find((p) => p.productId === prod.id);
              const isSelected = !!selectedItem;
              const qty = selectedItem?.quantity || 0;

              return (
                <div
                  key={prod.id}
                  className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-red-600/10 border-red-500 shadow-xs'
                      : 'bg-stone-900 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{prod.name}</p>
                      <p className="text-[10px] text-stone-400">{prod.category}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 flex-shrink-0">
                      {formatCurrency(prod.price)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-stone-800/80">
                    {isSelected ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(prod.id, -1)}
                          className="w-6 h-6 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center text-xs font-bold transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white min-w-4 text-center">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(prod.id, 1)}
                          className="w-6 h-6 rounded-lg bg-red-600 hover:bg-red-500 text-white flex items-center justify-center text-xs font-bold transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleProduct(prod.id)}
                        className="w-full py-1 px-2.5 rounded-lg bg-stone-800 hover:bg-red-600/80 text-stone-300 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Adicionar</span>
                      </button>
                    )}

                    {isSelected && (
                      <span className="text-xs font-bold text-white">
                        {formatCurrency(prod.price * qty)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Customer Info */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-300 block">
              2. Dados do Cliente
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <input
                  type="text"
                  value={firstSale.customerName}
                  onChange={(e) => setFirstSale((prev) => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Nome do cliente"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 focus:border-red-500 rounded-xl text-white text-xs font-medium"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={firstSale.customerPhone}
                  onChange={(e) => setFirstSale((prev) => ({ ...prev, customerPhone: e.target.value }))}
                  placeholder="Telefone / WhatsApp (opcional)"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 focus:border-red-500 rounded-xl text-white text-xs font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary & Checkout Controls */}
        <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-300">
                Resumo da Venda
              </span>
              <span className="text-xs font-bold text-red-400">
                {firstSale.selectedProductIds.reduce((a, b) => a + b.quantity, 0)} itens
              </span>
            </div>

            {/* Order Type Tabs */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-400">Tipo de Atendimento</label>
              <div className="grid grid-cols-3 gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800">
                {(['Balcão', 'Entrega', 'Retirada'] as OrderType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFirstSale((prev) => ({ ...prev, type }))}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      firstSale.type === type
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-400">Forma de Pagamento</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Pix', label: 'Pix', icon: QrCode },
                  { id: 'Dinheiro', label: 'Dinheiro', icon: Banknote },
                  { id: 'Cartão de Crédito', label: 'Crédito', icon: CreditCard },
                  { id: 'Cartão de Débito', label: 'Débito', icon: CreditCard },
                ].map((pay) => {
                  const Icon = pay.icon;
                  const isSelected = firstSale.paymentMethod === pay.id;

                  return (
                    <button
                      key={pay.id}
                      type="button"
                      onClick={() => setFirstSale((prev) => ({ ...prev, paymentMethod: pay.id as PaymentMethod }))}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{pay.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Total Math */}
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-3 space-y-1.5">
              <div className="flex justify-between text-xs text-stone-400">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {firstSale.type === 'Entrega' && (
                <div className="flex justify-between text-xs text-stone-400">
                  <span>Taxa de Entrega</span>
                  <span>{formatCurrency(firstSale.deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-white pt-1 border-t border-stone-800">
                <span>Total a Receber</span>
                <span className="text-emerald-400">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-2 text-xs text-stone-400 mb-3">
              <input
                type="checkbox"
                id="check-create-sale"
                checked={firstSale.shouldCreateSale && firstSale.selectedProductIds.length > 0}
                onChange={(e) =>
                  setFirstSale((prev) => ({ ...prev, shouldCreateSale: e.target.checked }))
                }
                className="w-4 h-4 rounded bg-stone-950 border-stone-700 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="check-create-sale" className="cursor-pointer text-stone-300">
                Registrar e concluir este pedido agora
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-800">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 text-xs font-bold text-stone-400 hover:text-white transition-colors"
        >
          Voltar
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setFirstSale((prev) => ({ ...prev, shouldCreateSale: false }));
              onFinish();
            }}
            className="px-4 py-2.5 text-xs font-semibold text-stone-400 hover:text-stone-200 transition-colors"
          >
            Pular venda agora
          </button>

          <button
            type="button"
            id="btn-step-5-finish"
            onClick={onFinish}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center gap-2 transition-all"
          >
            <span>Concluir Configuração</span>
            <span>✓</span>
          </button>
        </div>
      </div>
    </div>
  );
};
