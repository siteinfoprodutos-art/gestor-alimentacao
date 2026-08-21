import { BusinessSegmentConfig } from '../types';

export const outroSegment: BusinessSegmentConfig = {
  id: 'outro',
  name: 'Negócio Personalizado / Outro',
  emoji: '📦',
  tagline: 'Gestão Flexível para Qualquer Tipo de Negócio',
  description: 'Estrutura aberta e flexível para comércio, artesanato, confecção, pet shops, estúdios ou pequenos negócios.',
  primaryColor: '#4f46e5', // Índigo moderno
  secondaryColor: '#818cf8',
  defaultCategories: [
    'Produtos Principais',
    'Linha Especial & Premium',
    'Acessórios & Complementos',
    'Serviços & Personalizações',
    'Kits & Combos',
    'Outros',
  ],
  defaultUnits: ['un', 'kg', 'g', 'L', 'pct', 'cx', 'm', 'serv'],
  terminology: {
    productSingular: 'Item / Produto',
    productPlural: 'Itens & Produtos',
    newProductLabel: 'Novo Item / Produto',
    inventoryLabel: 'Estoque Geral de Itens',
    recipeLabel: 'Composição de Custos / Ficha',
    salesLabel: 'Vendas & Atendimentos',
    customerLabel: 'Clientes',
    categoryLabel: 'Categorias de Produtos',
  },
  features: {
    hasSizes: true,
    hasCrustsOrBorders: false,
    hasFlavors: false,
    hasAddons: true,
    hasCombos: true,
    hasRecipeCostCMV: true,
    hasInventory: true,
    hasDelivery: true,
    hasCodeSKU: true,
    hasPreparationTime: true,
  },
  suggestedProducts: [
    {
      name: 'Item / Produto Principal Exemplo',
      category: 'Produtos Principais',
      price: 50.0,
      cost: 20.0,
      unit: 'un',
      description: 'Item padrão de venda cadastrado com margem de lucro calculada.',
    },
    {
      name: 'Kit / Combo Promocional',
      category: 'Kits & Combos',
      price: 85.0,
      cost: 35.0,
      unit: 'un',
      description: 'Combinação de produtos com desconto especial para o cliente.',
    },
  ],
  suggestedInventory: [
    { name: 'Matéria-Prima / Insumo Principal', category: 'Matéria-Prima', unit: 'un', currentQuantity: 20, minQuantity: 5, cost: 10.0 },
    { name: 'Embalagem de Envio / Sacola Personalizada', category: 'Embalagens', unit: 'un', currentQuantity: 100, minQuantity: 20, cost: 1.5 },
  ],
};
