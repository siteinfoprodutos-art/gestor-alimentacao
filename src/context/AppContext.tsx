import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  adjustInventoryQuantity,
  archiveProduct,
  clearAllDemoData,
  deleteAddon,
  deleteCategory,
  deleteCombo,
  deleteCustomer,
  deleteInventoryItem,
  deleteOrder,
  deleteProduct,
  deleteTransaction,
  duplicateProduct,
  getAddons,
  getCategories,
  getCombos,
  getCustomers,
  getInventory,
  getOrders,
  getProducts,
  getSettings,
  getTransactions,
  initializeDatabase,
  resetToDemoData,
  saveAddon,
  saveCategory,
  saveCombo,
  saveCustomer,
  saveInventoryItem,
  saveOrder,
  saveProduct,
  saveTransaction,
  toggleAddonAvailability,
  toggleComboAvailability,
  toggleProductAvailability,
  updateOrderStatus,
  updateSettings,
} from '../services/database';
import {
  ActiveTab,
  AddOn,
  BusinessSegmentType,
  Category,
  Combo,
  Customer,
  InventoryItem,
  Order,
  OrderStatus,
  Product,
  Settings,
  Transaction,
} from '../types';
import { BusinessSegmentConfig, getSegmentConfig } from '../config/businessSegments';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  settings: Settings | null;
  currentSegment: BusinessSegmentConfig;
  categories: Category[];
  products: Product[];
  addons: AddOn[];
  combos: Combo[];
  customers: Customer[];
  orders: Order[];
  inventory: InventoryItem[];
  transactions: Transaction[];
  loading: boolean;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  
  // Modals / Overlays
  isNewOrderOpen: boolean;
  setIsNewOrderOpen: (open: boolean) => void;
  editingOrder: Order | null;
  setEditingOrder: (order: Order | null) => void;
  selectedOrderForDetails: Order | null;
  setSelectedOrderForDetails: (order: Order | null) => void;
  orderForWhatsApp: Order | null;
  setOrderForWhatsApp: (order: Order | null) => void;
  isMoreMenuOpen: boolean;
  setIsMoreMenuOpen: (open: boolean) => void;

  // Product Modals
  isProductModalOpen: boolean;
  setIsProductModalOpen: (open: boolean) => void;
  editingProduct: Product | null;
  setEditingProduct: (product: Product | null) => void;
  isCategoryModalOpen: boolean;
  setIsCategoryModalOpen: (open: boolean) => void;
  isAddonModalOpen: boolean;
  setIsAddonModalOpen: (open: boolean) => void;
  isComboModalOpen: boolean;
  setIsComboModalOpen: (open: boolean) => void;

  // Onboarding Wizard
  isSetupWizardOpen: boolean;
  setIsSetupWizardOpen: (open: boolean) => void;

  // Toast
  toast: ToastInfo | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  setToast: (toast: { message: string; type?: 'success' | 'info' | 'warning' | 'error' } | null) => void;

  // Actions
  refreshAll: () => Promise<void>;
  changeSegment: (segmentId: BusinessSegmentType, options?: { loadSuggestedCategories?: boolean; loadDemoData?: boolean }) => Promise<void>;
  handleSaveOrder: (order: Order) => Promise<Order>;
  handleUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  handleDeleteOrder: (orderId: string) => Promise<void>;
  handleSaveProduct: (product: Product) => Promise<void>;
  handleDuplicateProduct: (id: string) => Promise<void>;
  handleDeleteProduct: (id: string) => Promise<void>;
  handleArchiveProduct: (id: string) => Promise<void>;
  handleToggleProductAvailability: (id: string) => Promise<void>;
  handleSaveCategory: (category: Category) => Promise<void>;
  handleDeleteCategory: (id: string) => Promise<void>;
  handleSaveAddon: (addon: AddOn) => Promise<void>;
  handleDeleteAddon: (id: string) => Promise<void>;
  handleToggleAddonAvailability: (id: string) => Promise<void>;
  handleSaveCombo: (combo: Combo) => Promise<void>;
  handleDeleteCombo: (id: string) => Promise<void>;
  handleToggleComboAvailability: (id: string) => Promise<void>;
  handleSaveCustomer: (customer: Customer) => Promise<void>;
  handleDeleteCustomer: (id: string) => Promise<void>;
  handleSaveInventoryItem: (item: InventoryItem) => Promise<void>;
  handleDeleteInventoryItem: (id: string) => Promise<void>;
  handleAdjustStock: (id: string, delta: number) => Promise<void>;
  handleSaveTransaction: (tx: Transaction) => Promise<void>;
  handleDeleteTransaction: (id: string) => Promise<void>;
  handleUpdateSettings: (settings: Settings) => Promise<void>;
  handleClearDemoData: () => Promise<void>;
  handleResetDemoData: (segmentId?: BusinessSegmentType) => Promise<void>;
  handleClearAllData: () => Promise<void>;
  handleResetToDemo: (segmentId?: BusinessSegmentType) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<Settings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [addons, setAddons] = useState<AddOn[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('alstudio_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  // Order Modals
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);
  const [orderForWhatsApp, setOrderForWhatsApp] = useState<Order | null>(null);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Product Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);

  // Setup Wizard Modal
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);

  const [toast, setToastState] = useState<ToastInfo | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToastState({ id, message, type });
    setTimeout(() => {
      setToastState((current) => (current?.id === id ? null : current));
    }, 3500);
  };

  const applyTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('alstudio_theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  const refreshAll = async () => {
    try {
      const [s, cats, p, adds, cmbs, c, o, inv, tx] = await Promise.all([
        getSettings(),
        getCategories(),
        getProducts(true),
        getAddons(),
        getCombos(),
        getCustomers(),
        getOrders(),
        getInventory(),
        getTransactions(),
      ]);

      setSettingsState(s);
      setCategories(cats);
      setProducts(p);
      setAddons(adds);
      setCombos(cmbs);
      setCustomers(c);
      setOrders(o);
      setInventory(inv);
      setTransactions(tx);

      if (s?.theme) {
        applyTheme(s.theme === 'light' ? 'light' : 'dark');
      }

      // Check if setup wizard should be opened on first access
      if (s && s.setupCompleted === false) {
        setIsSetupWizardOpen(true);
      }
    } catch (err) {
      console.error('Error refreshing app state:', err);
      showToast('Erro ao carregar dados do banco local.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        await initializeDatabase();
        await refreshAll();
      } catch (err) {
        console.error('Init DB error:', err);
        setLoading(false);
      }
    }
    init();
  }, []);

  const setTheme = async (newTheme: 'light' | 'dark') => {
    applyTheme(newTheme);
    if (settings) {
      const updated = { ...settings, theme: newTheme };
      await updateSettings(updated);
      setSettingsState(updated);
    }
  };

  const handleSaveOrder = async (order: Order): Promise<Order> => {
    try {
      const saved = await saveOrder(order);
      await refreshAll();
      showToast(`Pedido #${saved.orderNumber} salvo com sucesso!`, 'success');
      return saved;
    } catch (err) {
      console.error('Save order error:', err);
      showToast('Erro ao salvar pedido.', 'error');
      throw err;
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      await refreshAll();
      showToast(`Status atualizado para: ${status}`, 'info');
      if (selectedOrderForDetails?.id === orderId) {
        setSelectedOrderForDetails((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      console.error('Update status error:', err);
      showToast('Erro ao atualizar status.', 'error');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrder(orderId);
      if (selectedOrderForDetails?.id === orderId) {
        setSelectedOrderForDetails(null);
      }
      await refreshAll();
      showToast('Pedido excluído.', 'info');
    } catch (err) {
      console.error('Delete order error:', err);
      showToast('Erro ao excluir pedido.', 'error');
    }
  };

  // Product Actions
  const handleSaveProduct = async (product: Product) => {
    try {
      await saveProduct(product);
      await refreshAll();
      showToast(`Produto "${product.name}" salvo com sucesso!`, 'success');
    } catch (err) {
      console.error('Save product error:', err);
      showToast('Erro ao salvar produto.', 'error');
    }
  };

  const handleDuplicateProduct = async (id: string) => {
    try {
      const dup = await duplicateProduct(id);
      await refreshAll();
      if (dup) {
        showToast(`Produto duplicado como "${dup.name}"!`, 'success');
        // Open modal to edit duplicated product immediately if desired
        setEditingProduct(dup);
        setIsProductModalOpen(true);
      }
    } catch (err) {
      console.error('Duplicate product error:', err);
      showToast('Erro ao duplicar produto.', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      await refreshAll();
      showToast('Produto excluído com sucesso!', 'info');
    } catch (err) {
      console.error('Delete product error:', err);
      showToast('Erro ao excluir produto.', 'error');
    }
  };

  const handleArchiveProduct = async (id: string) => {
    try {
      await archiveProduct(id);
      await refreshAll();
      showToast('Produto arquivado (histórico preservado).', 'info');
    } catch (err) {
      console.error('Archive product error:', err);
      showToast('Erro ao arquivar produto.', 'error');
    }
  };

  const handleToggleProductAvailability = async (id: string) => {
    try {
      const prod = await toggleProductAvailability(id);
      await refreshAll();
      if (prod) {
        showToast(
          `Produto ${prod.available ? 'ativado (Disponível)' : 'pausado (Indisponível)'}.`,
          'info'
        );
      }
    } catch (err) {
      console.error('Toggle availability error:', err);
      showToast('Erro ao alterar disponibilidade.', 'error');
    }
  };

  // Category Actions
  const handleSaveCategory = async (category: Category) => {
    try {
      await saveCategory(category);
      await refreshAll();
      showToast(`Categoria "${category.name}" salva!`, 'success');
    } catch (err) {
      console.error('Save category error:', err);
      showToast('Erro ao salvar categoria.', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      await refreshAll();
      showToast('Categoria removida.', 'info');
    } catch (err) {
      console.error('Delete category error:', err);
      showToast('Erro ao remover categoria.', 'error');
    }
  };

  // Addon Actions
  const handleSaveAddon = async (addon: AddOn) => {
    try {
      await saveAddon(addon);
      await refreshAll();
      showToast(`Adicional "${addon.name}" salvo!`, 'success');
    } catch (err) {
      console.error('Save addon error:', err);
      showToast('Erro ao salvar adicional.', 'error');
    }
  };

  const handleDeleteAddon = async (id: string) => {
    try {
      await deleteAddon(id);
      await refreshAll();
      showToast('Adicional excluído.', 'info');
    } catch (err) {
      console.error('Delete addon error:', err);
      showToast('Erro ao excluir adicional.', 'error');
    }
  };

  const handleToggleAddonAvailability = async (id: string) => {
    try {
      await toggleAddonAvailability(id);
      await refreshAll();
    } catch (err) {
      console.error('Toggle addon availability error:', err);
      showToast('Erro ao alterar disponibilidade.', 'error');
    }
  };

  // Combo Actions
  const handleSaveCombo = async (combo: Combo) => {
    try {
      await saveCombo(combo);
      await refreshAll();
      showToast(`Combo "${combo.name}" salvo!`, 'success');
    } catch (err) {
      console.error('Save combo error:', err);
      showToast('Erro ao salvar combo.', 'error');
    }
  };

  const handleDeleteCombo = async (id: string) => {
    try {
      await deleteCombo(id);
      await refreshAll();
      showToast('Combo excluído.', 'info');
    } catch (err) {
      console.error('Delete combo error:', err);
      showToast('Erro ao excluir combo.', 'error');
    }
  };

  const handleToggleComboAvailability = async (id: string) => {
    try {
      await toggleComboAvailability(id);
      await refreshAll();
    } catch (err) {
      console.error('Toggle combo availability error:', err);
      showToast('Erro ao alterar disponibilidade.', 'error');
    }
  };

  // Customer Actions
  const handleSaveCustomer = async (customer: Customer) => {
    try {
      await saveCustomer(customer);
      await refreshAll();
      showToast(`Cliente "${customer.name}" salvo com sucesso!`, 'success');
    } catch (err) {
      console.error('Save customer error:', err);
      showToast('Erro ao salvar cliente.', 'error');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await deleteCustomer(id);
      await refreshAll();
      showToast('Cliente excluído.', 'info');
    } catch (err) {
      console.error('Delete customer error:', err);
      showToast('Erro ao excluir cliente.', 'error');
    }
  };

  // Inventory Actions
  const handleSaveInventoryItem = async (item: InventoryItem) => {
    try {
      await saveInventoryItem(item);
      await refreshAll();
      showToast(`Item "${item.name}" salvo no estoque!`, 'success');
    } catch (err) {
      console.error('Save inventory error:', err);
      showToast('Erro ao salvar estoque.', 'error');
    }
  };

  const handleDeleteInventoryItem = async (id: string) => {
    try {
      await deleteInventoryItem(id);
      await refreshAll();
      showToast('Item de estoque excluído.', 'info');
    } catch (err) {
      console.error('Delete inventory error:', err);
      showToast('Erro ao excluir item do estoque.', 'error');
    }
  };

  const handleAdjustStock = async (id: string, delta: number) => {
    try {
      await adjustInventoryQuantity(id, delta);
      await refreshAll();
      showToast(`Estoque ajustado (${delta > 0 ? '+' : ''}${delta}).`, 'info');
    } catch (err) {
      console.error('Adjust stock error:', err);
      showToast('Erro ao ajustar quantidade.', 'error');
    }
  };

  // Transaction Actions
  const handleSaveTransaction = async (tx: Transaction) => {
    try {
      await saveTransaction(tx);
      await refreshAll();
      showToast('Movimentação financeira registrada!', 'success');
    } catch (err) {
      console.error('Save transaction error:', err);
      showToast('Erro ao registrar movimentação.', 'error');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      await refreshAll();
      showToast('Movimentação financeira removida.', 'info');
    } catch (err) {
      console.error('Delete transaction error:', err);
      showToast('Erro ao remover movimentação.', 'error');
    }
  };

  const currentSegment = getSegmentConfig(settings?.segment || settings?.category);

  const setToast = (t: { message: string; type?: 'success' | 'info' | 'warning' | 'error' } | null) => {
    if (!t) {
      setToastState(null);
    } else {
      showToast(t.message, t.type || 'info');
    }
  };

  const changeSegment = async (
    segmentId: BusinessSegmentType,
    options?: { loadSuggestedCategories?: boolean; loadDemoData?: boolean }
  ) => {
    try {
      const segConfig = getSegmentConfig(segmentId);
      
      if (options?.loadDemoData) {
        await resetToDemoData(segmentId);
        await refreshAll();
        showToast(`Segmento alterado para ${segConfig.name} com dados de demonstração!`, 'success');
        return;
      }

      // Update segment in settings while preserving all user data
      const current = settings || (await getSettings());
      const updatedSettings: Settings = {
        ...current,
        segment: segmentId,
        category: segConfig.name,
        primaryColor: current.primaryColor && current.primaryColor !== '#ef4444' ? current.primaryColor : segConfig.primaryColor,
        secondaryColor: current.secondaryColor && current.secondaryColor !== '#fca5a5' ? current.secondaryColor : segConfig.secondaryColor,
        updatedAt: new Date().toISOString(),
      };

      await updateSettings(updatedSettings);

      // If user wants to import recommended categories
      if (options?.loadSuggestedCategories) {
        const existingCats = await getCategories();
        const existingNames = new Set(existingCats.map((c) => c.name.toLowerCase().trim()));
        
        for (let i = 0; i < segConfig.defaultCategories.length; i++) {
          const catName = segConfig.defaultCategories[i];
          if (!existingNames.has(catName.toLowerCase().trim())) {
            await saveCategory({
              id: `cat-${segmentId}-${Date.now()}-${i}`,
              name: catName,
              icon: segConfig.emoji,
              color: segConfig.primaryColor,
              order: existingCats.length + i + 1,
              isActive: true,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }

      await refreshAll();
      showToast(`Segmento alterado para ${segConfig.name} com sucesso!`, 'success');
    } catch (err) {
      console.error('Error changing segment:', err);
      showToast('Erro ao trocar segmento de negócio.', 'error');
    }
  };

  // Settings Actions
  const handleUpdateSettings = async (newSettings: Settings) => {
    try {
      const updated = await updateSettings(newSettings);
      setSettingsState(updated);
      if (updated.theme) {
        applyTheme(updated.theme === 'light' ? 'light' : 'dark');
      }
      showToast('Configurações salvas com sucesso!', 'success');
    } catch (err) {
      console.error('Update settings error:', err);
      showToast('Erro ao atualizar configurações.', 'error');
    }
  };

  const handleClearDemoData = async () => {
    try {
      await clearAllDemoData();
      await refreshAll();
      showToast('Dados de demonstração removidos. Banco pronto para dados reais!', 'success');
    } catch (err) {
      console.error('Clear demo error:', err);
      showToast('Erro ao limpar dados de demonstração.', 'error');
    }
  };

  const handleResetDemoData = async (segmentId?: BusinessSegmentType) => {
    try {
      await resetToDemoData(segmentId || settings?.segment || 'pizzaria');
      await refreshAll();
      showToast('Dados de demonstração restaurados com sucesso!', 'success');
    } catch (err) {
      console.error('Reset demo error:', err);
      showToast('Erro ao restaurar dados de demonstração.', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        currentSegment,
        categories,
        products,
        addons,
        combos,
        customers,
        orders,
        inventory,
        transactions,
        loading,
        activeTab,
        setActiveTab,
        theme,
        setTheme,
        toggleTheme,
        isNewOrderOpen,
        setIsNewOrderOpen,
        editingOrder,
        setEditingOrder,
        selectedOrderForDetails,
        setSelectedOrderForDetails,
        orderForWhatsApp,
        setOrderForWhatsApp,
        isMoreMenuOpen,
        setIsMoreMenuOpen,
        isProductModalOpen,
        setIsProductModalOpen,
        editingProduct,
        setEditingProduct,
        isCategoryModalOpen,
        setIsCategoryModalOpen,
        isAddonModalOpen,
        setIsAddonModalOpen,
        isComboModalOpen,
        setIsComboModalOpen,
        isSetupWizardOpen,
        setIsSetupWizardOpen,
        toast,
        showToast,
        setToast,
        refreshAll,
        changeSegment,
        handleSaveOrder,
        handleUpdateOrderStatus,
        handleDeleteOrder,
        handleSaveProduct,
        handleDuplicateProduct,
        handleDeleteProduct,
        handleArchiveProduct,
        handleToggleProductAvailability,
        handleSaveCategory,
        handleDeleteCategory,
        handleSaveAddon,
        handleDeleteAddon,
        handleToggleAddonAvailability,
        handleSaveCombo,
        handleDeleteCombo,
        handleToggleComboAvailability,
        handleSaveCustomer,
        handleDeleteCustomer,
        handleSaveInventoryItem,
        handleDeleteInventoryItem,
        handleAdjustStock,
        handleSaveTransaction,
        handleDeleteTransaction,
        handleUpdateSettings,
        handleClearDemoData,
        handleResetDemoData,
        handleClearAllData: handleClearDemoData,
        handleResetToDemo: handleResetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
