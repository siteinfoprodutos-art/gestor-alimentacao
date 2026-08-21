import { BusinessSegmentConfig } from '../types';

export const adegaSegment: BusinessSegmentConfig = {
  id: 'adega',
  name: 'Adega & Distribuidora de Bebidas',
  emoji: '🍺',
  tagline: 'Gestão de Adegas, Empórios, Cervejarias & Tabacaria',
  description: 'Controle de fardos, garrafas individuais, caixas térmicas, gelo, carvão, tabacaria e vendas rápidas no balcão/delivery.',
  primaryColor: '#eab308', // Dourado cervejeiro / âmbar
  secondaryColor: '#ca8a04',
  defaultCategories: [
    'Cervejas em Lata & Long Neck',
    'Cervejas Especiais & Artesanais',
    'Fardos & Packs Econômicos',
    'Destilados (Gin, Vodka, Whisky)',
    'Vinhos & Espumantes',
    'Gelo, Carvão & Acessórios',
    'Refrigerantes, Energéticos & Água',
    'Tabacaria & Snacks',
  ],
  defaultUnits: ['un', 'cx', 'pct', 'L'],
  terminology: {
    productSingular: 'Bebida / Produto',
    productPlural: 'Bebidas & Produtos',
    newProductLabel: 'Nova Bebida / Item',
    inventoryLabel: 'Estoque de Fardos & Bebidas',
    recipeLabel: 'Composição de Combos & Kits',
    salesLabel: 'Vendas de Balcão & Disk Bebidas',
    customerLabel: 'Clientes',
    categoryLabel: 'Departamentos de Bebidas',
  },
  features: {
    hasSizes: false,
    hasCrustsOrBorders: false,
    hasFlavors: false,
    hasAddons: true, // Copo descartável, gelo de sabor, canudo
    hasCombos: true, // Kit Whisky + 4 Energéticos + Gelo de Coco
    hasRecipeCostCMV: false, // Revenda direta com margem de lucro
    hasInventory: true,
    hasDelivery: true,
    hasCodeSKU: true,
    hasPreparationTime: false,
  },
  suggestedProducts: [
    {
      name: 'Cerveja Heineken Long Neck 330ml (Gelada)',
      category: 'Cervejas em Lata & Long Neck',
      price: 9.5,
      cost: 5.8,
      code: '7891991000856',
      description: 'Long neck tradicional estupidamente gelada.',
    },
    {
      name: 'Combo Whisky Red Label 1L + 4 Red Bull + Gelo de Coco',
      category: 'Destilados (Gin, Vodka, Whisky)',
      price: 159.0,
      cost: 105.0,
      description: 'Garrafa de Red Label 1 Litro original + 4 latas de energético Red Bull 250ml + 2 copos descartáveis 700ml + saco de gelo de coco.',
    },
    {
      name: 'Fardo Cerveja Amstel Lata 350ml (12 un)',
      category: 'Fardos & Packs Econômicos',
      price: 44.9,
      cost: 33.0,
      description: 'Fardo lacrado temperatura ambiente ou gelado.',
    },
    {
      name: 'Saco de Gelo Filtrado 5kg',
      category: 'Gelo, Carvão & Acessórios',
      price: 14.0,
      cost: 6.5,
      description: 'Gelo em cubos cristalinos para drinks.',
    },
  ],
  suggestedInventory: [
    { name: 'Heineken Long Neck 330ml (Caixa 24un)', category: 'Cervejas', unit: 'cx', currentQuantity: 15, minQuantity: 5, cost: 139.2 },
    { name: 'Red Label Whisky 1L Garrafa', category: 'Destilados', unit: 'un', currentQuantity: 18, minQuantity: 4, cost: 72.0 },
    { name: 'Red Bull Energy Drink 250ml (Pack 24un)', category: 'Energéticos', unit: 'cx', currentQuantity: 8, minQuantity: 2, cost: 148.0 },
    { name: 'Carvão Vegetal Especial 3kg', category: 'Churrasco', unit: 'pct', currentQuantity: 30, minQuantity: 10, cost: 9.5 },
    { name: 'Gelo de Coco Sachê 200ml (Cx 50un)', category: 'Gelos & Bebidas', unit: 'cx', currentQuantity: 6, minQuantity: 2, cost: 65.0 },
  ],
};
