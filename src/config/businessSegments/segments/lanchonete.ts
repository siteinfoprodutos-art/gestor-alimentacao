import { BusinessSegmentConfig } from '../types';

export const lanchoneteSegment: BusinessSegmentConfig = {
  id: 'lanchonete',
  name: 'Lanchonete & Petiscaria',
  emoji: '🥪',
  tagline: 'Gestão de Lanchonetes, Doguerias & Casas de Salgados',
  description: 'Controle de lanches prensados, hot dogs, salgados fritos e assados, sucos, vitaminas e vendas ágeis de balcão.',
  primaryColor: '#f97316', // Laranja vibrante
  secondaryColor: '#f59e0b',
  defaultCategories: [
    'Lanches na Chapa & Prensados',
    'Hot Dogs Prensados',
    'Salgados Fritos na Hora',
    'Salgados Assados & Folhados',
    'Vitaminas & Sucos de Polpa',
    'Bebidas & Refrigerantes',
  ],
  defaultUnits: ['un', 'kg', 'g', 'L', 'pct', 'cx'],
  terminology: {
    productSingular: 'Lanche / Salgado',
    productPlural: 'Lanches & Salgados',
    newProductLabel: 'Novo Lanche / Salgado',
    inventoryLabel: 'Estoque de Frios & Ingredientes',
    recipeLabel: 'Ficha Técnica do Lanche',
    salesLabel: 'Vendas de Balcão & Delivery',
    customerLabel: 'Clientes',
    categoryLabel: 'Categorias do Cardápio',
  },
  features: {
    hasSizes: false,
    hasCrustsOrBorders: false,
    hasFlavors: false,
    hasAddons: true, // Queijo extra, vinagrete, milho, batata palha
    hasCombos: true, // Lanche + Fritas + Refri
    hasRecipeCostCMV: true,
    hasInventory: true,
    hasDelivery: true,
    hasCodeSKU: false,
    hasPreparationTime: true,
  },
  suggestedProducts: [
    {
      name: 'X-Tudo Especial da Casa',
      category: 'Lanches na Chapa & Prensados',
      price: 26.0,
      cost: 8.9,
      description: 'Hambúrguer, filé de frango desfiado, presunto, queijo mussarela derretido, ovo frito, bacon crocante, alface, tomate, milho e maionese verde artesanal prensado.',
    },
    {
      name: 'Hot Dog Completo Prensado Duplo',
      category: 'Hot Dogs Prensados',
      price: 18.0,
      cost: 5.5,
      description: '2 salsichas Perdigão, molho de tomate temperado, purê de batata caseiro, milho, vinagrete e bastante batata palha.',
    },
    {
      name: 'Coxinha Dourada com Catupiry',
      category: 'Salgados Fritos na Hora',
      price: 8.5,
      cost: 2.6,
      description: 'Massa cremosa de mandioca e caldo de galinha recheada com peito de frango desfiado e requeijão cremoso.',
    },
    {
      name: 'Vitamina de Açaí com Banana e Leite 500ml',
      category: 'Vitaminas & Sucos de Polpa',
      price: 15.0,
      cost: 4.8,
      description: 'Batida bem gelada com leite integral, polpa de açaí puro, banana madura e mel.',
    },
  ],
  suggestedInventory: [
    { name: 'Pão de Hambúrguer Gergelim', category: 'Pães', unit: 'pct', currentQuantity: 25, minQuantity: 8, cost: 11.0 },
    { name: 'Pão de Hot Dog Prensado', category: 'Pães', unit: 'pct', currentQuantity: 15, minQuantity: 5, cost: 9.5 },
    { name: 'Salsicha Hot Dog Resfriada 3kg', category: 'Carnes & Embutidos', unit: 'pct', currentQuantity: 6, minQuantity: 2, cost: 28.0 },
    { name: 'Batata Palha Extra Fina 1kg', category: 'Secos', unit: 'pct', currentQuantity: 10, minQuantity: 3, cost: 22.0 },
    { name: 'Papel Acoplado para Lanches (Fardo 500un)', category: 'Embalagens', unit: 'cx', currentQuantity: 2, minQuantity: 1, cost: 52.0 },
  ],
};
