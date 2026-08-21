import { BusinessSegmentConfig } from '../types';

export const servicosSegment: BusinessSegmentConfig = {
  id: 'servicos',
  name: 'Prestação de Serviços & Manutenção',
  emoji: '🛠',
  tagline: 'Gestão de Assistências Técnicas, Reformas & Serviços Gerais',
  description: 'Controle de ordens de serviço, mão de obra, peças/materiais aplicados, orçamentos e histórico de clientes.',
  primaryColor: '#475569', // Cinza ardósia técnico / profissional
  secondaryColor: '#64748b',
  defaultCategories: [
    'Mão de Obra & Diagnósticos',
    'Manutenções Preventivas',
    'Reparos & Troca de Peças',
    'Instalações & Montagens',
    'Peças & Componentes',
    'Contratos & Planos Mensais',
  ],
  defaultUnits: ['serv', 'un', 'hr', 'm', 'pct', 'cx'],
  terminology: {
    productSingular: 'Serviço / Peça',
    productPlural: 'Serviços & Materiais',
    newProductLabel: 'Novo Serviço / Material',
    inventoryLabel: 'Estoque de Peças & Materiais',
    recipeLabel: 'Materiais / Peças por Serviço',
    salesLabel: 'Ordens de Serviço & Vendas',
    customerLabel: 'Clientes / Contratantes',
    categoryLabel: 'Tipos de Serviços',
  },
  features: {
    hasSizes: false,
    hasCrustsOrBorders: false,
    hasFlavors: false,
    hasAddons: true, // Garantia estendida, visita técnica urgente
    hasCombos: true, // Pacote Manutenção Completa
    hasRecipeCostCMV: true, // Peças e materiais usados no conserto
    hasInventory: true,
    hasDelivery: false,
    hasCodeSKU: true,
    hasPreparationTime: true, // Tempo estimado de execução
  },
  suggestedProducts: [
    {
      name: 'Diagnóstico Técnico & Visita Especializada',
      category: 'Mão de Obra & Diagnósticos',
      price: 80.0,
      cost: 15.0,
      unit: 'serv',
      description: 'Avaliação técnica presencial ou em bancada para identificação de falhas e orçamento detalhado.',
    },
    {
      name: 'Higienização & Manutenção Preventiva Completa',
      category: 'Manutenções Preventivas',
      price: 180.0,
      cost: 35.0,
      unit: 'serv',
      description: 'Desmontagem, limpeza química profunda de componentes, lubrificação, testes de tensão e calibração.',
    },
    {
      name: 'Troca de Peça / Componente com Garantia 90 Dias',
      category: 'Reparos & Troca de Peças',
      price: 120.0,
      cost: 45.0,
      unit: 'serv',
      description: 'Substituição de peça avariada por componente novo original e testes de funcionamento.',
    },
  ],
  suggestedInventory: [
    { name: 'Spray Limpa Contatos Elétricos 300ml', category: 'Insumos', unit: 'un', currentQuantity: 6, minQuantity: 2, cost: 19.5 },
    { name: 'Fita Isolante de Alta Tensão 20m', category: 'Insumos', unit: 'un', currentQuantity: 10, minQuantity: 3, cost: 8.9 },
    { name: 'Graxa Branca de Lítio Especial 500g', category: 'Insumos', unit: 'un', currentQuantity: 4, minQuantity: 1, cost: 24.0 },
    { name: 'Cabos e Conectores Padrão (Kit)', category: 'Peças', unit: 'cx', currentQuantity: 5, minQuantity: 2, cost: 65.0 },
  ],
};
