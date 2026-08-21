import { BusinessSegmentConfig } from '../types';

export const hamburgueriaSegment: BusinessSegmentConfig = {
  id: 'hamburgueria',
  name: 'Hamburgueria Artesanal',
  emoji: '🍔',
  tagline: 'Gestão de Hamburguerias, Smash & American BBQ',
  description: 'Controle de blends de carne, smash burgers, porções de batata, adicionais extras e combos de entrega.',
  primaryColor: '#e11d48', // Vermelho rubi moderno
  secondaryColor: '#f59e0b',
  defaultCategories: [
    'Burgers Artesanais',
    'Smash Burgers',
    'Porções & Fritas',
    'Molhos Especiais',
    'Combos Burger + Fritas',
    'Shakes & Sobremesas',
    'Bebidas & Cervejas',
  ],
  defaultUnits: ['kg', 'g', 'un', 'L', 'pct', 'cx'],
  terminology: {
    productSingular: 'Burger / Prato',
    productPlural: 'Burgers & Porções',
    newProductLabel: 'Novo Burger / Lanche',
    inventoryLabel: 'Estoque',
    recipeLabel: 'Ficha Técnica do Burger',
    salesLabel: 'Vendas & Pedidos',
    customerLabel: 'Clientes',
    categoryLabel: 'Categorias do Cardápio',
  },
  features: {
    hasSizes: true, // Simples / Duplo / Triplo
    hasCrustsOrBorders: false,
    hasFlavors: false,
    hasAddons: true, // Bacon extra, queijo cheddar extra, etc.
    hasCombos: true,
    hasRecipeCostCMV: true,
    hasInventory: true,
    hasDelivery: true,
    hasCodeSKU: false,
    hasPreparationTime: true,
  },
  suggestedProducts: [
    {
      name: 'Smash Bacon Supreme',
      category: 'Smash Burgers',
      price: 34.9,
      cost: 11.2,
      hasSizes: true,
      sizes: [
        { id: 's-single', name: 'Smash Simples (90g)', price: 28.9, cost: 8.5 },
        { id: 's-double', name: 'Smash Duplo (180g)', price: 34.9, cost: 11.2 },
        { id: 's-triple', name: 'Smash Triplo (270g)', price: 41.9, cost: 14.8 },
      ],
      description: 'Pão brioche tostado na manteiga, 2x smash 90g com crostinha crocante, queijo cheddar inglês derretido, tiras de bacon crocante e maionese defumada da casa.',
    },
    {
      name: 'Classic Cheese Burger Artesanal',
      category: 'Burgers Artesanais',
      price: 31.0,
      cost: 9.8,
      description: 'Blend bovino 160g suculento grelhado no fogo, dobro de cheddar, picles artesanais e molho especial.',
    },
    {
      name: 'Batata Rústica com Alecrim e Páprica',
      category: 'Porções & Fritas',
      price: 22.0,
      cost: 5.5,
      description: 'Batatas rústicas douradas temperadas com sal marinho, alecrim fresco e páprica defumada.',
    },
    {
      name: 'Milkshake de Nutella & Ninho (400ml)',
      category: 'Shakes & Sobremesas',
      price: 21.0,
      cost: 6.9,
      description: 'Sorvete artesanal batido com leite Ninho em pó e generosa borda de Nutella legítima.',
    },
  ],
  suggestedInventory: [
    { name: 'Blend Bovino Moído (Fraldinha + Acém)', category: 'Carnes & Blends', unit: 'kg', currentQuantity: 25, minQuantity: 8, cost: 32.0 },
    { name: 'Pão Brioche Selado (Pacote c/ 6)', category: 'Pães', unit: 'pct', currentQuantity: 20, minQuantity: 6, cost: 14.4 },
    { name: 'Queijo Cheddar Fatiado Especial', category: 'Laticínios', unit: 'kg', currentQuantity: 10, minQuantity: 3, cost: 42.0 },
    { name: 'Bacon em Fatias Defumado', category: 'Carnes & Blends', unit: 'kg', currentQuantity: 12, minQuantity: 4, cost: 36.0 },
    { name: 'Batata Pré-Frita Congelada 2.5kg', category: 'Congelados', unit: 'pct', currentQuantity: 15, minQuantity: 5, cost: 24.0 },
    { name: 'Embalagem Box Térmico Hamburguer', category: 'Embalagens', unit: 'un', currentQuantity: 200, minQuantity: 50, cost: 1.2 },
  ],
};
