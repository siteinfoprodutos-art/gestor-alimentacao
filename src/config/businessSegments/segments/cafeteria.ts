import { BusinessSegmentConfig } from '../types';

export const cafeteriaSegment: BusinessSegmentConfig = {
  id: 'cafeteria',
  name: 'Cafeteria & Bistro',
  emoji: '☕',
  tagline: 'Gestão de Cafeterias Especiais, Coffee Shops & Bistrôs',
  description: 'Controle de grãos especiais, métodos de extração, lattes, confeitaria artesanal, toasts e atendimento de mesa.',
  primaryColor: '#78350f', // Marrom café especial
  secondaryColor: '#b45309',
  defaultCategories: [
    'Cafés Especiais & Filtrados',
    'Espressos & Lattes',
    'Bebidas Geladas & Frappes',
    'Toasts & Brunch',
    'Croissants & Salgados Finos',
    'Confeitaria & Sobremesas',
    'Grãos de Café em Pacote',
  ],
  defaultUnits: ['un', 'g', 'kg', 'L', 'ml', 'pct'],
  terminology: {
    productSingular: 'Café / Item',
    productPlural: 'Cafés & Gastronomia',
    newProductLabel: 'Novo Café / Item',
    inventoryLabel: 'Estoque de Grãos & Laticínios',
    recipeLabel: 'Ficha da Bebida / Extração',
    salesLabel: 'Vendas & Comandas',
    customerLabel: 'Clientes & Coffee Lovers',
    categoryLabel: 'Categorias do Cardápio',
  },
  features: {
    hasSizes: true, // Pequeno (150ml), Médio (250ml), Grande (350ml)
    hasCrustsOrBorders: false,
    hasFlavors: false,
    hasAddons: true, // Shot extra de espresso, leite vegetal de aveia, xarope de baunilha
    hasCombos: true, // Combo Café + Toast
    hasRecipeCostCMV: true,
    hasInventory: true,
    hasDelivery: true,
    hasCodeSKU: false,
    hasPreparationTime: true,
  },
  suggestedProducts: [
    {
      name: 'Cappuccino Italiano Clássico',
      category: 'Espressos & Lattes',
      price: 15.0,
      cost: 3.8,
      hasSizes: true,
      sizes: [
        { id: 's-trad', name: 'Tradicional (180ml)', price: 15.0, cost: 3.8 },
        { id: 's-duplo', name: 'Grande Duplo (300ml)', price: 19.5, cost: 5.2 },
      ],
      description: 'Dose dupla de espresso especial 84 pontos, leite vaporizado com microespuma sedosa e cacau 100% polvilhado.',
    },
    {
      name: 'Avocado Toast com Ovos Pochê e Gergelim',
      category: 'Toasts & Brunch',
      price: 28.0,
      cost: 8.5,
      description: 'Fatia espessa de pão sourdough tostada na manteiga ghee, pasta de abacate temperada com limão, 2 ovos pochê caipiras e gergelim tostado.',
    },
    {
      name: 'Croissant Francês Tradicional na Manteiga',
      category: 'Croissants & Salgados Finos',
      price: 14.0,
      cost: 4.2,
      description: 'Folhado artesanal leve e aerado com manteiga francesa, servido quentinho.',
    },
    {
      name: 'Iced Caramel Macchiato Gelado 400ml',
      category: 'Bebidas Geladas & Frappes',
      price: 18.0,
      cost: 4.9,
      description: 'Leite integral gelado com essência de baunilha, gelo, dose dupla de espresso especial e calda artesanal de caramelo toffee.',
    },
  ],
  suggestedInventory: [
    { name: 'Café Especial Grãos 100% Arábica 1kg', category: 'Cafés & Grãos', unit: 'kg', currentQuantity: 10, minQuantity: 3, cost: 68.0 },
    { name: 'Leite Integral Tipo A para Vaporizar 1L', category: 'Laticínios', unit: 'L', currentQuantity: 24, minQuantity: 8, cost: 5.8 },
    { name: 'Leite de Aveia Barista 1L (Vegano)', category: 'Laticínios', unit: 'L', currentQuantity: 8, minQuantity: 2, cost: 16.5 },
    { name: 'Xarope Monin Baunilha Francesa 700ml', category: 'Xaropes & Caldas', unit: 'un', currentQuantity: 4, minQuantity: 1, cost: 54.0 },
    { name: 'Pão Fermentação Natural Sourdough (Peça)', category: 'Pães', unit: 'un', currentQuantity: 6, minQuantity: 2, cost: 18.0 },
  ],
};
