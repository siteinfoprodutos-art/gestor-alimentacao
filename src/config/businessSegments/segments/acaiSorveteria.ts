import { BusinessSegmentConfig } from '../types';

export const acaiSorveteriaSegment: BusinessSegmentConfig = {
  id: 'acai_sorveteria',
  name: 'Açaí & Sorveteria',
  emoji: '🍦',
  tagline: 'Gestão de Açaiterias, Sorveterias & Gelaterias',
  description: 'Controle de copos e potes (300ml, 500ml, 700ml, 1L), caldas, dezenas de adicionais e self-service por peso.',
  primaryColor: '#7c3aed', // Roxo açaí
  secondaryColor: '#ec4899',
  defaultCategories: [
    'Copos de Açaí Tradicional',
    'Açaí na Tigela & Barcas',
    'Sorvetes & Gelatos Artesanais',
    'Picolés & Paletas Mexicanas',
    'Cremes Especiais (Cupuaçu, Pitaya)',
    'Adicionais & Frutas Extras',
    'Bebidas & Água',
  ],
  defaultUnits: ['kg', 'g', 'un', 'L', 'pct', 'cx'],
  terminology: {
    productSingular: 'Copo / Sorvete',
    productPlural: 'Copos & Sorvetes',
    newProductLabel: 'Novo Copo / Sorvete',
    inventoryLabel: 'Estoque',
    recipeLabel: 'Composição do Copo / Tigela',
    salesLabel: 'Vendas de Açaí & Sorvetes',
    customerLabel: 'Clientes',
    categoryLabel: 'Categorias do Cardápio',
  },
  features: {
    hasSizes: true, // 300ml, 500ml, 700ml, 1 Litro
    hasCrustsOrBorders: false,
    hasFlavors: true, // Mesclar Açaí com Cupuaçu ou Ninho
    hasAddons: true, // Leite Ninho, Nutella, Paçoca, Morango, Banana, Granola, Confetes
    hasCombos: true, // Barca de Açaí Completa
    hasRecipeCostCMV: true,
    hasInventory: true,
    hasDelivery: true,
    hasCodeSKU: false,
    hasPreparationTime: true,
  },
  suggestedProducts: [
    {
      name: 'Açaí Especial Turbo no Copo',
      category: 'Copos de Açaí Tradicional',
      price: 24.0,
      cost: 7.8,
      hasSizes: true,
      sizes: [
        { id: 's-300', name: 'Copo 300ml (3 acompanhamentos)', price: 17.0, cost: 5.5 },
        { id: 's-500', name: 'Copo 500ml (4 acompanhamentos)', price: 24.0, cost: 7.8 },
        { id: 's-700', name: 'Copo 700ml (5 acompanhamentos)', price: 31.0, cost: 10.5 },
        { id: 's-1000', name: 'Pote 1 Litro Família', price: 42.0, cost: 14.0 },
      ],
      description: 'Açaí cremoso batido com xarope de guaraná natural, montado em camadas com leite condensado e leite em pó.',
    },
    {
      name: 'Barca de Açaí dos Sonhos (Serve 3 pessoas)',
      category: 'Açaí na Tigela & Barcas',
      price: 58.0,
      cost: 18.5,
      description: 'Barca recheada com 800g de açaí puro, morangos, bananas fatiadas, kiwi, fios de Nutella, KitKat picado e confetes.',
    },
    {
      name: 'Casquinha Dupla Sorvete Artesanal',
      category: 'Sorvetes & Gelatos Artesanais',
      price: 12.0,
      cost: 3.2,
      description: 'Dois sabores à sua escolha servidos na casquinha de biscoito artesanal crocante.',
    },
  ],
  suggestedInventory: [
    { name: 'Balde Açaí Médio Especial 10 Litros', category: 'Polpas & Sorvetes', unit: 'L', currentQuantity: 30, minQuantity: 10, cost: 98.0 },
    { name: 'Leite em Pó Ninho Integral 1kg', category: 'Toppings & Secos', unit: 'kg', currentQuantity: 12, minQuantity: 4, cost: 38.0 },
    { name: 'Nutella Pote Profissional 3kg', category: 'Cremes & Coberturas', unit: 'kg', currentQuantity: 6, minQuantity: 2, cost: 145.0 },
    { name: 'Granola Crocante Tradicional', category: 'Toppings & Secos', unit: 'kg', currentQuantity: 15, minQuantity: 5, cost: 16.5 },
    { name: 'Copos Plásticos Transparentes 500ml (Cx 500un)', category: 'Embalagens', unit: 'cx', currentQuantity: 3, minQuantity: 1, cost: 85.0 },
  ],
};
