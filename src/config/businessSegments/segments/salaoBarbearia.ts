import { BusinessSegmentConfig } from '../types';

export const salaoBarbeariaSegment: BusinessSegmentConfig = {
  id: 'salao_barbearia',
  name: 'Salão de Beleza & Barbearia',
  emoji: '💇',
  tagline: 'Gestão de Salões, Barbearias, Esmalterias & Estética',
  description: 'Controle de serviços/procedimentos realizados, produtos de uso profissional (shampoos, tinturas, pomadas), kits e fidelização de clientes.',
  primaryColor: '#0284c7', // Azul oceano / barbearia moderna
  secondaryColor: '#38bdf8',
  defaultCategories: [
    'Cortes & Penteados',
    'Barba & Terapia Capilar',
    'Química & Coloração',
    'Manicure & Pedicure',
    'Estética Facial & Sobrancelhas',
    'Produtos para Cuidados (Home Care)',
    'Combos & Assinaturas',
  ],
  defaultUnits: ['un', 'serv', 'ml', 'g', 'pct', 'cx'],
  terminology: {
    productSingular: 'Serviço / Procedimento',
    productPlural: 'Serviços & Procedimentos',
    newProductLabel: 'Novo Serviço / Produto',
    inventoryLabel: 'Estoque',
    recipeLabel: 'Consumo de Insumos por Procedimento',
    salesLabel: 'Atendimentos & Comandas',
    customerLabel: 'Clientes & Pacientes',
    categoryLabel: 'Especialidades / Categorias',
  },
  features: {
    hasSizes: false, // Pode usar variações se necessário
    hasCrustsOrBorders: false,
    hasFlavors: false,
    hasAddons: true, // Lavagem especial, massagem capilar, hidratação rápida
    hasCombos: true, // Combo Cabelo + Barba + Sobrancelha
    hasRecipeCostCMV: true, // Custo de tinta, lâmina descartável, pomada
    hasInventory: true,
    hasDelivery: false,
    hasCodeSKU: true, // Para produtos de revenda (pomadas, óleos)
    hasPreparationTime: true, // Duração do atendimento em minutos
  },
  suggestedProducts: [
    {
      name: 'Corte Cabelo Masculino / Fade Degradê',
      category: 'Cortes & Penteados',
      price: 45.0,
      cost: 4.5,
      description: 'Corte completo com máquina e tesoura, alinhamento de contorno (pezinho), lavagem e finalização com pomada matte.',
    },
    {
      name: 'Barba Terapia com Toalha Quente & Navalha',
      category: 'Barba & Terapia Capilar',
      price: 35.0,
      cost: 5.0,
      description: 'Modelagem completa da barba, esfoliação facial, vapor de ozônio, toalha quente e massagem com balm hidratante.',
    },
    {
      name: 'Combo Completo: Cabelo + Barba + Sobrancelha',
      category: 'Combos & Assinaturas',
      price: 75.0,
      cost: 9.0,
      description: 'Pacote VIP completo com lavagem relaxante, corte degradê, barba desenhada e alinhamento de sobrancelha.',
    },
    {
      name: 'Pomada Modeladora Efeito Matte 120g (Revenda)',
      category: 'Produtos para Cuidados (Home Care)',
      price: 38.0,
      cost: 18.0,
      code: '7898950000412',
      description: 'Fixação forte com acabamento fosco sem brilho, fragrância amadeirada sofisticada.',
    },
  ],
  suggestedInventory: [
    { name: 'Pomada Modeladora Matte 120g (Caixa 12un)', category: 'Revenda', unit: 'cx', currentQuantity: 3, minQuantity: 1, cost: 216.0 },
    { name: 'Lâminas Descartáveis Derby Extra (Caixa 100un)', category: 'Descartáveis', unit: 'cx', currentQuantity: 2, minQuantity: 1, cost: 35.0 },
    { name: 'Shampoo Neutro Lavatório Galão 5 Litros', category: 'Lavatório', unit: 'un', currentQuantity: 2, minQuantity: 1, cost: 58.0 },
    { name: 'Golas Higiênicas Descartáveis (Rolo 500un)', category: 'Descartáveis', unit: 'un', currentQuantity: 3, minQuantity: 1, cost: 24.0 },
    { name: 'Óleo para Barba Hidratante 30ml', category: 'Revenda', unit: 'un', currentQuantity: 8, minQuantity: 2, cost: 16.0 },
  ],
};
