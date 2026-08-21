import { Order, Settings } from '../types';

export function calculateProfitMargin(price: number, cost: number): number {
  if (!price || price <= 0) return 0;
  const margin = ((price - cost) / price) * 100;
  return Math.round(margin * 100) / 100;
}

export function calculateMarkup(price: number, cost: number): number {
  if (!cost || cost <= 0) return 0;
  const markup = ((price - cost) / cost) * 100;
  return Math.round(markup * 100) / 100;
}

export function formatPercent(value: number): string {
  if (isNaN(value)) return '0,00%';
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

export function formatCurrency(value: number, currency: string = 'R$'): string {
  if (isNaN(value)) return `${currency} 0,00`;
  return `${currency} ${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(isoDateString?: string): string {
  if (!isoDateString) return '--';
  const date = new Date(isoDateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(isoDateString?: string): string {
  if (!isoDateString) return '--';
  const date = new Date(isoDateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTimeOnly(isoDateString?: string): string {
  if (!isoDateString) return '--';
  const date = new Date(isoDateString);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function getCleanPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('55') && cleaned.length >= 12) {
    return cleaned;
  }
  return `55${cleaned}`;
}

export function generateWhatsAppOrderMessage(order: Order, settings: Settings, type: 'confirmation' | 'ready' | 'delivery' | 'completed' = 'confirmation'): string {
  const businessName = settings.name || 'Loja';

  let message = '';
  
  if (type === 'confirmation') {
    message = `*${businessName}*\n`;
    message += `Olá, *${order.customerName}*! Seu pedido foi *RECEBIDO* com sucesso!\n\n`;
    message += `📋 *Pedido #${order.orderNumber}*\n`;
    message += `------------------------\n`;
    order.items.forEach((item) => {
      message += `• *${item.quantity}x* ${item.name} (${formatCurrency(item.subtotal)})\n`;
      
      const customizations = [];
      if (item.size) customizations.push(`Tam: ${item.size}`);
      if (item.crust) customizations.push(`Borda/Adicional: ${item.crust}`);
      if (item.addons && item.addons.length > 0) customizations.push(`+ ${item.addons.join(', ')}`);
      
      if (customizations.length > 0) {
        message += `  └ ${customizations.join(' | ')}\n`;
      }

      if (item.notes) {
        message += `  └ Obs: _${item.notes}_\n`;
      }
    });
    message += `------------------------\n`;
    if (order.deliveryFee > 0) {
      message += `Taxa de entrega: ${formatCurrency(order.deliveryFee)}\n`;
    }
    if (order.discount > 0) {
      message += `Desconto: -${formatCurrency(order.discount)}\n`;
    }
    message += `💰 *Total: ${formatCurrency(order.total)}*\n`;
    message += `💳 Pagamento: ${order.paymentMethod} (${order.paymentStatus})\n`;
    if (order.changeFor && order.paymentMethod === 'Dinheiro') {
      message += `💵 Troco para: ${formatCurrency(order.changeFor)} (Troco: ${formatCurrency(order.changeFor - order.total)})\n`;
    }
    message += `📍 Tipo: *${order.type}*\n`;
    if (order.type === 'Entrega' && order.customerAddress) {
      message += `Endereço: ${order.customerAddress}\n`;
    }
    message += `\nEstamos preparando com todo carinho! Qualquer dúvida, estamos à disposição.`;
  } else if (type === 'ready') {
    message = `*${businessName}*\n`;
    message += `Olá, *${order.customerName}*! Seu pedido *#${order.orderNumber}* está *PRONTO*! 🥳\n\n`;
    if (order.type === 'Retirada') {
      message += `Você já pode retirar no nosso balcão.\n📍 Endereço: ${settings.address || 'Nosso endereço'}`;
    } else {
      message += `Aguardando a saída do entregador!`;
    }
  } else if (type === 'delivery') {
    message = `*${businessName}*\n`;
    message += `Olá, *${order.customerName}*! O entregador acabou de sair com o seu pedido *#${order.orderNumber}*!\n\n`;
    message += `Por favor, fique atento(a) ao interfone/portão.\n`;
    if (order.paymentStatus === 'Pendente') {
      message += `💰 Valor a pagar: *${formatCurrency(order.total)}* (${order.paymentMethod})\n`;
    }
    message += `\nBom apetite! 😋`;
  } else {
    message = `*${businessName}*\n`;
    message += `Olá, *${order.customerName}*! Agradecemos a preferência pelo pedido *#${order.orderNumber}*.\n`;
    message += `Esperamos que tenha sido uma excelente experiência! Até a próxima! ❤️`;
  }

  return message;
}

export function openWhatsAppLink(phone: string, text: string) {
  const cleanPhone = getCleanPhone(phone);
  const encodedText = encodeURIComponent(text);
  const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
  window.open(url, '_blank');
}
