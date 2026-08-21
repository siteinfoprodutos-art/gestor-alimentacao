import React, { Suspense, lazy, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { PWAProvider } from './context/PWAContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { MoreMenuModal } from './components/layout/MoreMenuModal';
import { Toast } from './components/common/Toast';
import { TabSkeleton } from './components/common/TabSkeleton';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { PWAInstallModal } from './components/pwa/PWAInstallModal';
import { PWAUpdateNotification } from './components/pwa/PWAUpdateNotification';
import { PWADiagnosticsModal } from './components/pwa/PWADiagnosticsModal';
import { SetupWizardModal } from './components/onboarding/SetupWizardModal';
import { exportFullBackup } from './services/database';

// Lazy Loaded Views (Code Splitting for Production Performance)
const DashboardView = lazy(() =>
  import('./components/dashboard/DashboardView').then((m) => ({ default: m.DashboardView }))
);
const OrdersView = lazy(() =>
  import('./components/orders/OrdersView').then((m) => ({ default: m.OrdersView }))
);
const ProductsView = lazy(() =>
  import('./components/products/ProductsView').then((m) => ({ default: m.ProductsView }))
);
const CustomersView = lazy(() =>
  import('./components/customers/CustomersView').then((m) => ({ default: m.CustomersView }))
);
const InventoryView = lazy(() =>
  import('./components/inventory/InventoryView').then((m) => ({ default: m.InventoryView }))
);
const FinancesView = lazy(() =>
  import('./components/finances/FinancesView').then((m) => ({ default: m.FinancesView }))
);
const ReportsView = lazy(() =>
  import('./components/reports/ReportsView').then((m) => ({ default: m.ReportsView }))
);
const SettingsView = lazy(() =>
  import('./components/settings/SettingsView').then((m) => ({ default: m.SettingsView }))
);
const BackupView = lazy(() =>
  import('./components/backup/BackupView').then((m) => ({ default: m.BackupView }))
);

// Lazy Loaded Heavy Modals
const NewOrderModal = lazy(() =>
  import('./components/orders/NewOrderModal').then((m) => ({ default: m.NewOrderModal }))
);
const OrderDetailsModal = lazy(() =>
  import('./components/orders/OrderDetailsModal').then((m) => ({ default: m.OrderDetailsModal }))
);
const WhatsAppShareModal = lazy(() =>
  import('./components/orders/WhatsAppShareModal').then((m) => ({ default: m.WhatsAppShareModal }))
);

const MainLayout: React.FC = () => {
  const {
    activeTab,
    isNewOrderOpen,
    setIsNewOrderOpen,
    selectedOrderForDetails,
    setSelectedOrderForDetails,
    orderForWhatsApp,
    setOrderForWhatsApp,
    isMoreMenuOpen,
    setIsMoreMenuOpen,
    isSetupWizardOpen,
    setIsSetupWizardOpen,
    toast,
    setToast,
    settings,
  } = useApp();

  useEffect(() => {
    const handleAutoBackup = async () => {
      if (!settings?.autoBackupLocal) return;

      const lastBackupDate = localStorage.getItem('lastAutoBackupDate');
      const today = new Date().toISOString().split('T')[0];

      if (lastBackupDate !== today) {
        try {
          const jsonStr = await exportFullBackup();
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `backup_automatico_alstudio_${today}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          localStorage.setItem('lastAutoBackupDate', today);
          setToast({ message: 'Backup automático diário gerado!', type: 'success' });
        } catch (error) {
          console.error('Falha no backup automático', error);
        }
      }
    };

    handleAutoBackup();
  }, [settings?.autoBackupLocal, setToast]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'orders':
        return <OrdersView />;
      case 'products':
        return <ProductsView />;
      case 'customers':
        return <CustomersView />;
      case 'inventory':
        return <InventoryView />;
      case 'finances':
        return <FinancesView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      case 'backup':
        return <BackupView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div
      id="app-root-layout"
      className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans antialiased selection:bg-red-600 selection:text-white"
    >
      {/* Top Fixed Header */}
      <Header />

      {/* Offline Banner when network is lost */}
      <OfflineIndicator />

      {/* Main Body */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Desktop Left Sidebar */}
        <Sidebar />

        {/* Dynamic Main Viewport */}
        <main
          id="main-viewport-content"
          tabIndex={-1}
          className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-12 focus:outline-none"
        >
          <Suspense fallback={<TabSkeleton />}>
            {renderActiveTab()}
          </Suspense>
        </main>
      </div>

      {/* Mobile Bottom Fixed Navigation */}
      <BottomNav />

      {/* Global Modals & Dialogs (Suspended & Lazy) */}
      <Suspense fallback={null}>
        {isNewOrderOpen && (
          <NewOrderModal
            isOpen={isNewOrderOpen}
            onClose={() => setIsNewOrderOpen(false)}
          />
        )}

        <OrderDetailsModal />

        {orderForWhatsApp && (
          <WhatsAppShareModal
            order={orderForWhatsApp}
            isOpen={!!orderForWhatsApp}
            onClose={() => setOrderForWhatsApp(null)}
          />
        )}
      </Suspense>

      <MoreMenuModal
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
      />

      {/* PWA & System Modals */}
      <PWAInstallModal />
      <PWAUpdateNotification />
      <PWADiagnosticsModal />

      {/* Initial Setup Wizard */}
      <SetupWizardModal
        isOpen={isSetupWizardOpen}
        onClose={() => setIsSetupWizardOpen(false)}
      />

      {/* Global Animated Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <PWAProvider>
        <MainLayout />
      </PWAProvider>
    </AppProvider>
  );
}
