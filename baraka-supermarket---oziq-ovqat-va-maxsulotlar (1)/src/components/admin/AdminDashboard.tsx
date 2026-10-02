import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Ticket, 
  Settings, 
  LogOut, 
  Store, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Eye, 
  ShieldCheck, 
  Lock, 
  ArrowUpRight,
  Filter,
  Layers,
  Sparkles,
  Phone,
  RotateCcw,
  Percent,
  Check,
  X,
  Truck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { Product, OrderDetails, OrderStatus, CategoryId, PromoCode } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { formatCurrency } from '../../utils/formatters';
import { ProductFormModal } from './ProductFormModal';
import { OrderInvoiceModal } from './OrderInvoiceModal';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'inventory' | 'finance' | 'promos' | 'settings';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    orders,
    promoCodes,
    settings,
    isAdminOpen,
    setIsAdminOpen,
    isAdminAuthenticated,
    setIsAdminAuthenticated,
    setIsCourierPanelOpen,
    isInventoryModalOpen,
    setIsInventoryModalOpen,
    auditHistory,
    financialMetrics,
    autoAssignOrder,
    autoAssignAllPendingOrders,
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
    placeOrder
  } = useStore();

  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Lock body scroll when Admin dashboard is open
  useEffect(() => {
    if (isAdminOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isAdminOpen]);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<OrderDetails | null>(null);

  // Products filtering
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // Orders filtering
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // New Promo form state
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState<number | string>(10);
  const [newPromoMinOrder, setNewPromoMinOrder] = useState<number | string>(50000);
  const [newPromoDesc, setNewPromoDesc] = useState('');
  const [promoSuccessMsg, setPromoSuccessMsg] = useState('');

  // Settings form state
  const [tempSettings, setTempSettings] = useState(settings);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState('');

  if (!isAdminOpen) return null;

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === 'admin' || pinInput.trim() === '1234' || pinInput.trim() === 'baraka2026') {
      setIsAdminAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Noto‘g‘ri PIN yoki Parol. (Demo: admin yoki 1234)');
    }
  };

  const handleQuickDemoLogin = () => {
    setIsAdminAuthenticated(true);
    setLoginError('');
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setPinInput('');
  };

  // Metrics calculation
  const totalRevenue = orders.reduce((sum, o) => o.status !== 'Bekor qilindi' ? sum + o.totalAmount : sum, 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Tayyorlanmoqda' || o.status === "Kuryer yo'lda").length;
  const lowStockProductsCount = products.filter(p => p.stock <= 5).length;
  const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  // Filtered products list
  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
    if (stockFilter === 'low' && (p.stock > 5 || p.stock === 0)) return false;
    if (stockFilter === 'out' && p.stock > 0) return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      const match = p.name.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.origin.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Filtered orders list
  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const match = o.orderId.toLowerCase().includes(q) ||
        o.fullName.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Create demo simulation order
  const handleCreateTestOrder = () => {
    const randomProduct1 = products[Math.floor(Math.random() * products.length)];
    const randomProduct2 = products[Math.floor(Math.random() * products.length)];
    const names = ['Sardor Aliyev', 'Madina Karimova', 'Bobur Usmonov', 'Shahzod Mirzayev', 'Zilola Rahimova'];
    const districts = [
      'Samarqand sh., Sug‘diyona 7-mavze, 21-uy',
      'Samarqand sh., Registon ko‘chasi, 4-uy',
      'Samarqand sh., Gagarin ko‘chasi, 15-uy',
      'Samarqand sh., Sattepo mavzesi, 24-uy'
    ];

    placeOrder({
      fullName: names[Math.floor(Math.random() * names.length)],
      phone: `+998 90 ${Math.floor(1000000 + Math.random() * 9000000)}`,
      address: districts[Math.floor(Math.random() * districts.length)],
      landmark: 'Mo‘ljal: Katta yo‘l bo‘yida',
      paymentMethod: ['payme', 'click', 'uzum', 'cash'][Math.floor(Math.random() * 4)] as any,
      timeSlot: 'tezkor',
      comment: 'Tezroq yetkazib bering, iltimos'
    });
  };

  // Add promo code submit
  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;
    addPromoCode({
      code: newPromoCode.trim(),
      discountPercent: Number(newPromoDiscount) || 10,
      minOrderAmount: Number(newPromoMinOrder) || 0,
      active: true,
      description: newPromoDesc.trim() || `${newPromoDiscount}% chegirma promokodi`
    });
    setNewPromoCode('');
    setNewPromoDesc('');
    setPromoSuccessMsg('Yangi promokod muvaffaqiyatli qo‘shildi!');
    setTimeout(() => setPromoSuccessMsg(''), 3000);
  };

  // Save Settings submit
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(tempSettings);
    setSettingsSuccessMsg('Do‘kon sozlamalari muvaffaqiyatli saqlandi!');
    setTimeout(() => setSettingsSuccessMsg(''), 3000);
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50 overflow-hidden bg-[#07070a] text-white flex flex-col font-sans"
      >
        {/* Background ambient lighting */}
      <div className="fixed top-[-100px] right-[-100px] w-[500px] h-[500px] bg-orange-600/10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-emerald-600/10 blur-[150px] pointer-events-none" />

      {/* 1. AUTHENTICATION GATEWAY */}
      {!isAdminAuthenticated ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#0e0e14] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl text-center">
            {/* Exit button */}
            <button
              onClick={() => setIsAdminOpen(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-black mx-auto mb-5 shadow-xl shadow-orange-500/25">
              <Lock className="w-8 h-8 stroke-[2.5]" />
            </div>

            <h2 className="text-2xl font-black uppercase tracking-tight text-white">
              Baraka Admin Boshqaruvi
            </h2>
            <p className="text-xs text-stone-400 mt-1.5 mb-6">
              Supermarket boshqaruv paneliga kirish uchun parolni kiriting
            </p>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Admin Paroli yoki PIN
                </label>
                <input
                  type="password"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  placeholder="Parolni kiriting (masalan: admin)"
                  className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-stone-500 focus:outline-hidden focus:border-orange-400 text-sm font-mono"
                  autoFocus
                />
              </div>

              {loginError && (
                <p className="text-rose-400 text-xs font-semibold">{loginError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-400 text-black font-black text-sm rounded-2xl shadow-xl shadow-orange-500/20 hover:from-orange-400 hover:to-amber-300 transition-all cursor-pointer uppercase tracking-wider"
              >
                Tizimga kirish
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Bosishda Kirish (Tezkor Demo Login)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAdminOpen(false)}
                className="w-full py-2 rounded-xl text-stone-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Mijoz do‘koniga qaytish
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 2. AUTHENTICATED ADMIN DASHBOARD WORKSPACE */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Admin Bar */}
          <header className="px-4 sm:px-8 py-3.5 bg-[#0b0b10] border-b border-white/10 flex items-center justify-between gap-4 shrink-0">
            {/* Left: Brand & Mode Tag */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-black font-black text-lg shadow-md">
                B
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-white uppercase">
                    Baraka Admin
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full">
                    Control Center
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 hidden sm:block">
                  Supermarket mahsulotlari, buyurtmalari va sozlamalari
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Courier Panel Button */}
              <button
                onClick={() => setIsCourierPanelOpen(true)}
                className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-105"
                title="Kuryerlar va Jonli Radar Paneli"
              >
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>Kuryer Paneli</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-stone-950 font-black text-[10px]">
                  Avto
                </span>
              </button>

              {/* Back to Client Store button */}
              <button
                onClick={() => setIsAdminOpen(false)}
                className="px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Mijozlar ko'rinishiga o'tish"
              >
                <Store className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Mijoz do‘koniga o‘tish</span>
              </button>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Chiqish"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Chiqish</span>
              </button>
            </div>
          </header>

          {/* Navigation Tabs Bar */}
          <div className="bg-[#0e0e14] border-b border-white/10 px-4 sm:px-8 py-2 overflow-x-auto scrollbar-none shrink-0 flex items-center gap-2">
            {[
              { id: 'dashboard', label: 'Umumiy Statistika', icon: LayoutDashboard },
              { id: 'finance', label: 'Bankrotlikdan Himoya & Moliya', icon: ShieldCheck, highlight: true },
              { id: 'inventory', label: `Inventarizatsiya & Sklad (${products.length})`, icon: Layers },
              { id: 'products', label: `Mahsulotlar (${products.length})`, icon: Package },
              { id: 'orders', label: `Buyurtmalar (${orders.length})`, icon: ShoppingBag, badge: pendingOrdersCount },
              { id: 'promos', label: `Promokodlar (${promoCodes.length})`, icon: Ticket },
              { id: 'settings', label: 'Do‘kon Sozlamalari', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id as AdminTab)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-black font-black shadow-md'
                      : tab.highlight
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                        : 'bg-white/5 text-stone-400 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {Boolean(tab.badge && tab.badge > 0) && (
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#07070a]">
            {/* ======================================================== */}
            {/* TAB 1: DASHBOARD OVERVIEW */}
            {/* ======================================================== */}
            {currentTab === 'dashboard' && (
              <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
                {/* 4 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Revenue */}
                  <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 relative overflow-hidden group hover:border-orange-500/30 transition-all">
                    <div className="flex items-center justify-between text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">
                      <span>Jami Savdo Aylanmasi</span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {formatCurrency(totalRevenue)}
                    </div>
                    <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
                      <span>✓</span> Barcha yetkazilgan va faol buyurtmalar
                    </p>
                  </div>

                  {/* Total Orders */}
                  <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 relative overflow-hidden group hover:border-orange-500/30 transition-all">
                    <div className="flex items-center justify-between text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">
                      <span>Jami Buyurtmalar</span>
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {totalOrdersCount} ta
                    </div>
                    <p className="text-[11px] text-amber-400 mt-2">
                      {pendingOrdersCount} ta kutilayotgan / jarayondagi
                    </p>
                  </div>

                  {/* Total Catalog Products */}
                  <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 relative overflow-hidden group hover:border-orange-500/30 transition-all">
                    <div className="flex items-center justify-between text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">
                      <span>Faol Mahsulotlar</span>
                      <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                        <Package className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {products.length} ta
                    </div>
                    <p className="text-[11px] text-stone-400 mt-2">
                      {CATEGORIES.length} ta toifada taqsimlangan
                    </p>
                  </div>

                  {/* Low Stock Alerts */}
                  <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 relative overflow-hidden group hover:border-orange-500/30 transition-all">
                    <div className="flex items-center justify-between text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">
                      <span>Kam Qolgan Mahsulotlar</span>
                      <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
                      {lowStockProductsCount} ta
                    </div>
                    <p className="text-[11px] text-rose-400/80 mt-2">
                      Zaxirani to‘ldirish talab etiladi (stock ≤ 5)
                    </p>
                  </div>
                </div>

                {/* Quick Actions Row */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-tight">
                      Tezkor Amallar & Yangilanishlar
                    </h3>
                    <p className="text-xs text-stone-400">
                      Yangi tovar qo‘shish, simulyatsiya buyurtmasi yoki promokod yaratish
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={() => {
                        setProductToEdit(null);
                        setIsProductModalOpen(true);
                      }}
                      className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-400 text-black rounded-2xl text-xs font-black shadow-lg shadow-orange-500/20 hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Yangi Mahsulot</span>
                    </button>

                    <button
                      onClick={handleCreateTestOrder}
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>+ Test Buyurtma</span>
                    </button>

                    <button
                      onClick={autoAssignAllPendingOrders}
                      className="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      title="Kutilayotgan barcha buyurtmalarni eng yaqin bo‘sh kuryerga avtomatik tayinlash"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Avto-Biriktirish</span>
                    </button>

                    <button
                      onClick={clearAllOrders}
                      className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      title="Barcha buyurtmalar va savdo aylanmasini 0 qilish"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Statistikani 0 qilish</span>
                    </button>
                  </div>
                </div>

                {/* Bankruptcy & Safety Overview Card on main dashboard */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900/90 to-emerald-950/40 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xl shrink-0">
                      🛡️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">
                          Avtomatik Bankrotlikdan Himoya Ko‘rsatkichi: {financialMetrics.bankruptcySafetyScore}% ({financialMetrics.bankruptcyStatus})
                        </h4>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Ombordagi tovarlar tan narxi: <span className="text-stone-200 font-mono font-bold">{formatCurrency(financialMetrics.totalInventoryCostValue)}</span> • Kutilayotgan sof marja: <span className="text-emerald-400 font-mono font-bold">+{formatCurrency(financialMetrics.potentialGrossProfit)} ({financialMetrics.grossMarginPercent}%)</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentTab('finance')}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all cursor-pointer shrink-0"
                  >
                    Batafsil Moliya →
                  </button>
                </div>

                {/* Recent Orders & Category Breakdown Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Recent 5 Orders */}
                  <div className="lg:col-span-2 p-6 rounded-3xl bg-white/[0.02] border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-orange-400" />
                        So‘nggi Buyurtmalar
                      </h3>
                      <button
                        onClick={() => setCurrentTab('orders')}
                        className="text-xs text-orange-400 font-bold hover:underline cursor-pointer"
                      >
                        Barchasini ko‘rish ({orders.length}) →
                      </button>
                    </div>

                    {orders.length === 0 ? (
                      <div className="py-10 text-center text-stone-500">
                        <ShoppingBag className="w-9 h-9 mx-auto mb-2 text-stone-600 opacity-50" />
                        <p className="text-xs font-bold text-stone-400">Hozircha hech qanday buyurtma yo‘q (0 ta)</p>
                        <p className="text-[11px] text-stone-500 mt-1">Yangi buyurtmalar kelib tushganda bu yerda avtomatik ko‘rinadi</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {orders.slice(0, 5).map(order => (
                          <div key={order.orderId} className="py-3 flex items-center justify-between gap-3 text-xs">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-orange-400">#{order.orderId}</span>
                                <span className="font-bold text-stone-200 truncate">{order.fullName}</span>
                                <span className="text-[10px] text-stone-500 hidden sm:inline">{order.createdAt}</span>
                              </div>
                              <p className="text-[11px] text-stone-400 truncate mt-0.5">{order.address}</p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="font-mono font-black text-emerald-400">
                                {formatCurrency(order.totalAmount)}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                order.status === 'Tayyorlanmoqda'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : order.status === "Kuryer yo'lda"
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : order.status === 'Yetkazildi'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-rose-500/20 text-rose-400'
                              }`}>
                                {order.status}
                              </span>
                              <button
                                onClick={() => setSelectedOrderForInvoice(order)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 cursor-pointer"
                                title="Tafsilotlar"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Category Distribution */}
                  <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-400" />
                        Kategoriyalar Taqsimoti
                      </h3>

                      <div className="space-y-3">
                        {CATEGORIES.slice(0, 6).map(cat => {
                          const count = products.filter(p => p.categoryId === cat.id).length;
                          const percent = Math.round((count / products.length) * 100);
                          return (
                            <div key={cat.id} className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="flex items-center gap-1.5 text-stone-300">
                                  <span>{cat.icon}</span>
                                  <span>{cat.name}</span>
                                </span>
                                <span className="font-mono text-stone-400">{count} ta ({percent}%)</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/10 text-[11px] text-stone-400 flex items-center justify-between">
                      <span>Jami mahsulotlar:</span>
                      <span className="font-mono font-bold text-white">{products.length} ta</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: PRODUCTS MANAGEMENT */}
            {/* ======================================================== */}
            {currentTab === 'products' && (
              <div className="space-y-5 max-w-7xl mx-auto animate-in fade-in duration-200">
                {/* Top filter and search bar */}
                <div className="p-4 sm:p-6 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex items-center rounded-2xl bg-white/5 border border-white/10 px-3 py-2 text-xs flex-1 sm:w-64">
                      <Search className="w-4 h-4 text-stone-400 mr-2" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={e => setProductSearch(e.target.value)}
                        placeholder="Mahsulot nomi yoki brend izlash..."
                        className="bg-transparent text-white focus:outline-hidden w-full placeholder:text-stone-500"
                      />
                      {productSearch && (
                        <button onClick={() => setProductSearch('')} className="text-stone-400 hover:text-white cursor-pointer ml-1">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Category Filter */}
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value as any)}
                      className="px-3 py-2 rounded-2xl bg-stone-900 border border-white/10 text-white text-xs font-semibold focus:outline-hidden cursor-pointer"
                    >
                      <option value="all">Barcha Bo‘limlar ({products.length})</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>

                    {/* Stock status filter */}
                    <select
                      value={stockFilter}
                      onChange={e => setStockFilter(e.target.value as any)}
                      className="px-3 py-2 rounded-2xl bg-stone-900 border border-white/10 text-white text-xs font-semibold focus:outline-hidden cursor-pointer"
                    >
                      <option value="all">Barcha zaxiralar</option>
                      <option value="low">Kam qolganlar (≤ 5)</option>
                      <option value="out">Tugaganlar (0 ta)</option>
                    </select>
                  </div>

                  {/* Add Product Button */}
                  <button
                    onClick={() => {
                      setProductToEdit(null);
                      setIsProductModalOpen(true);
                    }}
                    className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-400 text-black font-black text-xs rounded-2xl shadow-lg shadow-orange-500/20 hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yangi Mahsulot Qo‘shish</span>
                  </button>
                </div>

                {/* Products Table */}
                <div className="rounded-3xl border border-white/10 overflow-hidden bg-[#0a0a0f]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 border-b border-white/10 text-stone-400 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="p-4">Mahsulot & SKU</th>
                          <th className="p-4">Kategoriya</th>
                          <th className="p-4">Sotish narxi</th>
                          <th className="p-4">Tan narxi & Marja</th>
                          <th className="p-4 text-center">Ombor (Soni)</th>
                          <th className="p-4 text-center">Xususiyatlar</th>
                          <th className="p-4 text-right">Amallar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredProducts.map(product => {
                          const categoryObj = CATEGORIES.find(c => c.id === product.categoryId);
                          const cost = product.costPrice !== undefined ? product.costPrice : Math.round(product.price * 0.72);
                          const profitPerUnit = product.price - cost;
                          const margin = product.price > 0 ? ((profitPerUnit / product.price) * 100).toFixed(1) : '0';
                          const sku = product.sku || `SKU-${product.id.padStart(4, '0')}`;

                          return (
                            <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                              {/* Product Info */}
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-bold text-stone-100 truncate max-w-[200px]">
                                      {product.name}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="text-[9px] font-mono text-orange-400 bg-orange-500/10 px-1 py-0.2 rounded border border-orange-500/20">
                                        {sku}
                                      </span>
                                      <span className="text-[10px] text-stone-400">
                                        {product.weightOrVolume}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="p-4 whitespace-nowrap">
                                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-stone-300 font-medium flex items-center gap-1 w-max">
                                  <span>{categoryObj?.icon}</span>
                                  <span>{categoryObj?.name}</span>
                                </span>
                              </td>

                              {/* Price */}
                              <td className="p-4 whitespace-nowrap">
                                <div className="font-mono font-black text-emerald-400 text-sm">
                                  {formatCurrency(product.price)}
                                </div>
                                {product.oldPrice && (
                                  <div className="font-mono text-[10px] text-stone-500 line-through">
                                    {formatCurrency(product.oldPrice)}
                                  </div>
                                )}
                              </td>

                              {/* Cost Price & Margin */}
                              <td className="p-4 whitespace-nowrap">
                                <div className="font-mono font-bold text-amber-300 text-xs">
                                  {formatCurrency(cost)}
                                </div>
                                <div className="text-[10px] font-mono mt-0.5 flex items-center gap-1">
                                  <span className={profitPerUnit >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                    +{formatCurrency(profitPerUnit)}
                                  </span>
                                  <span className="text-stone-400 font-normal">({margin}%)</span>
                                </div>
                              </td>

                              {/* Stock Controls */}
                              <td className="p-4 whitespace-nowrap text-center">
                                <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1">
                                  <button
                                    onClick={() => updateProductStock(product.id, product.stock - 1)}
                                    className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 text-stone-300 font-bold flex items-center justify-center cursor-pointer text-xs"
                                  >
                                    -
                                  </button>
                                  <span className={`font-mono font-bold px-2 text-xs ${
                                    product.stock <= 5 ? 'text-rose-400' : 'text-stone-200'
                                  }`}>
                                    {product.stock} {product.unit}
                                  </span>
                                  <button
                                    onClick={() => updateProductStock(product.id, product.stock + 1)}
                                    className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 text-stone-300 font-bold flex items-center justify-center cursor-pointer text-xs"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>

                              {/* Badges */}
                              <td className="p-4 whitespace-nowrap text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {product.isHalal && (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                                      Halol
                                    </span>
                                  )}
                                  {product.discountPercent && (
                                    <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                                      -{product.discountPercent}%
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="p-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setProductToEdit(product);
                                      setIsProductModalOpen(true);
                                    }}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-stone-300 hover:text-white transition-colors cursor-pointer"
                                    title="Tahrirlash"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Haqiqatdan ham "${product.name}" mahsulotini o'chirmoqchimisiz?`)) {
                                        deleteProduct(product.id);
                                      }
                                    }}
                                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                                    title="O‘chirish"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {filteredProducts.length === 0 && (
                    <div className="p-12 text-center text-stone-400">
                      Mahsulotlar topilmadi
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: ORDERS MANAGEMENT */}
            {/* ======================================================== */}
            {currentTab === 'orders' && (
              <div className="space-y-5 max-w-7xl mx-auto animate-in fade-in duration-200">
                {/* Orders top filter bar */}
                <div className="p-4 sm:p-6 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {/* Status Tabs */}
                    {(['all', 'Tayyorlanmoqda', "Kuryer yo'lda", 'Yetkazildi', 'Bekor qilindi'] as const).map(st => {
                      const count = st === 'all' ? orders.length : orders.filter(o => o.status === st).length;
                      return (
                        <button
                          key={st}
                          onClick={() => setOrderStatusFilter(st as any)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            orderStatusFilter === st
                              ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-black font-black'
                              : 'bg-white/5 text-stone-400 hover:text-white hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          <span>{st === 'all' ? 'Barcha buyurtmalar' : st}</span>
                          <span className="text-[10px] px-1.5 rounded-full bg-black/30 font-mono font-bold">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => autoAssignAllPendingOrders()}
                      className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-stone-950 text-xs font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/20"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>⚡ Kuryerlarga Avto-Taqsimlash</span>
                    </button>

                    <button
                      onClick={handleCreateTestOrder}
                      className="w-full md:w-auto px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Test Buyurtma</span>
                    </button>
                  </div>
                </div>

                {/* Orders list */}
                <div className="space-y-3">
                  {filteredOrders.map(order => (
                    <div
                      key={order.orderId}
                      className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-4 text-xs overflow-hidden"
                    >
                      {/* Left: Customer info */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-orange-400 text-sm">
                            #{order.orderId}
                          </span>
                          <span className="font-black text-stone-100 text-sm truncate">
                            {order.fullName}
                          </span>
                          <span className="text-[11px] text-stone-400 font-mono">
                            {order.createdAt}
                          </span>
                          {order.courierName && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              <span>{order.courierName} ({order.deliveryProgress || 0}%)</span>
                            </span>
                          )}
                        </div>

                        <div className="text-stone-300 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                          <span className="flex items-center gap-1 font-mono text-amber-400">
                            <Phone className="w-3.5 h-3.5" /> {order.phone}
                          </span>
                          <span className="break-words">
                            📍 {order.address}
                          </span>
                          <span className="text-stone-400 uppercase font-semibold">
                            💳 {order.paymentMethod}
                          </span>
                        </div>

                        {/* Order items brief - wraps cleanly into rows without overflowing */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 max-w-full">
                          <span className="text-stone-400 text-[11px] font-semibold mr-1 shrink-0">
                            Mahsulotlar ({order.items.length} ta):
                          </span>
                          {order.items.map((item, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-stone-300 inline-flex items-center max-w-full truncate"
                            >
                              {item.product.name} × {item.quantity}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right: Sum, Status changer, Actions */}
                      <div className="flex flex-wrap items-center gap-3 xl:justify-end shrink-0 pt-3 xl:pt-0 border-t xl:border-t-0 border-white/5">
                        {order.status === 'Tayyorlanmoqda' && !order.courierId && (
                          <button
                            onClick={() => autoAssignOrder(order.orderId)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                            title="Kuryerga avto-biriktirish"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Avto-Kuryer</span>
                          </button>
                        )}

                        <div className="text-left xl:text-right mr-2">
                          <span className="text-[10px] text-stone-400 block uppercase font-bold">Jami Summa:</span>
                          <span className="text-base font-black font-mono text-emerald-400">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </div>

                        {/* Status select dropdown */}
                        <select
                          value={order.status}
                          onChange={e => updateOrderStatus(order.orderId, e.target.value as OrderStatus)}
                          className={`px-3 py-2 rounded-2xl text-xs font-black uppercase cursor-pointer border ${
                            order.status === 'Tayyorlanmoqda'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : order.status === "Kuryer yo'lda"
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                              : order.status === 'Yetkazildi'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          <option value="Tayyorlanmoqda" className="bg-stone-900 text-white">Tayyorlanmoqda</option>
                          <option value="Kuryer yo'lda" className="bg-stone-900 text-white">Kuryer yo'lda</option>
                          <option value="Yetkazildi" className="bg-stone-900 text-white">Yetkazildi</option>
                          <option value="Bekor qilindi" className="bg-stone-900 text-white">Bekor qilindi</option>
                        </select>

                        {/* Invoice modal button */}
                        <button
                          onClick={() => setSelectedOrderForInvoice(order)}
                          className="px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-stone-200 hover:text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Chekni ko‘rish"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chek</span>
                        </button>

                        {/* Delete order */}
                        <button
                          onClick={() => {
                            if (confirm(`Buyurtma #${order.orderId} ni ro'yxatdan o'chirmoqchimisiz?`)) {
                              deleteOrder(order.orderId);
                            }
                          }}
                          className="p-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                          title="O‘chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredOrders.length === 0 && (
                    <div className="p-12 text-center text-stone-400 bg-white/[0.02] rounded-3xl border border-white/10">
                      Ushbu toifada buyurtmalar mavjud emas
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: BANKRUPTCY & FINANCIAL HEALTH METRICS */}
            {/* ======================================================== */}
            {currentTab === 'finance' && (
              <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
                {/* Bankruptcy Safety Alert Banner */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-[#11192e] to-[#0d1222] border border-white/15 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-lg">
                        🛡️
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                          Avtomatik Moliya va Bankrotlikdan Himoya Tizimi
                        </h2>
                        <p className="text-xs text-stone-400">
                          Har bir tovarning kelish narxi (tan narxi), marjasi, kutilayotgan sof foydasi va kamomad xatarlari nazorati
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-center min-w-[200px] shrink-0">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Xavfsizlik Ko‘rsatkichi</span>
                    <span className="text-3xl font-black text-emerald-400 font-mono">
                      {financialMetrics.bankruptcySafetyScore}%
                    </span>
                    <span className="text-[11px] font-bold text-emerald-300 block mt-1">
                      {financialMetrics.bankruptcyStatus}
                    </span>
                  </div>
                </div>

                {/* 4 Financial Big Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Sklad Tan Narxi */}
                  <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10">
                    <span className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider block">Sklad Umumiy Tan Narxi</span>
                    <div className="text-2xl font-black text-white font-mono mt-2">
                      {formatCurrency(financialMetrics.totalInventoryCostValue)}
                    </div>
                    <span className="text-[10px] text-stone-500 mt-2 block">
                      Ombordagi barcha tovarlarga tikilgan sof mablag‘
                    </span>
                  </div>

                  {/* Sklad Sotuv Qiymati */}
                  <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10">
                    <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider block">Sotuvdagi Jami Qiymati</span>
                    <div className="text-2xl font-black text-amber-400 font-mono mt-2">
                      {formatCurrency(financialMetrics.totalInventoryRetailValue)}
                    </div>
                    <span className="text-[10px] text-stone-500 mt-2 block">
                      Barcha mahsulot to‘liq sotilgandagi tushum
                    </span>
                  </div>

                  {/* Kutilayotgan Sof Yalpi Foyda */}
                  <div className="p-5 rounded-3xl bg-white/[0.03] border border-emerald-500/20">
                    <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider block">Kutilayotgan Sof Marja (Foyda)</span>
                    <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
                      +{formatCurrency(financialMetrics.potentialGrossProfit)}
                    </div>
                    <span className="text-[10px] text-emerald-400/80 mt-2 block font-mono font-bold">
                      O‘rtacha rentabellik: +{financialMetrics.grossMarginPercent}%
                    </span>
                  </div>

                  {/* Kamomad va Xavf */}
                  <div className="p-5 rounded-3xl bg-white/[0.03] border border-rose-500/20">
                    <span className="text-[11px] text-rose-400 font-semibold uppercase tracking-wider block">Aniqlangan Kamomad Zarari</span>
                    <div className="text-2xl font-black text-rose-400 font-mono mt-2">
                      {financialMetrics.lossRiskValue > 0 ? `-${formatCurrency(financialMetrics.lossRiskValue)}` : "0 so'm"}
                    </div>
                    <span className="text-[10px] text-rose-400/80 mt-2 block">
                      Inventarizatsiya orqali aniqlangan kamomad
                    </span>
                  </div>
                </div>

                {/* Audit & Health Actions */}
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black text-white">Ombor Qoldig‘ini To‘liq Sanash (Inventarizatsiya)</h3>
                    <p className="text-xs text-stone-400">
                      Bazada bor soni bilan tokchadagi haqiqiy sonini solishtirish va qoldiqlarni avtomatik to‘g‘rilash
                    </p>
                  </div>
                  <button
                    onClick={() => setIsInventoryModalOpen(true)}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 text-black font-black text-xs uppercase tracking-wider hover:scale-105 transition-all cursor-pointer shadow-lg shadow-orange-500/20 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Qoldiqni Sanashni Boshlash</span>
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: INVENTORY & STOCK AUDITING */}
            {/* ======================================================== */}
            {currentTab === 'inventory' && (
              <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
                {/* Inventory Top Hero */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-500/10 via-white/[0.02] to-transparent border border-orange-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                      <Layers className="w-5 h-5 text-orange-400" />
                      <span>Ombor va Mahsulotlar Inventarizatsiyasi</span>
                    </h2>
                    <p className="text-xs text-stone-400 mt-1">
                      Do‘kondagi tovarlar qoldig‘i, tan narxi, SKU artikuli va kutilayotgan daromad balansi
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsInventoryModalOpen(true)}
                      className="px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-wider hover:scale-105 transition-all cursor-pointer shadow-lg shadow-orange-500/20 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Inventarizatsiya Oynasini Ochish</span>
                    </button>
                  </div>
                </div>

                {/* Audit Sessions History in Tab */}
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>So‘nggi Sanash va O‘zgarishlar Tarixi ({auditHistory.length} ta sessiya)</span>
                  </h3>

                  {auditHistory.length === 0 ? (
                    <div className="py-12 text-center text-stone-500 text-xs">
                      Hali inventarizatsiya o‘tkazilmagan. Yuqoridagi tugma orqali birinchi sanashni boshlang.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {auditHistory.map(audit => (
                        <div key={audit.id} className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{audit.branchName}</span>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                                {audit.id}
                              </span>
                            </div>
                            <span className="text-[11px] text-stone-400 block mt-0.5">
                              Sanalgan vaqt: {audit.createdAt} • Auditor: {audit.auditorName}
                            </span>
                            {audit.note && (
                              <p className="text-[11px] text-stone-300 italic mt-1">"{audit.note}"</p>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-left sm:text-right font-mono">
                              <span className="text-[10px] text-stone-500 block">Farq balansi:</span>
                              <span className={`font-black text-xs ${audit.totalFinancialDiscrepancy < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {audit.totalFinancialDiscrepancy < 0 
                                  ? `-${formatCurrency(Math.abs(audit.totalFinancialDiscrepancy))}` 
                                  : `+${formatCurrency(audit.totalFinancialDiscrepancy)}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 4: PROMO CODES & DISCOUNTS */}
            {/* ======================================================== */}
            {currentTab === 'promos' && (
              <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
                {/* Promo creation box */}
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10">
                  <h3 className="text-base font-black text-white uppercase tracking-tight mb-2 flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-orange-400" />
                    Yangi Promokod Yaratish
                  </h3>
                  <p className="text-xs text-stone-400 mb-5">
                    Mijozlarga chegirma beruvchi yangi promokodlarni kiriting
                  </p>

                  {promoSuccessMsg && (
                    <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>{promoSuccessMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleAddPromo} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <label className="block text-stone-300 font-bold uppercase tracking-wider mb-1.5">
                        Promokod Nomi *
                      </label>
                      <input
                        type="text"
                        value={newPromoCode}
                        onChange={e => setNewPromoCode(e.target.value.toUpperCase())}
                        placeholder="Masalan: BAHOR20"
                        className="w-full px-4 py-2.5 rounded-2xl border border-white/10 bg-white/5 text-white font-mono font-bold focus:outline-hidden focus:border-orange-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-stone-300 font-bold uppercase tracking-wider mb-1.5">
                        Chegirma Foizi (%) *
                      </label>
                      <input
                        type="number"
                        value={newPromoDiscount}
                        onChange={e => setNewPromoDiscount(e.target.value)}
                        placeholder="15"
                        min="1"
                        max="90"
                        className="w-full px-4 py-2.5 rounded-2xl border border-white/10 bg-white/5 text-white font-mono focus:outline-hidden focus:border-orange-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-stone-300 font-bold uppercase tracking-wider mb-1.5">
                        Minimal Xarid Summasi (so‘m)
                      </label>
                      <input
                        type="number"
                        value={newPromoMinOrder}
                        onChange={e => setNewPromoMinOrder(e.target.value)}
                        placeholder="100000"
                        className="w-full px-4 py-2.5 rounded-2xl border border-white/10 bg-white/5 text-white font-mono focus:outline-hidden focus:border-orange-400"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-300 font-bold uppercase tracking-wider mb-1.5">
                        Tavsif / Izoh
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newPromoDesc}
                          onChange={e => setNewPromoDesc(e.target.value)}
                          placeholder="Bahorgi maxsus chegirma"
                          className="flex-1 px-4 py-2.5 rounded-2xl border border-white/10 bg-white/5 text-white focus:outline-hidden focus:border-orange-400"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-400 text-black font-black rounded-2xl hover:scale-105 transition-all cursor-pointer shrink-0 uppercase tracking-wider"
                        >
                          Qo‘shish
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Active Promo codes Table */}
                <div className="rounded-3xl border border-white/10 overflow-hidden bg-[#0a0a0f]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 border-b border-white/10 text-stone-400 uppercase font-bold text-[10px] tracking-wider">
                      <tr>
                        <th className="p-4">Promokod</th>
                        <th className="p-4">Chegirma</th>
                        <th className="p-4">Min. Xarid</th>
                        <th className="p-4">Foydalanilgan</th>
                        <th className="p-4 text-center">Holati</th>
                        <th className="p-4 text-right">O‘chirish</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {promoCodes.map(promo => (
                        <tr key={promo.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-mono font-black text-orange-400 text-sm">
                            {promo.code}
                            {promo.description && (
                              <p className="text-[11px] font-sans font-normal text-stone-400 mt-0.5">
                                {promo.description}
                              </p>
                            )}
                          </td>
                          <td className="p-4 font-black font-mono text-emerald-400 text-sm">
                            {promo.discountPercent}%
                          </td>
                          <td className="p-4 font-mono text-stone-300">
                            {promo.minOrderAmount > 0 ? formatCurrency(promo.minOrderAmount) : "Cheklovsiz"}
                          </td>
                          <td className="p-4 font-mono text-stone-400">
                            {promo.usageCount} marta
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => togglePromoStatus(promo.id)}
                              className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                                promo.active
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-stone-800 text-stone-500 border border-stone-700'
                              }`}
                            >
                              {promo.active ? 'Faol' : 'Nofaol'}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => deletePromoCode(promo.id)}
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 5: STORE SETTINGS */}
            {/* ======================================================== */}
            {currentTab === 'settings' && (
              <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
                <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10">
                  <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-orange-400" />
                    Do‘kon Asosiy Sozlamalari
                  </h3>
                  <p className="text-xs text-stone-400 mb-6">
                    Ish vaqti, ishonch telefoni va yetkazib berish narxlarini boshqaring
                  </p>

                  {settingsSuccessMsg && (
                    <div className="mb-5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>{settingsSuccessMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveSettings} className="space-y-4 text-xs sm:text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                          Do‘kon Nomi
                        </label>
                        <input
                          type="text"
                          value={tempSettings.storeName}
                          onChange={e => setTempSettings({ ...tempSettings, storeName: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-2xl border border-white/10 bg-white/5 text-white focus:outline-hidden focus:border-orange-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                          Ishonch Telefoni (Hotline)
                        </label>
                        <input
                          type="text"
                          value={tempSettings.hotline}
                          onChange={e => setTempSettings({ ...tempSettings, hotline: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-2xl border border-white/10 bg-white/5 text-white font-mono focus:outline-hidden focus:border-orange-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                          Ish Vaqti
                        </label>
                        <input
                          type="text"
                          value={tempSettings.workingHours}
                          onChange={e => setTempSettings({ ...tempSettings, workingHours: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-2xl border border-white/10 bg-white/5 text-white focus:outline-hidden focus:border-orange-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                          Do‘kon Manzili
                        </label>
                        <input
                          type="text"
                          value={tempSettings.address}
                          onChange={e => setTempSettings({ ...tempSettings, address: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-2xl border border-white/10 bg-white/5 text-white focus:outline-hidden focus:border-orange-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                          Bepul Yetkazish Chegarasi (so‘m)
                        </label>
                        <input
                          type="number"
                          value={tempSettings.freeDeliveryThreshold}
                          onChange={e => setTempSettings({ ...tempSettings, freeDeliveryThreshold: Number(e.target.value) })}
                          className="w-full px-4 py-2.5 rounded-2xl border border-white/10 bg-white/5 text-white font-mono focus:outline-hidden focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                          Standart Yetkazish Narxi (so‘m)
                        </label>
                        <input
                          type="number"
                          value={tempSettings.standardDeliveryFee}
                          onChange={e => setTempSettings({ ...tempSettings, standardDeliveryFee: Number(e.target.value) })}
                          className="w-full px-4 py-2.5 rounded-2xl border border-white/10 bg-white/5 text-white font-mono focus:outline-hidden focus:border-orange-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                        Tepada chiquvchi e’lon banneri matni
                      </label>
                      <input
                        type="text"
                        value={tempSettings.announcementBanner}
                        onChange={e => setTempSettings({ ...tempSettings, announcementBanner: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl border border-white/10 bg-white/5 text-white focus:outline-hidden focus:border-orange-400 text-xs"
                      />
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-end">
                      <button
                        type="submit"
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 text-black font-black text-xs shadow-lg shadow-orange-500/20 hover:scale-105 transition-all cursor-pointer uppercase tracking-wider"
                      >
                        Sozlamalarni Saqlash
                      </button>
                    </div>
                  </form>
                </div>

                {/* Reset Data card */}
                <div className="p-6 rounded-3xl bg-rose-500/[0.03] border border-rose-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-black text-rose-400 uppercase tracking-tight flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Ma’lumotlarni Dastlabki Holatga Qaytarish
                    </h4>
                    <p className="text-xs text-stone-400 mt-1">
                      Barcha qo‘shilgan mahsulotlar, test buyurtmalar va promokodlarni asl holatiga tiklaydi.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Rostdan ham barcha ma\'lumotlarni asl holatiga qaytarmoqchimisiz?')) {
                        resetAllDataToDefaults();
                      }
                    }}
                    className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                  >
                    Asl holatga qaytarish
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Admin Modals */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
      />

      <OrderInvoiceModal
        isOpen={Boolean(selectedOrderForInvoice)}
        onClose={() => setSelectedOrderForInvoice(null)}
        order={selectedOrderForInvoice}
        onStatusChange={(orderId, st) => {
          updateOrderStatus(orderId, st);
          if (selectedOrderForInvoice) {
            setSelectedOrderForInvoice({ ...selectedOrderForInvoice, status: st });
          }
        }}
      />
      </motion.div>
    </AnimatePresence>
  );
};
