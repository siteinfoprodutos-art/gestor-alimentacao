import React, { useState } from 'react';
import {
  Edit2,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { formatCurrency, formatDate, openWhatsAppLink } from '../../utils/formatters';
import { CustomerModal } from './CustomerModal';

export const CustomersView: React.FC = () => {
  const { customers, handleDeleteCustomer, settings } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.address || '').toLowerCase().includes(q) ||
      (c.neighborhood || '').toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setModalOpen(true);
  };

  const handleDelete = (c: Customer) => {
    setCustomerToDelete(c);
  };

  const handleDirectWhatsApp = (c: Customer) => {
    const greeting = `Olá, ${c.name}! Tudo bem? Aqui é da ${settings?.name || 'nossa loja'}. Como podemos te ajudar hoje?`;
    openWhatsAppLink(c.phone, greeting);
  };

  return (
    <div id="customers-view" className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            👥 Clientes
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Histórico de pedidos, contatos e endereços para entrega
          </p>
        </div>

        <button
          id="customers-add-btn"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm shadow-lg shadow-red-600/30 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>+ Novo Cliente</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Buscar cliente por nome, telefone, bairro ou endereço..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-stone-900 border border-stone-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
        />
      </div>

      {/* Customers List / Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-10 text-center text-stone-400 space-y-2">
          <p className="text-sm font-semibold text-white">Nenhum cliente encontrado.</p>
          <p className="text-xs">
            Clientes são criados automaticamente ao lançar pedidos ou manualmente em "+ Novo Cliente".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredCustomers.map((c) => (
            <div
              key={c.id}
              className="bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 shadow-md transition-all"
            >
              <div>
                {/* Header: Name & WhatsApp */}
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-stone-800">
                  <div>
                    <h3 className="font-heading font-extrabold text-base text-white">
                      {c.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-stone-500" />
                      <span>{c.phone}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDirectWhatsApp(c)}
                    className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors border border-emerald-500/30"
                    title="Conversar no WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>

                {/* Address & Notes */}
                <div className="pt-2 space-y-1.5 text-xs text-stone-300">
                  {c.address ? (
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>
                        {c.address} {c.neighborhood ? `• ${c.neighborhood}` : ''} {c.city ? `(${c.city})` : ''}
                      </span>
                    </div>
                  ) : (
                    <div className="text-stone-500 italic text-[11px]">
                      Nenhum endereço de entrega cadastrado
                    </div>
                  )}

                  {c.notes && (
                    <div className="p-2 rounded-xl bg-stone-950 text-amber-300/90 text-[11px] italic">
                      Obs: {c.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="pt-3 border-t border-stone-800 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center bg-stone-950 p-2.5 rounded-xl text-xs">
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase font-semibold">Pedidos</div>
                    <div className="font-extrabold text-white">{c.totalOrders || 0}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase font-semibold">Total Gasto</div>
                    <div className="font-extrabold text-red-400">{formatCurrency(c.totalSpent || 0)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase font-semibold">Último Pedido</div>
                    <div className="font-bold text-stone-300 text-[11px] truncate">
                      {formatDate(c.lastOrderDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => handleDelete(c)}
                    className="p-2 rounded-xl bg-stone-800 hover:bg-red-950/40 text-stone-400 hover:text-red-400 border border-stone-700 transition-colors cursor-pointer"
                    title="Excluir cliente"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <CustomerModal
        customer={editingCustomer}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* Confirmation Modal for Delete */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 text-red-500 pb-3 border-b border-stone-800">
              <div className="p-2.5 bg-red-500/10 rounded-2xl border border-red-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Excluir Cliente</h3>
                <p className="text-xs text-stone-400">Esta ação remove o cadastro do cliente.</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Tem certeza que deseja excluir o cliente <strong className="text-white">"{customerToDelete.name}"</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = customerToDelete.id;
                  setCustomerToDelete(null);
                  await handleDeleteCustomer(id);
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/20 cursor-pointer"
              >
                Sim, Excluir Cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
