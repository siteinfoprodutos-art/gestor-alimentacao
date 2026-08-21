import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Printer,
  Sparkles,
  Calculator,
  Utensils,
  Clock,
  Layers,
  ChefHat,
  Info,
  CheckCircle2,
  TrendingUp,
  Package,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, RecipeIngredient, InventoryItem } from '../../types';
import {
  calculateMarkup,
  calculateProfitMargin,
  formatCurrency,
  formatPercent,
} from '../../utils/formatters';

interface RecipeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProductId?: string;
}

export const RecipeManagerModal: React.FC<RecipeManagerModalProps> = ({
  isOpen,
  onClose,
  initialProductId,
}) => {
  const {
    products,
    inventory,
    handleSaveProduct,
    showToast,
  } = useApp();

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number>(15);
  const [yieldUnits, setYieldUnits] = useState<number>(1);
  const [recipeInstructions, setRecipeInstructions] = useState<string>('');
  const [targetMargin, setTargetMargin] = useState<number>(70); // 70% default target margin

  // Temporary row for adding a new ingredient
  const [selectedInventoryId, setSelectedInventoryId] = useState<string>('');
  const [inputQuantity, setInputQuantity] = useState<number | ''>(100);
  const [inputUnit, setInputUnit] = useState<string>('g');

  // Selected product object
  const currentProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0];
  }, [products, selectedProductId]);

  // Load product data when selected
  useEffect(() => {
    if (initialProductId) {
      setSelectedProductId(initialProductId);
    } else if (!selectedProductId && products.length > 0) {
      setSelectedProductId(products[0].id);
    }
  }, [initialProductId, products]);

  useEffect(() => {
    if (currentProduct) {
      setRecipeIngredients(currentProduct.recipe || []);
      setPrepTimeMinutes(currentProduct.preparationTimeMinutes || 15);
      setYieldUnits(currentProduct.yieldUnits || 1);
      setRecipeInstructions(currentProduct.recipeInstructions || '');
    }
  }, [currentProduct]);

  // Set default unit when inventory item changes
  useEffect(() => {
    if (selectedInventoryId) {
      const invItem = inventory.find((i) => i.id === selectedInventoryId);
      if (invItem) {
        if (invItem.unit === 'kg') setInputUnit('g');
        else if (invItem.unit === 'L') setInputUnit('ml');
        else setInputUnit(invItem.unit);
      }
    }
  }, [selectedInventoryId, inventory]);

  if (!isOpen) return null;

  // Calculate Unit Cost based on inventory item unit & recipe unit
  const calculateUnitCost = (invItem: InventoryItem, recUnit: string): number => {
    if (invItem.unit === 'kg') {
      if (recUnit === 'g') return invItem.cost / 1000;
      if (recUnit === 'kg') return invItem.cost;
    }
    if (invItem.unit === 'L') {
      if (recUnit === 'ml') return invItem.cost / 1000;
      if (recUnit === 'L') return invItem.cost;
    }
    return invItem.cost; // un, pct, cx
  };

  // Add ingredient to recipe list
  const handleAddIngredient = () => {
    if (!selectedInventoryId) {
      showToast('Selecione um ingrediente do estoque.', 'warning');
      return;
    }
    const numQty = Number(inputQuantity);
    if (!numQty || numQty <= 0) {
      showToast('Informe uma quantidade válida.', 'warning');
      return;
    }

    const invItem = inventory.find((i) => i.id === selectedInventoryId);
    if (!invItem) return;

    const unitCost = calculateUnitCost(invItem, inputUnit);
    const totalCost = Number((numQty * unitCost).toFixed(2));

    const newIng: RecipeIngredient = {
      id: `ri-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      inventoryItemId: invItem.id,
      inventoryItemName: invItem.name,
      quantity: numQty,
      unit: inputUnit as any,
      unitCost,
      totalCost,
    };

    setRecipeIngredients((prev) => [...prev, newIng]);
    setInputQuantity(100);
    showToast(`"${invItem.name}" adicionado à ficha técnica!`, 'info');
  };

  const handleRemoveIngredient = (id: string) => {
    setRecipeIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  // Calculated Totals
  const totalRecipeCost = recipeIngredients.reduce((sum, item) => sum + item.totalCost, 0);
  const costPerYieldUnit = yieldUnits > 0 ? totalRecipeCost / yieldUnits : totalRecipeCost;
  const currentSellingPrice = currentProduct?.price || 0;
  const profitMarginPercent = calculateProfitMargin(currentSellingPrice, costPerYieldUnit);
  const markupMultiplier = calculateMarkup(currentSellingPrice, costPerYieldUnit);
  const cmvPercent = currentSellingPrice > 0 ? (costPerYieldUnit / currentSellingPrice) * 100 : 0;

  // Suggested Price based on target margin: Price = Cost / (1 - TargetMargin/100)
  const suggestedPrice =
    targetMargin < 100 && costPerYieldUnit > 0
      ? costPerYieldUnit / (1 - targetMargin / 100)
      : 0;

  // Save recipe and update product cost
  const handleSaveRecipe = async () => {
    if (!currentProduct) return;

    const updatedProduct: Product = {
      ...currentProduct,
      cost: Number(costPerYieldUnit.toFixed(2)),
      recipe: recipeIngredients,
      preparationTimeMinutes: prepTimeMinutes,
      yieldUnits,
      recipeInstructions,
      updatedAt: new Date().toISOString(),
    };

    await handleSaveProduct(updatedProduct);
    showToast(
      `Ficha técnica de "${currentProduct.name}" salva! Custo atualizado para ${formatCurrency(costPerYieldUnit)}.`,
      'success'
    );
  };

  // Print Kitchen Recipe Sheet
  const handlePrintRecipe = () => {
    window.print();
  };

  return (
    <div
      id="recipe-manager-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recipe-modal-title"
    >
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl animate-in fade-in duration-200 my-4 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/10 text-red-500 flex items-center justify-center font-bold text-xl border border-red-500/20">
              <ChefHat className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 id="recipe-modal-title" className="text-base sm:text-lg font-extrabold text-white font-heading">
                Ficha Técnica & Engenharia de Cardápio (CMV)
              </h2>
              <p className="text-xs text-stone-400">
                Calcule custos exatos de insumos, margem de lucro e modo de preparo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="print-recipe-sheet-btn"
              onClick={handlePrintRecipe}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
              title="Imprimir Ficha Técnica"
              aria-label="Imprimir Ficha Técnica"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              id="close-recipe-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Product Selector Bar */}
        <div className="p-4 bg-stone-950/60 border-b border-stone-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <label htmlFor="product-recipe-select" className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
              Produto Selecionado
            </label>
            <select
              id="product-recipe-select"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 text-white rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.category} ({formatCurrency(p.price)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center pt-1 sm:pt-0">
            <div className="text-right">
              <span className="text-[11px] text-stone-400 block">Preço de Venda</span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-400">
                {formatCurrency(currentSellingPrice)}
              </span>
            </div>
            <div className="h-8 w-px bg-stone-800 hidden sm:block"></div>
            <div className="text-right">
              <span className="text-[11px] text-stone-400 block">Custo Total (CMV)</span>
              <span className="text-sm sm:text-base font-extrabold text-amber-400">
                {formatCurrency(costPerYieldUnit)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-950 border border-stone-800/80">
              <span className="text-[11px] font-semibold text-stone-400 block">Custo da Receita (CMV)</span>
              <span className="text-lg sm:text-2xl font-black text-amber-400 mt-1 block">
                {formatCurrency(costPerYieldUnit)}
              </span>
              <span className="text-[10px] text-stone-500 mt-0.5 block">
                {recipeIngredients.length} {recipeIngredients.length === 1 ? 'insumo' : 'insumos'}
              </span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-950 border border-stone-800/80">
              <span className="text-[11px] font-semibold text-stone-400 block">Índice CMV %</span>
              <span
                className={`text-lg sm:text-2xl font-black mt-1 block ${
                  cmvPercent <= 35 ? 'text-emerald-400' : cmvPercent <= 45 ? 'text-amber-400' : 'text-red-400'
                }`}
              >
                {formatPercent(cmvPercent)}
              </span>
              <span className="text-[10px] text-stone-500 mt-0.5 block">
                {cmvPercent <= 35 ? 'Excelente (≤35%)' : cmvPercent <= 45 ? 'Moderado' : 'Alto (>45%)'}
              </span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-950 border border-stone-800/80">
              <span className="text-[11px] font-semibold text-stone-400 block">Margem Bruta Atual</span>
              <span
                className={`text-lg sm:text-2xl font-black mt-1 block ${
                  profitMarginPercent >= 60 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {formatPercent(profitMarginPercent)}
              </span>
              <span className="text-[10px] text-stone-500 mt-0.5 block">
                Markup {markupMultiplier.toFixed(2)}x
              </span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-950 border border-stone-800/80">
              <span className="text-[11px] font-semibold text-stone-400 block">Lucro Bruto Unitário</span>
              <span className="text-lg sm:text-2xl font-black text-emerald-400 mt-1 block">
                {formatCurrency(Math.max(0, currentSellingPrice - costPerYieldUnit))}
              </span>
              <span className="text-[10px] text-stone-500 mt-0.5 block">
                Por unidade vendida
              </span>
            </div>
          </div>

          {/* Section: Ingredients List & Cost Composition */}
          <div className="bg-stone-950 rounded-2xl p-4 sm:p-5 border border-stone-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-red-500" />
                  Composição de Insumos & Ingredientes (Estoque)
                </h3>
                <p className="text-xs text-stone-400">
                  Os valores unitários são sincronizados diretamente com os preços do seu estoque.
                </p>
              </div>
            </div>

            {/* Add Ingredient Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-2xl bg-stone-900/90 border border-stone-800 items-end">
              <div className="sm:col-span-5">
                <label htmlFor="inv-ingredient-select" className="block text-[11px] font-semibold text-stone-400 mb-1">
                  Selecionar Insumo do Estoque
                </label>
                <select
                  id="inv-ingredient-select"
                  value={selectedInventoryId}
                  onChange={(e) => setSelectedInventoryId(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none"
                >
                  <option value="">-- Escolha um insumo --</option>
                  {inventory.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} ({formatCurrency(inv.cost)}/{inv.unit}) — Saldo: {inv.currentQuantity} {inv.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="inv-quantity-input" className="block text-[11px] font-semibold text-stone-400 mb-1">
                  Quantidade
                </label>
                <input
                  id="inv-quantity-input"
                  type="number"
                  step="any"
                  value={inputQuantity}
                  onChange={(e) => setInputQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="Ex: 250"
                  className="w-full bg-stone-950 border border-stone-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="inv-unit-select" className="block text-[11px] font-semibold text-stone-400 mb-1">
                  Unidade
                </label>
                <select
                  id="inv-unit-select"
                  value={inputUnit}
                  onChange={(e) => setInputUnit(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none"
                >
                  <option value="g">gramas (g)</option>
                  <option value="kg">quilos (kg)</option>
                  <option value="ml">mililitros (ml)</option>
                  <option value="L">litros (L)</option>
                  <option value="un">unidade (un)</option>
                  <option value="pct">pacote (pct)</option>
                  <option value="cx">caixa (cx)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  id="add-ingredient-to-recipe-btn"
                  type="button"
                  onClick={handleAddIngredient}
                  className="w-full py-2 px-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20 active:scale-95 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar</span>
                </button>
              </div>
            </div>

            {/* Table of Ingredients */}
            {recipeIngredients.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl border border-dashed border-stone-800 text-stone-500 text-xs">
                Nenhum ingrediente adicionado à ficha técnica deste produto. Selecione acima para começar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-800 text-stone-400 uppercase text-[10px] font-bold tracking-wider">
                      <th className="py-2.5 px-3">Ingrediente / Insumo</th>
                      <th className="py-2.5 px-3">Qtd. Utilizada</th>
                      <th className="py-2.5 px-3">Custo Unitário</th>
                      <th className="py-2.5 px-3">Custo Total</th>
                      <th className="py-2.5 px-3 text-center">% CMV</th>
                      <th className="py-2.5 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60">
                    {recipeIngredients.map((item) => {
                      const sharePercent = totalRecipeCost > 0 ? (item.totalCost / totalRecipeCost) * 100 : 0;
                      return (
                        <tr key={item.id} className="hover:bg-stone-900/60 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-stone-200">
                            {item.inventoryItemName}
                          </td>
                          <td className="py-2.5 px-3 text-stone-300 font-mono">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="py-2.5 px-3 text-stone-400 font-mono">
                            {formatCurrency(item.unitCost)} / {item.unit}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-amber-400 font-mono">
                            {formatCurrency(item.totalCost)}
                          </td>
                          <td className="py-2.5 px-3 text-center text-stone-400 font-mono">
                            {sharePercent.toFixed(1)}%
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleRemoveIngredient(item.id)}
                              className="p-1 text-stone-500 hover:text-red-400 transition cursor-pointer"
                              title="Remover insumo"
                              aria-label="Remover insumo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-stone-700 font-extrabold text-stone-100 bg-stone-950/80">
                      <td colSpan={3} className="py-3 px-3 text-right uppercase text-[11px] text-stone-400">
                        Custo Total dos Insumos (CMV):
                      </td>
                      <td className="py-3 px-3 text-amber-400 text-sm font-mono font-black">
                        {formatCurrency(totalRecipeCost)}
                      </td>
                      <td colSpan={2} className="py-3 px-3 text-right text-stone-400">
                        100.0%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Pricing Simulation & Yield Setup */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Margins & Target Price Calculator */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                Simulador de Margem & Preço Sugerido
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-stone-300 font-semibold">Margem Bruta Alvo:</span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">{targetMargin}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="90"
                    step="1"
                    value={targetMargin}
                    onChange={(e) => setTargetMargin(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-stone-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500 mt-1">
                    <span>30% (Competitivo)</span>
                    <span>60% - 70% (Recomendado Pizzarias)</span>
                    <span>85%+ (Premium)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-stone-400 block font-semibold">Preço de Venda Sugerido</span>
                    <span className="text-xs text-stone-500">Para atingir {targetMargin}% de margem</span>
                  </div>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {formatCurrency(suggestedPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Preparation & Yield Details */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Tempo de Preparo & Rendimento
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="prep-time-input" className="block text-[11px] font-semibold text-stone-400 mb-1">
                    Tempo Médio (minutos)
                  </label>
                  <input
                    id="prep-time-input"
                    type="number"
                    value={prepTimeMinutes}
                    onChange={(e) => setPrepTimeMinutes(parseInt(e.target.value) || 0)}
                    className="w-full bg-stone-900 border border-stone-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="yield-units-input" className="block text-[11px] font-semibold text-stone-400 mb-1">
                    Rendimento da Receita
                  </label>
                  <input
                    id="yield-units-input"
                    type="number"
                    min="1"
                    value={yieldUnits}
                    onChange={(e) => setYieldUnits(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-stone-900 border border-stone-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="recipe-instructions-textarea" className="block text-[11px] font-semibold text-stone-400 mb-1">
                  Instruções da Cozinha / Modo de Preparo
                </label>
                <textarea
                  id="recipe-instructions-textarea"
                  rows={2}
                  value={recipeInstructions}
                  onChange={(e) => setRecipeInstructions(e.target.value)}
                  placeholder="Ex: Abrir disco 35cm, espalhar 100ml de molho, cobrir com 250g mussarela..."
                  className="w-full bg-stone-900 border border-stone-700 text-white rounded-xl px-3 py-2 text-xs focus:border-red-500 focus:outline-none resize-none"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-stone-800 bg-stone-950">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition cursor-pointer"
          >
            Fechar
          </button>

          <div className="flex items-center gap-3">
            <button
              id="save-recipe-btn"
              type="button"
              onClick={handleSaveRecipe}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 active:scale-95 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar Ficha Técnica & Atualizar Custo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
