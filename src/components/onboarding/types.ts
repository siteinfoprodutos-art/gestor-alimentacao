import { BusinessSegmentType, InventoryUnit, PaymentMethod, OrderType } from '../../types';

export type WizardStep = 'welcome' | 'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'completion';

export interface BusinessCategoryOption {
  id: BusinessSegmentType;
  name: string;
  icon: string;
  color: string;
  description: string;
  defaultDeliveryFee: number;
}

export interface SuggestedProduct {
  name: string;
  category: string;
  price: number;
  cost: number;
  description: string;
}

export interface SuggestedInventory {
  name: string;
  unit: InventoryUnit;
  currentQuantity: number;
  minQuantity: number;
  cost: number;
}

export interface WizardProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  description?: string;
}

export interface WizardInventoryItem {
  id: string;
  name: string;
  unit: InventoryUnit;
  currentQuantity: number;
  minQuantity: number;
  cost: number;
}

export interface WizardFirstSale {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  type: OrderType;
  paymentMethod: PaymentMethod;
  selectedProductIds: { productId: string; quantity: number }[];
  deliveryFee: number;
  discount: number;
  notes: string;
  shouldCreateSale: boolean;
}

export interface WizardState {
  segment: BusinessSegmentType;
  businessName: string;
  category: string;
  slogan: string;
  phone: string;
  whatsapp: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  products: WizardProductItem[];
  inventory: WizardInventoryItem[];
  firstSale: WizardFirstSale;
}

