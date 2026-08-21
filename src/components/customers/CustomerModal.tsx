import React, { useEffect, useState } from 'react';
import { Check, User, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';

interface CustomerModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({ customer, isOpen, onClose }) => {
  const { handleSaveCustomer } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
      setAddress(customer.address || '');
      setNeighborhood(customer.neighborhood || '');
      setCity(customer.city || '');
      setNotes(customer.notes || '');
    } else {
      setName('');
      setPhone('');
      setAddress('');
      setNeighborhood('');
      setCity('');
      setNotes('');
    }
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Informe o nome do cliente.');
      return;
    }

    if (!phone.trim()) {
      alert('Informe o telefone do cliente.');
      return;
    }

    const custToSave: Customer = {
      id: customer ? customer.id : `cust-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      neighborhood: neighborhood.trim() || undefined,
      city: city.trim() || undefined,
      notes: notes.trim() || undefined,
      totalOrders: customer ? customer.totalOrders : 0,
      totalSpent: customer ? customer.totalSpent : 0,
      lastOrderDate: customer ? customer.lastOrderDate : undefined,
      createdAt: customer ? customer.createdAt : new Date().toISOString(),
    };

    await handleSaveCustomer(custToSave);
    onClose();
  };

  return (
    <div
      id="customer-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        id="customer-modal"
        className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 text-stone-100 max-w-md w-full shadow-2xl space-y-4 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                {customer ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
              <p className="text-xs text-stone-400">Cadastro de clientes e endereços</p>
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
              Nome Completo *
            </label>
            <input
              type="text"
              placeholder="Ex: Carlos Eduardo Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-300 block mb-1">
              Telefone / WhatsApp *
            </label>
            <input
              type="text"
              placeholder="(11) 98765-4321"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-300 block mb-1">
              Endereço Principal
            </label>
            <input
              type="text"
              placeholder="Rua, número e complemento"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">Bairro</label>
              <input
                type="text"
                placeholder="Ex: Bela Vista"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">Cidade</label>
              <input
                type="text"
                placeholder="Ex: São Paulo"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-300 block mb-1">
              Observações / Preferências
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Interfone 42, prefere massa fina, sempre pede borda de catupiry..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-500 resize-none"
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
              <span>Salvar Cliente</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
