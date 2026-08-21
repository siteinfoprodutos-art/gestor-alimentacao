import { BusinessSegmentConfig } from '../types';

export const restauranteSegment: BusinessSegmentConfig = {
  id: 'restaurante',
  name: 'Restaurante & Marmitaria',
  emoji: '🍗',
  tagline: 'Gestão de Restaurantes, Pratos Feitos & Self-Service',
  description: 'Controle de pratos executivos, marmitex (P/M/G), porções de almoço/jantar, bebidas e fichas de custo gastronômico.',
  primaryColor: '#c2410c', // Laranja terra / terracota
  secondaryColor: '#ea580c',
  defaultCategories: [
    'Marmitex & Executivos',
    'Pratos à la Carte',
    'Porções & Petiscos',
    'Guarnições & Acompanhamentos',
    'Sobremesas Caseiras',
    'Sucos Naturais & Bebidas',
  ],
  defaultUnits: ['kg', 'g', 'un', 'L', 'pct', 'cx'],
  terminology: {
    productSingular: 'Prato / Refeição',
    productPlural: 'Pratos & Refeições',
    newProductLabel: 'Novo Prato / Marmitex',
    inventoryLabel: 'Estoque',
    recipeLabel: 'Ficha Técnica do Prato',
    salesLabel: 'Vendas & Comandas',
    customerLabel: 'Clientes & Comensais',
    categoryLabel: 'Categorias do Cardápio',
  },
  features: {
    hasSizes: true, // Marmitex P, M, G ou Meio Prato / Inteiro
    hasCrustsOrBorders: false,
    hasFlavors: false,
    hasAddons: true, // Ovo frito extra, feijão tropeiro, salada extra
    hasCombos: true, // Prato + Suco + Sobremesa
    hasRecipeCostCMV: true,
    hasInventory: true,
    hasDelivery: true,
    hasCodeSKU: false,
    hasPreparationTime: true,
  },
  suggestedProducts: [
    {
      name: 'Marmitex Executiva de Picanha Grelhada',
      category: 'Marmitex & Executivos',
      price: 32.0,
      cost: 11.8,
      hasSizes: true,
      sizes: [
        { id: 's-p', name: 'Marmitex P (Individual leve)', price: 24.0, cost: 8.5 },
        { id: 's-m', name: 'Marmitex M (Tradicional)', price: 32.0, cost: 11.8 },
        { id: 's-g', name: 'Marmitex G (Reforçada)', price: 39.0, cost: 14.5 },
      ],
      description: 'Picanha fatiada grelhada na chapa, arroz branco soltinho, feijão carioca temperado com louro, farofa de bacon crocante e salada fresca mista.',
    },
    {
      name: 'Filé de Frango Grelhado com Legumes no Vapor',
      category: 'Pratos à la Carte',
      price: 28.0,
      cost: 8.2,
      description: 'Filé de peito marinado em limão e ervas finas grelhado, acompanhado de brócolis, cenoura e batata sautée.',
    },
    {
      name: 'Porção Frango a Passarinho com Alho Dourado',
      category: 'Porções & Petiscos',
      price: 45.0,
      cost: 16.0,
      description: '1kg de pedaços crocantes de frango frito com lâminas de alho torrado e cheiro verde picado.',
    },
    {
      name: 'Suco Natural de Laranja Jarra 700ml',
      category: 'Sucos Naturais & Bebidas',
      price: 14.0,
      cost: 4.5,
      description: 'Espremido da fruta na hora, 100% puro sem adição de água.',
    },
  ],
  suggestedInventory: [
    { name: 'Arroz Tipo 1 Selecionado 5kg', category: 'Grãos & Secos', unit: 'pct', currentQuantity: 20, minQuantity: 6, cost: 26.5 },
    { name: 'Feijão Carioca Novo 1kg', category: 'Grãos & Secos', unit: 'kg', currentQuantity: 25, minQuantity: 8, cost: 7.9 },
    { name: 'Peito de Frango Resfriado', category: 'Carnes & Aves', unit: 'kg', currentQuantity: 30, minQuantity: 10, cost: 17.5 },
    { name: 'Picanha Bovina Fatiada', category: 'Carnes & Aves', unit: 'kg', currentQuantity: 15, minQuantity: 5, cost: 58.0 },
    { name: 'Embalagem de Isopor / Alumínio para Marmita', category: 'Embalagens', unit: 'un', currentQuantity: 300, minQuantity: 80, cost: 0.85 },
  ],
};
