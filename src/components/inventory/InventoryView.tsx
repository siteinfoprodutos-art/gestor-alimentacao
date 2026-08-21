import React, { useState } from 'react';
import {
  AlertTriangle,
  Edit2,
  Minus,
  Package,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InventoryItem } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { InventoryModal } from './InventoryModal';

export const InventoryView: React.FC = () => {
  const { inventory, handleDeleteInventoryItem, handleAdjustStock, currentSegment } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  const lowStockCount = inventory.filter((i) => i.currentQuantity <= i.minQuantity).length;

  const filteredInventory = inventory.filter((item) => {
    const isLow = item.currentQuantity <= item.minQuantity;
    if (filterLowStockOnly && !isLow) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = (item: InventoryItem) => {
    setItemToDelete(item);
  };

  return (
    <div id="inventory-view" className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            📦 Controle de {currentSegment.terminology.inventoryLabel}
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Acompanhe insumos, ingredientes e matérias-primas do seu negócio ({currentSegment.name})
          </p>
        </div>

        <button
          id="inventory-add-btn"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm shadow-lg shadow-red-600/30 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>+ Novo Item</span>
        </button>
      </div>

      {/* Low stock alert banner */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-amber-300">
                Alerta: {lowStockCount} {lowStockCount === 1 ? 'item com Estoque Baixo' : 'itens com Estoque Baixo'}
              </div>
              <div className="text-xs text-amber-200/80">
                Estes insumos atingiram ou estão abaixo da quantidade mínima recomendada para a produção.
              </div>
            </div>
          </div>

          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterLowStockOnly
                ? 'bg-amber-500 text-stone-950 shadow'
                : 'bg-stone-800 text-amber-300 hover:bg-stone-700'
            }`}
          >
            {filterLowStockOnly ? 'Ver todos os itens' : 'Filtrar apenas estoque baixo'}
          </button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Buscar insumo, queijo, farinha, embalagem..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-stone-900 border border-stone-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
        />
      </div>

      {/* Inventory Items List / Table */}
      {filteredInventory.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-10 text-center text-stone-400 space-y-2">
          <p className="text-sm font-semibold text-white">Nenhum item de estoque encontrado.</p>
          <p className="text-xs">
            Clique em "+ Novo Item" para cadastrar ingredientes ou insumos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredInventory.map((item) => {
            const isLowStock = item.currentQuantity <= item.minQuantity;

            return (
              <div
                key={item.id}
                className={`bg-stone-900 border rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 shadow-md transition-all ${
                  isLowStock
                    ? 'border-amber-500/50 bg-amber-500/5'
                    : 'border-stone-800 hover:border-stone-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-stone-800">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-800 text-stone-300 border border-stone-700">
                      {item.category || 'Geral'}
                    </span>

                    {isLowStock ? (
                      <span className="flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Estoque Baixo</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-400">
                        Estoque Normal
                      </span>
                    )}
                  </div>

                  <div className="pt-2">
                    <h3 className="font-heading font-extrabold text-base text-white">
                      {item.name}
                    </h3>
                    <div className="text-xs text-stone-400 mt-0.5">
                      Custo Unitário: {formatCurrency(item.cost)} / {item.unit}
                    </div>
                  </div>
                </div>

                {/* Stock Level Bar & Counters */}
                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-stone-400 uppercase font-semibold">Quantidade Atual</div>
                      <div
                        className={`font-heading font-extrabold text-xl ${
                          isLowStock ? 'text-amber-400' : 'text-white'
                        }`}
                      >
                        {item.currentQuantity} <span className="text-sm font-normal text-stone-400">{item.unit}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-stone-400 uppercase font-semibold">Mínimo</div>
                      <div className="font-bold text-stone-300 text-sm">
                        {item.minQuantity} {item.unit}
                      </div>
                    </div>
                  </div>

                  {/* Inline quick adjustment buttons (+1, -1, +5, -5) */}
                  <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-1">
                    <span className="text-[10px] font-semibold text-stone-400">Ajuste Rápido:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAdjustStock(item.id, -1)}
                        className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 font-bold text-xs border border-stone-700 cursor-pointer"
                        title="Subtrair 1"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => handleAdjustStock(item.id, 1)}
                        className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 font-bold text-xs border border-stone-700 cursor-pointer"
                        title="Adicionar 1"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleAdjustStock(item.id, 5)}
                        className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 text-emerald-400 font-bold text-xs border border-stone-700 cursor-pointer"
                        title="Adicionar 5"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2 rounded-xl bg-stone-800 hover:bg-red-950/40 text-stone-400 hover:text-red-400 border border-stone-700 transition-colors cursor-pointer"
                    title="Excluir item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <InventoryModal
        item={editingItem}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* Confirmation Modal for Delete */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 text-red-500 pb-3 border-b border-stone-800">
              <div className="p-2.5 bg-red-500/10 rounded-2xl border border-red-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Excluir Item do Estoque</h3>
                <p className="text-xs text-stone-400">Esta ação não poderá ser desfeita.</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Tem certeza que deseja remover o item <strong className="text-white">"{itemToDelete.name}"</strong> do seu estoque?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = itemToDelete.id;
                  setItemToDelete(null);
                  await handleDeleteInventoryItem(id);
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/20 cursor-pointer"
              >
                Sim, Excluir Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
