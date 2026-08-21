import {
  AddOn,
  Category,
  Combo,
  Customer,
  InventoryItem,
  Order,
  PriceHistory,
  Product,
  Settings,
  Transaction,
} from '../../types';
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

const DB_NAME = 'AL_STUDIO_GESTAO_PIZZARIA_DB';
const DB_VERSION = 4;

export interface DBStores {
  settings: Settings;
  categories: Category;
  products: Product;
  addons: AddOn;
  combos: Combo;
  priceHistory: PriceHistory;
  customers: Customer;
  orders: Order;
  inventory: InventoryItem;
  transactions: Transaction;
}

let dbInstance: IDBDatabase | null = null;

export async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('categories')) {
        const catStore = db.createObjectStore('categories', { keyPath: 'id' });
        catStore.createIndex('name', 'name', { unique: false });
        catStore.createIndex('parentId', 'parentId', { unique: false });
      }

      if (!db.objectStoreNames.contains('products')) {
        const prodStore = db.createObjectStore('products', { keyPath: 'id' });
        prodStore.createIndex('category', 'category', { unique: false });
        prodStore.createIndex('categoryId', 'categoryId', { unique: false });
        prodStore.createIndex('code', 'code', { unique: false });
      }

      if (!db.objectStoreNames.contains('addons')) {
        const addStore = db.createObjectStore('addons', { keyPath: 'id' });
        addStore.createIndex('category', 'category', { unique: false });
      }

      if (!db.objectStoreNames.contains('combos')) {
        db.createObjectStore('combos', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('priceHistory')) {
        const phStore = db.createObjectStore('priceHistory', { keyPath: 'id' });
        phStore.createIndex('productId', 'productId', { unique: false });
        phStore.createIndex('changedAt', 'changedAt', { unique: false });
      }

      if (!db.objectStoreNames.contains('customers')) {
        const custStore = db.createObjectStore('customers', { keyPath: 'id' });
        custStore.createIndex('phone', 'phone', { unique: false });
        custStore.createIndex('name', 'name', { unique: false });
      }

      if (!db.objectStoreNames.contains('orders')) {
        const ordStore = db.createObjectStore('orders', { keyPath: 'id' });
        ordStore.createIndex('orderNumber', 'orderNumber', { unique: true });
        ordStore.createIndex('status', 'status', { unique: false });
        ordStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      if (!db.objectStoreNames.contains('inventory')) {
        const invStore = db.createObjectStore('inventory', { keyPath: 'id' });
        invStore.createIndex('name', 'name', { unique: false });
      }

      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
        txStore.createIndex('date', 'date', { unique: false });
        txStore.createIndex('type', 'type', { unique: false });
      }
    };
  });
}

// Low-level generic helpers
export async function getAllFromStore<T>(storeName: keyof DBStores): Promise<T[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();

    req.onsuccess = () => resolve((req.result || []) as T[]);
    req.onerror = () => reject(req.error);
  });
}

export async function getItemFromStore<T>(
  storeName: keyof DBStores,
  key: string
): Promise<T | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.get(key);

    req.onsuccess = () => resolve((req.result as T) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function putItemToStore<T>(
  storeName: keyof DBStores,
  value: T
): Promise<T> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.put(value);

    req.onsuccess = () => resolve(value);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteItemFromStore(
  storeName: keyof DBStores,
  key: string
): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.delete(key);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearStore(storeName: keyof DBStores): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.clear();

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Initial Seeding & Upgrade
export async function initializeDatabase(): Promise<void> {
  const settings = await getItemFromStore<Settings>('settings', 'settings');
  if (!settings) {
    // Seed initial demo data
    await putItemToStore<Settings>('settings', INITIAL_SETTINGS);

    for (const cat of DEMO_CATEGORIES) {
      await putItemToStore('categories', cat);
    }
    for (const prod of DEMO_PRODUCTS) {
      await putItemToStore('products', prod);
    }
    for (const add of DEMO_ADDONS) {
      await putItemToStore('addons', add);
    }
    for (const cmb of DEMO_COMBOS) {
      await putItemToStore('combos', cmb);
    }
    for (const cust of DEMO_CUSTOMERS) {
      await putItemToStore('customers', cust);
    }
    for (const inv of DEMO_INVENTORY) {
      await putItemToStore('inventory', inv);
    }
    for (const ord of DEMO_ORDERS) {
      await putItemToStore('orders', ord);
    }
    for (const tx of DEMO_TRANSACTIONS) {
      await putItemToStore('transactions', tx);
    }
  } else {
    // If upgrading from v1, ensure categories and addons are seeded if empty
    const existingCats = await getAllFromStore<Category>('categories');
    if (existingCats.length === 0) {
      for (const cat of DEMO_CATEGORIES) {
        await putItemToStore('categories', cat);
      }
    }

    const existingAddons = await getAllFromStore<AddOn>('addons');
    if (existingAddons.length === 0) {
      for (const add of DEMO_ADDONS) {
        await putItemToStore('addons', add);
      }
    }

    const existingCombos = await getAllFromStore<Combo>('combos');
    if (existingCombos.length === 0) {
      for (const cmb of DEMO_COMBOS) {
        await putItemToStore('combos', cmb);
      }
    }
  }
}
