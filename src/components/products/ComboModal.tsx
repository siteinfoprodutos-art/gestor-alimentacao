import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Check, Sparkles, Gift, Edit2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Combo, ComboItem } from '../../types';
import { calculateProfitMargin, formatCurrency, formatPercent } from '../../utils/formatters';

export const ComboModal: React.FC = () => {
  const { isComboModalOpen, setIsComboModalOpen, combos, products, handleSaveCombo, handleDeleteCombo, handleToggleComboAvailability, showToast } = useApp();

  const [editingComboId, setEditingComboId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<ComboItem[]>([
    { id: 'item-1', productName: '1 Pizza Grande Salgada (Qualquer Sabor)', sizeName: 'Grande', quantity: 1 },
    { id: 'item-2', productName: '1 Refrigerante 2L', sizeName: '2L', quantity: 1 },
  ]);
  const [originalPrice, setOriginalPrice] = useState<number | ''>(79.9);
  const [comboPrice, setComboPrice] = useState<number | ''>(64.9);
  const [cost, setCost] = useState<number | ''>(24.0);
  const [available, setAvailable] = useState(true);
  const [comboToDelete, setComboToDelete] = useState<{ id: string; name: string } | null>(null);

  if (!isComboModalOpen) return null;

  const numOrigPrice = Number(originalPrice) || 0;
  const numComboPrice = Number(comboPrice) || 0;
  const numCost = Number(cost) || 0;
  const discount = Math.max(0, numOrigPrice - numComboPrice);
  const margin = calculateProfitMargin(numComboPrice, numCost);

  const handleStartEdit = (c: Combo) => {
    setEditingComboId(c.id);
    setName(c.name);
    setDescription(c.description || '');
    setItems(c.items || []);
    setOriginalPrice(c.originalPrice);
    setComboPrice(c.comboPrice);
    setCost(c.cost);
    setAvailable(c.available);
  };

  const handleResetForm = () => {
    setEditingComboId(null);
    setName('');
    setDescription('');
    setItems([
      { id: `ci-${Date.now()}-1`, productName: '1 Pizza Grande Salgada', sizeName: 'Grande', quantity: 1 },
      { id: `ci-${Date.now()}-2`, productName: '1 Refrigerante 2L', sizeName: '2L', quantity: 1 },
    ]);
    setOriginalPrice(79.9);
    setComboPrice(64.9);
    setCost(24.0);
    setAvailable(true);
  };

  const handleAddItemRow = () => {
    setItems((prev) => [
      ...prev,
      { id: `ci-${Date.now()}`, productName: '', quantity: 1 },
    ]);
  };

  const handleRemoveItemRow = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateItemRow = (idx: number, field: keyof ComboItem, val: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Informe o nome do combo.', 'warning');
      return;
    }

    const filteredItems = items.filter((i) => i.productName.trim());
    if (filteredItems.length === 0) {
      showToast('Adicione pelo menos um item ao combo.', 'warning');
      return;
    }

    const combo: Combo = {
      id: editingComboId || `combo-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      items: filteredItems,
      originalPrice: numOrigPrice,
      comboPrice: numComboPrice,
      discount,
      cost: numCost,
      available,
      createdAt: new Date().toISOString(),
    };

    await handleSaveCombo(combo);
    handleResetForm();
  };

  const handleDelete = (id: string, comboName: string) => {
    setComboToDelete({ id, name: comboName });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xl">
              🎁
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Gerenciador de Combos & Promoções</h2>
              <p className="text-xs text-neutral-400">Crie pacotes promocionais com economia visível para o cliente</p>
            </div>
          </div>
          <button
            onClick={() => {
              handleResetForm();
              setIsComboModalOpen(false);
            }}
            className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="md:col-span-6 space-y-4 bg-neutral-950/50 p-4 rounded-xl border border-neutral-800/80">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-400" />
              {editingComboId ? 'Editar Combo' : 'Novo Combo Promocional'}
            </h3>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Nome do Combo *</label>
              <input
                type="text"
                required
                placeholder="Ex: Combo Família Feliz, Combo Casal..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Descrição / Destaque</label>
              <input
                type="text"
                placeholder="Ex: 1 Pizza Grande + 1 Refri 2L + Borda grátis"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-sm"
              />
            </div>

            {/* Items in the Combo */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-neutral-300">Itens Inclusos no Pacote</label>
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Item
                </button>
              </div>

              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={item.id || idx} className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItemRow(idx, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-14 px-2 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-xs text-center"
                      title="Quantidade"
                    />
                    <input
                      type="text"
                      placeholder="Descrição do item no combo..."
                      value={item.productName}
                      onChange={(e) => handleUpdateItemRow(idx, 'productName', e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      className="p-1.5 text-neutral-500 hover:text-red-400 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Matrix */}
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">Preço Normal</label>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  required
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-emerald-400 mb-1">Preço Combo *</label>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  required
                  value={comboPrice}
                  onChange={(e) => setComboPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-neutral-900 border border-emerald-500/60 rounded-lg text-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">Custo Total</label>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  value={cost}
                  onChange={(e) => setCost(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-xs"
                />
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Preço Normal sem combo:</span>
                <span className="text-neutral-300 line-through">{formatCurrency(numOrigPrice)}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-400">
                <span>Economia do Cliente:</span>
                <span>{formatCurrency(discount)} de desconto</span>
              </div>
              <div className="flex justify-between text-neutral-300 pt-1 border-t border-emerald-500/20">
                <span>Margem do Restaurante:</span>
                <span className="font-semibold text-white">{formatPercent(margin)} ({formatCurrency(numComboPrice - numCost)} lucro)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="combo-available"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-neutral-900 border-neutral-700 focus:ring-emerald-500"
              />
              <label htmlFor="combo-available" className="text-xs text-neutral-300 cursor-pointer">
                Combo ativo no cardápio
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              {editingComboId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-medium transition"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20"
              >
                <Check className="w-4 h-4" />
                {editingComboId ? 'Salvar Alterações' : 'Salvar Combo'}
              </button>
            </div>
          </form>

          {/* List of Combos */}
          <div className="md:col-span-6 space-y-3 overflow-y-auto max-h-[500px] pr-1">
            <h3 className="text-sm font-semibold text-white mb-2">Combos Ativos ({combos.length})</h3>

            {combos.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-sm">Nenhum combo cadastrado.</div>
            ) : (
              combos.map((c) => (
                <div
                  key={c.id}
                  className={`p-4 rounded-xl border transition space-y-3 ${
                    !c.available ? 'opacity-60 bg-neutral-950/40 border-neutral-850' : 'bg-neutral-950 border-neutral-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white text-base flex items-center gap-2">
                        <span>🎁 {c.name}</span>
                        {!c.available && (
                          <span className="text-[10px] bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded-md">
                            Pausado
                          </span>
                        )}
                      </div>
                      {c.description && <p className="text-xs text-neutral-400 mt-0.5">{c.description}</p>}
                    </div>

                    <div className="text-right">
                      <div className="text-base font-bold text-emerald-400">{formatCurrency(c.comboPrice)}</div>
                      {c.originalPrice > c.comboPrice && (
                        <div className="text-[11px] text-neutral-500 line-through">
                          {formatCurrency(c.originalPrice)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items included */}
                  <div className="bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-850 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Itens inclusos:</span>
                    <ul className="text-xs text-neutral-300 space-y-0.5">
                      {c.items.map((it, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="text-emerald-400 font-bold">• {it.quantity}x</span>
                          <span>{it.productName}</span>
                          {it.sizeName && <span className="text-neutral-500 text-[11px]">({it.sizeName})</span>}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-850 text-xs">
                    <span className="text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      Economia: {formatCurrency(c.discount || (c.originalPrice - c.comboPrice))}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleComboAvailability(c.id)}
                        className="text-xs px-2.5 py-1 rounded-lg border text-neutral-300 hover:bg-neutral-800"
                      >
                        {c.available ? 'Pausar' : 'Ativar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(c)}
                        className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            type="button"
            onClick={() => {
              handleResetForm();
              setIsComboModalOpen(false);
            }}
            className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm font-medium transition"
          >
            Fechar
          </button>
        </div>
      </div>

      {comboToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500 pb-3 border-b border-stone-800">
              <div className="p-2.5 bg-red-500/10 rounded-2xl border border-red-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Excluir Combo</h3>
                <p className="text-xs text-stone-400">Esta ação não poderá ser desfeita.</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Tem certeza que deseja excluir o combo <strong className="text-white">"{comboToDelete.name}"</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setComboToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const { id } = comboToDelete;
                  setComboToDelete(null);
                  await handleDeleteCombo(id);
                  if (editingComboId === id) {
                    handleResetForm();
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/20 cursor-pointer"
              >
                Sim, Excluir Combo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
