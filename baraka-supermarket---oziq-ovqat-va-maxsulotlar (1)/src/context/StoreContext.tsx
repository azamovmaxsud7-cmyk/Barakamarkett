import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Product, 
  CartItem, 
  CategoryId, 
  FilterState, 
  OrderDetails, 
  PaymentMethod, 
  DeliveryTimeSlot,
  OrderStatus,
  PromoCode,
  StoreSettings,
  Courier,
  CourierStatus,
  AutoDispatchSettings,
  LoyaltyCard,
  SupermarketBranch,
  InventoryAuditSession,
  FinancialHealthMetrics
} from '../types';
import { PRODUCTS } from '../data/products';
import { INITIAL_COURIERS } from '../data/couriers';
import { SUPERMARKET_BRANCHES } from '../data/branches';
import { sounds } from '../utils/audio';
import { applyDailyCategoryDiscounts } from '../utils/dailyDiscounts';

const INITIAL_AUDIT_HISTORY: InventoryAuditSession[] = [
  {
    id: 'AUD-2026-0831',
    auditorName: 'Shaxruz (Do‘kon rahbari)',
    auditorRole: 'Bosh boshqaruvchi',
    branchId: 'tash_qoratosh',
    branchName: 'Baraka Qoratosh Hypermarket',
    createdAt: '31-avgust 2026, 15:49',
    itemsCount: 6,
    countedCount: 1,
    discrepanciesCount: 1,
    totalMissingQty: 6,
    totalSurplusQty: 0,
    totalFinancialDiscrepancy: -138000,
    status: 'applied',
    note: 'Oylik qoldiq tekshiruvi. Kovrik uz tovarida 6 dona kamomad aniqlandi va hisobdan chiqarildi.',
    items: [
      {
        productId: '1',
        productName: 'Kovrik uz',
        sku: 'SKU-MSXBGAUC',
        expectedStock: 116,
        actualStock: 110,
        difference: -6,
        costPrice: 23000,
        price: 32000,
        lossOrGainValue: -138000
      }
    ]
  }
];

interface OrderInput {
  fullName: string;
  phone: string;
  address: string;
  landmark?: string;
  paymentMethod: PaymentMethod;
  timeSlot: DeliveryTimeSlot;
  comment?: string;
  usedBonusPoints?: number;
}

const INITIAL_LOYALTY_CARD: LoyaltyCard = {
  cardNumber: '8600 4591 2280 4390',
  holderName: 'Azamov Maxsud',
  pointsBalance: 34500,
  cashbackTier: 'Oltin (2%)',
  cashbackPercent: 2,
  totalSavings: 142000,
  qrCode: 'BARAKA-PLUS-8600459122804390',
  levelProgress: 65
};

const INITIAL_PROMO_CODES: PromoCode[] = [
  { id: '1', code: 'BARAKA2026', discountPercent: 10, minOrderAmount: 50000, active: true, usageCount: 42, description: 'Yangi yil va baraka aksiyasi' },
  { id: '2', code: 'SUPER10', discountPercent: 10, minOrderAmount: 80000, active: true, usageCount: 128, description: 'Doimiy mijozlar uchun 10%' },
  { id: '3', code: 'MEGAMARKET', discountPercent: 15, minOrderAmount: 150000, active: true, usageCount: 67, description: 'Katta xaridlar uchun 15%' },
  { id: '4', code: 'BARAKA15', discountPercent: 15, minOrderAmount: 120000, active: true, usageCount: 35, description: 'Maxsus bayramona chegirma' },
  { id: '5', code: 'WELCOME20', discountPercent: 20, minOrderAmount: 200000, active: false, usageCount: 19, description: 'Birinchi xarid uchun maxsus' }
];

const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Baraka Supermarket',
  hotline: '(66) 200-00-00',
  workingHours: '07:00 – 23:00',
  address: 'Samarqand sh., Registon ko‘chasi 14',
  freeDeliveryThreshold: 150000,
  standardDeliveryFee: 15000,
  announcementBanner: '150 000 so‘mdan yuqori buyurtmalarga BEPUL YETKAZISH! Yetkazish vaqti: 30 - 45 daqiqa.',
  isOpen: true
};

const INITIAL_AUTO_DISPATCH: AutoDispatchSettings = {
  autoAssignEnabled: true,
  autoDeliverySimEnabled: true,
  simulationSpeed: 'normal',
  perDeliveryFeeToCourier: 15000,
  soundAlertsEnabled: true
};

const INITIAL_ORDERS: OrderDetails[] = [];

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  orders: OrderDetails[];
  promoCodes: PromoCode[];
  settings: StoreSettings;
  couriers: Courier[];
  autoDispatchSettings: AutoDispatchSettings;
  activeCategoryModal: CategoryId | null;
  activeProductModal: Product | null;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isWishlistOpen: boolean;
  isOrderSuccessOpen: boolean;
  isAdminOpen: boolean;
  isAdminAuthenticated: boolean;
  isCourierPanelOpen: boolean;
  isCourierAuthenticated: boolean;
  activeCourierDriverId: string | null;
  lastOrder: OrderDetails | null;
  filters: FilterState;
  soundEnabled: boolean;
  deliveryLocation: string;
  appliedPromo: { code: string; discountPercent: number } | null;
  mobileGridCols: 2 | 3;
  setMobileGridCols: (cols: 2 | 3) => void;
  activeTab: 'home' | 'categories' | 'cart' | 'wishlist' | 'profile';
  setActiveTab: (tab: 'home' | 'categories' | 'cart' | 'wishlist' | 'profile') => void;
  
  // Supermarket & Loyalty
  loyaltyCard: LoyaltyCard;
  branches: SupermarketBranch[];
  activeBranch: SupermarketBranch;
  deliveryMode: 'express' | 'standard' | 'pickup';
  isCatalogOpen: boolean;
  isLoyaltyModalOpen: boolean;
  isBranchModalOpen: boolean;
  setIsCatalogOpen: (open: boolean) => void;
  setIsLoyaltyModalOpen: (open: boolean) => void;
  setIsBranchModalOpen: (open: boolean) => void;
  setActiveBranch: (branch: SupermarketBranch) => void;
  setDeliveryMode: (mode: 'express' | 'standard' | 'pickup') => void;
  addLoyaltyPoints: (points: number) => void;

  // Client Actions
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  openCategoryModal: (id: CategoryId) => void;
  closeCategoryModal: () => void;
  openProductModal: (product: Product) => void;
  closeProductModal: () => void;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsWishlistOpen: (open: boolean) => void;
  setIsOrderSuccessOpen: (open: boolean) => void;
  setIsAdminOpen: (open: boolean) => void;
  setIsAdminAuthenticated: (auth: boolean) => void;
  setIsCourierPanelOpen: (open: boolean) => void;
  setIsCourierAuthenticated: (auth: boolean) => void;
  setActiveCourierDriverId: (id: string | null) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getCartItemQuantity: (productId: string) => number;
  toggleSound: () => void;
  setDeliveryLocation: (location: string) => void;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  placeOrder: (input: OrderInput) => void;

  // Courier Actions
  autoAssignOrder: (orderId: string) => { success: boolean; courier?: Courier; message: string };
  autoAssignAllPendingOrders: () => number;
  assignCourierToOrder: (orderId: string, courierId: string) => void;
  unassignCourierFromOrder: (orderId: string) => void;
  acceptOrderByCourier: (orderId: string) => void;
  rejectOrderByCourier: (orderId: string) => void;
  updateCourierStatus: (courierId: string, status: CourierStatus) => void;
  addNewCourier: (courier: Omit<Courier, 'id' | 'completedDeliveriesToday' | 'earningsToday' | 'speedKmh' | 'joinedDate'>) => void;
  deleteCourier: (courierId: string) => void;
  updateAutoDispatchSettings: (partial: Partial<AutoDispatchSettings>) => void;
  advanceDeliveryProgress: (orderId: string, deltaPercent: number) => void;
  completeDelivery: (orderId: string) => void;

  // Admin Actions (Products CRUD, Orders Status, Promo, Settings)
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateProductStock: (id: string, newStock: number) => void;
  updateProductCostPrice: (id: string, newCostPrice: number) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
  clearAllOrders: () => void;
  addPromoCode: (promo: Omit<PromoCode, 'id' | 'usageCount'>) => void;
  togglePromoStatus: (id: string) => void;
  deletePromoCode: (id: string) => void;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  resetAllDataToDefaults: () => void;

  // Inventory & Anti-Bankruptcy Financial System
  isInventoryModalOpen: boolean;
  setIsInventoryModalOpen: (open: boolean) => void;
  auditHistory: InventoryAuditSession[];
  applyInventoryAudit: (audit: InventoryAuditSession) => void;
  deleteAuditRecord: (auditId: string) => void;
  financialMetrics: FinancialHealthMetrics;

  // Computed values
  cartTotalCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  deliveryFee: number;
  cartFinalTotal: number;
  freeDeliveryThreshold: number;
  remainingForFreeDelivery: number;
  activeDeliveriesCount: number;
}

const initialFilters: FilterState = {
  searchQuery: '',
  category: 'all',
  subcategory: 'all',
  minPrice: 0,
  maxPrice: 200000,
  onlyDiscount: false,
  onlyInStock: false,
  onlyHalal: false,
  sortBy: 'popular',
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      localStorage.removeItem('baraka_products');
      return applyDailyCategoryDiscounts(PRODUCTS);
    } catch {
      return applyDailyCategoryDiscounts(PRODUCTS);
    }
  });

  // Automatically refresh daily discounts across the store on date change
  useEffect(() => {
    const handleDayCheck = () => {
      setProducts(prev => applyDailyCategoryDiscounts(prev));
    };
    const timer = setInterval(handleDayCheck, 60000);
    return () => clearInterval(timer);
  }, []);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('baraka_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('baraka_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<OrderDetails[]>(() => {
    try {
      localStorage.removeItem('baraka_orders');
      localStorage.setItem('baraka_orders', JSON.stringify([]));
      return [];
    } catch {
      return [];
    }
  });

  const [couriers, setCouriers] = useState<Courier[]>(() => {
    try {
      const saved = localStorage.getItem('baraka_couriers');
      return saved ? JSON.parse(saved) : INITIAL_COURIERS;
    } catch {
      return INITIAL_COURIERS;
    }
  });

  const [autoDispatchSettings, setAutoDispatchSettings] = useState<AutoDispatchSettings>(() => {
    try {
      const saved = localStorage.getItem('baraka_auto_dispatch');
      return saved ? JSON.parse(saved) : INITIAL_AUTO_DISPATCH;
    } catch {
      return INITIAL_AUTO_DISPATCH;
    }
  });

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    try {
      const saved = localStorage.getItem('baraka_promo_codes');
      return saved ? JSON.parse(saved) : INITIAL_PROMO_CODES;
    } catch {
      return INITIAL_PROMO_CODES;
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('baraka_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.address === 'string' && parsed.address.includes('Toshkent')) {
          parsed.address = 'Samarqand sh., Registon ko‘chasi 14';
        }
        return parsed;
      }
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [activeCategoryModal, setActiveCategoryModal] = useState<CategoryId | null>(null);
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCourierPanelOpen, setIsCourierPanelOpen] = useState(false);
  const [activeCourierDriverId, setActiveCourierDriverId] = useState<string | null>(null);
  
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('baraka_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [isCourierAuthenticated, setIsCourierAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('baraka_courier_auth') === 'true';
    } catch {
      return false;
    }
  });

  // Inventory & Auditing State
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [auditHistory, setAuditHistory] = useState<InventoryAuditSession[]>(() => {
    try {
      const saved = localStorage.getItem('baraka_audit_history');
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_HISTORY;
    } catch {
      return INITIAL_AUDIT_HISTORY;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('baraka_audit_history', JSON.stringify(auditHistory));
    } catch {}
  }, [auditHistory]);

  // Supermarket & Loyalty States
  const [loyaltyCard, setLoyaltyCard] = useState<LoyaltyCard>(() => {
    try {
      const saved = localStorage.getItem('baraka_loyalty_card');
      return saved ? JSON.parse(saved) : INITIAL_LOYALTY_CARD;
    } catch {
      return INITIAL_LOYALTY_CARD;
    }
  });

  const [branches] = useState<SupermarketBranch[]>(SUPERMARKET_BRANCHES);
  const [activeBranch, setActiveBranchState] = useState<SupermarketBranch>(() => {
    try {
      const saved = localStorage.getItem('baraka_active_branch');
      if (saved) {
        const parsed = JSON.parse(saved);
        const found = SUPERMARKET_BRANCHES.find(b => b.id === parsed.id);
        if (found) return found;
      }
      return SUPERMARKET_BRANCHES[0];
    } catch {
      return SUPERMARKET_BRANCHES[0];
    }
  });

  const [deliveryMode, setDeliveryModeState] = useState<'express' | 'standard' | 'pickup'>(() => {
    try {
      const saved = localStorage.getItem('baraka_delivery_mode');
      return (saved as any) || 'express';
    } catch {
      return 'express';
    }
  });

  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);

  const setActiveBranch = (branch: SupermarketBranch) => {
    setActiveBranchState(branch);
    try {
      localStorage.setItem('baraka_active_branch', JSON.stringify(branch));
    } catch {}
    sounds.playClick();
  };

  const setDeliveryMode = (mode: 'express' | 'standard' | 'pickup') => {
    setDeliveryModeState(mode);
    try {
      localStorage.setItem('baraka_delivery_mode', mode);
    } catch {}
    sounds.playClick();
  };

  const addLoyaltyPoints = (points: number) => {
    setLoyaltyCard(prev => {
      const updated = {
        ...prev,
        pointsBalance: prev.pointsBalance + points,
        totalSavings: prev.totalSavings + points
      };
      try {
        localStorage.setItem('baraka_loyalty_card', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  useEffect(() => {
    try {
      localStorage.setItem('baraka_loyalty_card', JSON.stringify(loyaltyCard));
    } catch {}
  }, [loyaltyCard]);

  const [lastOrder, setLastOrder] = useState<OrderDetails | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [deliveryLocation, setDeliveryLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('baraka_delivery_location');
      if (saved && !saved.includes('Toshkent')) {
        return saved;
      }
      return 'Samarqand sh.';
    } catch {
      return 'Samarqand sh.';
    }
  });
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number } | null>(null);
  const [mobileGridCols, setMobileGridColsState] = useState<2 | 3>(() => {
    try {
      const saved = localStorage.getItem('baraka_mobile_grid_cols');
      return saved === '3' ? 3 : 2;
    } catch {
      return 2;
    }
  });

  const setMobileGridCols = (cols: 2 | 3) => {
    setMobileGridColsState(cols);
    try {
      localStorage.setItem('baraka_mobile_grid_cols', String(cols));
    } catch {}
  };

  const [activeTab, setActiveTabState] = useState<'home' | 'categories' | 'cart' | 'wishlist' | 'profile'>('home');

  const setActiveTab = (tab: 'home' | 'categories' | 'cart' | 'wishlist' | 'profile') => {
    setActiveTabState(tab);
    if (tab === 'cart') {
      setIsCartOpen(true);
    } else if (tab === 'wishlist') {
      setIsWishlistOpen(true);
    } else if (tab === 'profile') {
      setIsLoyaltyModalOpen(true);
    }
  };

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('baraka_delivery_location', deliveryLocation);
    } catch {}
  }, [deliveryLocation]);

  useEffect(() => {
    try {
      localStorage.setItem('baraka_products', JSON.stringify(products));
    } catch {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('baraka_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('baraka_wishlist', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('baraka_orders', JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('baraka_couriers', JSON.stringify(couriers));
    } catch {}
  }, [couriers]);

  useEffect(() => {
    try {
      localStorage.setItem('baraka_auto_dispatch', JSON.stringify(autoDispatchSettings));
    } catch {}
  }, [autoDispatchSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('baraka_promo_codes', JSON.stringify(promoCodes));
    } catch {}
  }, [promoCodes]);

  useEffect(() => {
    try {
      localStorage.setItem('baraka_settings', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('baraka_admin_auth', isAdminAuthenticated ? 'true' : 'false');
    } catch {}
  }, [isAdminAuthenticated]);

  useEffect(() => {
    try {
      localStorage.setItem('baraka_courier_auth', isCourierAuthenticated ? 'true' : 'false');
    } catch {}
  }, [isCourierAuthenticated]);

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.enabled = nextState;
    if (nextState) sounds.playClick();
  };

  const openCategoryModal = (id: CategoryId) => {
    sounds.playClick();
    setActiveCategoryModal(id);
    setFilters(prev => ({ ...prev, category: id, subcategory: 'all' }));
  };

  const closeCategoryModal = () => {
    sounds.playClick();
    setActiveCategoryModal(null);
  };

  const openProductModal = (product: Product) => {
    sounds.playClick();
    setActiveProductModal(product);
  };

  const closeProductModal = () => {
    sounds.playClick();
    setActiveProductModal(null);
  };

  const resetFilters = () => {
    sounds.playClick();
    setFilters(initialFilters);
  };

  const addToCart = (product: Product, quantity = 1) => {
    sounds.playAddToCart();
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    sounds.playRemove();
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    sounds.playClick();
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    sounds.playRemove();
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    sounds.playClick();
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const getCartItemQuantity = (productId: string) => {
    const item = cart.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const applyPromoCode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const matched = promoCodes.find(p => p.code.toUpperCase() === cleanCode && p.active);
    
    if (matched) {
      if (cartSubtotal < matched.minOrderAmount) {
        sounds.playRemove();
        return { 
          success: false, 
          message: `Ushbu promokod uchun minimal xarid: ${matched.minOrderAmount.toLocaleString()} so'm` 
        };
      }
      setAppliedPromo({ code: matched.code, discountPercent: matched.discountPercent });
      setPromoCodes(prev => prev.map(p => p.id === matched.id ? { ...p, usageCount: p.usageCount + 1 } : p));
      sounds.playSuccess();
      return { success: true, message: `${matched.discountPercent}% chegirma muvaffaqiyatli qo‘llandi!` };
    }

    sounds.playRemove();
    return { success: false, message: 'Noto‘g‘ri yoki nofaol promokod kiritildi' };
  };

  const removePromoCode = () => {
    sounds.playRemove();
    setAppliedPromo(null);
  };

  // Calculations
  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const promoDiscountAmount = appliedPromo
    ? Math.round((cartSubtotal * appliedPromo.discountPercent) / 100)
    : 0;

  const freeDeliveryThreshold = settings.freeDeliveryThreshold || 150000;
  const standardFee = settings.standardDeliveryFee || 15000;
  const deliveryFee = cartSubtotal >= freeDeliveryThreshold || cartSubtotal === 0 ? 0 : standardFee;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartSubtotal);
  const cartDiscount = promoDiscountAmount;
  const cartFinalTotal = Math.max(0, cartSubtotal - cartDiscount + deliveryFee);

  const activeDeliveriesCount = orders.filter(o => o.status === "Kuryer yo'lda").length;

  const placeOrder = (input: OrderInput) => {
    const newOrder: OrderDetails = {
      orderId: Math.floor(100000 + Math.random() * 900000).toString(),
      fullName: input.fullName,
      phone: input.phone,
      address: input.address,
      landmark: input.landmark,
      timeSlot: input.timeSlot,
      paymentMethod: input.paymentMethod,
      comment: input.comment,
      items: [...cart],
      subtotal: cartSubtotal,
      discount: cartDiscount,
      deliveryFee,
      totalAmount: cartFinalTotal,
      createdAt: `Bugun, ${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`,
      status: 'Tayyorlanmoqda',
      isAcceptedByCourier: false
    };

    sounds.playSuccess();
    const earnedCashback = Math.round(cartFinalTotal * 0.02);
    if (earnedCashback > 0) {
      addLoyaltyPoints(earnedCashback);
    }
    setLastOrder(newOrder);
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setIsCheckoutOpen(false);
    setIsOrderSuccessOpen(true);
  };

  // Courier Actions
  const assignCourierToOrder = useCallback((orderId: string, courierId: string) => {
    const courier = couriers.find(c => c.id === courierId);
    if (!courier) return;

    sounds.playCourierAssign();

    setOrders(prev => prev.map(o => o.orderId === orderId ? {
      ...o,
      status: "Kuryer yo'lda",
      courierId: courier.id,
      courierName: courier.name,
      courierPhone: courier.phone,
      courierVehicle: `${courier.vehicleName} (${courier.vehiclePlate})`,
      courierAvatar: courier.avatar,
      isAcceptedByCourier: false,
      deliveryProgress: 10,
      estimatedMinutes: courier.vehicleType === 'motor' ? 12 : courier.vehicleType === 'car' ? 18 : courier.vehicleType === 'scooter' ? 15 : 20,
      assignedAt: `Bugun, ${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`
    } : o));

    setCouriers(prev => prev.map(c => c.id === courierId ? {
      ...c,
      status: 'busy',
      currentOrderId: orderId
    } : c));
  }, [couriers]);

  const acceptOrderByCourier = useCallback((orderId: string) => {
    sounds.playSuccess();
    setOrders(prev => prev.map(o => o.orderId === orderId ? {
      ...o,
      status: "Kuryer yo'lda",
      isAcceptedByCourier: true,
      deliveryProgress: Math.max(10, o.deliveryProgress || 10)
    } : o));
  }, []);

  const rejectOrderByCourier = useCallback((orderId: string) => {
    sounds.playRemove();
    const order = orders.find(o => o.orderId === orderId);
    if (order && order.courierId) {
      setCouriers(prev => prev.map(c => c.id === order.courierId ? {
        ...c,
        status: 'online',
        currentOrderId: undefined
      } : c));
    }

    setOrders(prev => prev.map(o => o.orderId === orderId ? {
      ...o,
      status: 'Tayyorlanmoqda',
      courierId: undefined,
      courierName: undefined,
      courierPhone: undefined,
      courierVehicle: undefined,
      courierAvatar: undefined,
      isAcceptedByCourier: false,
      deliveryProgress: 0,
      estimatedMinutes: undefined
    } : o));
  }, [orders]);

  const autoAssignOrder = useCallback((orderId: string) => {
    const order = orders.find(o => o.orderId === orderId);
    if (!order) return { success: false, message: 'Buyurtma topilmadi' };

    const availableCouriers = couriers.filter(c => c.status === 'online' && !c.currentOrderId);
    if (availableCouriers.length === 0) {
      return { success: false, message: 'Ayni damda bo‘sh (onlayn) kuryer yo‘q' };
    }

    // Match criteria based on order volume
    let chosen = availableCouriers[0];
    const isBig = order.items.length >= 3 || order.totalAmount > 150000;
    if (isBig) {
      const heavy = availableCouriers.find(c => ['damas', 'car', 'motor'].includes(c.vehicleType));
      if (heavy) chosen = heavy;
    } else {
      const light = availableCouriers.find(c => ['motor', 'scooter', 'bike'].includes(c.vehicleType));
      if (light) chosen = light;
    }

    assignCourierToOrder(orderId, chosen.id);
    return { success: true, courier: chosen, message: `${chosen.name} (${chosen.vehicleName}) biriktirildi` };
  }, [orders, couriers, assignCourierToOrder]);

  const autoAssignAllPendingOrders = useCallback(() => {
    const pending = orders.filter(o => o.status === 'Tayyorlanmoqda' && !o.courierId);
    let count = 0;
    pending.forEach(p => {
      const res = autoAssignOrder(p.orderId);
      if (res.success) count++;
    });
    return count;
  }, [orders, autoAssignOrder]);

  const unassignCourierFromOrder = (orderId: string) => {
    sounds.playRemove();
    const order = orders.find(o => o.orderId === orderId);
    if (order && order.courierId) {
      setCouriers(prev => prev.map(c => c.id === order.courierId ? {
        ...c,
        status: 'online',
        currentOrderId: undefined
      } : c));
    }

    setOrders(prev => prev.map(o => o.orderId === orderId ? {
      ...o,
      status: 'Tayyorlanmoqda',
      courierId: undefined,
      courierName: undefined,
      courierPhone: undefined,
      courierVehicle: undefined,
      courierAvatar: undefined,
      isAcceptedByCourier: false,
      deliveryProgress: 0,
      estimatedMinutes: undefined
    } : o));
  };

  const updateCourierStatus = (courierId: string, status: CourierStatus) => {
    sounds.playClick();
    setCouriers(prev => prev.map(c => c.id === courierId ? { ...c, status } : c));
  };

  const addNewCourier = (courierData: Omit<Courier, 'id' | 'completedDeliveriesToday' | 'earningsToday' | 'speedKmh' | 'joinedDate'>) => {
    const id = `cour_${Date.now()}`;
    const newCourier: Courier = {
      ...courierData,
      id,
      completedDeliveriesToday: 0,
      earningsToday: 0,
      speedKmh: courierData.vehicleType === 'bike' ? 18 : courierData.vehicleType === 'scooter' ? 24 : courierData.vehicleType === 'motor' ? 45 : 35,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    sounds.playSuccess();
    setCouriers(prev => [newCourier, ...prev]);
  };

  const deleteCourier = (courierId: string) => {
    sounds.playRemove();
    setCouriers(prev => prev.filter(c => c.id !== courierId));
  };

  const updateAutoDispatchSettings = (partial: Partial<AutoDispatchSettings>) => {
    sounds.playClick();
    setAutoDispatchSettings(prev => ({ ...prev, ...partial }));
  };

  const advanceDeliveryProgress = (orderId: string, deltaPercent: number) => {
    sounds.playClick();
    setOrders(prev => prev.map(order => {
      if (order.orderId === orderId) {
        const current = order.deliveryProgress || 0;
        const next = Math.min(100, Math.max(0, current + deltaPercent));
        if (next >= 100) {
          completeDelivery(orderId);
          return { ...order, deliveryProgress: 100, status: 'Yetkazildi' };
        }
        return { ...order, deliveryProgress: next };
      }
      return order;
    }));
  };

  const completeDelivery = useCallback((orderId: string) => {
    const order = orders.find(o => o.orderId === orderId);
    if (!order) return;

    sounds.playDeliveryArrival();

    if (order.courierId) {
      const courierId = order.courierId;
      setCouriers(prev => prev.map(c => {
        if (c.id === courierId) {
          return {
            ...c,
            status: 'online',
            currentOrderId: undefined,
            completedDeliveriesToday: c.completedDeliveriesToday + 1,
            earningsToday: c.earningsToday + autoDispatchSettings.perDeliveryFeeToCourier
          };
        }
        return c;
      }));
    }

    setOrders(prev => prev.map(o => o.orderId === orderId ? {
      ...o,
      status: 'Yetkazildi',
      deliveryProgress: 100,
      completedAt: `Bugun, ${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`
    } : o));
  }, [orders, autoDispatchSettings.perDeliveryFeeToCourier]);

  // Automated Simulation Loop (Auto-Assign & Live Delivery Progress Simulation)
  useEffect(() => {
    const intervalMs = autoDispatchSettings.simulationSpeed === 'fast' ? 2000 : autoDispatchSettings.simulationSpeed === 'normal' ? 3800 : 7000;
    const progressStep = autoDispatchSettings.simulationSpeed === 'fast' ? 14 : autoDispatchSettings.simulationSpeed === 'normal' ? 7 : 3;

    const timer = setInterval(() => {
      // 1. Auto-assign pending orders
      if (autoDispatchSettings.autoAssignEnabled) {
        const pending = orders.find(o => o.status === 'Tayyorlanmoqda' && !o.courierId);
        const freeCourier = couriers.find(c => c.status === 'online' && !c.currentOrderId);
        if (pending && freeCourier) {
          assignCourierToOrder(pending.orderId, freeCourier.id);
        }
      }

      // 2. Auto-simulate on-the-road deliveries only if accepted by courier
      if (autoDispatchSettings.autoDeliverySimEnabled) {
        orders.forEach(order => {
          if (order.status === "Kuryer yo'lda" && order.courierId && order.isAcceptedByCourier) {
            const currentProg = order.deliveryProgress || 0;
            const nextProg = currentProg + progressStep;
            if (nextProg >= 100) {
              completeDelivery(order.orderId);
            } else {
              setOrders(prev => prev.map(o => o.orderId === order.orderId ? {
                ...o,
                deliveryProgress: nextProg,
                estimatedMinutes: Math.max(1, Math.round((o.estimatedMinutes || 15) * (1 - nextProg / 100)))
              } : o));
            }
          }
        });
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [
    autoDispatchSettings.autoAssignEnabled, 
    autoDispatchSettings.autoDeliverySimEnabled, 
    autoDispatchSettings.simulationSpeed, 
    orders, 
    couriers, 
    assignCourierToOrder, 
    completeDelivery
  ]);

  // Admin Actions
  const addProduct = (newProdData: Omit<Product, 'id'>) => {
    const id = `prod_${Date.now()}`;
    const newProduct: Product = {
      ...newProdData,
      id,
      rating: newProdData.rating || 5.0,
      reviewCount: newProdData.reviewCount || 1,
      stock: newProdData.stock ?? 25
    };
    sounds.playSuccess();
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    sounds.playClick();
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
  };

  const deleteProduct = (id: string) => {
    sounds.playRemove();
    setProducts(prev => prev.filter(p => p.id !== id));
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const updateProductStock = (id: string, newStock: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: Math.max(0, newStock) } : p));
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    sounds.playClick();
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status } : o));
  };

  const deleteOrder = (orderId: string) => {
    sounds.playRemove();
    setOrders(prev => prev.filter(o => o.orderId !== orderId));
  };

  const clearAllOrders = () => {
    sounds.playRemove();
    setOrders([]);
    try {
      localStorage.removeItem('baraka_orders');
      localStorage.setItem('baraka_orders', JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }
  };

  const addPromoCode = (promoData: Omit<PromoCode, 'id' | 'usageCount'>) => {
    const id = `promo_${Date.now()}`;
    const newPromo: PromoCode = {
      ...promoData,
      id,
      usageCount: 0,
      code: promoData.code.trim().toUpperCase()
    };
    sounds.playSuccess();
    setPromoCodes(prev => [newPromo, ...prev]);
  };

  const togglePromoStatus = (id: string) => {
    sounds.playClick();
    setPromoCodes(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const deletePromoCode = (id: string) => {
    sounds.playRemove();
    setPromoCodes(prev => prev.filter(p => p.id !== id));
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    sounds.playSuccess();
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateProductCostPrice = (id: string, newCostPrice: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, costPrice: Math.max(0, newCostPrice) } : p));
  };

  const applyInventoryAudit = (audit: InventoryAuditSession) => {
    sounds.playSuccess();
    // Update product stocks based on audit
    setProducts(prev => prev.map(p => {
      const auditedItem = audit.items.find(i => i.productId === p.id);
      if (auditedItem) {
        return {
          ...p,
          stock: Math.max(0, auditedItem.actualStock),
          lastAuditedAt: new Date().toISOString()
        };
      }
      return p;
    }));
    // Save to audit history
    setAuditHistory(prev => [audit, ...prev]);
  };

  const deleteAuditRecord = (auditId: string) => {
    sounds.playRemove();
    setAuditHistory(prev => prev.filter(a => a.id !== auditId));
  };

  // Automated Financial Intelligence & Anti-Bankruptcy Risk Analytics
  const financialMetrics: FinancialHealthMetrics = React.useMemo(() => {
    let totalCostVal = 0;
    let totalRetailVal = 0;
    let dangerCount = 0;
    let deadStockVal = 0;

    products.forEach(p => {
      const cost = p.costPrice !== undefined ? p.costPrice : Math.round(p.price * 0.72);
      const stock = p.stock || 0;
      totalCostVal += cost * stock;
      totalRetailVal += p.price * stock;

      // Risk conditions: out of stock, zero or negative margin, price lower than cost
      if (stock === 0 || cost >= p.price || (p.oldPrice && p.price < cost)) {
        dangerCount++;
      }
      if (stock > 70) {
        deadStockVal += cost * (stock - 35);
      }
    });

    const potentialProfit = Math.max(0, totalRetailVal - totalCostVal);
    const marginPercent = totalRetailVal > 0 ? Number(((potentialProfit / totalRetailVal) * 100).toFixed(1)) : 0;
    
    const totalDiscrepancyLoss = auditHistory.reduce((sum, a) => {
      return sum + (a.totalFinancialDiscrepancy < 0 ? Math.abs(a.totalFinancialDiscrepancy) : 0);
    }, 0);

    const dailyRev = orders.reduce((sum, o) => o.status !== 'Bekor qilindi' ? sum + o.totalAmount : sum, 0);
    const monthlyNet = Math.max(0, Math.round((dailyRev * 30 * 0.18) - (totalDiscrepancyLoss * 0.1)));

    // Bankrotlikdan himoya xavfsizlik reytingi
    let safetyScore = 96;
    if (dangerCount > 2) safetyScore -= dangerCount * 3;
    if (marginPercent < 22) safetyScore -= Math.round((22 - marginPercent) * 2.5);
    if (totalDiscrepancyLoss > 300000) safetyScore -= 12;
    if (deadStockVal > 3000000) safetyScore -= 6;
    safetyScore = Math.max(20, Math.min(99, Math.round(safetyScore)));

    let status: 'Xavfsiz (Barqaror)' | 'Ehtiyotkorlik zarur' | 'Xavfli (Bankrotlik xatari)' = 'Xavfsiz (Barqaror)';
    if (safetyScore < 65) {
      status = 'Xavfli (Bankrotlik xatari)';
    } else if (safetyScore < 85) {
      status = 'Ehtiyotkorlik zarur';
    }

    return {
      totalInventoryCostValue: totalCostVal,
      totalInventoryRetailValue: totalRetailVal,
      potentialGrossProfit: potentialProfit,
      grossMarginPercent: marginPercent,
      lossRiskValue: totalDiscrepancyLoss,
      bankruptcySafetyScore: safetyScore,
      bankruptcyStatus: status,
      dangerProductsCount: dangerCount,
      deadStockValue: deadStockVal,
      dailyRevenue: dailyRev,
      estimatedMonthlyNetProfit: monthlyNet
    };
  }, [products, auditHistory, orders]);

  const resetAllDataToDefaults = () => {
    setProducts(PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setCouriers(INITIAL_COURIERS);
    setAutoDispatchSettings(INITIAL_AUTO_DISPATCH);
    setPromoCodes(INITIAL_PROMO_CODES);
    setSettings(INITIAL_SETTINGS);
    setAuditHistory(INITIAL_AUDIT_HISTORY);
    localStorage.removeItem('baraka_products');
    localStorage.removeItem('baraka_orders');
    localStorage.removeItem('baraka_couriers');
    localStorage.removeItem('baraka_auto_dispatch');
    localStorage.removeItem('baraka_promo_codes');
    localStorage.removeItem('baraka_settings');
    localStorage.removeItem('baraka_audit_history');
    sounds.playSuccess();
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        wishlist,
        orders,
        promoCodes,
        settings,
        couriers,
        autoDispatchSettings,
        activeCategoryModal,
        activeProductModal,
        isCartOpen,
        isCheckoutOpen,
        isWishlistOpen,
        isOrderSuccessOpen,
        isAdminOpen,
        isAdminAuthenticated,
        isCourierPanelOpen,
        isCourierAuthenticated,
        activeCourierDriverId,
        lastOrder,
        filters,
        soundEnabled,
        deliveryLocation,
        appliedPromo,
        mobileGridCols,
        setMobileGridCols,
        activeTab,
        setActiveTab,
        loyaltyCard,
        branches,
        activeBranch,
        deliveryMode,
        isCatalogOpen,
        isLoyaltyModalOpen,
        isBranchModalOpen,
        setIsCatalogOpen,
        setIsLoyaltyModalOpen,
        setIsBranchModalOpen,
        setActiveBranch,
        setDeliveryMode,
        addLoyaltyPoints,
        setFilters,
        resetFilters,
        openCategoryModal,
        closeCategoryModal,
        openProductModal,
        closeProductModal,
        setIsCartOpen,
        setIsCheckoutOpen,
        setIsWishlistOpen,
        setIsOrderSuccessOpen,
        setIsAdminOpen,
        setIsAdminAuthenticated,
        setIsCourierPanelOpen,
        setIsCourierAuthenticated,
        setActiveCourierDriverId,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        getCartItemQuantity,
        toggleSound,
        setDeliveryLocation,
        applyPromoCode,
        removePromoCode,
        placeOrder,
        autoAssignOrder,
        autoAssignAllPendingOrders,
        assignCourierToOrder,
        unassignCourierFromOrder,
        acceptOrderByCourier,
        rejectOrderByCourier,
        updateCourierStatus,
        addNewCourier,
        deleteCourier,
        updateAutoDispatchSettings,
        advanceDeliveryProgress,
        completeDelivery,
        addProduct,
        updateProduct,
        deleteProduct,
        updateProductStock,
        updateProductCostPrice,
        updateOrderStatus,
        deleteOrder,
        clearAllOrders,
        addPromoCode,
        togglePromoStatus,
        deletePromoCode,
        updateSettings,
        resetAllDataToDefaults,
        isInventoryModalOpen,
        setIsInventoryModalOpen,
        auditHistory,
        applyInventoryAudit,
        deleteAuditRecord,
        financialMetrics,
        cartTotalCount,
        cartSubtotal,
        cartDiscount,
        deliveryFee,
        cartFinalTotal,
        freeDeliveryThreshold,
        remainingForFreeDelivery,
        activeDeliveriesCount
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
