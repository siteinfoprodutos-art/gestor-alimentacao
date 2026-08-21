import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Upload,
  Trash2,
  Plus,
  Image as ImageIcon,
  Check,
  History,
  Layers,
  Sparkles,
  DollarSign,
  Info,
  ChefHat,
  Utensils,
  Clock,
  Calculator,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, ProductCrust, ProductSize, RecipeIngredient, InventoryItem } from '../../types';
import {
  calculateMarkup,
  calculateProfitMargin,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPercent,
} from '../../utils/formatters';
import { compressImage } from '../../utils/imageCompressor';
import { STANDARD_PIZZA_CRUSTS, STANDARD_PIZZA_SIZES } from '../../services/database/demoData';

export const ProductModal: React.FC = () => {
  const {
    isProductModalOpen,
    setIsProductModalOpen,
    editingProduct,
    setEditingProduct,
    categories,
    addons,
    inventory,
    handleSaveProduct,
    setIsCategoryModalOpen,
    showToast,
    currentSegment,
  } = useApp();

  // Active Tab in Modal: 'general' | 'sizes' | 'crusts' | 'recipe' | 'history'
  const [activeTab, setActiveTab] = useState<'general' | 'sizes' | 'crusts' | 'recipe' | 'history'>('general');

  // Form Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('Pizzas');
  const [subCategory, setSubCategory] = useState('');
  const [description, setDescription] = useState('');
  const [available, setAvailable] = useState(true);
  const [image, setImage] = useState<string | undefined>(undefined);
  const [isCompressingImage, setIsCompressingImage] = useState(false);

  // Pricing & Sizes
  const [hasSizes, setHasSizes] = useState(false);
  const [price, setPrice] = useState<number | ''>(49.9);
  const [cost, setCost] = useState<number | ''>(16.0);
  const [sizes, setSizes] = useState<ProductSize[]>(STANDARD_PIZZA_SIZES);
  const [crusts, setCrusts] = useState<ProductCrust[]>(STANDARD_PIZZA_CRUSTS);
  const [allowedAddonIds, setAllowedAddonIds] = useState<string[]>([]);
  const [maxFlavors, setMaxFlavors] = useState<number>(2);

  // Recipe & Technical Sheet Fields
  const [recipe, setRecipe] = useState<RecipeIngredient[]>([]);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number>(15);
  const [yieldUnits, setYieldUnits] = useState<number>(1);
  const [recipeInstructions, setRecipeInstructions] = useState<string>('');

  // Temp ingredient selection
  const [selectedInvId, setSelectedInvId] = useState<string>('');
  const [tempQuantity, setTempQuantity] = useState<number | ''>(100);
  const [tempUnit, setTempUnit] = useState<string>('g');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || '');
      setCode(editingProduct.code || '');
      setCategoryId(editingProduct.categoryId || 'cat-pizzas');
      setCategoryName(editingProduct.category || 'Pizzas');
      setSubCategory(editingProduct.subCategory || '');
      setDescription(editingProduct.description || '');
      setAvailable(editingProduct.available ?? true);
      setImage(editingProduct.image);
      setHasSizes(editingProduct.hasSizes || (editingProduct.sizes && editingProduct.sizes.length > 0) || false);
      setPrice(editingProduct.price ?? 49.9);
      setCost(editingProduct.cost ?? 16.0);
      setSizes(
        editingProduct.sizes && editingProduct.sizes.length > 0
          ? editingProduct.sizes
          : STANDARD_PIZZA_SIZES
      );
      setCrusts(
        editingProduct.crusts && editingProduct.crusts.length > 0
          ? editingProduct.crusts
          : STANDARD_PIZZA_CRUSTS
      );
      setAllowedAddonIds(editingProduct.allowedAddonIds || []);
      setMaxFlavors(editingProduct.maxFlavors || 2);
      setRecipe(editingProduct.recipe || []);
      setPrepTimeMinutes(editingProduct.preparationTimeMinutes || 15);
      setYieldUnits(editingProduct.yieldUnits || 1);
      setRecipeInstructions(editingProduct.recipeInstructions || '');
      setActiveTab('general');
    } else {
      // Default new product
      setName('');
      setCode('');
      const defaultCat = categories.find((c) => c.name.toLowerCase().includes('pizza')) || categories[0];
      setCategoryId(defaultCat ? defaultCat.id : 'cat-pizzas');
      setCategoryName(defaultCat ? defaultCat.name : 'Pizzas');
      setSubCategory('Tradicionais');
      setDescription('');
      setAvailable(true);
      setImage(undefined);
      setHasSizes(true);
      setPrice(49.9);
      setCost(16.0);
      setSizes(STANDARD_PIZZA_SIZES);
      setCrusts(STANDARD_PIZZA_CRUSTS);
      setAllowedAddonIds(addons.map((a) => a.id));
      setMaxFlavors(2);
      setRecipe([]);
      setPrepTimeMinutes(15);
      setYieldUnits(1);
      setRecipeInstructions('');
      setActiveTab('general');
    }
  }, [editingProduct, isProductModalOpen, categories, addons]);

  // Adjust unit when inventory item changes
  useEffect(() => {
    if (selectedInvId) {
      const inv = inventory.find((i) => i.id === selectedInvId);
      if (inv) {
        if (inv.unit === 'kg') setTempUnit('g');
        else if (inv.unit === 'L') setTempUnit('ml');
        else setTempUnit(inv.unit);
      }
    }
  }, [selectedInvId, inventory]);

  if (!isProductModalOpen) return null;

  const numPrice = Number(price) || 0;
  const numCost = Number(cost) || 0;
  const singleMargin = calculateProfitMargin(numPrice, numCost);
  const singleMarkup = calculateMarkup(numPrice, numCost);

  // Category change handler
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setCategoryId(selectedId);
    const found = categories.find((c) => c.id === selectedId);
    if (found) {
      setCategoryName(found.name);
      if (found.subcategories && found.subcategories.length > 0) {
        setSubCategory(found.subcategories[0]);
      }
      if (!found.name.toLowerCase().includes('pizza')) {
        setHasSizes(false);
      } else {
        setHasSizes(true);
      }
    }
  };

  // Image Upload with local compression
  const handleImageFile = async (file: File) => {
    try {
      setIsCompressingImage(true);
      const compressedDataUrl = await compressImage(file, 600, 600, 0.82);
      setImage(compressedDataUrl);
      showToast('Imagem carregada e otimizada localmente!', 'info');
    } catch (err) {
      console.error('Image compression error:', err);
      showToast('Erro ao processar imagem. Tente outro arquivo.', 'error');
    } finally {
      setIsCompressingImage(false);
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  // Sizes management
  const handleAddSize = () => {
    const newSize: ProductSize = {
      id: `sz-${Date.now()}`,
      name: 'Novo Tamanho',
      slices: 8,
      maxFlavors: 2,
      price: numPrice > 0 ? numPrice : 49.9,
      cost: numCost > 0 ? numCost : 16.0,
    };
    setSizes((prev) => [...prev, newSize]);
  };

  const handleRemoveSize = (idx: number) => {
    setSizes((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateSize = (idx: number, field: keyof ProductSize, val: any) => {
    setSizes((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  // Crusts management
  const handleAddCrust = () => {
    const newCrust: ProductCrust = {
      id: `crust-${Date.now()}`,
      name: 'Nova Borda',
      price: 8.0,
      cost: 2.8,
      available: true,
    };
    setCrusts((prev) => [...prev, newCrust]);
  };

  const handleRemoveCrust = (idx: number) => {
    setCrusts((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateCrust = (idx: number, field: keyof ProductCrust, val: any) => {
    setCrusts((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  // Recipe Ingredient handlers
  const handleAddRecipeIngredient = () => {
    if (!selectedInvId) {
      showToast('Selecione um insumo do estoque.', 'warning');
      return;
    }
    const numQ = Number(tempQuantity);
    if (!numQ || numQ <= 0) {
      showToast('Informe uma quantidade válida.', 'warning');
      return;
    }

    const invItem = inventory.find((i) => i.id === selectedInvId);
    if (!invItem) return;

    let unitCost = invItem.cost;
    if (invItem.unit === 'kg' && tempUnit === 'g') unitCost = invItem.cost / 1000;
    if (invItem.unit === 'L' && tempUnit === 'ml') unitCost = invItem.cost / 1000;

    const totalCost = Number((numQ * unitCost).toFixed(2));

    const newIngredient: RecipeIngredient = {
      id: `ri-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      inventoryItemId: invItem.id,
      inventoryItemName: invItem.name,
      quantity: numQ,
      unit: tempUnit as any,
      unitCost,
      totalCost,
    };

    setRecipe((prev) => [...prev, newIngredient]);
    setTempQuantity(100);
    showToast(`"${invItem.name}" adicionado à ficha técnica!`, 'info');
  };

  const handleRemoveRecipeIngredient = (id: string) => {
    setRecipe((prev) => prev.filter((item) => item.id !== id));
  };

  const totalRecipeCost = recipe.reduce((acc, curr) => acc + curr.totalCost, 0);
  const costPerYield = yieldUnits > 0 ? totalRecipeCost / yieldUnits : totalRecipeCost;

  const handleApplyRecipeCost = () => {
    if (totalRecipeCost > 0) {
      const rounded = Number(costPerYield.toFixed(2));
      setCost(rounded);
      showToast(`Custo do produto atualizado para ${formatCurrency(rounded)}!`, 'success');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Informe o nome do produto.', 'warning');
      return;
    }

    // Determine representative base price/cost
    let finalPrice = numPrice;
    let finalCost = numCost;

    if (hasSizes && sizes.length > 0) {
      const standardSize = sizes.find((s) => s.name.toLowerCase().includes('grande')) || sizes[0];
      finalPrice = standardSize.price;
      finalCost = standardSize.cost;
    } else if (recipe.length > 0 && costPerYield > 0 && finalCost === 0) {
      finalCost = Number(costPerYield.toFixed(2));
    }

    const product: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: name.trim(),
      code: code.trim() || undefined,
      categoryId: categoryId || 'cat-pizzas',
      category: categoryName || 'Pizzas',
      subCategory: subCategory.trim() || undefined,
      description: description.trim(),
      price: finalPrice,
      cost: finalCost,
      available,
      image,
      hasSizes,
      sizes: hasSizes ? sizes : undefined,
      crusts: crusts.length > 0 ? crusts : undefined,
      allowedAddonIds,
      maxFlavors,
      recipe: recipe.length > 0 ? recipe : undefined,
      preparationTimeMinutes: prepTimeMinutes,
      yieldUnits,
      recipeInstructions: recipeInstructions.trim() || undefined,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priceHistory: editingProduct?.priceHistory || [],
    };

    await handleSaveProduct(product);
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const currentCategory = categories.find((c) => c.id === categoryId);

  return (
    <div
      id="product-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-heading"
    >
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in duration-200 my-4 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/10 text-red-500 flex items-center justify-center font-bold text-xl border border-red-500/20">
              {currentSegment.icon}
            </div>
            <div>
              <h2 id="product-modal-heading" className="text-base sm:text-lg font-extrabold text-white font-heading">
                {editingProduct ? `Editar: ${editingProduct.name}` : `Cadastrar Novo ${currentSegment.terminology.productSingular}`}
              </h2>
              <p className="text-xs text-stone-400">
                Configure detalhes, preços, opções e parâmetros para o segmento de {currentSegment.name}
              </p>
            </div>
          </div>
          <button
            id="close-product-modal-btn"
            onClick={() => {
              setIsProductModalOpen(false);
              setEditingProduct(null);
            }}
            className="text-stone-400 hover:text-white p-2 rounded-xl hover:bg-stone-800 transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-950/60 px-4 sm:px-6 gap-2 pt-2 overflow-x-auto">
          <button
            id="tab-general-btn"
            type="button"
            onClick={() => setActiveTab('general')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'general'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <Info className="w-4 h-4" /> Informações Gerais
          </button>

          <button
            id="tab-sizes-btn"
            type="button"
            onClick={() => setActiveTab('sizes')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'sizes'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" /> Preços & Tamanhos
            {hasSizes && (
              <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.2 rounded-full font-bold">
                {sizes.length}
              </span>
            )}
          </button>

          {(currentSegment.features.hasSizesAndCrusts || currentSegment.features.hasAddons) && (
            <button
              id="tab-crusts-btn"
              type="button"
              onClick={() => setActiveTab('crusts')}
              className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'crusts'
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-stone-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" /> Bordas & Adicionais
            </button>
          )}

          {currentSegment.features.hasTechnicalSheet && (
            <button
              id="tab-recipe-btn"
              type="button"
              onClick={() => setActiveTab('recipe')}
              className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'recipe'
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-stone-400 hover:text-white'
              }`}
            >
              <ChefHat className="w-4 h-4" /> Ficha Técnica & CMV
              {recipe.length > 0 && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold">
                  {recipe.length}
                </span>
              )}
            </button>
          )}

          {editingProduct && editingProduct.priceHistory && editingProduct.priceHistory.length > 0 && (
            <button
              id="tab-history-btn"
              type="button"
              onClick={() => setActiveTab('history')}
              className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'history'
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-stone-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" /> Histórico ({editingProduct.priceHistory.length})
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: INFORMAÇÕES GERAIS */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label htmlFor="prod-name-input" className="block text-xs font-bold text-stone-300 mb-1.5">
                    Nome do Produto *
                  </label>
                  <input
                    id="prod-name-input"
                    type="text"
                    required
                    placeholder="Ex: Pizza Calabresa Especial"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white text-sm font-medium focus:outline-hidden focus:border-red-500"
                  />
                </div>

                {/* SKU Code */}
                <div>
                  <label htmlFor="prod-code-input" className="block text-xs font-bold text-stone-300 mb-1.5">
                    Código / SKU (Opcional)
                  </label>
                  <input
                    id="prod-code-input"
                    type="text"
                    placeholder="Ex: PIZ-001"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white text-sm font-mono focus:outline-hidden focus:border-red-500"
                  />
                </div>
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="prod-category-select" className="text-xs font-bold text-stone-300">
                      Categoria Principal *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-[11px] text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                    >
                      + Gerenciar Categorias
                    </button>
                  </div>
                  <select
                    id="prod-category-select"
                    value={categoryId}
                    onChange={handleCategoryChange}
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white text-sm font-medium focus:outline-hidden focus:border-red-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                <div>
                  <label htmlFor="prod-subcategory-input" className="block text-xs font-bold text-stone-300 mb-1.5">
                    Subcategoria / Tipo
                  </label>
                  {currentCategory?.subcategories && currentCategory.subcategories.length > 0 ? (
                    <select
                      id="prod-subcategory-input"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white text-sm font-medium focus:outline-hidden focus:border-red-500"
                    >
                      {currentCategory.subcategories.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="prod-subcategory-input"
                      type="text"
                      placeholder="Ex: Tradicionais, Especiais, Premium"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-red-500"
                    />
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="prod-desc-textarea" className="block text-xs font-bold text-stone-300 mb-1.5">
                  Descrição do Produto / Ingredientes Visíveis
                </label>
                <textarea
                  id="prod-desc-textarea"
                  rows={3}
                  placeholder="Descreva os ingredientes saborosos, molho artesanal, recheio..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-red-500 resize-none"
                />
              </div>

              {/* Availability & Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Available switch */}
                <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Disponibilidade no Cardápio</h4>
                    <p className="text-[11px] text-stone-400">
                      Pausar este item se faltar ingredientes
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="prod-available-checkbox"
                      type="checkbox"
                      checked={available}
                      onChange={(e) => setAvailable(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Image Upload Area */}
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    Foto do Produto
                  </label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleImageDrop}
                    className="border-2 border-dashed border-stone-700 hover:border-red-500 rounded-2xl p-4 text-center bg-stone-950 transition"
                  >
                    {image ? (
                      <div className="relative inline-block group">
                        <img
                          src={image}
                          alt="Prévia do produto"
                          className="w-24 h-24 object-cover rounded-xl border border-stone-700 shadow-md"
                        />
                        <div className="mt-2 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-1.5 bg-stone-800 text-stone-200 rounded-lg text-xs font-medium hover:bg-stone-700 transition"
                          >
                            Alterar
                          </button>
                          <button
                            type="button"
                            onClick={() => setImage(undefined)}
                            className="p-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer space-y-2 py-3"
                      >
                        <div className="w-10 h-10 rounded-xl bg-stone-900 text-stone-400 flex items-center justify-center mx-auto">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <div className="text-xs text-stone-300 font-medium">
                          Clique ou arraste uma foto aqui
                        </div>
                        <p className="text-[10px] text-stone-500">
                          Compressão automática local no navegador
                        </p>
                      </div>
                    )}

                    <input
                      id="prod-image-file-input"
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageFile(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PREÇOS & TAMANHOS */}
          {activeTab === 'sizes' && (
            <div className="space-y-6">
              {/* Size Mode Switch */}
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Vender por Múltiplos Tamanhos</h4>
                  <p className="text-xs text-stone-400">
                    Ideal para pizzas com tamanhos (Broto, Média, Grande, Família)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs ${!hasSizes ? 'text-white font-bold' : 'text-stone-500'}`}>
                    Preço Único
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="prod-has-sizes-checkbox"
                      type="checkbox"
                      checked={hasSizes}
                      onChange={(e) => setHasSizes(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                  <span className={`text-xs ${hasSizes ? 'text-red-400 font-bold' : 'text-stone-500'}`}>
                    Múltiplos Tamanhos
                  </span>
                </div>
              </div>

              {!hasSizes ? (
                /* SINGLE PRICE FORM */
                <div className="bg-stone-950/60 p-6 rounded-2xl border border-stone-800 space-y-4">
                  <h4 className="text-sm font-bold text-white">Preço e Margem Única</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="prod-single-price-input" className="block text-xs font-bold text-stone-300 mb-1.5">
                        Preço de Venda (R$) *
                      </label>
                      <input
                        id="prod-single-price-input"
                        type="number"
                        step="0.10"
                        min="0"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-white text-base font-bold focus:outline-hidden focus:border-red-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="prod-single-cost-input" className="text-xs font-bold text-stone-300">
                          Custo do Produto (CMV) (R$)
                        </label>
                        {recipe.length > 0 && (
                          <button
                            type="button"
                            onClick={handleApplyRecipeCost}
                            className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Calculator className="w-3.5 h-3.5" /> Usar Ficha ({formatCurrency(costPerYield)})
                          </button>
                        )}
                      </div>
                      <input
                        id="prod-single-cost-input"
                        type="number"
                        step="0.10"
                        min="0"
                        value={cost}
                        onChange={(e) => setCost(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-white text-base font-medium focus:outline-hidden focus:border-red-500"
                      />
                    </div>
                  </div>

                  {/* Single Profit Stats */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 text-center">
                      <span className="text-[11px] text-stone-400 block font-semibold">Lucro Bruto</span>
                      <span className="text-base font-black text-emerald-400 font-mono">
                        {formatCurrency(Math.max(0, numPrice - numCost))}
                      </span>
                    </div>
                    <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 text-center">
                      <span className="text-[11px] text-stone-400 block font-semibold">Margem Bruta</span>
                      <span className="text-base font-black text-emerald-400 font-mono">
                        {formatPercent(singleMargin)}
                      </span>
                    </div>
                    <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 text-center">
                      <span className="text-[11px] text-stone-400 block font-semibold">Markup</span>
                      <span className="text-base font-black text-amber-400 font-mono">
                        {singleMarkup.toFixed(2)}x
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* MULTIPLE SIZES LIST */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Tamanhos e Preços</h4>
                      <p className="text-xs text-stone-400">
                        Cada tamanho possui seu próprio preço, fatias e limite de sabores
                      </p>
                    </div>
                    <button
                      id="add-size-row-btn"
                      type="button"
                      onClick={handleAddSize}
                      className="text-xs px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar Tamanho
                    </button>
                  </div>

                  <div className="space-y-3">
                    {sizes.map((s, idx) => {
                      const szMargin = calculateProfitMargin(s.price, s.cost);
                      return (
                        <div
                          key={s.id || idx}
                          className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                        >
                          <div className="md:col-span-4">
                            <label className="text-[10px] text-stone-400 font-bold block mb-1">Nome do Tamanho</label>
                            <input
                              type="text"
                              value={s.name}
                              onChange={(e) => handleUpdateSize(idx, 'name', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-white text-xs font-semibold"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="text-[10px] text-stone-400 font-bold block mb-1">Fatias</label>
                            <input
                              type="number"
                              min="1"
                              value={s.slices || 8}
                              onChange={(e) => handleUpdateSize(idx, 'slices', parseInt(e.target.value) || 1)}
                              className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-white text-xs"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="text-[10px] text-stone-400 font-bold block mb-1">Max Sabores</label>
                            <select
                              value={s.maxFlavors || 2}
                              onChange={(e) => handleUpdateSize(idx, 'maxFlavors', parseInt(e.target.value) || 1)}
                              className="w-full px-2 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-white text-xs font-semibold"
                            >
                              <option value={1}>1 sabor</option>
                              <option value={2}>2 sabores</option>
                              <option value={3}>3 sabores</option>
                              <option value={4}>4 sabores</option>
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="text-[10px] text-red-400 font-bold block mb-1">Preço Venda (R$)</label>
                            <input
                              type="number"
                              step="0.10"
                              min="0"
                              value={s.price}
                              onChange={(e) => handleUpdateSize(idx, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 bg-stone-900 border border-red-500/50 rounded-xl text-white text-xs font-bold"
                            />
                          </div>

                          <div className="md:col-span-1">
                            <label className="text-[10px] text-stone-400 font-bold block mb-1">Custo</label>
                            <input
                              type="number"
                              step="0.10"
                              min="0"
                              value={s.cost}
                              onChange={(e) => handleUpdateSize(idx, 'cost', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-white text-xs"
                            />
                          </div>

                          <div className="md:col-span-1 flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveSize(idx)}
                              className="p-2 text-stone-500 hover:text-red-400 hover:bg-stone-800 rounded-xl transition cursor-pointer"
                              title="Remover tamanho"
                              aria-label="Remover tamanho"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BORDAS & ADICIONAIS */}
          {activeTab === 'crusts' && (
            <div className="space-y-6">
              {/* Crusts list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Opções de Bordas Recheadas</h4>
                    <p className="text-xs text-stone-400">
                      Bordas disponíveis para seleção ao incluir este produto no pedido
                    </p>
                  </div>
                  <button
                    id="add-crust-row-btn"
                    type="button"
                    onClick={handleAddCrust}
                    className="text-xs px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Borda
                  </button>
                </div>

                <div className="space-y-2">
                  {crusts.map((crust, idx) => (
                    <div
                      key={crust.id || idx}
                      className="p-3 bg-stone-950 rounded-2xl border border-stone-800 flex items-center gap-3"
                    >
                      <input
                        type="text"
                        placeholder="Nome da Borda (Ex: Catupiry, Cheddar)"
                        value={crust.name}
                        onChange={(e) => handleUpdateCrust(idx, 'name', e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-white text-xs font-semibold"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-stone-400">Adicional:</span>
                        <input
                          type="number"
                          step="0.10"
                          min="0"
                          value={crust.price}
                          onChange={(e) => handleUpdateCrust(idx, 'price', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-white text-xs font-bold text-right"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCrust(idx)}
                        className="p-1.5 text-stone-500 hover:text-red-400 rounded-xl transition cursor-pointer"
                        aria-label="Remover borda"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Addons applicable */}
              <div className="pt-4 border-t border-stone-800 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Adicionais Permitidos</h4>
                  <p className="text-xs text-stone-400">
                    Selecione quais adicionais podem ser acrescentados a este produto
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {addons.map((add) => {
                    const isChecked = allowedAddonIds.includes(add.id);
                    return (
                      <label
                        key={add.id}
                        className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                          isChecked
                            ? 'bg-amber-500/10 border-amber-500/40 text-white'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        <div className="text-xs">
                          <span className="font-bold block">{add.name}</span>
                          <span className="text-amber-400 font-medium">+{formatCurrency(add.price)}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAllowedAddonIds((prev) => [...prev, add.id]);
                            } else {
                              setAllowedAddonIds((prev) => prev.filter((id) => id !== add.id));
                            }
                          }}
                          className="w-4 h-4 text-amber-500 rounded bg-stone-900 border-stone-700"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FICHA TÉCNICA & CMV */}
          {activeTab === 'recipe' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-stone-950 p-4 rounded-2xl border border-stone-800">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-red-500" />
                    Engenharia de Cardápio & Insumos da Receita
                  </h4>
                  <p className="text-xs text-stone-400">
                    Custo total da receita: <span className="font-extrabold text-amber-400 font-mono">{formatCurrency(costPerYield)}</span>
                  </p>
                </div>
                {totalRecipeCost > 0 && (
                  <button
                    type="button"
                    onClick={handleApplyRecipeCost}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-extrabold border border-amber-500/40 transition cursor-pointer"
                  >
                    Atualizar Custo do Produto
                  </button>
                )}
              </div>

              {/* Add Recipe Ingredient Row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-2xl bg-stone-950 border border-stone-800 items-end">
                <div className="sm:col-span-5">
                  <label htmlFor="modal-inv-select" className="block text-[11px] font-bold text-stone-400 mb-1">
                    Insumo do Estoque
                  </label>
                  <select
                    id="modal-inv-select"
                    value={selectedInvId}
                    onChange={(e) => setSelectedInvId(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none"
                  >
                    <option value="">-- Selecione um insumo --</option>
                    {inventory.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.name} ({formatCurrency(inv.cost)}/{inv.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="modal-inv-qty" className="block text-[11px] font-bold text-stone-400 mb-1">
                    Quantidade
                  </label>
                  <input
                    id="modal-inv-qty"
                    type="number"
                    step="any"
                    value={tempQuantity}
                    onChange={(e) => setTempQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="Ex: 250"
                    className="w-full bg-stone-900 border border-stone-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="modal-inv-unit" className="block text-[11px] font-bold text-stone-400 mb-1">
                    Unidade
                  </label>
                  <select
                    id="modal-inv-unit"
                    value={tempUnit}
                    onChange={(e) => setTempUnit(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none"
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
                    id="modal-add-ingredient-btn"
                    type="button"
                    onClick={handleAddRecipeIngredient}
                    className="w-full py-2 px-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 shadow-md shadow-red-600/20 active:scale-95 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>

              {/* Table of Recipe Ingredients */}
              {recipe.length === 0 ? (
                <div className="text-center py-6 px-4 rounded-2xl border border-dashed border-stone-800 text-stone-500 text-xs">
                  Nenhum ingrediente cadastrado na ficha técnica deste produto.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-stone-800 bg-stone-950 p-2">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-stone-800 text-stone-400 uppercase text-[10px] font-bold tracking-wider">
                        <th className="py-2.5 px-3">Ingrediente</th>
                        <th className="py-2.5 px-3">Quantidade</th>
                        <th className="py-2.5 px-3">Custo Unitário</th>
                        <th className="py-2.5 px-3 font-mono">Custo Total</th>
                        <th className="py-2.5 px-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60">
                      {recipe.map((item) => (
                        <tr key={item.id} className="hover:bg-stone-900/60 transition-colors">
                          <td className="py-2 px-3 font-semibold text-stone-200">{item.inventoryItemName}</td>
                          <td className="py-2 px-3 text-stone-300 font-mono">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="py-2 px-3 text-stone-400 font-mono">
                            {formatCurrency(item.unitCost)} / {item.unit}
                          </td>
                          <td className="py-2 px-3 font-bold text-amber-400 font-mono">
                            {formatCurrency(item.totalCost)}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveRecipeIngredient(item.id)}
                              className="p-1 text-stone-500 hover:text-red-400 transition cursor-pointer"
                              aria-label="Remover ingrediente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-stone-700 font-extrabold text-stone-100">
                        <td colSpan={3} className="py-2.5 px-3 text-right uppercase text-[11px] text-stone-400">
                          Custo Total da Receita:
                        </td>
                        <td className="py-2.5 px-3 text-amber-400 text-sm font-mono font-black">
                          {formatCurrency(totalRecipeCost)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Prep Time & Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modal-prep-time" className="block text-xs font-bold text-stone-300 mb-1.5">
                    Tempo de Preparo (minutos)
                  </label>
                  <input
                    id="modal-prep-time"
                    type="number"
                    value={prepTimeMinutes}
                    onChange={(e) => setPrepTimeMinutes(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label htmlFor="modal-yield-units" className="block text-xs font-bold text-stone-300 mb-1.5">
                    Rendimento da Receita
                  </label>
                  <input
                    id="modal-yield-units"
                    type="number"
                    min="1"
                    value={yieldUnits}
                    onChange={(e) => setYieldUnits(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="modal-recipe-instructions" className="block text-xs font-bold text-stone-300 mb-1.5">
                  Instruções da Cozinha / Modo de Preparo
                </label>
                <textarea
                  id="modal-recipe-instructions"
                  rows={2}
                  value={recipeInstructions}
                  onChange={(e) => setRecipeInstructions(e.target.value)}
                  placeholder="Ex: Abrir disco 35cm, espalhar 100ml de molho, cobrir com 250g mussarela..."
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white text-xs focus:outline-none focus:border-red-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 5: HISTÓRICO DE PREÇOS */}
          {activeTab === 'history' && editingProduct?.priceHistory && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white">Registro de Alterações de Preço</h4>
              <div className="space-y-2">
                {editingProduct.priceHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs text-stone-400 block">{formatDateTime(entry.changedAt)}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-stone-400 line-through text-xs">
                          {formatCurrency(entry.oldPrice)}
                        </span>
                        <span className="text-white font-bold text-sm">
                          &rarr; {formatCurrency(entry.newPrice)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      {entry.oldCost && entry.newCost && (
                        <span className="text-xs text-stone-400 block">
                          Custo: {formatCurrency(entry.oldCost)} &rarr; {formatCurrency(entry.newCost)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Footer Actions */}
          <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
            <button
              id="cancel-product-modal-btn"
              type="button"
              onClick={() => {
                setIsProductModalOpen(false);
                setEditingProduct(null);
              }}
              className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              id="submit-product-btn"
              type="submit"
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
