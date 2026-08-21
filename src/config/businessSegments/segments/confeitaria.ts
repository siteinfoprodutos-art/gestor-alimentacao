import { BusinessSegmentConfig } from '../types';

export const confeitariaSegment: BusinessSegmentConfig = {
  id: 'confeitaria',
  name: 'Confeitaria & Doceria',
  emoji: '🍰',
  tagline: 'Gestão de Confeitarias, Docerias & Encomendas de Bolos',
  description: 'Controle de bolos decorados por kg, brigadeiros gourmet, doces finos, encomendas e custos de confeitaria.',
  primaryColor: '#db2777', // Rosa doce / Pink gourmet
  secondaryColor: '#f472b6',
  defaultCategories: [
    'Bolos de Festa & Decorados',
    'Bolos Caseiros & Vulcão',
    'Doces Finos & Brigadeiros',
    'Tortas Doces & Cheesecakes',
    'Doces no Pote & Sobremesas',
    'Kits Festa & Encomendas',
    'Bebidas & Cafés',
  ],
  defaultUnits: ['kg', 'g', 'un', 'L', 'pct', 'cx', 'dz'],
  terminology: {
    productSingular: 'Bolo / Doce',
    productPlural: 'Bolos & Doces',
    newProductLabel: 'Novo Bolo / Doce',
    inventoryLabel: 'Estoque de Confeitaria & Embalagens',
    recipeLabel: 'Ficha Técnica do Doce / Bolo',
    salesLabel: 'Vendas & Encomendas',
    customerLabel: 'Clientes & Noivas',
    categoryLabel: 'Categorias de Doces',
  },
  features: {
    hasSizes: true, // 1kg, 2kg, 3kg ou Fatia / Inteiro
    hasCrustsOrBorders: false,
    hasFlavors: false,
    hasAddons: true, // Topo de bolo, velas, caixa de presente
    hasCombos: true, // Kits de festa
    hasRecipeCostCMV: true,
    hasInventory: true,
    hasDelivery: true,
    hasCodeSKU: false,
    hasPreparationTime: true,
  },
  suggestedProducts: [
    {
      name: 'Bolo Red Velvet com Frutas Vermelhas',
      category: 'Bolos de Festa & Decorados',
      price: 95.0,
      cost: 32.0,
      hasSizes: true,
      sizes: [
        { id: 's-fatia', name: 'Fatia Individual (180g)', price: 16.0, cost: 4.8 },
        { id: 's-1kg', name: 'Bolo 1.5kg (Aprox. 12 fatias)', price: 95.0, cost: 32.0 },
        { id: 's-2kg', name: 'Bolo 2.5kg (Aprox. 24 fatias)', price: 155.0, cost: 52.0 },
      ],
      description: 'Massa aveludada de cacau puro, recheio cremoso de cream cheese e coulis de frutas silvestres frescas.',
    },
    {
      name: 'Cento de Brigadeiros Gourmet Sortidos',
      category: 'Doces Finos & Brigadeiros',
      price: 140.0,
      cost: 45.0,
      unit: 'cx',
      description: 'Caixa com 100 doces: Belga tradicional, Ninho com Nutella, Churros e Limão Siciliano.',
    },
    {
      name: 'Bolo de Pote Ninho com Morango',
      category: 'Doces no Pote & Sobremesas',
      price: 14.5,
      cost: 4.2,
      unit: 'un',
      description: 'Camadas generosas de pão de ló úmido, brigadeiro de leite Ninho e morangos frescos picados.',
    },
  ],
  suggestedInventory: [
    { name: 'Leite Condensado Moça (Caixa c/ 27)', category: 'Laticínios', unit: 'cx', currentQuantity: 5, minQuantity: 2, cost: 160.0 },
    { name: 'Chocolate Nobre Meio Amargo Callebaut 2.5kg', category: 'Chocolates & Coberturas', unit: 'kg', currentQuantity: 8, minQuantity: 3, cost: 78.0 },
    { name: 'Creme de Leite UHT 30% Gordura', category: 'Laticínios', unit: 'kg', currentQuantity: 18, minQuantity: 6, cost: 14.0 },
    { name: 'Morangos Selecionados Frescos', category: 'Frutas', unit: 'kg', currentQuantity: 6, minQuantity: 2, cost: 22.0 },
    { name: 'Caixas de Bolo Acetato com Laço', category: 'Embalagens', unit: 'un', currentQuantity: 40, minQuantity: 15, cost: 5.5 },
  ],
};
