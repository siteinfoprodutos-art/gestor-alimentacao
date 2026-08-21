import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Filter,
  Copy,
  Edit2,
  Trash2,
  Folder,
  Layers,
  Gift,
  ArrowUpDown,
  Sparkles,
  Archive,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ChefHat,
  Utensils,
  Calculator,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import {
  calculateProfitMargin,
  formatCurrency,
  formatPercent,
} from '../../utils/formatters';
import { ProductModal } from './ProductModal';
import { CategoryManagerModal } from './CategoryManagerModal';
import { AddonManagerModal } from './AddonManagerModal';
import { ComboModal } from './ComboModal';
import { RecipeManagerModal } from './RecipeManagerModal';

export const ProductsView: React.FC = () => {
  const {
    products,
    categories,
    addons,
    combos,
    currentSegment,
    setIsProductModalOpen,
    setEditingProduct,
    setIsCategoryModalOpen,
    setIsAddonModalOpen,
    setIsComboModalOpen,
    handleDuplicateProduct,
    handleDeleteProduct,
    handleToggleProductAvailability,
    showToast,
  } = useApp();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable' | 'archived'>('all');
  const [recipeFilter, setRecipeFilter] = useState<'all' | 'with-recipe' | 'without-recipe'>('all');
  const [priceRangeFilter, setPriceRangeFilter] = useState<'all' | 'under30' | '30to60' | 'above60'>('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'recent'>('name-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Recipe Manager Modal State
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [selectedProductForRecipe, setSelectedProductForRecipe] = useState<string | undefined>(undefined);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Archive status
        if (availabilityFilter === 'archived') {
          if (!product.isArchived) return false;
        } else {
          if (product.isArchived) return false;
        }

        // Search text: Name, Code, Category, Ingredients
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = product.name.toLowerCase().includes(q);
          const matchCode = (product.code || '').toLowerCase().includes(q);
          const matchCat = product.category.toLowerCase().includes(q);
          const matchDesc = (product.description || '').toLowerCase().includes(q);
          if (!matchName && !matchCode && !matchCat && !matchDesc) return false;
        }

        // Category Filter
        if (selectedCategory !== 'all') {
          const matchCatId = product.categoryId === selectedCategory;
          const matchCatName = product.category === selectedCategory;
          if (!matchCatId && !matchCatName) return false;
        }

        // Availability Filter
        if (availabilityFilter === 'available' && !product.available) return false;
        if (availabilityFilter === 'unavailable' && product.available) return false;

        // Recipe Filter
        if (recipeFilter === 'with-recipe' && (!product.recipe || product.recipe.length === 0)) return false;
        if (recipeFilter === 'without-recipe' && product.recipe && product.recipe.length > 0) return false;

        // Price Range Filter
        if (priceRangeFilter === 'under30' && product.price >= 30) return false;
        if (priceRangeFilter === '30to60' && (product.price < 30 || product.price > 60)) return false;
        if (priceRangeFilter === 'above60' && product.price <= 60) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'recent') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
  }, [
    products,
    searchTerm,
    selectedCategory,
    availabilityFilter,
    recipeFilter,
    priceRangeFilter,
    sortBy,
  ]);

  // Actions
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  const handleOpenRecipeForProduct = (prodId: string) => {
    setSelectedProductForRecipe(prodId);
    setIsRecipeModalOpen(true);
  };

  const handleDuplicate = async (prod: Product) => {
    await handleDuplicateProduct(prod.id);
  };

  const handleDeleteWithConfirm = (prod: Product) => {
    setProductToDelete(prod);
  };

  return (
    <div id="products-view" className="space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {currentSegment.terminology.productPlural} & Catálogo
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
              {filteredProducts.length} itens
            </span>
          </div>
          <p className="text-sm text-stone-400 mt-1">
            Gerencie {currentSegment.terminology.productPlural.toLowerCase()}, preços, categorias e configurações para o segmento de {currentSegment.name}.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {currentSegment.features.hasTechnicalSheet && (
            <button
              id="open-recipes-manager-btn"
              type="button"
              onClick={() => {
                setSelectedProductForRecipe(undefined);
                setIsRecipeModalOpen(true);
              }}
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-stone-200 rounded-xl text-xs font-bold border border-stone-700/80 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <ChefHat className="w-4 h-4 text-red-500" />
              Fichas Técnicas & CMV
            </button>
          )}

          <button
            id="open-categories-modal-btn"
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-xl text-xs font-semibold border border-stone-700/80 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Folder className="w-3.5 h-3.5 text-red-400" />
            Categorias ({categories.length})
          </button>

          {currentSegment.features.hasAddons && (
            <button
              id="open-addons-modal-btn"
              type="button"
              onClick={() => setIsAddonModalOpen(true)}
              className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-xl text-xs font-semibold border border-stone-700/80 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Adicionais ({addons.length})
            </button>
          )}

          {currentSegment.features.hasCombos && (
            <button
              id="open-combos-modal-btn"
              type="button"
              onClick={() => setIsComboModalOpen(true)}
              className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-xl text-xs font-semibold border border-stone-700/80 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 text-emerald-400" />
              Combos ({combos.length})
            </button>
          )}

          <button
            id="new-product-btn"
            type="button"
            onClick={handleOpenNewProduct}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center gap-2 shadow-lg shadow-red-600/25 ml-auto sm:ml-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo {currentSegment.terminology.productSingular}
          </button>
        </div>
      </div>

      {/* Category Pills (Horizontal Scroll) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-stone-800">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800 hover:bg-stone-850'
          }`}
        >
          <span>🔥</span> Todos ({products.filter((p) => !p.isArchived).length})
        </button>

        {categories.map((cat) => {
          const count = products.filter((p) => !p.isArchived && (p.categoryId === cat.id || p.category === cat.name)).length;
          const isSelected = selectedCategory === cat.id || selectedCategory === cat.name;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800 hover:bg-stone-850'
              }`}
            >
              <span>{cat.icon || '🍕'}</span>
              <span>{cat.name}</span>
              <span className="text-[10px] opacity-75 font-normal">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search & Secondary Filter Toolbar */}
      <div className="bg-stone-900/90 border border-stone-800 p-3.5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="product-search-input"
            type="text"
            placeholder="Buscar por nome, categoria ou código SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-stone-700/80 rounded-xl text-white text-xs placeholder:text-stone-500 focus:outline-hidden focus:border-red-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white text-xs"
              aria-label="Limpar busca"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Recipe Filter */}
          <select
            id="product-recipe-filter-select"
            value={recipeFilter}
            onChange={(e: any) => setRecipeFilter(e.target.value)}
            className="px-3 py-2 bg-stone-950 border border-stone-700/80 rounded-xl text-stone-300 text-xs focus:outline-hidden focus:border-red-500"
          >
            <option value="all">Ficha Técnica: Todas</option>
            <option value="with-recipe">Com Ficha Técnica</option>
            <option value="without-recipe">Sem Ficha Técnica</option>
          </select>

          {/* Availability Filter */}
          <select
            id="product-availability-filter-select"
            value={availabilityFilter}
            onChange={(e: any) => setAvailabilityFilter(e.target.value)}
            className="px-3 py-2 bg-stone-950 border border-stone-700/80 rounded-xl text-stone-300 text-xs focus:outline-hidden focus:border-red-500"
          >
            <option value="all">Status: Todos</option>
            <option value="available">Apenas Disponíveis</option>
            <option value="unavailable">Apenas Pausados</option>
            <option value="archived">Arquivados (Lixeira)</option>
          </select>

          {/* Price Range Filter */}
          <select
            id="product-price-filter-select"
            value={priceRangeFilter}
            onChange={(e: any) => setPriceRangeFilter(e.target.value)}
            className="px-3 py-2 bg-stone-950 border border-stone-700/80 rounded-xl text-stone-300 text-xs focus:outline-hidden focus:border-red-500 hidden sm:block"
          >
            <option value="all">Faixa: Todas</option>
            <option value="under30">Até R$ 30</option>
            <option value="30to60">R$ 30 a R$ 60</option>
            <option value="above60">Acima de R$ 60</option>
          </select>

          {/* Sort Selector */}
          <select
            id="product-sort-select"
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-stone-950 border border-stone-700/80 rounded-xl text-stone-300 text-xs focus:outline-hidden focus:border-red-500"
          >
            <option value="name-asc">Nome (A &rarr; Z)</option>
            <option value="name-desc">Nome (Z &rarr; A)</option>
            <option value="price-asc">Menor Preço</option>
            <option value="price-desc">Maior Preço</option>
            <option value="recent">Mais Recentes</option>
          </select>

          {/* View Mode Toggle (Grid / List) */}
          <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-700/80">
            <button
              id="product-grid-view-btn"
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-stone-800 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Visualização em Grade"
              aria-label="Visualização em Grade"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="product-list-view-btn"
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-stone-800 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Visualização em Tabela"
              aria-label="Visualização em Tabela"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16 bg-stone-900/50 border border-stone-800 rounded-3xl p-8">
          <div className="w-14 h-14 rounded-2xl bg-stone-800 text-stone-500 flex items-center justify-center mx-auto mb-3 text-2xl">
            🍕
          </div>
          <h3 className="text-base font-bold text-white">Nenhum produto encontrado</h3>
          <p className="text-xs text-stone-400 max-w-md mx-auto mt-1 mb-4">
            {searchTerm
              ? `Nenhum resultado para "${searchTerm}". Tente ajustar os filtros ou pesquisar por outro termo.`
              : 'Comece adicionando novos sabores e itens ao seu cardápio.'}
          </p>
          <button
            type="button"
            onClick={handleOpenNewProduct}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Cadastrar Primeiro Produto
          </button>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((prod) => {
            const hasMultipleSizes = prod.hasSizes && prod.sizes && prod.sizes.length > 0;
            const minPrice = hasMultipleSizes
              ? Math.min(...prod.sizes!.map((s) => s.price))
              : prod.price;
            const maxPrice = hasMultipleSizes
              ? Math.max(...prod.sizes!.map((s) => s.price))
              : prod.price;

            const margin = calculateProfitMargin(prod.price, prod.cost);
            const hasRecipe = prod.recipe && prod.recipe.length > 0;

            return (
              <div
                key={prod.id}
                className={`bg-stone-900 border rounded-3xl overflow-hidden flex flex-col justify-between transition group hover:shadow-xl hover:border-stone-700 ${
                  !prod.available ? 'opacity-70 border-stone-850' : 'border-stone-800'
                }`}
              >
                {/* Card Top: Photo or Icon Banner */}
                <div className="relative h-40 bg-stone-950 overflow-hidden flex items-center justify-center">
                  {prod.image ? (
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-stone-600">
                      <span className="text-4xl">
                        {categories.find((c) => c.id === prod.categoryId || c.name === prod.category)?.icon || '🍕'}
                      </span>
                    </div>
                  )}

                  {/* SKU Tag */}
                  {prod.code && (
                    <span className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-xs text-[10px] font-mono text-stone-300 px-2 py-0.5 rounded-md border border-stone-700">
                      {prod.code}
                    </span>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <button
                      type="button"
                      onClick={() => handleToggleProductAvailability(prod.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md transition flex items-center gap-1 cursor-pointer ${
                        prod.available
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                      }`}
                      title="Clique para alternar disponibilidade"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          prod.available ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                        }`}
                      />
                      {prod.available ? 'Disponível' : 'Pausado'}
                    </button>
                  </div>

                  {/* Category Pill at bottom of image */}
                  <div className="absolute bottom-2 left-3">
                    <span className="bg-stone-900/90 text-stone-300 text-[10px] font-medium px-2 py-0.5 rounded-md border border-stone-800">
                      {prod.category} {prod.subCategory ? `• ${prod.subCategory}` : ''}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight group-hover:text-red-400 transition">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-stone-400 mt-1 line-clamp-2 min-h-[32px]">
                      {prod.description || 'Sem descrição cadastrada.'}
                    </p>
                  </div>

                  {/* Sizes / Price Info */}
                  <div className="pt-2 border-t border-stone-800/80 space-y-2">
                    {hasMultipleSizes ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-400 font-medium">A partir de:</span>
                          <span className="text-base font-bold text-white">
                            {formatCurrency(minPrice)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {prod.sizes!.map((s, i) => (
                            <span
                              key={s.id || i}
                              className="text-[10px] bg-stone-950 text-stone-400 border border-stone-800 px-1.5 py-0.5 rounded-md"
                            >
                              {s.name}: <strong className="text-stone-200">{formatCurrency(s.price)}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-400 font-medium">Preço de Venda:</span>
                        <span className="text-base font-bold text-white">{formatCurrency(prod.price)}</span>
                      </div>
                    )}

                    {/* Cost and Margin */}
                    <div className="flex items-center justify-between text-[11px] text-stone-400 bg-stone-950 px-2.5 py-1.5 rounded-xl border border-stone-850">
                      <span>Custo: {formatCurrency(prod.cost || 0)}</span>
                      <span className="font-semibold text-emerald-400">
                        Margem: {formatPercent(margin)}
                      </span>
                    </div>

                    {/* Ficha Técnica Indicator */}
                    <button
                      type="button"
                      onClick={() => handleOpenRecipeForProduct(prod.id)}
                      className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        hasRecipe
                          ? 'bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800'
                          : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      <ChefHat className="w-3.5 h-3.5 text-red-400" />
                      <span>{hasRecipe ? `Ficha Técnica (${prod.recipe!.length} insumos)` : '+ Criar Ficha Técnica'}</span>
                    </button>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-4 py-3 bg-stone-950/80 border-t border-stone-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleDuplicate(prod)}
                    className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition cursor-pointer"
                    title="Duplicar Produto"
                    aria-label="Duplicar Produto"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDeleteWithConfirm(prod)}
                      className="p-2 text-stone-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition cursor-pointer"
                      title="Excluir"
                      aria-label="Excluir Produto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEditProduct(prod)}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && filteredProducts.length > 0 && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-950 border-b border-stone-800 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Preço Venda</th>
                  <th className="py-3 px-4">Custo</th>
                  <th className="py-3 px-4">Margem</th>
                  <th className="py-3 px-4">Ficha Técnica</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredProducts.map((prod) => {
                  const hasSizes = prod.hasSizes && prod.sizes && prod.sizes.length > 0;
                  const margin = calculateProfitMargin(prod.price, prod.cost);
                  const hasRecipe = prod.recipe && prod.recipe.length > 0;

                  return (
                    <tr key={prod.id} className="hover:bg-stone-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {prod.image ? (
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-9 h-9 rounded-xl object-cover border border-stone-700"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-stone-950 flex items-center justify-center text-base border border-stone-800">
                              🍕
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-white text-sm block">{prod.name}</span>
                            {prod.code && (
                              <span className="text-[10px] font-mono text-stone-500">
                                SKU: {prod.code}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-stone-300">
                        <span className="bg-stone-950 px-2 py-1 rounded-lg border border-stone-800 text-xs">
                          {prod.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white text-sm font-mono">
                        {hasSizes ? `A partir de ${formatCurrency(prod.sizes![0].price)}` : formatCurrency(prod.price)}
                      </td>
                      <td className="py-3 px-4 text-stone-400 font-mono">
                        {formatCurrency(prod.cost || 0)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-emerald-400 font-mono">
                          {formatPercent(margin)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleOpenRecipeForProduct(prod.id)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                            hasRecipe
                              ? 'bg-stone-950 text-stone-300 border border-stone-800 hover:bg-stone-800'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
                          }`}
                        >
                          <ChefHat className="w-3.5 h-3.5 text-red-400" />
                          <span>{hasRecipe ? `${prod.recipe!.length} insumos` : 'Criar Ficha'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleProductAvailability(prod.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                            prod.available
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}
                        >
                          {prod.available ? 'Disponível' : 'Pausado'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleDuplicate(prod)}
                            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition cursor-pointer"
                            title="Duplicar"
                            aria-label="Duplicar"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditProduct(prod)}
                            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition cursor-pointer"
                            title="Editar"
                            aria-label="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteWithConfirm(prod)}
                            className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                            title="Excluir"
                            aria-label="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product, Category, Addon, Combo & Recipe Modals */}
      <ProductModal />
      <CategoryManagerModal />
      <AddonManagerModal />
      <ComboModal />
      <RecipeManagerModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        initialProductId={selectedProductForRecipe}
      />

      {/* Confirmation Modal for Product Delete */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 text-red-500 pb-3 border-b border-stone-800">
              <div className="p-2.5 bg-red-500/10 rounded-2xl border border-red-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Remover {currentSegment.terminology.productSingular}</h3>
                <p className="text-xs text-stone-400">Ação de exclusão do catálogo</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-stone-300 leading-relaxed">
                Deseja remover <strong className="text-white">"{productToDelete.name}"</strong>?
              </p>
              <p className="text-[11px] text-stone-400 bg-stone-950 p-3 rounded-xl border border-stone-800 leading-relaxed">
                <strong>Nota:</strong> Se já existirem vendas associadas a este item, ele será arquivado automaticamente para preservar seu histórico financeiro e relatórios.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = productToDelete.id;
                  setProductToDelete(null);
                  await handleDeleteProduct(id);
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/20 cursor-pointer"
              >
                Sim, Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
