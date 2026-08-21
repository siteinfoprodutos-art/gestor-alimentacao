import React, { useState, useEffect } from 'react';
import { X, DollarSign, Wallet, Calendar, FileText, Tag, CreditCard } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Transaction, TransactionCategory, ExpenseCategory, PaymentMethod } from '../../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'income' | 'expense';
  editingTransaction?: Transaction | null;
}

const defaultExpenseCategories = [
  'Ingredientes', 'Embalagens', 'Aluguel', 'Energia', 'Água', 
  'Internet', 'Funcionários', 'Marketing', 'Manutenção', 
  'Transporte', 'Impostos', 'Outros'
];

export const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  type,
  editingTransaction 
}) => {
  const { handleSaveTransaction } = useApp();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<TransactionCategory>(
    type === 'income' ? 'Vendas' : 'Ingredientes'
  );
  const [customCategory, setCustomCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount.toString());
      setDate(editingTransaction.date.split('T')[0]);
      setCategory(editingTransaction.category);
      setPaymentMethod(editingTransaction.paymentMethod || 'Pix');
      setNotes(editingTransaction.notes || '');
      
      if (type === 'expense' && !defaultExpenseCategories.includes(editingTransaction.category as string)) {
        setCustomCategory(editingTransaction.category);
        setCategory('Outros'); // Treat as 'Outros' in dropdown, but we will save customCategory
      }
    } else {
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory(type === 'income' ? 'Outros' : 'Ingredientes'); // Default to Outros for manual income
      setCustomCategory('');
      setPaymentMethod('Pix');
      setNotes('');
    }
  }, [editingTransaction, type, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date) return;
    
    let finalCategory = category;
    if (type === 'expense' && category === 'Outros' && customCategory) {
      finalCategory = customCategory;
    }

    const tx: Transaction = {
      id: editingTransaction?.id || `tx-${Date.now()}`,
      type,
      description,
      amount: parseFloat(amount),
      category: finalCategory,
      paymentMethod,
      date: new Date(`${date}T12:00:00Z`).toISOString(), // Keep it mid-day to avoid timezone shifting
      notes,
      orderId: editingTransaction?.orderId,
      isDemo: false
    };

    await handleSaveTransaction(tx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 text-stone-100 max-w-md w-full shadow-2xl my-auto">
        <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-5">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {type === 'income' ? <Wallet className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
            </div>
            <h2 className="font-heading font-bold text-xl">
              {editingTransaction ? 'Editar ' : 'Nova '}
              {type === 'income' ? 'Receita' : 'Despesa'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-stone-400 mb-1.5 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> Descrição
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === 'income' ? 'Ex: Venda avulsa, Serviço' : 'Ex: Compra de Queijo, Internet'}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-400 mb-1.5 flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" /> Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-400 mb-1.5 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> Data
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-400 mb-1.5 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" /> Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
              >
                {type === 'income' ? (
                  <>
                    <option value="Vendas">Vendas</option>
                    <option value="Serviços">Serviços</option>
                    <option value="Outros">Outros</option>
                  </>
                ) : (
                  <>
                    {defaultExpenseCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-400 mb-1.5 flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5" /> Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="Pix">Pix</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>

          {type === 'expense' && category === 'Outros' && (
            <div className="animate-fade-in">
              <label className="text-xs font-semibold text-stone-400 mb-1.5 block">
                Nome da Categoria (Personalizada)
              </label>
              <input
                type="text"
                required
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Ex: Assinatura de Software"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-stone-400 mb-1.5 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> Observação (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalhes adicionais..."
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 ${
                type === 'income' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              {type === 'income' ? <Wallet className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
              Salvar {type === 'income' ? 'Receita' : 'Despesa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
