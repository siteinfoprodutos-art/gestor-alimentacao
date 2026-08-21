import React, { useState } from 'react';
import { Plus, Trash2, X, Edit2, Check, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AddOn } from '../../types';
import { calculateProfitMargin, formatCurrency, formatPercent } from '../../utils/formatters';

export const AddonManagerModal: React.FC = () => {
  const { isAddonModalOpen, setIsAddonModalOpen, addons, handleSaveAddon, handleDeleteAddon, handleToggleAddonAvailability, showToast } = useApp();

  const [editingAddonId, setEditingAddonId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>(6.0);
  const [cost, setCost] = useState<number | ''>(2.0);
  const [category, setCategory] = useState('Queijos');
  const [available, setAvailable] = useState(true);
  const [addonToDelete, setAddonToDelete] = useState<{ id: string; name: string } | null>(null);

  if (!isAddonModalOpen) return null;

  const numPrice = Number(price) || 0;
  const numCost = Number(cost) || 0;
  const margin = calculateProfitMargin(numPrice, numCost);

  const handleStartEdit = (a: AddOn) => {
    setEditingAddonId(a.id);
    setName(a.name);
    setPrice(a.price);
    setCost(a.cost);
    setCategory(a.category || 'Geral');
    setAvailable(a.available);
  };

  const handleResetForm = () => {
    setEditingAddonId(null);
    setName('');
    setPrice(6.0);
    setCost(2.0);
    setCategory('Queijos');
    setAvailable(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Informe o nome do adicional.', 'warning');
      return;
    }

    const addon: AddOn = {
      id: editingAddonId || `add-${Date.now()}`,
      name: name.trim(),
      price: numPrice,
      cost: numCost,
      category: category.trim(),
      available,
      createdAt: new Date().toISOString(),
    };

    await handleSaveAddon(addon);
    handleResetForm();
  };

  const handleDelete = (id: string, addonName: string) => {
    setAddonToDelete({ id, name: addonName });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xl">
              🧀
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Gerenciador de Adicionais</h2>
              <p className="text-xs text-neutral-400">Ingredientes extras configuráveis para pedidos (Bacon, Catupiry, etc.)</p>
            </div>
          </div>
          <button
            onClick={() => {
              handleResetForm();
              setIsAddonModalOpen(false);
            }}
            className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="md:col-span-5 space-y-4 bg-neutral-950/50 p-4 rounded-xl border border-neutral-800/80 h-fit">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              {editingAddonId ? <Edit2 className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-amber-400" />}
              {editingAddonId ? 'Editar Adicional' : 'Novo Adicional'}
            </h3>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Nome do Adicional *</label>
              <input
                type="text"
                required
                placeholder="Ex: Bacon Crocante, Catupiry Extra..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-amber-500 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Preço de Venda (R$) *</label>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Custo Estimado (R$)</label>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  value={cost}
                  onChange={(e) => setCost(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            {/* Calculated Margin */}
            <div className="p-2.5 bg-neutral-900/90 rounded-lg border border-neutral-800 flex items-center justify-between text-xs">
              <span className="text-neutral-400">Margem bruta:</span>
              <span className={`font-bold ${margin >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {formatPercent(margin)} ({formatCurrency(numPrice - numCost)} lucro)
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Categoria do Adicional</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-sm"
              >
                <option value="Queijos">Queijos & Laticínios</option>
                <option value="Carnes">Carnes & Frios</option>
                <option value="Vegetais">Vegetais & Cogumelos</option>
                <option value="Temperos">Temperos & Molhos</option>
                <option value="Doces">Doces & Confeitos</option>
                <option value="Geral">Geral</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="addon-available"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-neutral-900 border-neutral-700 focus:ring-amber-500"
              />
              <label htmlFor="addon-available" className="text-xs text-neutral-300 cursor-pointer">
                Disponível para venda imediata
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              {editingAddonId && (
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
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-600/20"
              >
                <Check className="w-4 h-4" />
                {editingAddonId ? 'Salvar Alteração' : 'Adicionar'}
              </button>
            </div>
          </form>

          {/* List of Addons */}
          <div className="md:col-span-7 space-y-2.5 overflow-y-auto max-h-[460px] pr-1">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center justify-between">
              <span>Adicionais Cadastrados ({addons.length})</span>
            </h3>

            {addons.length === 0 ? (
              <div className="text-center py-10 text-neutral-500 text-sm">Nenhum adicional cadastrado.</div>
            ) : (
              addons.map((a) => {
                const addMargin = calculateProfitMargin(a.price, a.cost);
                return (
                  <div
                    key={a.id}
                    className={`p-3.5 rounded-xl border transition flex items-center justify-between ${
                      !a.available ? 'opacity-60 bg-neutral-950/40 border-neutral-850' : 'bg-neutral-950 border-neutral-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{a.name}</span>
                        <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded-md">
                          {a.category || 'Geral'}
                        </span>
                        {!a.available && (
                          <span className="text-[10px] bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded-md">
                            Pausado
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-400">
                        <span className="text-amber-400 font-bold">+{formatCurrency(a.price)}</span>
                        <span>Custo: {formatCurrency(a.cost)}</span>
                        <span className="text-emerald-400 font-medium">Margem: {formatPercent(addMargin)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleAddonAvailability(a.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                          a.available
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700'
                        }`}
                      >
                        {a.available ? 'Ativo' : 'Pausado'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(a)}
                        className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(a.id, a.name)}
                        className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            type="button"
            onClick={() => {
              handleResetForm();
              setIsAddonModalOpen(false);
            }}
            className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm font-medium transition"
          >
            Fechar
          </button>
        </div>
      </div>

      {addonToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500 pb-3 border-b border-stone-800">
              <div className="p-2.5 bg-red-500/10 rounded-2xl border border-red-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Excluir Adicional</h3>
                <p className="text-xs text-stone-400">Esta ação não poderá ser desfeita.</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Tem certeza que deseja remover o adicional <strong className="text-white">"{addonToDelete.name}"</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setAddonToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const { id } = addonToDelete;
                  setAddonToDelete(null);
                  await handleDeleteAddon(id);
                  if (editingAddonId === id) {
                    handleResetForm();
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/20 cursor-pointer"
              >
                Sim, Excluir Adicional
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
