import React, { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  X,
  Send,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateWhatsAppOrderMessage, openWhatsAppLink } from '../../utils/formatters';

export const WhatsAppShareModal: React.FC = () => {
  const { orderForWhatsApp, setOrderForWhatsApp, settings, showToast } = useApp();
  const [templateType, setTemplateType] = useState<'confirmation' | 'ready' | 'delivery' | 'completed'>('confirmation');
  const [copied, setCopied] = useState(false);

  if (!orderForWhatsApp || !settings) return null;

  const messageText = generateWhatsAppOrderMessage(orderForWhatsApp, settings, templateType);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    showToast('Mensagem copiada para a área de transferência!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    openWhatsAppLink(orderForWhatsApp.customerPhone, messageText);
  };

  return (
    <div
      id="whatsapp-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={() => setOrderForWhatsApp(null)}
    >
      <div
        id="whatsapp-modal"
        className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 text-stone-100 max-w-lg w-full shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                WhatsApp — Pedido #{orderForWhatsApp.orderNumber}
              </h3>
              <p className="text-xs text-stone-400">
                Para: {orderForWhatsApp.customerName} ({orderForWhatsApp.customerPhone})
              </p>
            </div>
          </div>
          <button
            onClick={() => setOrderForWhatsApp(null)}
            className="p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Selector Tabs */}
        <div>
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
            Modelo de Mensagem:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setTemplateType('confirmation')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                templateType === 'confirmation'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              ✅ Confirmação
            </button>
            <button
              onClick={() => setTemplateType('ready')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                templateType === 'ready'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              🍕 Pedido Pronto
            </button>
            <button
              onClick={() => setTemplateType('delivery')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                templateType === 'delivery'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              🛵 Saiu Entrega
            </button>
            <button
              onClick={() => setTemplateType('completed')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                templateType === 'completed'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              ❤️ Agradecimento
            </button>
          </div>
        </div>

        {/* Message Preview Box */}
        <div>
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-1.5">
            Pré-visualização do texto:
          </label>
          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 font-mono text-xs text-stone-300 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {messageText}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            onClick={handleCopy}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-sm transition-colors border border-stone-700 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
          </button>

          <button
            onClick={handleSendWhatsApp}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-98"
          >
            <Send className="w-4 h-4" />
            <span>Abrir no WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
