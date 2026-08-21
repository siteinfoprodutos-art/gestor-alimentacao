import { InventoryUnit, ProductSize } from '../../types';

export type BusinessSegmentType =
  | 'pizzaria'
  | 'padaria'
  | 'hamburgueria'
  | 'confeitaria'
  | 'adega'
  | 'acai_sorveteria'
  | 'restaurante'
  | 'lanchonete'
  | 'mercadinho'
  | 'cafeteria'
  | 'salao_barbearia'
  | 'servicos'
  | 'outro';

export interface BusinessTerminology {
  productSingular: string;      // e.g. "Produto", "Serviço", "Item", "Prato"
  productPlural: string;        // e.g. "Produtos", "Serviços", "Itens", "Pratos"
  newProductLabel: string;      // e.g. "Novo Produto", "Novo Serviço"
  inventoryLabel: string;       // e.g. "Estoque de Insumos", "Estoque Geral", "Insumos & Materiais"
  recipeLabel: string;          // e.g. "Ficha Técnica / Receita", "Composição de Custo", "Materiais por Serviço"
  salesLabel: string;           // e.g. "Vendas", "Atendimentos / Vendas"
  customerLabel: string;        // e.g. "Clientes", "Consumidores"
  categoryLabel: string;        // e.g. "Categorias", "Setores"
}

export interface BusinessSegmentFeatures {
  hasSizes: boolean;             // Tamanhos (P/M/G, etc)
  hasCrustsOrBorders: boolean;   // Bordas recheadas (ex: pizzaria)
  hasFlavors: boolean;           // Sabores divididos (ex: meio a meio)
  hasAddons: boolean;            // Adicionais / complementos
  hasCombos: boolean;            // Combos e promoções
  hasRecipeCostCMV: boolean;     // Ficha técnica e cálculo de CMV
  hasInventory: boolean;         // Controle de estoque de insumos
  hasDelivery: boolean;          // Opções de entrega e taxa
  hasCodeSKU: boolean;           // Código de barras / SKU
  hasPreparationTime: boolean;   // Tempo de preparo / Duração do procedimento
}

export interface SuggestedProduct {
  name: string;
  category: string;
  price: number;
  cost: number;
  unit?: InventoryUnit;
  hasSizes?: boolean;
  sizes?: ProductSize[];
  description?: string;
  code?: string;
}

export interface SuggestedInventory {
  name: string;
  category: string;
  unit: InventoryUnit;
  currentQuantity: number;
  minQuantity: number;
  cost: number;
}

export interface BusinessSegmentConfig {
  id: BusinessSegmentType;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  defaultCategories: string[];
  defaultUnits: InventoryUnit[];
  terminology: BusinessTerminology;
  features: BusinessSegmentFeatures;
  suggestedProducts: SuggestedProduct[];
  suggestedInventory: SuggestedInventory[];
}
