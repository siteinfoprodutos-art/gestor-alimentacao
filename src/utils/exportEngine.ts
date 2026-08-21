import { Order, Product, Category, InventoryItem, Transaction, Settings } from '../types';
import { formatCurrency, formatDateTime } from './formatters';

// Helper to sanitize CSV / Excel fields
function sanitizeField(val: any): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

// Download CSV with UTF-8 BOM so Excel opens it with correct encoding and columns
function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csvContent = '\uFEFF' + rows.map((row) => row.map(sanitizeField).join(';')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// -------------------------------------------------------------
// 1. EXCEL EXPORTERS
// -------------------------------------------------------------

/**
 * Exporta Vendas para Excel
 */
export function exportSalesToExcel(orders: Order[], settings: Settings | null, periodLabel: string) {
  const businessName = settings?.name || 'Meu Negócio';
  const emissionDate = new Date().toLocaleString('pt-BR');

  const rows: (string | number)[][] = [
    [`RELATÓRIO DE VENDAS - ${businessName.toUpperCase()}`],
    [`Período: ${periodLabel}`, `Emissão: ${emissionDate}`],
    [],
    [
      'Nº Pedido',
      'Data/Hora',
      'Cliente',
      'Telefone',
      'Tipo',
      'Origem',
      'Status',
      'Itens',
      'Subtotal (R$)',
      'Taxa Entrega (R$)',
      'Desconto (R$)',
      'Total (R$)',
      'Forma Pagamento',
      'Status Pagamento',
    ],
  ];

  let totalRevenue = 0;
  let totalDelivery = 0;
  let totalDiscount = 0;

  orders.forEach((o) => {
    totalRevenue += o.total;
    totalDelivery += o.deliveryFee || 0;
    totalDiscount += o.discount || 0;

    const itemsSummary = o.items
      .map((i) => `${i.quantity}x ${i.name}${i.size ? ` (${i.size})` : ''}`)
      .join(', ');

    rows.push([
      `#${o.orderNumber}`,
      formatDateTime(o.createdAt),
      o.customerName,
      o.customerPhone,
      o.type,
      o.origin,
      o.status,
      itemsSummary,
      o.subtotal.toFixed(2),
      (o.deliveryFee || 0).toFixed(2),
      (o.discount || 0).toFixed(2),
      o.total.toFixed(2),
      o.paymentMethod,
      o.paymentStatus,
    ]);
  });

  rows.push([]);
  rows.push([
    'TOTAL GERAL',
    '',
    '',
    '',
    '',
    '',
    `${orders.length} pedidos`,
    '',
    '',
    totalDelivery.toFixed(2),
    totalDiscount.toFixed(2),
    totalRevenue.toFixed(2),
    '',
    '',
  ]);

  const filename = `Vendas_${businessName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(filename, rows);
}

/**
 * Exporta Estoque para Excel
 */
export function exportInventoryToExcel(inventory: InventoryItem[], settings: Settings | null) {
  const businessName = settings?.name || 'Meu Negócio';
  const emissionDate = new Date().toLocaleString('pt-BR');

  const rows: (string | number)[][] = [
    [`RELATÓRIO DE ESTOQUE - ${businessName.toUpperCase()}`],
    [`Emissão: ${emissionDate}`],
    [],
    [
      'Item / Insumo',
      'Categoria',
      'Unidade',
      'Qtd. Atual',
      'Qtd. Mínima',
      'Custo Unitário (R$)',
      'Valor Total em Estoque (R$)',
      'Situação',
    ],
  ];

  let totalStockValue = 0;

  inventory.forEach((item) => {
    const itemTotal = item.currentQuantity * (item.cost || 0);
    totalStockValue += itemTotal;

    let status = 'Normal';
    if (item.currentQuantity <= 0) {
      status = 'ZERADO / CRÍTICO';
    } else if (item.currentQuantity <= item.minQuantity) {
      status = 'Estoque Baixo';
    }

    rows.push([
      item.name,
      item.category || 'Geral',
      item.unit,
      item.currentQuantity.toFixed(2),
      item.minQuantity.toFixed(2),
      (item.cost || 0).toFixed(2),
      itemTotal.toFixed(2),
      status,
    ]);
  });

  rows.push([]);
  rows.push([
    'VALOR TOTAL DO ESTOQUE',
    '',
    '',
    '',
    '',
    '',
    totalStockValue.toFixed(2),
    '',
  ]);

  const filename = `Estoque_${businessName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(filename, rows);
}

/**
 * Exporta Financeiro para Excel
 */
export function exportFinancesToExcel(
  transactions: Transaction[],
  settings: Settings | null,
  periodLabel: string
) {
  const businessName = settings?.name || 'Meu Negócio';
  const emissionDate = new Date().toLocaleString('pt-BR');

  const rows: (string | number)[][] = [
    [`RELATÓRIO FINANCEIRO & FLUXO DE CAIXA - ${businessName.toUpperCase()}`],
    [`Período: ${periodLabel}`, `Emissão: ${emissionDate}`],
    [],
    [
      'Data',
      'Tipo',
      'Descrição',
      'Categoria',
      'Forma de Pagamento',
      'Valor Entrada (R$)',
      'Valor Saída (R$)',
    ],
  ];

  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((tx) => {
    const isIncome = tx.type === 'income';
    if (isIncome) totalIncome += tx.amount;
    else totalExpense += tx.amount;

    rows.push([
      formatDateTime(tx.date),
      isIncome ? 'RECEITA' : 'DESPESA',
      tx.description,
      tx.category,
      tx.paymentMethod || 'Outro',
      isIncome ? tx.amount.toFixed(2) : '0.00',
      !isIncome ? tx.amount.toFixed(2) : '0.00',
    ]);
  });

  const saldo = totalIncome - totalExpense;

  rows.push([]);
  rows.push([
    'TOTAIS',
    '',
    '',
    '',
    '',
    totalIncome.toFixed(2),
    totalExpense.toFixed(2),
  ]);
  rows.push(['SALDO LÍQUIDO DO PERÍODO', '', '', '', '', saldo.toFixed(2), '']);

  const filename = `Financeiro_${businessName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(filename, rows);
}

/**
 * Exporta Custos, Ficha Técnica e Produtos para Excel
 */
export function exportCostsToExcel(
  products: Product[],
  categories: Category[],
  orders: Order[],
  settings: Settings | null
) {
  const businessName = settings?.name || 'Meu Negócio';
  const emissionDate = new Date().toLocaleString('pt-BR');

  const rows: (string | number)[][] = [
    [`RELATÓRIO DE CUSTOS, PRODUTOS E MARGENS - ${businessName.toUpperCase()}`],
    [`Emissão: ${emissionDate}`],
    [],
    [
      'Código/SKU',
      'Produto',
      'Categoria',
      'Preço Venda (R$)',
      'Custo Unitário (R$)',
      'Lucro Unitário (R$)',
      'Margem Bruta (%)',
      'Qtd Vendida (Histórico)',
      'Faturamento Total (R$)',
      'Status',
    ],
  ];

  // Map sales from orders
  const salesMap: Record<string, { qty: number; revenue: number }> = {};
  orders.forEach((o) => {
    if (o.status !== 'Cancelado') {
      o.items.forEach((it) => {
        if (!salesMap[it.productId]) {
          salesMap[it.productId] = { qty: 0, revenue: 0 };
        }
        salesMap[it.productId].qty += it.quantity;
        salesMap[it.productId].revenue += it.subtotal;
      });
    }
  });

  products.forEach((p) => {
    const cost = p.cost || 0;
    const price = p.price || 0;
    const profit = price - cost;
    const margin = price > 0 ? (profit / price) * 100 : 0;
    const sold = salesMap[p.id]?.qty || 0;
    const rev = salesMap[p.id]?.revenue || 0;

    rows.push([
      p.code || '-',
      p.name,
      p.category,
      price.toFixed(2),
      cost.toFixed(2),
      profit.toFixed(2),
      `${margin.toFixed(1)}%`,
      sold,
      rev.toFixed(2),
      p.available ? 'Disponível' : 'Indisponível',
    ]);
  });

  const filename = `Custos_Produtos_${businessName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(filename, rows);
}

// -------------------------------------------------------------
// 2. WHATSAPP REPORT GENERATOR (Gratuito, sem API paga)
// -------------------------------------------------------------

export function generateWhatsAppReportSummary(
  reportType: 'financeiro' | 'mensal' | 'estoque' | 'produtos' | 'despesas' | 'consumo',
  data: {
    faturamento: number;
    custos: number;
    despesas: number;
    lucro: number;
    margem: number;
    totalPedidos: number;
    ticketMedio: number;
    topProducts?: { name: string; qty: number; total: number }[];
    lowStockItems?: { name: string; current: number; min: number; unit: string }[];
    expensesByCategory?: { category: string; amount: number }[];
    periodLabel: string;
  },
  settings: Settings | null
): string {
  const businessName = settings?.name || 'AL Studio Gestão';
  const emissionDate = new Date().toLocaleString('pt-BR');

  let text = `📊 *${businessName.toUpperCase()} - RELATÓRIO*\n`;
  text += `📅 *Período:* ${data.periodLabel}\n`;
  text += `🕒 *Emissão:* ${emissionDate}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  if (reportType === 'financeiro' || reportType === 'mensal') {
    text += `💰 *RESUMO FINANCEIRO:*\n`;
    text += `• Faturamento Bruto: *${formatCurrency(data.faturamento)}*\n`;
    text += `• Custos dos Produtos (CMV): ${formatCurrency(data.custos)}\n`;
    text += `• Despesas Operacionais: ${formatCurrency(data.despesas)}\n`;
    text += `• *Lucro Líquido Estimado: ${formatCurrency(data.lucro)}*\n`;
    text += `• Margem de Lucro: *${data.margem.toFixed(1)}%*\n\n`;

    text += `📈 *DESEMPENHO COMERCIAL:*\n`;
    text += `• Total de Pedidos: *${data.totalPedidos}*\n`;
    text += `• Ticket Médio: *${formatCurrency(data.ticketMedio)}*\n\n`;

    if (data.topProducts && data.topProducts.length > 0) {
      text += `🏆 *PRODUTOS MAIS VENDIDOS:*\n`;
      data.topProducts.slice(0, 5).forEach((p, idx) => {
        text += `${idx + 1}. ${p.name} (${p.qty} un) - ${formatCurrency(p.total)}\n`;
      });
      text += `\n`;
    }
  } else if (reportType === 'estoque') {
    text += `📦 *STATUS DO ESTOQUE:*\n`;
    if (data.lowStockItems && data.lowStockItems.length > 0) {
      text += `⚠️ *ITENS COM ESTOQUE BAIXO/CRÍTICO:*\n`;
      data.lowStockItems.forEach((i) => {
        text += `• *${i.name}*: ${i.current} ${i.unit} (mínimo: ${i.min} ${i.unit})\n`;
      });
      text += `\n`;
    } else {
      text += `✅ Todos os itens do estoque estão acima do limite mínimo.\n\n`;
    }
  } else if (reportType === 'despesas') {
    text += `💸 *DETALHAMENTO DE DESPESAS:*\n`;
    text += `• Total Gasto: *${formatCurrency(data.despesas)}*\n\n`;
    if (data.expensesByCategory && data.expensesByCategory.length > 0) {
      text += `📁 *Por Categoria:*\n`;
      data.expensesByCategory.forEach((e) => {
        text += `• ${e.category}: ${formatCurrency(e.amount)}\n`;
      });
      text += `\n`;
    }
  } else if (reportType === 'consumo') {
    text += `🥩 *RELATÓRIO DE CONSUMO & CUSTOS:*\n`;
    text += `• Custo Total dos Produtos Vendidos (CMV): *${formatCurrency(data.custos)}*\n`;
    text += `• Faturamento Correspondente: *${formatCurrency(data.faturamento)}*\n`;
    text += `• Custo sobre Faturamento: *${data.faturamento > 0 ? ((data.custos / data.faturamento) * 100).toFixed(1) : 0}%*\n\n`;
  } else if (reportType === 'produtos') {
    text += `🍕 *CARDÁPIO & DESEMPENHO DE PRODUTOS:*\n`;
    if (data.topProducts && data.topProducts.length > 0) {
      data.topProducts.forEach((p, idx) => {
        text += `${idx + 1}. *${p.name}* - ${p.qty} un (${formatCurrency(p.total)})\n`;
      });
      text += `\n`;
    }
  }

  if (settings?.phone || settings?.whatsapp) {
    text += `📞 Contato: ${settings?.phone || settings?.whatsapp}\n`;
  }
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `_Gerado automaticamente via AL Studio Gestão_`;

  return text;
}

/**
 * Abre o WhatsApp permitindo que o usuário escolha qualquer contato ou grupo livremente
 */
export function shareReportOnWhatsApp(text: string) {
  const encoded = encodeURIComponent(text);
  const url = `https://api.whatsapp.com/send?text=${encoded}`;
  window.open(url, '_blank');
}
