import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Store,
  Tag,
  Package,
  ShoppingBag,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WizardFirstSale, WizardInventoryItem, WizardProductItem, WizardState, WizardStep } from './types';
import { WelcomeStep } from './WelcomeStep';
import { Step1BusinessInfo } from './Step1BusinessInfo';
import { Step2Logo } from './Step2Logo';
import { Step3Products } from './Step3Products';
import { Step4Inventory } from './Step4Inventory';
import { Step5FirstSale } from './Step5FirstSale';
import { CompletionStep } from './CompletionStep';
import {
  saveProduct,
  saveInventoryItem,
  saveOrder,
  updateSettings,
  resetToDemoData,
  clearAllDemoData,
  getCategories,
  saveCategory,
} from '../../services/database';
import { Order, OrderItem, Settings, BusinessSegmentType } from '../../types';
import { getSegmentConfig } from '../../config/businessSegments';

interface SetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupWizardModal: React.FC<SetupWizardModalProps> = ({ isOpen, onClose }) => {
  const { settings, refreshAll, setActiveTab, showToast } = useApp();

  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome');
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Wizard state initialized with existing settings or sensible defaults
  const [segment, setSegment] = useState<BusinessSegmentType>('pizzaria');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('Pizzaria & Fornaria');
  const [slogan, setSlogan] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [logo, setLogo] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#ef4444');
  const [secondaryColor, setSecondaryColor] = useState('#fca5a5');
  const [products, setProducts] = useState<WizardProductItem[]>([]);
  const [inventory, setInventory] = useState<WizardInventoryItem[]>([]);
  const [firstSale, setFirstSale] = useState<WizardFirstSale>({
    customerName: 'Cliente Balcão',
    customerPhone: '',
    customerAddress: '',
    type: 'Balcão',
    paymentMethod: 'Pix',
    selectedProductIds: [],
    deliveryFee: 5.0,
    discount: 0,
    notes: 'Primeira venda inaugural do sistema',
    shouldCreateSale: true,
  });

  useEffect(() => {
    if (settings) {
      if (settings.segment) {
        setSegment(settings.segment);
      }
      if (settings.name && settings.name !== 'Meu Negócio') {
        setBusinessName(settings.name);
      }
      if (settings.category) {
        setCategory(settings.category);
      }
      if (settings.slogan) {
        setSlogan(settings.slogan);
      }
      if (settings.whatsapp) {
        setWhatsapp(settings.whatsapp);
      }
      if (settings.phone) {
        setPhone(settings.phone);
      }
      if (settings.logo) {
        setLogo(settings.logo);
      }
    }
  }, [settings]);

  if (!isOpen) return null;

  // Handle Demo Mode 1-click
  const handleLoadDemoMode = async () => {
    try {
      setIsDemoLoading(true);
      await resetToDemoData(segment);
      await refreshAll();
      showToast(`Modo Demonstração (${getSegmentConfig(segment).name}) carregado com sucesso!`, 'success');
      setActiveTab('dashboard');
      onClose();
    } catch (err) {
      console.error('Error loading demo mode:', err);
      showToast('Erro ao carregar dados de demonstração.', 'error');
    } finally {
      setIsDemoLoading(false);
    }
  };

  // Finalize setup and persist everything to IndexedDB
  const handleFinishWizard = async () => {
    try {
      setIsFinalizing(true);
      const segConfig = getSegmentConfig(segment);

      // 1. Update Settings
      const newSettings: Settings = {
        id: 'settings',
        segment,
        name: businessName.trim() || `Meu ${segConfig.name}`,
        category: category.trim() || segConfig.name,
        slogan: slogan.trim() || segConfig.tagline,
        phone: phone.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        logo: logo || undefined,
        primaryColor: primaryColor || segConfig.primaryColor,
        secondaryColor: secondaryColor || segConfig.secondaryColor,
        theme: settings?.theme || 'dark',
        currency: 'R$',
        defaultDeliveryFee: firstSale.deliveryFee || (segConfig.features.hasDelivery ? 6.0 : 0),
        isDemoMode: false,
        setupCompleted: true,
        createdAt: settings?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await updateSettings(newSettings);

      // 2. Ensure categories exist in DB
      const existingCategories = await getCategories();
      const catNames: string[] = Array.from(new Set(products.map((p) => p.category)));
      for (const catName of catNames) {
        if (!existingCategories.some((c) => c.name.toLowerCase() === catName.toLowerCase())) {
          await saveCategory({
            id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: catName,
            icon: '📦',
            color: '#ef4444',
            isActive: true,
            createdAt: new Date().toISOString(),
          });
        }
      }

      // 3. Save Products
      const savedProducts: { id: string; name: string; price: number; cost: number; category: string }[] = [];
      for (const prod of products) {
        const saved = await saveProduct({
          id: prod.id,
          name: prod.name,
          categoryId: 'cat-geral',
          category: prod.category,
          description: prod.description || '',
          price: prod.price,
          cost: prod.cost,
          available: true,
          createdAt: new Date().toISOString(),
          isDemo: false,
        });
        savedProducts.push(saved);
      }

      // 4. Save Inventory Items
      for (const inv of inventory) {
        await saveInventoryItem({
          id: inv.id,
          name: inv.name,
          unit: inv.unit,
          currentQuantity: inv.currentQuantity,
          minQuantity: inv.minQuantity,
          cost: inv.cost,
          updatedAt: new Date().toISOString(),
          isDemo: false,
        });
      }

      // 5. Save First Sale if selected
      if (firstSale.shouldCreateSale && firstSale.selectedProductIds.length > 0) {
        const orderItems: OrderItem[] = [];
        let subtotal = 0;

        firstSale.selectedProductIds.forEach((item) => {
          const prod = savedProducts.find((p) => p.id === item.productId) || products.find((p) => p.id === item.productId);
          if (prod) {
            const itemSubtotal = prod.price * item.quantity;
            subtotal += itemSubtotal;
            orderItems.push({
              id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              productId: prod.id,
              name: prod.name,
              category: prod.category,
              price: prod.price,
              cost: prod.cost,
              quantity: item.quantity,
              subtotal: itemSubtotal,
            });
          }
        });

        const deliveryFee = firstSale.type === 'Entrega' ? firstSale.deliveryFee : 0;
        const total = Math.max(0, subtotal + deliveryFee - firstSale.discount);

        const newOrder: Order = {
          id: `ord-${Date.now()}`,
          orderNumber: 1,
          customerName: firstSale.customerName.trim() || 'Cliente Balcão',
          customerPhone: firstSale.customerPhone.trim() || '',
          customerAddress: firstSale.customerAddress.trim() || undefined,
          type: firstSale.type,
          origin: firstSale.type === 'Entrega' ? 'WhatsApp' : 'Balcão',
          status: 'Concluído',
          items: orderItems,
          subtotal,
          deliveryFee,
          discount: firstSale.discount,
          total,
          paymentMethod: firstSale.paymentMethod,
          paymentStatus: 'Pago',
          notes: firstSale.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          isDemo: false,
        };

        await saveOrder(newOrder);
      }

      await refreshAll();
      showToast('Seu negócio foi configurado com sucesso!', 'success');
      setCurrentStep('completion');
    } catch (err) {
      console.error('Error saving wizard setup:', err);
      showToast('Erro ao salvar configurações.', 'error');
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleGoToDashboard = () => {
    setActiveTab('dashboard');
    onClose();
  };

  // Steps definition for progress bar
  const stepsList: { id: WizardStep; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'step1', label: 'Nome & Tipo', icon: Store },
    { id: 'step2', label: 'Logo', icon: ImageIcon },
    { id: 'step3', label: 'Produtos', icon: Tag },
    { id: 'step4', label: 'Estoque', icon: Package },
    { id: 'step5', label: '1ª Venda', icon: ShoppingBag },
  ];

  const currentStepIndex = stepsList.findIndex((s) => s.id === currentStep);

  return (
    <div
      id="setup-wizard-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
    >
      <div
        id="setup-wizard-container"
        className="bg-stone-950 border border-stone-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="bg-stone-900/90 border-b border-stone-800 px-5 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-red-600/20">
              AL
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white leading-tight">
                AL Studio Gestão
              </h3>
              <p className="text-[10px] text-stone-400">
                Assistente de Configuração Inicial
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Demo Mode Button available at all times */}
            <button
              type="button"
              id="wizard-top-demo-btn"
              onClick={handleLoadDemoMode}
              disabled={isDemoLoading}
              title="Carregar dados de demonstração fictícios"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
            >
              {isDemoLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Modo Demonstração</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              title="Fechar assistente"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stepper Progress Indicator (Visible in Steps 1 to 5) */}
        {currentStep !== 'welcome' && currentStep !== 'completion' && (
          <div className="bg-stone-900/50 border-b border-stone-800 px-4 py-3">
            <div className="max-w-xl mx-auto flex items-center justify-between relative">
              {/* Connecting Line */}
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-stone-800 -translate-y-1/2 -z-0" />
              <div
                className="absolute top-1/2 left-4 h-0.5 bg-red-600 -translate-y-1/2 transition-all duration-300 -z-0"
                style={{
                  width: `${(currentStepIndex / (stepsList.length - 1)) * 100}%`,
                }}
              />

              {stepsList.map((step, idx) => {
                const Icon = step.icon;
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.id} className="flex flex-col items-center gap-1 relative z-10">
                    <button
                      type="button"
                      onClick={() => {
                        // Allow clicking back to completed steps
                        if (isPassed) setCurrentStep(step.id);
                      }}
                      disabled={!isPassed && !isCurrent}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? 'bg-emerald-500 text-white cursor-pointer'
                          : isCurrent
                          ? 'bg-red-600 text-white ring-4 ring-red-600/20'
                          : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                    </button>
                    <span
                      className={`text-[10px] font-bold hidden sm:inline-block ${
                        isCurrent
                          ? 'text-white'
                          : isPassed
                          ? 'text-stone-300'
                          : 'text-stone-600'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Step Content */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1">
          {currentStep === 'welcome' && (
            <WelcomeStep
              onStartWizard={() => setCurrentStep('step1')}
              onLoadDemoMode={handleLoadDemoMode}
              isDemoLoading={isDemoLoading}
            />
          )}

          {currentStep === 'step1' && (
            <Step1BusinessInfo
              segment={segment}
              setSegment={setSegment}
              businessName={businessName}
              setBusinessName={setBusinessName}
              category={category}
              setCategory={setCategory}
              slogan={slogan}
              setSlogan={setSlogan}
              whatsapp={whatsapp}
              setWhatsapp={setWhatsapp}
              onNext={() => setCurrentStep('step2')}
              onBack={() => setCurrentStep('welcome')}
            />
          )}

          {currentStep === 'step2' && (
            <Step2Logo
              logo={logo}
              setLogo={setLogo}
              businessName={businessName}
              category={category}
              onNext={() => setCurrentStep('step3')}
              onBack={() => setCurrentStep('step1')}
            />
          )}

          {currentStep === 'step3' && (
            <Step3Products
              products={products}
              setProducts={setProducts}
              category={category}
              onNext={() => setCurrentStep('step4')}
              onBack={() => setCurrentStep('step2')}
            />
          )}

          {currentStep === 'step4' && (
            <Step4Inventory
              inventory={inventory}
              setInventory={setInventory}
              category={category}
              onNext={() => setCurrentStep('step5')}
              onBack={() => setCurrentStep('step3')}
            />
          )}

          {currentStep === 'step5' && (
            <Step5FirstSale
              firstSale={firstSale}
              setFirstSale={setFirstSale}
              products={products}
              onFinish={handleFinishWizard}
              onBack={() => setCurrentStep('step4')}
            />
          )}

          {currentStep === 'completion' && (
            <CompletionStep
              state={{
                businessName: businessName.trim() || 'Meu Estabelecimento',
                category,
                slogan,
                phone,
                whatsapp,
                logo,
                primaryColor,
                secondaryColor,
                products,
                inventory,
                firstSale,
              }}
              onGoToDashboard={handleGoToDashboard}
              isLoading={isFinalizing}
            />
          )}
        </div>
      </div>
    </div>
  );
};
