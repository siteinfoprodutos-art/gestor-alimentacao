import React, { useEffect, useState } from 'react';
import { Check, Package, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InventoryItem, InventoryUnit } from '../../types';

interface InventoryModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ item, isOpen, onClose }) => {
  const { handleSaveInventoryItem } = useApp();

  const [name, setName] = useState('');
  const [unit, setUnit] = useState<InventoryUnit>('kg');
  const [currentQuantity, setCurrentQuantity] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [cost, setCost] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setUnit(item.unit);
      setCurrentQuantity(item.currentQuantity.toString());
      setMinQuantity(item.minQuantity.toString());
      setCost(item.cost.toString());
      setCategory(item.category || '');
    } else {
      setName('');
      setUnit('kg');
      setCurrentQuantity('');
      setMinQuantity('');
      setCost('');
      setCategory('');
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Informe o nome do item de estoque.');
      return;
    }

    const itemToSave: InventoryItem = {
      id: item ? item.id : `inv-${Date.now()}`,
      name: name.trim(),
      unit,
      currentQuantity: Number(currentQuantity) || 0,
      minQuantity: Number(minQuantity) || 0,
      cost: Number(cost) || 0,
      category: category.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    await handleSaveInventoryItem(itemToSave);
    onClose();
  };

  return (
    <div
      id="inventory-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        id="inventory-modal"
        className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 text-stone-100 max-w-md w-full shadow-2xl space-y-4 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                {item ? 'Editar Item de Estoque' : 'Novo Item de Estoque'}
              </h3>
              <p className="text-xs text-stone-400">Ingredientes e embalagens</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-stone-300 block mb-1">
              Nome do Item / Ingrediente *
            </label>
            <input
              type="text"
              placeholder="Ex: Mussarela Especial, Caixa de Pizza..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Unidade de Medida *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as InventoryUnit)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              >
                <option value="kg">kg (Quilogramas)</option>
                <option value="g">g (Gramas)</option>
                <option value="un">un (Unidades)</option>
                <option value="L">L (Litros)</option>
                <option value="pct">pct (Pacotes)</option>
                <option value="cx">cx (Caixas)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Categoria
              </label>
              <input
                type="text"
                placeholder="Ex: Queijos, Embalagens..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Quantidade Atual *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                value={currentQuantity}
                onChange={(e) => setCurrentQuantity(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Estoque Mínimo *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-300 block mb-1">
              Custo Unitário (R$)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-2/3 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Estoque</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
