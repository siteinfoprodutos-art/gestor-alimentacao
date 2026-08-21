import React, { useState } from 'react';
import { Plus, Trash2, X, Folder, Edit2, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Category } from '../../types';

const PRESET_ICONS = ['🍕', '🥤', '🍰', '🍟', '🎁', '➕', '🥪', '🥗', '🍺', '🍝', '🥩', '🧀', '☕'];
const PRESET_COLORS = ['#ef4444', '#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#64748b'];

export const CategoryManagerModal: React.FC = () => {
  const { isCategoryModalOpen, setIsCategoryModalOpen, categories, handleSaveCategory, handleDeleteCategory, showToast } = useApp();

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🍕');
  const [color, setColor] = useState('#ef4444');
  const [subcategoriesStr, setSubcategoriesStr] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);

  if (!isCategoryModalOpen) return null;

  const handleStartEdit = (cat: Category) => {
    setEditingCatId(cat.id);
    setName(cat.name);
    setIcon(cat.icon || '🍕');
    setColor(cat.color || '#ef4444');
    setSubcategoriesStr((cat.subcategories || []).join(', '));
  };

  const handleResetForm = () => {
    setEditingCatId(null);
    setName('');
    setIcon('🍕');
    setColor('#ef4444');
    setSubcategoriesStr('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Informe o nome da categoria.', 'warning');
      return;
    }

    const subcats = subcategoriesStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const category: Category = {
      id: editingCatId || `cat-${Date.now()}`,
      name: name.trim(),
      icon,
      color,
      subcategories: subcats,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    await handleSaveCategory(category);
    handleResetForm();
  };

  const handleDelete = (id: string, catName: string) => {
    setCategoryToDelete({ id, name: catName });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-xl">
              📂
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Gerenciar Categorias</h2>
              <p className="text-xs text-neutral-400">Organize o cardápio por categorias e subcategorias</p>
            </div>
          </div>
          <button
            onClick={() => {
              handleResetForm();
              setIsCategoryModalOpen(false);
            }}
            className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 bg-neutral-950/50 p-4 rounded-xl border border-neutral-800/80">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              {editingCatId ? <Edit2 className="w-4 h-4 text-red-400" /> : <Plus className="w-4 h-4 text-red-400" />}
              {editingCatId ? 'Editar Categoria' : 'Nova Categoria'}
            </h3>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">Nome da Categoria *</label>
              <input
                type="text"
                required
                placeholder="Ex: Pizzas, Bebidas, Calzones..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-red-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">Ícone / Emoji</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {PRESET_ICONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`w-9 h-9 text-lg rounded-lg flex items-center justify-center transition ${
                      icon === i ? 'bg-red-600 scale-110 shadow-md shadow-red-600/30' : 'bg-neutral-800 hover:bg-neutral-700'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Ou digite outro emoji..."
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">Cor de Destaque</label>
              <div className="flex items-center gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full transition ${color === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">Subcategorias (separadas por vírgula)</label>
              <input
                type="text"
                placeholder="Ex: Tradicionais, Especiais, Doces"
                value={subcategoriesStr}
                onChange={(e) => setSubcategoriesStr(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-red-500 transition"
              />
              <p className="text-[11px] text-neutral-500 mt-1">Ex: Tradicionais, Especiais, Doces, Premium</p>
            </div>

            <div className="flex gap-2 pt-2">
              {editingCatId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-sm font-medium transition"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/20"
              >
                <Check className="w-4 h-4" />
                {editingCatId ? 'Salvar Alterações' : 'Criar Categoria'}
              </button>
            </div>
          </form>

          {/* List of existing categories */}
          <div className="space-y-2 overflow-y-auto max-h-[420px] pr-1">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center justify-between">
              <span>Categorias Existentes ({categories.length})</span>
            </h3>

            {categories.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-sm">Nenhuma categoria cadastrada.</div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`p-3 rounded-xl border transition flex items-center justify-between ${
                    editingCatId === cat.id
                      ? 'bg-red-500/10 border-red-500/50'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${cat.color || '#ef4444'}20`, color: cat.color || '#ef4444' }}
                    >
                      {cat.icon || '🍕'}
                    </span>
                    <div>
                      <div className="font-semibold text-white text-sm flex items-center gap-2">
                        {cat.name}
                      </div>
                      {cat.subcategories && cat.subcategories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {cat.subcategories.map((sub, idx) => (
                            <span key={idx} className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded-md">
                              {sub}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat)}
                      className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
                      title="Editar categoria"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      title="Excluir categoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
              setIsCategoryModalOpen(false);
            }}
            className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm font-medium transition"
          >
            Fechar
          </button>
        </div>
      </div>

      {categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500 pb-3 border-b border-stone-800">
              <div className="p-2.5 bg-red-500/10 rounded-2xl border border-red-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Excluir Categoria</h3>
                <p className="text-xs text-stone-400">Esta ação não poderá ser desfeita.</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Tem certeza que deseja remover a categoria <strong className="text-white">"{categoryToDelete.name}"</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const { id } = categoryToDelete;
                  setCategoryToDelete(null);
                  await handleDeleteCategory(id);
                  if (editingCatId === id) {
                    handleResetForm();
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/20 cursor-pointer"
              >
                Sim, Excluir Categoria
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
