export type OrderStatus =
  | 'Novo'
  | 'Em preparo'
  | 'Pronto'
  | 'Saiu para entrega'
  | 'Concluído'
  | 'Cancelado';

export type OrderOrigin =
  | 'WhatsApp'
  | 'iFood'
  | 'Balcão'
  | 'Telefone'
  | 'Instagram'
  | 'Outro';

export type OrderType = 'Entrega' | 'Retirada' | 'Balcão';

export type PaymentMethod =
  | 'Dinheiro'
  | 'Pix'
  | 'Cartão de Crédito'
  | 'Cartão de Débito'
  | 'Outro';

export type PaymentStatus = 'Pendente' | 'Pago';

export type ProductCategory =
  | 'Pizzas'
  | 'Bebidas'
  | 'Sobremesas'
  | 'Acompanhamentos'
  | 'Combos'
  | 'Outros'
  | string;

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  parentId?: string;
  subcategories?: string[];
  order?: number;
  isActive: boolean;
  createdAt: string;
}

export interface ProductSize {
  id: string;
  name: string;
  slices?: number;
  maxFlavors?: number;
  price: number;
  cost: number;
}

export interface ProductCrust {
  id: string;
  name: string;
  price: number;
  cost: number;
  available: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  cost: number;
  category?: string;
  available: boolean;
  createdAt: string;
  isDemo?: boolean;
}

export interface ComboItem {
  id: string;
  productId?: string;
  productName: string;
  sizeName?: string;
  quantity: number;
}

export interface Combo {
  id: string;
  name: string;
  description: string;
  items: ComboItem[];
  originalPrice: number;
  comboPrice: number;
  discount: number;
  cost: number;
  available: boolean;
  image?: string;
  createdAt: string;
  isDemo?: boolean;
}

export interface PriceHistory {
  id: string;
  productId: string;
  oldPrice: number;
  newPrice: number;
  oldCost?: number;
  newCost?: number;
  changedAt: string;
  reason?: string;
}

export interface RecipeIngredient {
  id: string;
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: number; // Quantity in recipe (e.g. 250 for grams, 0.25 for kg, 1 for un)
  unit: InventoryUnit; // 'g' | 'kg' | 'un' | 'L' | 'pct' | 'cx'
  unitCost: number; // Cost per 1 unit of recipe measurement
  totalCost: number; // quantity * unitCost
}

export interface Product {
  id: string;
  name: string;
  code?: string; // SKU / Código
  categoryId: string;
  category: ProductCategory;
  subCategory?: string;
  description: string;
  price: number;
  cost: number;
  available: boolean;
  isArchived?: boolean; // Preserves history in past orders
  image?: string; // Base64 data url compressed locally
  hasSizes?: boolean;
  sizes?: ProductSize[];
  crusts?: ProductCrust[];
  allowedAddonIds?: string[];
  maxFlavors?: number;
  recipe?: RecipeIngredient[];
  preparationTimeMinutes?: number;
  yieldUnits?: number;
  recipeInstructions?: string;
  priceHistory?: PriceHistory[];
  createdAt: string;
  updatedAt?: string;
  isDemo?: boolean;
}

export interface OrderItemSize {
  name: string;
  slices?: number;
  price: number;
}

export interface OrderItemCrust {
  name: string;
  price: number;
}

export interface OrderItemAddon {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  category: ProductCategory | string;
  size?: OrderItemSize;
  flavors?: string[];
  crust?: OrderItemCrust;
  addons?: OrderItemAddon[];
  price: number;
  cost: number;
  quantity: number;
  notes?: string;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerId?: string;
  type: OrderType;
  origin: OrderOrigin;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  changeFor?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  isDemo?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  neighborhood?: string;
  city?: string;
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  createdAt: string;
  isDemo?: boolean;
}

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

export type InventoryUnit = 'kg' | 'g' | 'un' | 'L' | 'ml' | 'pct' | 'cx' | 'dz' | 'serv' | 'hr' | 'm' | string;

export interface InventoryItem {
  id: string;
  name: string;
  unit: InventoryUnit;
  currentQuantity: number;
  minQuantity: number;
  cost: number;
  category?: string;
  updatedAt: string;
  isDemo?: boolean;
}

export type ExpenseCategory =
  | 'Ingredientes'
  | 'Embalagens'
  | 'Aluguel'
  | 'Energia'
  | 'Água'
  | 'Internet'
  | 'Funcionários'
  | 'Marketing'
  | 'Manutenção'
  | 'Transporte'
  | 'Impostos'
  | 'Outros'
  | string;

export type TransactionCategory = 'Vendas' | ExpenseCategory | string;

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: TransactionCategory;
  paymentMethod?: PaymentMethod;
  orderId?: string;
  date: string;
  notes?: string;
  isDemo?: boolean;
}

export interface Settings {
  id: string;
  name: string;
  segment?: BusinessSegmentType;
  category?: string;
  slogan?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  notes?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  pixKey?: string;
  receiptFooterText?: string;
  whatsappTemplate?: string;
  theme: 'light' | 'dark' | 'system' | 'auto';
  currency: string;
  defaultDeliveryFee: number;
  isDemoMode?: boolean;
  setupCompleted?: boolean;
  autoBackupLocal?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'customers'
  | 'inventory'
  | 'finances'
  | 'reports'
  | 'settings'
  | 'backup';
