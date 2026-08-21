import React, { useState } from 'react';
import { Plus, Trash2, Tag, Sparkles, DollarSign, Check, ShoppingBag } from 'lucide-react';
import { WizardProductItem } from './types';
import { CATEGORY_PRODUCT_TEMPLATES } from './onboardingData';
import { formatCurrency } from '../../utils/formatters';

interface Step3ProductsProps {
  products: WizardProductItem[];
  setProducts: React.Dispatch<React.SetStateAction<WizardProductItem[]>>;
  category: string;
  onNext: () => void;
  onBack: () => void;
}

export const Step3Products: React.FC<Step3ProductsProps> = ({
  products,
  setProducts,
  category,
  onNext,
  onBack,
}) => {
  // Find templates based on category name
  const catKey = Object.keys(CATEGORY_PRODUCT_TEMPLATES).find((k) =>
    category.toLowerCase().includes(k)
  ) || 'pizzaria';

  const suggestedTemplates = CATEGORY_PRODUCT_TEMPLATES[catKey] || CATEGORY_PRODUCT_TEMPLATES.pizzaria;

  // Form State for custom product
  const [name, setName] = useState('');
  const [itemCategory, setItemCategory] = useState(category || 'Pizzas');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');

  const handleAddCustomProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    const numPrice = parseFloat(price.replace(',', '.')) || 0;
    const numCost = parseFloat(cost.replace(',', '.')) || 0;

    const newItem: WizardProductItem = {
      id: `wiz-prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      category: itemCategory.trim() || 'Geral',
      price: numPrice,
      cost: numCost,
    };

    setProducts((prev) => [...prev, newItem]);
    setName('');
    setPrice('');
    setCost('');
  };

  const handleAddSuggestion = (sug: typeof suggestedTemplates[0]) => {
    // Check if already added
    if (products.some((p) => p.name.toLowerCase() === sug.name.toLowerCase())) {
      return;
    }

    const newItem: WizardProductItem = {
      id: `wiz-prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: sug.name,
      category: sug.category,
      price: sug.price,
      cost: sug.cost,
      description: sug.description,
    };

    setProducts((prev) => [...prev, newItem]);
  };

  const handleAddAllSuggestions = () => {
    const toAdd: WizardProductItem[] = [];
    for (const sug of suggestedTemplates) {
      if (!products.some((p) => p.name.toLowerCase() === sug.name.toLowerCase())) {
        toAdd.push({
          id: `wiz-prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: sug.name,
          category: sug.category,
          price: sug.price,
          cost: sug.cost,
          description: sug.description,
        });
      }
    }
    setProducts((prev) => [...prev, ...toAdd]);
  };

  const handleRemoveProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div id="onboarding-step-3" className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
          <span>Passo 3 de 5</span>
          <span className="text-stone-600">•</span>
          <span>Cardápio Inicial</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Cadastre seus Primeiros Produtos
        </h2>
        <p className="text-sm text-stone-400">
          Adicione itens ao seu cardápio com 1 clique nas sugestões abaixo ou digite seus próprios produtos.
        </p>
      </div>

      {/* 1-Click Suggestions Bar */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-300">
              Sugestões Rápidas ({category || 'Negócio'})
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddAllSuggestions}
            className="text-xs font-bold text-red-400 hover:text-red-300 hover:underline transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar todas as sugestões</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestedTemplates.map((sug) => {
            const isAdded = products.some((p) => p.name.toLowerCase() === sug.name.toLowerCase());

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
                <span className="text-stone-400 font-normal">({formatCurrency(sug.price)})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form to Add Custom Product */}
      <form
        onSubmit={handleAddCustomProduct}
        className="bg-stone-900 border border-stone-800 rounded-3xl p-4 sm:p-5 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-red-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Adicionar Produto Personalizado
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-stone-400 mb-1">
              Nome do Produto *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: X-Salada Especial"
              className="w-full px-3 py-2 bg-stone-950 border border-stone-700 focus:border-red-500 rounded-xl text-white placeholder-stone-500 text-xs font-medium"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-stone-400 mb-1">
              Categoria
            </label>
            <input
              type="text"
              value={itemCategory}
              onChange={(e) => setItemCategory(e.target.value)}
              placeholder="Ex: Lanches, Pizzas..."
              className="w-full px-3 py-2 bg-stone-950 border border-stone-700 focus:border-red-500 rounded-xl text-white placeholder-stone-500 text-xs font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-stone-400 mb-1">
              Preço Venda (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0,00"
              className="w-full px-3 py-2 bg-stone-950 border border-stone-700 focus:border-red-500 rounded-xl text-white placeholder-stone-500 text-xs font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-stone-400 mb-1">
              Custo Estimado (R$)
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

          <div className="sm:col-span-1">
            <button
              type="submit"
              disabled={!name.trim() || !price}
              className="w-full py-2 bg-red-600 hover:bg-red-500 disabled:bg-stone-800 disabled:text-stone-600 text-white rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
              title="Adicionar item"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* List of Added Products */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-stone-400 px-1">
          <span>Produtos Cadastrados ({products.length})</span>
          {products.length > 0 && (
            <span className="text-[11px] text-stone-500">
              Você poderá adicionar mais no menu de Produtos depois
            </span>
          )}
        </div>

        {products.length === 0 ? (
          <div className="bg-stone-900/40 border border-stone-800 border-dashed rounded-2xl p-6 text-center text-xs text-stone-500">
            Nenhum produto adicionado ainda. Clique nas sugestões acima ou preencha o formulário para começar.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {products.map((prod) => {
              const margin = prod.price > 0 && prod.cost ? ((prod.price - prod.cost) / prod.price) * 100 : 0;

              return (
                <div
                  key={prod.id}
                  className="bg-stone-900 border border-stone-800 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{prod.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-stone-800 text-stone-400">
                        {prod.category}
                      </span>
                      <span className="text-xs font-bold text-emerald-400">
                        {formatCurrency(prod.price)}
                      </span>
                      {prod.cost > 0 && (
                        <span className="text-[10px] text-stone-500">
                          (Margem: {margin.toFixed(0)}%)
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(prod.id)}
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

        <button
          type="button"
          id="btn-step-3-next"
          disabled={products.length === 0}
          onClick={onNext}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            products.length > 0
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 cursor-pointer'
              : 'bg-stone-800 text-stone-500 cursor-not-allowed'
          }`}
        >
          <span>Avançar para Estoque</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
