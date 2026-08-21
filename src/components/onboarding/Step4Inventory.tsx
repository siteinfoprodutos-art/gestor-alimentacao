import React, { useState } from 'react';
import { Plus, Trash2, Package, Sparkles, AlertTriangle, Check, Layers } from 'lucide-react';
import { InventoryUnit } from '../../types';
import { WizardInventoryItem } from './types';
import { CATEGORY_INVENTORY_TEMPLATES } from './onboardingData';
import { formatCurrency } from '../../utils/formatters';

interface Step4InventoryProps {
  inventory: WizardInventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<WizardInventoryItem[]>>;
  category: string;
  onNext: () => void;
  onBack: () => void;
}

export const Step4Inventory: React.FC<Step4InventoryProps> = ({
  inventory,
  setInventory,
  category,
  onNext,
  onBack,
}) => {
  const catKey = Object.keys(CATEGORY_INVENTORY_TEMPLATES).find((k) =>
    category.toLowerCase().includes(k)
  ) || 'pizzaria';

  const suggestedTemplates = CATEGORY_INVENTORY_TEMPLATES[catKey] || CATEGORY_INVENTORY_TEMPLATES.pizzaria;

  // Form State
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<InventoryUnit>('kg');
  const [quantity, setQuantity] = useState('10');
  const [minQuantity, setMinQuantity] = useState('3');
  const [cost, setCost] = useState('');

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !quantity) return;

    const numQty = parseFloat(quantity.replace(',', '.')) || 0;
    const numMin = parseFloat(minQuantity.replace(',', '.')) || 0;
    const numCost = parseFloat(cost.replace(',', '.')) || 0;

    const newItem: WizardInventoryItem = {
      id: `wiz-inv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      unit,
      currentQuantity: numQty,
      minQuantity: numMin,
      cost: numCost,
    };

    setInventory((prev) => [...prev, newItem]);
    setName('');
    setQuantity('10');
    setMinQuantity('3');
    setCost('');
  };

  const handleAddSuggestion = (sug: typeof suggestedTemplates[0]) => {
    if (inventory.some((i) => i.name.toLowerCase() === sug.name.toLowerCase())) return;

    const newItem: WizardInventoryItem = {
      id: `wiz-inv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: sug.name,
      unit: sug.unit,
      currentQuantity: sug.currentQuantity,
      minQuantity: sug.minQuantity,
      cost: sug.cost,
    };

    setInventory((prev) => [...prev, newItem]);
  };

  const handleAddAllSuggestions = () => {
    const toAdd: WizardInventoryItem[] = [];
    for (const sug of suggestedTemplates) {
      if (!inventory.some((i) => i.name.toLowerCase() === sug.name.toLowerCase())) {
        toAdd.push({
          id: `wiz-inv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: sug.name,
          unit: sug.unit,
          currentQuantity: sug.currentQuantity,
          minQuantity: sug.minQuantity,
          cost: sug.cost,
        });
      }
    }
    setInventory((prev) => [...prev, ...toAdd]);
  };

  const handleRemoveItem = (id: string) => {
    setInventory((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div id="onboarding-step-4" className="space-y-6 animate-fade-in">
      {/* Step Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
          <span>Passo 4 de 5</span>
          <span className="text-stone-600">•</span>
          <span>Controle de Estoque</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Configure seu Estoque e Alertas
        </h2>
        <p className="text-sm text-stone-400">
          Monitore insumos e ingredientes para nunca faltar produtos nas suas vendas e receber avisos automáticos.
        </p>
      </div>

      {/* 1-Click Suggestions Bar */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-300">
              Insumos Sugeridos ({category || 'Negócio'})
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddAllSuggestions}
            className="text-xs font-bold text-red-400 hover:text-red-300 hover:underline transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar todos os insumos</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestedTemplates.map((sug) => {
            const isAdded = inventory.some((i) => i.name.toLowerCase() === sug.name.toLowerCase());

            return (
              <button
                key={sug.name}
                type="button"
                onClick={() => handleAddSuggestion(sug)}
                disabled={isAdded}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isAdded
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default'
                    : 'bg-stone-800/80 hover:bg-stone-700/80 border-stone-700 text-stone-200 hover:text-white cursor-pointer'
                }`}
              >
                {isAdded ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-stone-400" />
                )}
                <span>{sug.name}</span>
                <span className="text-stone-400 font-normal">
                  ({sug.currentQuantity} {sug.unit})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form to Add Custom Stock Item */}
      <form
        onSubmit={handleAddCustomItem}
        className="bg-stone-900 border border-stone-800 rounded-3xl p-4 sm:p-5 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Adicionar Insumo / Embalagem
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-stone-400 mb-1">
              Nome do Insumo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Queijo Muçarela, Caixa 35cm..."
              className="w-full px-3 py-2 bg-stone-950 border border-stone-700 focus:border-red-500 rounded-xl text-white placeholder-stone-500 text-xs font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-stone-400 mb-1">
              Unidade
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as InventoryUnit)}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-700 focus:border-red-500 rounded-xl text-white text-xs font-medium"
            >
              <option value="kg">kg (Quilograma)</option>
              <option value="g">g (Grama)</option>
              <option value="un">un (Unidade)</option>
              <option value="L">L (Litro)</option>
              <option value="pct">pct (Pacote)</option>
              <option value="cx">cx (Caixa)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-stone-400 mb-1">
              Qtd. Atual *
            </label>
            <input
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="10"
              className="w-full px-3 py-2 bg-stone-950 border border-stone-700 focus:border-red-500 rounded-xl text-white placeholder-stone-500 text-xs font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-stone-400 mb-1">
              Qtd. Mínima Alerta
            </label>
            <input
              type="number"
              step="0.01"
              value={minQuantity}
              onChange={(e) => setMinQuantity(e.target.value)}
              placeholder="3"
              className="w-full px-3 py-2 bg-stone-950 border border-stone-700 focus:border-red-500 rounded-xl text-white placeholder-stone-500 text-xs font-medium"
            />
          </div>

          <div className="sm:col-span-2 flex gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-stone-400 mb-1">
                Custo Unit. (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0,00"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 focus:border-red-500 rounded-xl text-white placeholder-stone-500 text-xs font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={!name.trim() || !quantity}
              className="self-end px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-800 disabled:text-stone-600 text-white rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
              title="Adicionar insumo"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* List of Added Inventory Items */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-stone-400 px-1">
          <span>Itens no Estoque ({inventory.length})</span>
          {inventory.length > 0 && (
            <span className="text-[11px] text-stone-500">
              Controle automático de saídas e relatórios
            </span>
          )}
        </div>

        {inventory.length === 0 ? (
          <div className="bg-stone-900/40 border border-stone-800 border-dashed rounded-2xl p-6 text-center text-xs text-stone-500">
            Nenhum insumo cadastrado ainda. Use as sugestões rápidas acima para preencher com 1 clique.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {inventory.map((item) => {
              const isLow = item.currentQuantity <= item.minQuantity;

              return (
                <div
                  key={item.id}
                  className="bg-stone-900 border border-stone-800 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-stone-200">
                        {item.currentQuantity} {item.unit}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        (Mín: {item.minQuantity} {item.unit})
                      </span>
                      {item.cost > 0 && (
                        <span className="text-[10px] text-emerald-400">
                          {formatCurrency(item.cost)}/{item.unit}
                        </span>
                      )}
                      {isLow && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                          Estoque Baixo
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 text-stone-500 hover:text-red-400 rounded-lg hover:bg-stone-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
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
          {inventory.length === 0 && (
            <button
              type="button"
              onClick={onNext}
              className="px-4 py-2.5 text-xs font-semibold text-stone-400 hover:text-stone-200 transition-colors"
            >
              Configurar estoque depois
            </button>
          )}

          <button
            type="button"
            id="btn-step-4-next"
            onClick={onNext}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 cursor-pointer flex items-center gap-2 transition-all"
          >
            <span>Avançar para Primeira Venda</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
