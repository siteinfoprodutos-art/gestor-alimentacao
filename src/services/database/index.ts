import {
  AddOn,
  BusinessSegmentType,
  Category,
  Combo,
  Customer,
  InventoryItem,
  Order,
  OrderStatus,
  PriceHistory,
  Product,
  Settings,
  Transaction,
} from '../../types';
import {
  clearStore,
  deleteItemFromStore,
  getAllFromStore,
  getItemFromStore,
  getDB,
  initializeDatabase,
  putItemToStore,
} from './db';
import {
  DEMO_ADDONS,
  DEMO_CATEGORIES,
  DEMO_COMBOS,
  DEMO_CUSTOMERS,
  DEMO_INVENTORY,
  DEMO_ORDERS,
  DEMO_PRODUCTS,
  DEMO_TRANSACTIONS,
  INITIAL_SETTINGS,
} from './demoData';
import { getSegmentConfig } from '../../config/businessSegments';

// Initialization & Raw Store Access
export { initializeDatabase, getDB, getAllFromStore, getItemFromStore, putItemToStore };

// Settings
export async function getSettings(): Promise<Settings> {
  let settings = await getItemFromStore<Settings>('settings', 'settings');
  if (!settings) {
    settings = INITIAL_SETTINGS;
    await putItemToStore('settings', settings);
  }
  return settings;
}

export async function updateSettings(settings: Settings): Promise<Settings> {
  settings.updatedAt = new Date().toISOString();
  return await putItemToStore('settings', settings);
}

// Categories
export async function getCategories(): Promise<Category[]> {
  const categories = await getAllFromStore<Category>('categories');
  if (categories.length === 0) {
    for (const cat of DEMO_CATEGORIES) {
      await putItemToStore('categories', cat);
    }
    return DEMO_CATEGORIES;
  }
  return categories.sort((a, b) => (a.order || 99) - (b.order || 99));
}

export async function saveCategory(category: Category): Promise<Category> {
  return await putItemToStore('categories', category);
}

export async function deleteCategory(id: string): Promise<void> {
  return await deleteItemFromStore('categories', id);
}

// Addons
export async function getAddons(): Promise<AddOn[]> {
  const addons = await getAllFromStore<AddOn>('addons');
  if (addons.length === 0) {
    for (const add of DEMO_ADDONS) {
      await putItemToStore('addons', add);
    }
    return DEMO_ADDONS;
  }
  return addons.sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveAddon(addon: AddOn): Promise<AddOn> {
  return await putItemToStore('addons', addon);
}

export async function deleteAddon(id: string): Promise<void> {
  return await deleteItemFromStore('addons', id);
}

export async function toggleAddonAvailability(id: string): Promise<AddOn | null> {
  const addon = await getItemFromStore<AddOn>('addons', id);
  if (!addon) return null;
  addon.available = !addon.available;
  return await putItemToStore('addons', addon);
}

// Combos
export async function getCombos(): Promise<Combo[]> {
  const combos = await getAllFromStore<Combo>('combos');
  if (combos.length === 0) {
    for (const c of DEMO_COMBOS) {
      await putItemToStore('combos', c);
    }
    return DEMO_COMBOS;
  }
  return combos.sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveCombo(combo: Combo): Promise<Combo> {
  return await putItemToStore('combos', combo);
}

export async function deleteCombo(id: string): Promise<void> {
  return await deleteItemFromStore('combos', id);
}

export async function toggleComboAvailability(id: string): Promise<Combo | null> {
  const combo = await getItemFromStore<Combo>('combos', id);
  if (!combo) return null;
  combo.available = !combo.available;
  return await putItemToStore('combos', combo);
}

// Products
export async function getProducts(includeArchived = false): Promise<Product[]> {
  const products = await getAllFromStore<Product>('products');
  const filtered = includeArchived ? products : products.filter((p) => !p.isArchived);
  return filtered.sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveProduct(product: Product): Promise<Product> {
  // Check if existing product has price change to log history
  const existing = await getItemFromStore<Product>('products', product.id);
  if (existing && (existing.price !== product.price || existing.cost !== product.cost)) {
    const historyEntry: PriceHistory = {
      id: `ph-${Date.now()}`,
      productId: product.id,
      oldPrice: existing.price,
      newPrice: product.price,
      oldCost: existing.cost,
      newCost: product.cost,
      changedAt: new Date().toISOString(),
    };
    await putItemToStore('priceHistory', historyEntry);

    // Keep history array in product model as well
    const history = product.priceHistory || existing.priceHistory || [];
    product.priceHistory = [historyEntry, ...history].slice(0, 20);
  }

  product.updatedAt = new Date().toISOString();
  return await putItemToStore('products', product);
}

export async function duplicateProduct(id: string): Promise<Product | null> {
  const original = await getItemFromStore<Product>('products', id);
  if (!original) return null;

  const duplicated: Product = {
    ...original,
    id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name: `${original.name} (Cópia)`,
    code: original.code ? `${original.code}-COP` : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: false,
    priceHistory: [],
  };

  return await putItemToStore('products', duplicated);
}

export async function archiveProduct(id: string): Promise<Product | null> {
  const product = await getItemFromStore<Product>('products', id);
  if (!product) return null;
  product.isArchived = true;
  product.available = false;
  product.updatedAt = new Date().toISOString();
  return await putItemToStore('products', product);
}

export async function deleteProduct(id: string): Promise<void> {
  // Check if product was used in any order
  const orders = await getAllFromStore<Order>('orders');
  const isUsedInOrders = orders.some((o) =>
    o.items?.some((i) => i.productId === id)
  );

  if (isUsedInOrders) {
    // Soft delete / archive to preserve historic orders
    await archiveProduct(id);
  } else {
    // Hard delete if never ordered
    await deleteItemFromStore('products', id);
  }
}

export async function toggleProductAvailability(id: string): Promise<Product | null> {
  const product = await getItemFromStore<Product>('products', id);
  if (!product) return null;
  product.available = !product.available;
  product.updatedAt = new Date().toISOString();
  return await putItemToStore('products', product);
}

// Customers
export async function getCustomers(): Promise<Customer[]> {
  const customers = await getAllFromStore<Customer>('customers');
  return customers.sort((a, b) => (b.lastOrderDate || '').localeCompare(a.lastOrderDate || ''));
}

export async function saveCustomer(customer: Customer): Promise<Customer> {
  return await putItemToStore('customers', customer);
}

export async function deleteCustomer(id: string): Promise<void> {
  return await deleteItemFromStore('customers', id);
}

// Orders
export async function getOrders(): Promise<Order[]> {
  const orders = await getAllFromStore<Order>('orders');
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getNextOrderNumber(): Promise<number> {
  const orders = await getAllFromStore<Order>('orders');
  if (orders.length === 0) return 101;
  const maxNumber = Math.max(...orders.map((o) => o.orderNumber || 0));
  return maxNumber + 1;
}

export async function saveOrder(order: Order): Promise<Order> {
  const isNew = !(await getItemFromStore<Order>('orders', order.id));
  
  // Save order
  const saved = await putItemToStore('orders', order);

  // Auto create / update customer if valid phone/name
  if (order.customerName && order.customerPhone) {
    try {
      const customers = await getAllFromStore<Customer>('customers');
      const cleanPhone = order.customerPhone.replace(/\D/g, '');
      const existing = customers.find(
        (c) => c.phone.replace(/\D/g, '') === cleanPhone || c.name.toLowerCase() === order.customerName.toLowerCase()
      );

      if (existing) {
        if (order.status === 'Concluído' || isNew) {
          existing.totalOrders = (existing.totalOrders || 0) + (isNew ? 1 : 0);
          existing.totalSpent = (existing.totalSpent || 0) + (isNew ? order.total : 0);
          existing.lastOrderDate = new Date().toISOString();
          if (order.customerAddress && !existing.address) {
            existing.address = order.customerAddress;
          }
          await putItemToStore('customers', existing);
        }
      } else {
        const newCust: Customer = {
          id: `cust-${Date.now()}`,
          name: order.customerName,
          phone: order.customerPhone,
          address: order.customerAddress || '',
          totalOrders: 1,
          totalSpent: order.total,
          lastOrderDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          isDemo: order.isDemo,
        };
        await putItemToStore('customers', newCust);
      }
    } catch (e) {
      console.warn('Customer auto-link warning:', e);
    }
  }

  // Register income transaction if order is marked as paid or completed
  if (order.paymentStatus === 'Pago' || order.status === 'Concluído') {
    const transactions = await getAllFromStore<Transaction>('transactions');
    const existingTx = transactions.find((t) => t.orderId === order.id);
    if (!existingTx) {
      const newTx: Transaction = {
        id: `tx-ord-${order.id}`,
        type: 'income',
        description: `Venda Pedido #${order.orderNumber} (${order.customerName})`,
        amount: order.total,
        category: 'Vendas',
        paymentMethod: order.paymentMethod,
        orderId: order.id,
        date: order.createdAt,
        isDemo: order.isDemo,
      };
      await putItemToStore('transactions', newTx);
    }
  }

  return saved;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
  const order = await getItemFromStore<Order>('orders', orderId);
  if (!order) return null;

  order.status = status;
  order.updatedAt = new Date().toISOString();
  if (status === 'Concluído' && !order.completedAt) {
    order.completedAt = new Date().toISOString();
    order.paymentStatus = 'Pago';

    // Ensure transaction is logged
    const transactions = await getAllFromStore<Transaction>('transactions');
    const existingTx = transactions.find((t) => t.orderId === order.id);
    if (!existingTx) {
      const newTx: Transaction = {
        id: `tx-ord-${order.id}`,
        type: 'income',
        description: `Venda Pedido #${order.orderNumber} (${order.customerName})`,
        amount: order.total,
        category: 'Vendas',
        paymentMethod: order.paymentMethod,
        orderId: order.id,
        date: new Date().toISOString(),
        isDemo: order.isDemo,
      };
      await putItemToStore('transactions', newTx);
    }
  }

  return await putItemToStore('orders', order);
}

export async function deleteOrder(id: string): Promise<void> {
  await deleteItemFromStore('orders', id);
  // Also delete associated transaction if any
  const transactions = await getAllFromStore<Transaction>('transactions');
  const tx = transactions.find((t) => t.orderId === id);
  if (tx) {
    await deleteItemFromStore('transactions', tx.id);
  }
}

// Inventory
export async function getInventory(): Promise<InventoryItem[]> {
  const items = await getAllFromStore<InventoryItem>('inventory');
  return items.sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveInventoryItem(item: InventoryItem): Promise<InventoryItem> {
  item.updatedAt = new Date().toISOString();
  return await putItemToStore('inventory', item);
}

export async function deleteInventoryItem(id: string): Promise<void> {
  return await deleteItemFromStore('inventory', id);
}

export async function adjustInventoryQuantity(id: string, delta: number): Promise<InventoryItem | null> {
  const item = await getItemFromStore<InventoryItem>('inventory', id);
  if (!item) return null;
  item.currentQuantity = Math.max(0, Number((item.currentQuantity + delta).toFixed(2)));
  item.updatedAt = new Date().toISOString();
  return await putItemToStore('inventory', item);
}

// Transactions / Finances
export async function getTransactions(): Promise<Transaction[]> {
  const txs = await getAllFromStore<Transaction>('transactions');
  return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function saveTransaction(tx: Transaction): Promise<Transaction> {
  return await putItemToStore('transactions', tx);
}

export async function deleteTransaction(id: string): Promise<void> {
  return await deleteItemFromStore('transactions', id);
}

// Data Management: Reset, Clear Demo, Full Backup
export async function clearAllDemoData(): Promise<void> {
  const products = (await getAllFromStore<Product>('products')).filter((p) => !p.isDemo);
  const categories = (await getAllFromStore<Category>('categories'));
  const addons = (await getAllFromStore<AddOn>('addons')).filter((a) => !a.isDemo);
  const combos = (await getAllFromStore<Combo>('combos')).filter((c) => !c.isDemo);
  const customers = (await getAllFromStore<Customer>('customers')).filter((c) => !c.isDemo);
  const inventory = (await getAllFromStore<InventoryItem>('inventory')).filter((i) => !i.isDemo);
  const orders = (await getAllFromStore<Order>('orders')).filter((o) => !o.isDemo);
  const transactions = (await getAllFromStore<Transaction>('transactions')).filter((t) => !t.isDemo);

  await clearStore('products');
  await clearStore('addons');
  await clearStore('combos');
  await clearStore('customers');
  await clearStore('inventory');
  await clearStore('orders');
  await clearStore('transactions');

  for (const p of products) await putItemToStore('products', p);
  for (const c of categories) await putItemToStore('categories', c);
  for (const a of addons) await putItemToStore('addons', a);
  for (const cm of combos) await putItemToStore('combos', cm);
  for (const cu of customers) await putItemToStore('customers', cu);
  for (const i of inventory) await putItemToStore('inventory', i);
  for (const o of orders) await putItemToStore('orders', o);
  for (const t of transactions) await putItemToStore('transactions', t);

  const settings = await getSettings();
  settings.isDemoMode = false;
  await updateSettings(settings);
}

export async function resetToDemoData(segmentId?: BusinessSegmentType): Promise<void> {
  await clearStore('settings');
  await clearStore('categories');
  await clearStore('products');
  await clearStore('addons');
  await clearStore('combos');
  await clearStore('priceHistory');
  await clearStore('customers');
  await clearStore('inventory');
  await clearStore('orders');
  await clearStore('transactions');

  if (!segmentId || segmentId === 'pizzaria') {
    const pizzariaSettings: Settings = {
      ...INITIAL_SETTINGS,
      segment: 'pizzaria',
      name: 'Pizzaria AL Studio',
      category: 'Pizzaria & Fornaria',
      primaryColor: '#ef4444',
      secondaryColor: '#f97316',
      isDemoMode: true,
      setupCompleted: true,
      updatedAt: new Date().toISOString(),
    };
    await putItemToStore('settings', pizzariaSettings);
    for (const cat of DEMO_CATEGORIES) await putItemToStore('categories', cat);
    for (const p of DEMO_PRODUCTS) await putItemToStore('products', p);
    for (const a of DEMO_ADDONS) await putItemToStore('addons', a);
    for (const cm of DEMO_COMBOS) await putItemToStore('combos', cm);
    for (const c of DEMO_CUSTOMERS) await putItemToStore('customers', c);
    for (const i of DEMO_INVENTORY) await putItemToStore('inventory', i);
    for (const o of DEMO_ORDERS) await putItemToStore('orders', o);
    for (const t of DEMO_TRANSACTIONS) await putItemToStore('transactions', t);
    return;
  }

  const segmentConfig = getSegmentConfig(segmentId);

  const newSettings: Settings = {
    id: 'settings',
    segment: segmentId,
    name: `${segmentConfig.emoji} ${segmentConfig.name} Demo`,
    category: segmentConfig.name,
    slogan: segmentConfig.tagline,
    phone: '(11) 98765-4321',
    whatsapp: '11987654321',
    email: `contato@${segmentId}.com.br`,
    address: 'Av. Comercial, 500',
    city: 'São Paulo',
    state: 'SP',
    theme: 'dark',
    primaryColor: segmentConfig.primaryColor,
    secondaryColor: segmentConfig.secondaryColor,
    currency: 'R$',
    defaultDeliveryFee: segmentConfig.features.hasDelivery ? 6.0 : 0,
    isDemoMode: true,
    setupCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await putItemToStore('settings', newSettings);

  // Categories
  const createdCategories: Category[] = segmentConfig.defaultCategories.map((catName, idx) => ({
    id: `cat-${segmentId}-${idx + 1}`,
    name: catName,
    icon: segmentConfig.emoji,
    color: segmentConfig.primaryColor,
    order: idx + 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  }));
  for (const cat of createdCategories) {
    await putItemToStore('categories', cat);
  }

  // Products
  const createdProducts: Product[] = segmentConfig.suggestedProducts.map((p, idx) => ({
    id: `prod-${segmentId}-${idx + 1}`,
    name: p.name,
    categoryId: createdCategories.find((c) => c.name === p.category)?.id || createdCategories[0]?.id || 'cat-1',
    category: p.category,
    description: p.description || '',
    price: p.price,
    cost: p.cost,
    available: true,
    hasSizes: p.hasSizes || false,
    sizes: p.sizes || [],
    code: p.code,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true,
  }));
  for (const prod of createdProducts) {
    await putItemToStore('products', prod);
  }

  // Inventory
  const createdInventory: InventoryItem[] = segmentConfig.suggestedInventory.map((item, idx) => ({
    id: `inv-${segmentId}-${idx + 1}`,
    name: item.name,
    category: item.category,
    unit: item.unit,
    currentQuantity: item.currentQuantity,
    minQuantity: item.minQuantity,
    cost: item.cost,
    updatedAt: new Date().toISOString(),
    isDemo: true,
  }));
  for (const inv of createdInventory) {
    await putItemToStore('inventory', inv);
  }

  // Customers
  for (const c of DEMO_CUSTOMERS) {
    await putItemToStore('customers', { ...c, isDemo: true });
  }

  // Sample Orders & Transactions
  if (createdProducts.length > 0) {
    const prod1 = createdProducts[0];
    const prod2 = createdProducts[1] || createdProducts[0];

    const sampleOrder1: Order = {
      id: `ord-${segmentId}-101`,
      orderNumber: 101,
      customerName: 'Carlos Eduardo Ramos',
      customerPhone: '(11) 98888-1111',
      customerAddress: 'Rua das Flores, 142 - Apto 31',
      type: segmentConfig.features.hasDelivery ? 'Entrega' : 'Balcão',
      origin: 'WhatsApp',
      status: 'Concluído',
      items: [
        {
          id: `item-${Date.now()}-1`,
          productId: prod1.id,
          name: prod1.name,
          category: prod1.category,
          price: prod1.price,
          cost: prod1.cost,
          quantity: 1,
          subtotal: prod1.price,
        },
      ],
      subtotal: prod1.price,
      deliveryFee: segmentConfig.features.hasDelivery ? 6.0 : 0,
      discount: 0,
      total: prod1.price + (segmentConfig.features.hasDelivery ? 6.0 : 0),
      paymentMethod: 'Pix',
      paymentStatus: 'Pago',
      notes: 'Cliente satisfeito com a rapidez',
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      completedAt: new Date(Date.now() - 1.5 * 3600000).toISOString(),
      isDemo: true,
    };

    const sampleOrder2: Order = {
      id: `ord-${segmentId}-102`,
      orderNumber: 102,
      customerName: 'Ana Beatriz Souza',
      customerPhone: '(11) 97777-2222',
      type: 'Balcão',
      origin: 'Balcão',
      status: 'Concluído',
      items: [
        {
          id: `item-${Date.now()}-2`,
          productId: prod2.id,
          name: prod2.name,
          category: prod2.category,
          price: prod2.price,
          cost: prod2.cost,
          quantity: 2,
          subtotal: prod2.price * 2,
        },
      ],
      subtotal: prod2.price * 2,
      deliveryFee: 0,
      discount: 0,
      total: prod2.price * 2,
      paymentMethod: 'Cartão de Crédito',
      paymentStatus: 'Pago',
      createdAt: new Date(Date.now() - 50 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 50 * 60000).toISOString(),
      completedAt: new Date(Date.now() - 30 * 60000).toISOString(),
      isDemo: true,
    };

    await putItemToStore('orders', sampleOrder1);
    await putItemToStore('orders', sampleOrder2);

    const tx1: Transaction = {
      id: `tx-ord-${sampleOrder1.id}`,
      type: 'income',
      description: `Venda #${sampleOrder1.orderNumber} - ${sampleOrder1.customerName}`,
      amount: sampleOrder1.total,
      category: 'Vendas',
      paymentMethod: sampleOrder1.paymentMethod,
      orderId: sampleOrder1.id,
      date: sampleOrder1.createdAt,
      isDemo: true,
    };

    const tx2: Transaction = {
      id: `tx-ord-${sampleOrder2.id}`,
      type: 'income',
      description: `Venda #${sampleOrder2.orderNumber} - ${sampleOrder2.customerName}`,
      amount: sampleOrder2.total,
      category: 'Vendas',
      paymentMethod: sampleOrder2.paymentMethod,
      orderId: sampleOrder2.id,
      date: sampleOrder2.createdAt,
      isDemo: true,
    };

    const txExpense: Transaction = {
      id: `tx-exp-${segmentId}-1`,
      type: 'expense',
      description: `Reposição de Insumos / Fornecedor`,
      amount: 150.0,
      category: 'Ingredientes',
      paymentMethod: 'Pix',
      date: new Date(Date.now() - 24 * 3600000).toISOString(),
      isDemo: true,
    };

    await putItemToStore('transactions', tx1);
    await putItemToStore('transactions', tx2);
    await putItemToStore('transactions', txExpense);
  }
}

export async function exportAllDataJSON(): Promise<string> {
  const settings = await getSettings();
  const categories = await getAllFromStore<Category>('categories');
  const products = await getAllFromStore<Product>('products');
  const addons = await getAllFromStore<AddOn>('addons');
  const combos = await getAllFromStore<Combo>('combos');
  const priceHistory = await getAllFromStore<PriceHistory>('priceHistory');
  const customers = await getAllFromStore<Customer>('customers');
  const inventory = await getAllFromStore<InventoryItem>('inventory');
  const orders = await getAllFromStore<Order>('orders');
  const transactions = await getAllFromStore<Transaction>('transactions');

  const exportObject = {
    exportedAt: new Date().toISOString(),
    version: '2.0',
    appName: 'AL Studio Gestão',
    settings,
    categories,
    products,
    addons,
    combos,
    priceHistory,
    customers,
    inventory,
    orders,
    transactions,
  };

  return JSON.stringify(exportObject, null, 2);
}

export async function importAllDataJSON(jsonStr: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonStr);
    if (!data || typeof data !== 'object') return false;

    if (data.settings) await putItemToStore('settings', data.settings);

    if (Array.isArray(data.categories)) {
      await clearStore('categories');
      for (const c of data.categories) await putItemToStore('categories', c);
    }
    if (Array.isArray(data.products)) {
      await clearStore('products');
      for (const p of data.products) await putItemToStore('products', p);
    }
    if (Array.isArray(data.addons)) {
      await clearStore('addons');
      for (const a of data.addons) await putItemToStore('addons', a);
    }
    if (Array.isArray(data.combos)) {
      await clearStore('combos');
      for (const cm of data.combos) await putItemToStore('combos', cm);
    }
    if (Array.isArray(data.priceHistory)) {
      await clearStore('priceHistory');
      for (const ph of data.priceHistory) await putItemToStore('priceHistory', ph);
    }
    if (Array.isArray(data.customers)) {
      await clearStore('customers');
      for (const c of data.customers) await putItemToStore('customers', c);
    }
    if (Array.isArray(data.inventory)) {
      await clearStore('inventory');
      for (const i of data.inventory) await putItemToStore('inventory', i);
    }
    if (Array.isArray(data.orders)) {
      await clearStore('orders');
      for (const o of data.orders) await putItemToStore('orders', o);
    }
    if (Array.isArray(data.transactions)) {
      await clearStore('transactions');
      for (const t of data.transactions) await putItemToStore('transactions', t);
    }

    return true;
  } catch (err) {
    console.error('Failed to import backup:', err);
    return false;
  }
}

export const exportFullBackup = exportAllDataJSON;
export const importFullBackup = importAllDataJSON;
