import React, { useEffect, useState } from 'react';
import {
  Minus,
  Plus,
  Search,
  Trash2,
  X,
  User,
  Phone,
  MapPin,
  MessageSquare,
  ShoppingBag,
  CreditCard,
  Check,
  Layers,
  Sparkles,
  Edit2,
  Gift,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  AddOn,
  OrderItem,
  OrderOrigin,
  OrderStatus,
  OrderType,
  PaymentMethod,
  Product,
  ProductCrust,
  ProductSize,
} from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { getNextOrderNumber } from '../../services/database';

export const NewOrderModal: React.FC = () => {
  const {
    isNewOrderOpen,
    setIsNewOrderOpen,
    editingOrder,
    setEditingOrder,
    products,
    categories,
    addons,
    combos,
    customers,
    settings,
    handleSaveOrder,
    setOrderForWhatsApp,
  } = useApp();

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>();
  const [orderType, setOrderType] = useState<OrderType>('Entrega');
  const [orderOrigin, setOrderOrigin] = useState<OrderOrigin>('WhatsApp');
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('Novo');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [deliveryFee, setDeliveryFee] = useState<number>(settings?.defaultDeliveryFee || 7.0);
  const [discountType, setDiscountType] = useState<'valor' | 'porcentagem'>('valor');
  const [discountValue, setDiscountValue] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix');
  const [changeFor, setChangeFor] = useState<string>('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [askWhatsAppAfterSave, setAskWhatsAppAfterSave] = useState(true);

  // Catalog Picker state
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [productSearch, setProductSearch] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Item Customizer Modal State (For selecting sizes, multiple flavors, crusts, and addons)
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [customSize, setCustomSize] = useState<ProductSize | null>(null);
  const [selectedFlavorProducts, setSelectedFlavorProducts] = useState<Product[]>([]);
  const [selectedCrust, setSelectedCrust] = useState<ProductCrust | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<AddOn[]>([]);
  const [customNotes, setCustomNotes] = useState('');
  const [customQuantity, setCustomQuantity] = useState(1);

  // Editing existing order item note
  const [editingItemNoteIndex, setEditingItemNoteIndex] = useState<number | null>(null);
  const [tempItemNote, setTempItemNote] = useState('');

  useEffect(() => {
    if (editingOrder) {
      setCustomerName(editingOrder.customerName);
      setCustomerPhone(editingOrder.customerPhone);
      setCustomerAddress(editingOrder.customerAddress || '');
      setSelectedCustomerId(editingOrder.customerId);
      setOrderType(editingOrder.type);
      setOrderOrigin(editingOrder.origin);
      setOrderStatus(editingOrder.status);
      setOrderItems(editingOrder.items);
      setDeliveryFee(editingOrder.deliveryFee);
      setDiscountType('valor');
      setDiscountValue(editingOrder.discount ? editingOrder.discount.toString() : '');
      setPaymentMethod(editingOrder.paymentMethod);
      setChangeFor(editingOrder.changeFor ? editingOrder.changeFor.toString() : '');
      setGeneralNotes(editingOrder.notes || '');
    } else {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setSelectedCustomerId(undefined);
      setOrderType('Entrega');
      setOrderOrigin('WhatsApp');
      setOrderStatus('Novo');
      setOrderItems([]);
      setDeliveryFee(settings?.defaultDeliveryFee || 7.0);
      setDiscountType('valor');
      setDiscountValue('');
      setPaymentMethod('Pix');
      setChangeFor('');
      setGeneralNotes('');
    }
  }, [editingOrder, isNewOrderOpen, settings]);

  if (!isNewOrderOpen) return null;

  // Autocomplete customer selection
  const filteredCustomers = customerSearchQuery.trim()
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
          c.phone.includes(customerSearchQuery)
      )
    : [];

  const handleSelectCustomer = (c: typeof customers[0]) => {
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    setCustomerAddress(c.address || '');
    setSelectedCustomerId(c.id);
    setShowCustomerDropdown(false);
    setCustomerSearchQuery('');
  };

  // Open customizer for pizzas / multi-size products
  const handleOpenCustomizer = (product: Product) => {
    setCustomizingProduct(product);
    if (product.hasSizes && product.sizes && product.sizes.length > 0) {
      const defaultSize = product.sizes.find((s) => s.name.toLowerCase().includes('grande')) || product.sizes[0];
      setCustomSize(defaultSize);
    } else {
      setCustomSize(null);
    }
    setSelectedFlavorProducts([product]);
    setSelectedCrust(null);
    setSelectedAddons([]);
    setCustomNotes('');
    setCustomQuantity(1);
  };

  // Add simple item directly (or open customizer if pizza/multi-size)
  const handleProductCardClick = (product: Product) => {
    if (
      product.hasSizes ||
      (product.sizes && product.sizes.length > 0) ||
      (product.crusts && product.crusts.length > 0) ||
      product.hasSizes || (product.maxFlavors && product.maxFlavors > 1)
    ) {
      handleOpenCustomizer(product);
    } else {
      // Single product addition
      setOrderItems((prev) => {
        const existingIdx = prev.findIndex((i) => i.productId === product.id && !i.notes && !i.size);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx].quantity += 1;
          updated[existingIdx].subtotal = updated[existingIdx].quantity * updated[existingIdx].price;
          return updated;
        } else {
          const newItem: OrderItem = {
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            productId: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            cost: product.cost,
            quantity: 1,
            subtotal: product.price,
          };
          return [...prev, newItem];
        }
      });
    }
  };

  // Add Combo to order
  const handleAddComboToOrder = (combo: typeof combos[0]) => {
    const newItem: OrderItem = {
      id: `combo-item-${Date.now()}`,
      productId: combo.id,
      name: `🎁 ${combo.name}`,
      category: 'Combos',
      price: combo.comboPrice,
      cost: combo.cost,
      quantity: 1,
      subtotal: combo.comboPrice,
      notes: combo.items.map((i) => `${i.quantity}x ${i.productName}`).join(' + '),
    };
    setOrderItems((prev) => [...prev, newItem]);
  };

  // Confirm customizer addition
  const handleConfirmCustomizedItem = () => {
    if (!customizingProduct) return;

    let basePrice = customizingProduct.price;
    let baseCost = customizingProduct.cost || 0;

    // If size selected, use size price
    if (customSize) {
      basePrice = customSize.price;
      baseCost = customSize.cost || 0;
    }

    // If multiple pizza flavors, use the highest flavor price if sized accordingly
    if (selectedFlavorProducts.length > 1) {
      const highestPrice = Math.max(
        ...selectedFlavorProducts.map((p) => {
          if (customSize && p.sizes) {
            const matchingSize = p.sizes.find((s) => s.name === customSize.name);
            return matchingSize ? matchingSize.price : p.price;
          }
          return p.price;
        })
      );
      basePrice = highestPrice;
    }

    // Crust price
    const crustPrice = selectedCrust ? selectedCrust.price : 0;
    const crustCost = selectedCrust ? selectedCrust.cost || 0 : 0;

    // Addons price
    const addonsPrice = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    const addonsCost = selectedAddons.reduce((sum, a) => sum + (a.cost || 0), 0);

    const unitPrice = basePrice + crustPrice + addonsPrice;
    const unitCost = baseCost + crustCost + addonsCost;
    const subtotal = unitPrice * customQuantity;

    // Item title
    let itemTitle = customizingProduct.name;
    if (selectedFlavorProducts.length > 1) {
      itemTitle = `Item 1/${selectedFlavorProducts.length} ${selectedFlavorProducts
        .map((p) => p.name.replace(/^.*? \s*/i, ''))
        .join(' + 1/' + selectedFlavorProducts.length + ' ')}`;
    }

    const newItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: customizingProduct.id,
      name: itemTitle,
      category: customizingProduct.category,
      price: unitPrice,
      cost: unitCost,
      quantity: customQuantity,
      subtotal,
      size: customSize ? customSize.name : undefined,
      flavors: selectedFlavorProducts.map((p) => p.name),
      crust: selectedCrust ? selectedCrust.name : undefined,
      addons: selectedAddons.map((a) => a.name),
      notes: customNotes.trim() || undefined,
    };

    setOrderItems((prev) => [...prev, newItem]);
    setCustomizingProduct(null);
  };

  const handleUpdateItemQuantity = (index: number, delta: number) => {
    setOrderItems((prev) => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index].quantity = newQty;
      updated[index].subtotal = newQty * updated[index].price;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveItemNote = (index: number) => {
    setOrderItems((prev) => {
      const updated = [...prev];
      updated[index].notes = tempItemNote.trim() || undefined;
      return updated;
    });
    setEditingItemNoteIndex(null);
    setTempItemNote('');
  };

  // Calculations
  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const actualDeliveryFee = orderType === 'Entrega' ? Number(deliveryFee) || 0 : 0;
  
  let actualDiscount = 0;
  const rawDiscountVal = Number(discountValue) || 0;
  if (discountType === 'porcentagem') {
    actualDiscount = (subtotal * rawDiscountVal) / 100;
  } else {
    actualDiscount = rawDiscountVal;
  }
  
  const total = Math.max(0, subtotal + actualDeliveryFee - actualDiscount);

  // Available products for catalog
  const availableProducts = products.filter((p) => {
    if (p.isArchived || !p.available) return false;
    const matchesCat =
      selectedCategory === 'Todos' ||
      p.category === selectedCategory ||
      p.categoryId === selectedCategory;
    const matchesSearch =
      productSearch.trim() === '' ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(productSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const availableFlavorProducts = products.filter(
    (p) => !p.isArchived && p.available && (p.hasSizes || (p.maxFlavors && p.maxFlavors > 1))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      alert('Por favor, informe o nome do cliente.');
      return;
    }

    if (orderItems.length === 0) {
      alert('Adicione pelo menos um produto ao pedido.');
      return;
    }

    const nextNumber = editingOrder ? editingOrder.orderNumber : await getNextOrderNumber();

    const orderToSave = {
      id: editingOrder ? editingOrder.id : `ord-${Date.now()}`,
      orderNumber: nextNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: orderType === 'Entrega' ? customerAddress.trim() : undefined,
      customerId: selectedCustomerId,
      type: orderType,
      origin: orderOrigin,
      status: orderStatus,
      items: orderItems,
      subtotal,
      deliveryFee: actualDeliveryFee,
      discount: actualDiscount,
      total,
      paymentMethod,
      paymentStatus: (orderStatus === 'Concluído' ? 'Pago' : 'Pendente') as 'Pago' | 'Pendente',
      changeFor: paymentMethod === 'Dinheiro' && changeFor ? Number(changeFor) : undefined,
      notes: generalNotes.trim() || undefined,
      createdAt: editingOrder ? editingOrder.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await handleSaveOrder(orderToSave);

    setIsNewOrderOpen(false);
    setEditingOrder(null);

    if (askWhatsAppAfterSave && saved.customerPhone) {
      setOrderForWhatsApp(saved);
    }
  };

  return (
    <div
      id="new-order-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in no-print"
      onClick={() => {
        setIsNewOrderOpen(false);
        setEditingOrder(null);
      }}
    >
      <div
        id="new-order-modal"
        className="bg-neutral-900 border border-neutral-800 rounded-3xl text-neutral-100 max-w-5xl w-full shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div>
            <h2 className="font-bold text-xl sm:text-2xl text-white">
              {editingOrder ? `Editar Pedido #${editingOrder.orderNumber}` : '+ Novo Pedido'}
            </h2>
            <p className="text-xs text-neutral-400">
              {editingOrder ? 'Atualize as informações do pedido' : 'Registro de pedido completo para o seu negócio'}
            </p>
          </div>
          <button
            onClick={() => {
              setIsNewOrderOpen(false);
              setEditingOrder(null);
            }}
            className="p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two columns on desktop */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Customer, Type, Origin & Product Catalog (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Customer & Order Type */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-red-400" />
                  <span>1. Dados do Cliente</span>
                </span>
                {/* Order Type Toggle */}
                <div className="flex bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs font-semibold">
                  {(['Entrega', 'Retirada', 'Balcão'] as OrderType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setOrderType(t)}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        orderType === t
                          ? 'bg-red-600 text-white shadow-xs font-bold'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Customer search / auto-fill */}
              <div className="relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Nome do Cliente *</label>
                    <input
                      type="text"
                      placeholder="Ex: Carlos Eduardo"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        setCustomerSearchQuery(e.target.value);
                        setShowCustomerDropdown(true);
                      }}
                      onFocus={() => setShowCustomerDropdown(true)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-hidden focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="(11) 98765-4321"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-hidden focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Customer Suggestions Dropdown */}
                {showCustomerDropdown && filteredCustomers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-neutral-800">
                    {filteredCustomers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectCustomer(c)}
                        className="w-full text-left p-2.5 hover:bg-neutral-800 text-xs flex items-center justify-between text-neutral-200"
                      >
                        <div>
                          <div className="font-bold text-white">{c.name}</div>
                          <div className="text-neutral-400">{c.phone} {c.address ? `• ${c.address}` : ''}</div>
                        </div>
                        <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded text-amber-300 font-semibold">
                          {c.totalOrders} pedidos
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Delivery Address (if type is Entrega) */}
              {orderType === 'Entrega' && (
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Endereço de Entrega</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-red-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Rua, número, apto/bloco e bairro"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-hidden focus:border-red-500"
                    />
                  </div>
                </div>
              )}

              {/* Origin Selector */}
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Origem do Pedido</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {(['WhatsApp', 'iFood', 'Balcão', 'Telefone', 'Instagram', 'Outro'] as OrderOrigin[]).map(
                    (orig) => (
                      <button
                        key={orig}
                        type="button"
                        onClick={() => setOrderOrigin(orig)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                          orderOrigin === orig
                            ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                            : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                        }`}
                      >
                        {orig}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* 2. Product Catalog Selector */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-red-400" />
                  <span>2. Catálogo & Cardápio</span>
                </span>
                <span className="text-xs text-neutral-400">{availableProducts.length} disponíveis</span>
              </div>

              {/* Category tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Todos')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === 'Todos'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                  }`}
                >
                  Todos
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                      selectedCategory === cat.name
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
                {combos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('Combos')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                      selectedCategory === 'Combos'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                    }`}
                  >
                    <span>🎁</span>
                    <span>Combos ({combos.length})</span>
                  </button>
                )}
              </div>

              {/* Product search */}
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar produtos, bebidas, adicionais..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-red-500"
                />
              </div>

              {/* Combos list if Combos category selected */}
              {selectedCategory === 'Combos' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {combos.filter((c) => c.available).map((combo) => (
                    <button
                      key={combo.id}
                      type="button"
                      onClick={() => handleAddComboToOrder(combo)}
                      className="p-3 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-emerald-500/30 hover:border-emerald-500 text-left transition-all group flex items-start justify-between gap-2 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-emerald-400 truncate">
                          🎁 {combo.name}
                        </div>
                        <div className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                          {combo.description}
                        </div>
                        <div className="text-xs font-bold text-white mt-1">
                          {formatCurrency(combo.comboPrice)}{' '}
                          <span className="text-[10px] text-neutral-500 line-through">
                            {formatCurrency(combo.originalPrice)}
                          </span>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-lg bg-emerald-600/20 group-hover:bg-emerald-600 text-emerald-400 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Product Cards Grid */}
              {selectedCategory !== 'Combos' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {availableProducts.map((prod) => {
                    const hasSizes = prod.hasSizes && prod.sizes && prod.sizes.length > 0;
                    return (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => handleProductCardClick(prod)}
                        className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800/80 hover:border-red-500/40 text-left transition-all group flex items-start justify-between gap-2 cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-neutral-100 group-hover:text-red-400 transition-colors truncate">
                            {prod.name}
                          </div>
                          <div className="text-[10px] text-neutral-400 line-clamp-1">
                            {prod.description || `${prod.category}`}
                          </div>
                          <div className="text-xs font-bold text-red-400 mt-1 flex items-center gap-1.5">
                            <span>
                              {hasSizes
                                ? `A partir de ${formatCurrency(Math.min(...prod.sizes!.map((s) => s.price)))}`
                                : formatCurrency(prod.price)}
                            </span>
                            {hasSizes && (
                              <span className="text-[9px] bg-neutral-800 text-neutral-400 px-1 py-0.2 rounded">
                                {prod.sizes!.length} tam
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-6 h-6 rounded-lg bg-red-600/20 group-hover:bg-red-600 text-red-400 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Selected Items, Payment, Totals & Save (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
            {/* Selected Items List */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3 flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  Itens do Pedido ({orderItems.reduce((acc, i) => acc + i.quantity, 0)})
                </span>
                {orderItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setOrderItems([])}
                    className="text-[10px] text-red-400 hover:underline"
                  >
                    Limpar itens
                  </button>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2 flex-1 overflow-y-auto max-h-56 pr-1 divide-y divide-neutral-900">
                {orderItems.length === 0 ? (
                  <div className="py-8 text-center text-neutral-500 text-xs">
                    Nenhum produto adicionado ainda.<br />
                    Clique nos produtos à esquerda para montar o pedido.
                  </div>
                ) : (
                  orderItems.map((item, idx) => (
                    <div key={item.id || idx} className="pt-2 first:pt-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-white truncate">
                            {item.name}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-0.5 text-[10px] text-neutral-400">
                            {item.size && (
                              <span className="bg-neutral-900 border border-neutral-800 px-1.5 py-0.2 rounded text-red-300 font-semibold">
                                {item.size}
                              </span>
                            )}
                            {item.crust && (
                              <span className="bg-neutral-900 border border-neutral-800 px-1.5 py-0.2 rounded text-amber-300">
                                Borda: {item.crust}
                              </span>
                            )}
                            {item.addons && item.addons.length > 0 && (
                              <span className="bg-neutral-900 border border-neutral-800 px-1.5 py-0.2 rounded text-emerald-300">
                                + {item.addons.join(', ')}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-red-400 font-semibold mt-0.5">
                            {formatCurrency(item.price)} cada
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1 bg-neutral-900 rounded-lg p-1 border border-neutral-800">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(idx, -1)}
                            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-1.5 text-xs font-bold text-white min-w-[16px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(idx, 1)}
                            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-white">
                            {formatCurrency(item.subtotal)}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-neutral-500 hover:text-red-400 p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Item note trigger / input */}
                      {editingItemNoteIndex === idx ? (
                        <div className="flex gap-1 pt-1">
                          <input
                            type="text"
                            placeholder="Obs do item (ex: Sem cebola, bem assada)"
                            value={tempItemNote}
                            onChange={(e) => setTempItemNote(e.target.value)}
                            className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-hidden"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveItemNote(idx)}
                            className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold"
                          >
                            Salvar
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-[11px]">
                          {item.notes ? (
                            <span className="text-amber-300 italic truncate max-w-[200px]">
                              Obs: {item.notes}
                            </span>
                          ) : (
                            <span className="text-neutral-500 italic">Sem observações</span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItemNoteIndex(idx);
                              setTempItemNote(item.notes || '');
                            }}
                            className="text-[10px] text-neutral-400 hover:text-amber-300 underline"
                          >
                            {item.notes ? 'Editar obs' : '+ Obs'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payment & Totals Section */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3">
              {/* Payment Method */}
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Forma de Pagamento</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(['Pix', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito'] as PaymentMethod[]).map(
                    (pm) => (
                      <button
                        key={pm}
                        type="button"
                        onClick={() => setPaymentMethod(pm)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          paymentMethod === pm
                            ? 'bg-emerald-600 text-white font-bold shadow-xs'
                            : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                        }`}
                      >
                        {pm === 'Cartão de Crédito'
                          ? 'Crédito'
                          : pm === 'Cartão de Débito'
                          ? 'Débito'
                          : pm}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Cash change field */}
              {paymentMethod === 'Dinheiro' && (
                <div className="flex gap-2 items-center bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                  <label className="text-xs text-neutral-300 whitespace-nowrap">Troco para:</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 100.00"
                    value={changeFor}
                    onChange={(e) => setChangeFor(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-hidden"
                  />
                  {changeFor && Number(changeFor) > total && (
                    <span className="text-xs text-amber-300 font-bold whitespace-nowrap">
                      Troco: {formatCurrency(Number(changeFor) - total)}
                    </span>
                  )}
                </div>
              )}

              {/* Delivery Fee & Discount inputs */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">
                    Taxa Entrega ({orderType === 'Entrega' ? 'Aplicada' : 'Grátis'})
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    disabled={orderType !== 'Entrega'}
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-white disabled:opacity-40"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-neutral-400 block">Desconto</label>
                    <div className="flex gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
                      <button
                        type="button"
                        onClick={() => setDiscountType('valor')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                          discountType === 'valor' ? 'bg-neutral-700 text-white' : 'text-neutral-500'
                        }`}
                      >
                        R$
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountType('porcentagem')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                          discountType === 'porcentagem' ? 'bg-neutral-700 text-white' : 'text-neutral-500'
                        }`}
                      >
                        %
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'valor' ? '0,00' : '0%'}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* General Order Notes */}
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Observações do Pedido</label>
                <input
                  type="text"
                  placeholder="Ex: Entregar até as 21h, portão cinza..."
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-hidden"
                />
              </div>

              {/* Final Totals Box */}
              <div className="pt-2 border-t border-neutral-800 space-y-1">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {orderType === 'Entrega' && (
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>Taxa de Entrega:</span>
                    <span>{formatCurrency(actualDeliveryFee)}</span>
                  </div>
                )}
                {actualDiscount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-400">
                    <span>Desconto:</span>
                    <span>-{formatCurrency(actualDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-xl text-white pt-1">
                  <span>Total:</span>
                  <span className="text-red-400">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* WhatsApp auto prompt checkbox */}
              <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={askWhatsAppAfterSave}
                  onChange={(e) => setAskWhatsAppAfterSave(e.target.checked)}
                  className="rounded bg-neutral-900 border-neutral-700 text-red-600 focus:ring-0"
                />
                <span>Enviar confirmação no WhatsApp após salvar</span>
              </label>

              {/* Submit Button */}
              <button
                type="button"
                id="submit-order-btn"
                onClick={handleSubmit}
                className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm shadow-xl shadow-red-600/30 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>{editingOrder ? 'Salvar Alterações' : 'Concluir & Gravar Pedido'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ITEM CUSTOMIZER MODAL (Sizes, Multiple Flavors, Crusts & Addons) */}
      {customizingProduct && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setCustomizingProduct(null)}
        >
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-3xl text-neutral-100 max-w-2xl w-full shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <span>🍕</span> {customizingProduct.name}
                </h3>
                <p className="text-xs text-neutral-400">Monte o item: escolha tamanho, sabores, borda e adicionais</p>
              </div>
              <button
                type="button"
                onClick={() => setCustomizingProduct(null)}
                className="p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* 1. Escolha de Tamanho */}
              {customizingProduct.hasSizes && customizingProduct.sizes && customizingProduct.sizes.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                    1. Selecione o Tamanho
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {customizingProduct.sizes.map((s) => {
                      const isSelected = customSize?.name === s.name;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setCustomSize(s);
                            // Ensure flavors do not exceed maxFlavors
                            if (selectedFlavorProducts.length > (s.maxFlavors || 2)) {
                              setSelectedFlavorProducts(selectedFlavorProducts.slice(0, s.maxFlavors || 2));
                            }
                          }}
                          className={`p-3 rounded-2xl border text-left transition ${
                            isSelected
                              ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                          }`}
                        >
                          <div className="font-bold text-xs">{s.name}</div>
                          <div className={`text-[10px] ${isSelected ? 'text-red-100' : 'text-neutral-400'}`}>
                            {s.slices ? `${s.slices} fatias` : ''} • até {s.maxFlavors || 2} sab.
                          </div>
                          <div className={`font-extrabold text-sm mt-1 ${isSelected ? 'text-white' : 'text-red-400'}`}>
                            {formatCurrency(s.price)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Seleção de Sabores (Meio a Meio / 1/2) */}
              {customizingProduct.hasSizes || (customizingProduct.maxFlavors && customizingProduct.maxFlavors > 1) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                      2. Sabores do Produto ({selectedFlavorProducts.length}/{customSize?.maxFlavors || 2})
                    </label>
                    <span className="text-[11px] text-neutral-400">
                      {selectedFlavorProducts.length === 1 ? '1 Sabor Inteiro' : `Dividida em ${selectedFlavorProducts.length} sabores`}
                    </span>
                  </div>

                  {/* Selected Flavors Pills */}
                  <div className="flex flex-wrap gap-1.5 p-2 bg-neutral-950 rounded-xl border border-neutral-800 min-h-[42px] items-center">
                    {selectedFlavorProducts.map((p, idx) => (
                      <span
                        key={idx}
                        className="bg-red-500/20 text-red-300 border border-red-500/40 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                      >
                        <strong>1/{selectedFlavorProducts.length}</strong> {p.name}
                        {selectedFlavorProducts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setSelectedFlavorProducts(selectedFlavorProducts.filter((_, i) => i !== idx))}
                            className="hover:text-white"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Add second flavor selector */}
                  {selectedFlavorProducts.length < (customSize?.maxFlavors || 2) && (
                    <div>
                      <span className="text-[11px] text-neutral-400 block mb-1">Adicionar outro sabor (Meio a Meio):</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-32 overflow-y-auto pr-1">
                        {availableFlavorProducts
                          .filter((p) => !selectedFlavorProducts.some((sf) => sf.id === p.id))
                          .map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setSelectedFlavorProducts((prev) => [...prev, p])}
                              className="p-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-left text-xs text-neutral-200 truncate"
                            >
                              + {p.name}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Borda Recheada */}
              {customizingProduct.crusts && customizingProduct.crusts.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                    3. Borda Recheada (Opcional)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCrust(null)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition ${
                        !selectedCrust
                          ? 'bg-amber-600 text-white border-amber-500 font-bold'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <span>Sem Borda Especial</span>
                      <span className="block text-[10px] opacity-75">Tradicional</span>
                    </button>

                    {customizingProduct.crusts.filter((c) => c.available).map((crust) => {
                      const isSelected = selectedCrust?.id === crust.id;
                      return (
                        <button
                          key={crust.id}
                          type="button"
                          onClick={() => setSelectedCrust(crust)}
                          className={`p-2.5 rounded-xl border text-left text-xs transition ${
                            isSelected
                              ? 'bg-amber-600 text-white border-amber-500 font-bold shadow-md shadow-amber-600/30'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                          }`}
                        >
                          <span>{crust.name}</span>
                          <span className={`block font-bold text-[11px] ${isSelected ? 'text-white' : 'text-amber-400'}`}>
                            +{formatCurrency(crust.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Adicionais Extras */}
              {addons.filter((a) => a.available).length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                    4. Adicionais & Extras
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {addons.filter((a) => a.available).map((addon) => {
                      const isSelected = selectedAddons.some((a) => a.id === addon.id);
                      return (
                        <button
                          key={addon.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedAddons((prev) => prev.filter((a) => a.id !== addon.id));
                            } else {
                              setSelectedAddons((prev) => [...prev, addon]);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                          }`}
                        >
                          <div>
                            <span>{addon.name}</span>
                            <span className={`block text-[11px] ${isSelected ? 'text-white' : 'text-emerald-400'}`}>
                              +{formatCurrency(addon.price)}
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. Observação do Item */}
              <div>
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-1">
                  5. Observações Especiais do Item
                </label>
                <input
                  type="text"
                  placeholder="Ex: Sem cebola, massa fina, bem assada, caprichar no orégano..."
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-red-500"
                />
              </div>
            </div>

            {/* Customizer Bottom Bar */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
              {/* Quantity */}
              <div className="flex items-center gap-2 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setCustomQuantity((q) => Math.max(1, q - 1))}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-sm font-bold text-white min-w-[20px] text-center">
                  {customQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setCustomQuantity((q) => q + 1)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Order Button */}
              <button
                type="button"
                onClick={handleConfirmCustomizedItem}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-red-600/30 transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Adicionar ao Pedido</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
