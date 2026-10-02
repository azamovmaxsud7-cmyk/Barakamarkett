import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Truck, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Play, 
  Zap, 
  Plus, 
  Trash2, 
  Navigation, 
  Smartphone, 
  Compass, 
  Check, 
  Layers, 
  Gauge, 
  Battery, 
  FastForward, 
  UserCheck, 
  Volume2, 
  VolumeX, 
  Lock, 
  CheckCheck, 
  XCircle, 
  AlertCircle, 
  Banknote, 
  CreditCard, 
  MessageSquare, 
  ShoppingBag, 
  ArrowRight,
  ExternalLink,
  MoreVertical,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { Courier, CourierVehicleType, OrderDetails } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { CourierPinLock } from './CourierPinLock';

type TabType = 'map' | 'orders' | 'couriers' | 'driver_app' | 'settings';

export const CourierPanelModal: React.FC = () => {
  const {
    isCourierPanelOpen,
    setIsCourierPanelOpen,
    isCourierAuthenticated,
    setIsCourierAuthenticated,
    orders,
    couriers,
    autoDispatchSettings,
    updateAutoDispatchSettings,
    autoAssignOrder,
    autoAssignAllPendingOrders,
    assignCourierToOrder,
    unassignCourierFromOrder,
    acceptOrderByCourier,
    rejectOrderByCourier,
    updateCourierStatus,
    addNewCourier,
    deleteCourier,
    advanceDeliveryProgress,
    completeDelivery,
    activeCourierDriverId,
    setActiveCourierDriverId,
    activeDeliveriesCount,
    soundEnabled,
    toggleSound,
    placeOrder
  } = useStore();

  const [activeTab, setActiveTab] = useState<TabType>('driver_app');
  const [selectedCourierOnMap, setSelectedCourierOnMap] = useState<Courier | null>(null);
  const [isAddCourierOpen, setIsAddCourierOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    if (isMoreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreMenuOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isCourierPanelOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isCourierPanelOpen]);

  // New courier form state
  const [newCourierName, setNewCourierName] = useState('');
  const [newCourierPhone, setNewCourierPhone] = useState('+998 9');
  const [newCourierVehicleType, setNewCourierVehicleType] = useState<CourierVehicleType>('motor');
  const [newCourierVehicleName, setNewCourierVehicleName] = useState('Yamaha Skuter');
  const [newCourierPlate, setNewCourierPlate] = useState('30 123 SAM');
  const [newCourierAvatar, setNewCourierAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80');
  const [newCourierLocation, setNewCourierLocation] = useState('Samarqand sh., Markaz');

  if (!isCourierPanelOpen) return null;

  // 1. PIN PROTECTION (Code: 0254)
  if (!isCourierAuthenticated) {
    return (
      <CourierPinLock
        onSuccess={() => setIsCourierAuthenticated(true)}
        onClose={() => setIsCourierPanelOpen(false)}
      />
    );
  }

  const onlineCouriers = couriers.filter(c => c.status === 'online');
  const busyCouriers = couriers.filter(c => c.status === 'busy');
  const pendingOrders = orders.filter(o => o.status === 'Tayyorlanmoqda');
  const onTheRoadOrders = orders.filter(o => o.status === "Kuryer yo'lda");
  const completedOrders = orders.filter(o => o.status === 'Yetkazildi');

  // Selected driver for Mobile View simulation
  const currentDriver = couriers.find(c => c.id === activeCourierDriverId) || couriers.find(c => c.status === 'busy') || couriers[0];
  
  // Find order associated with the current driver (either assigned / on the road)
  const driverAssignedOrder = orders.find(o => 
    (o.courierId === currentDriver?.id || o.orderId === currentDriver?.currentOrderId) &&
    (o.status === "Kuryer yo'lda" || o.status === 'Tayyorlanmoqda')
  );

  const handleCreateTestOrder = (paymentType: 'cash' | 'click' | 'payme' = 'cash') => {
    const samarDistricts = [
      'Samarqand sh., Sug‘diyona mavzesi, 12-uy, 45-xonadon',
      'Samarqand sh., Registon ko‘chasi 7-uy',
      'Samarqand sh., Gagarin ko‘chasi 45-uy, 14-xonadon',
      'Samarqand sh., Siyob tumani, Dahbed ko‘chasi 19-uy',
      'Samarqand sh., Sattepo mavzesi, 8-uy, 32-xonadon'
    ];
    const randomDist = samarDistricts[Math.floor(Math.random() * samarDistricts.length)];
    const names = ['Javohir Toshpulatov', 'Malika Karimova', 'Farhod Yusupov', 'Shoira Alimova', 'Azizbek Rahimov'];
    const randomName = names[Math.floor(Math.random() * names.length)];

    placeOrder({
      fullName: randomName,
      phone: `+998 90 ${Math.floor(1000000 + Math.random() * 9000000)}`,
      address: randomDist,
      landmark: 'Mo‘ljal: Registon maydoni yaqinida',
      paymentMethod: paymentType,
      timeSlot: 'tezkor',
      comment: paymentType === 'cash' ? 'Domofon: 45, 200 mingdan qaytim kerak' : 'Eshik tagiga qoldiring'
    });
  };

  const handleAddNewCourierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourierName.trim()) return;

    addNewCourier({
      name: newCourierName,
      phone: newCourierPhone,
      vehicleType: newCourierVehicleType,
      vehicleName: newCourierVehicleName,
      vehiclePlate: newCourierPlate,
      avatar: newCourierAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      status: 'online',
      rating: 5.0,
      currentLocationName: newCourierLocation,
      batteryOrFuel: 100
    });

    setIsAddCourierOpen(false);
    setNewCourierName('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-[#07080b] sm:bg-black/95 backdrop-blur-2xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-[#0b0c10] border-0 sm:border sm:border-white/10 rounded-none sm:rounded-3xl w-full h-full sm:h-[92vh] sm:max-w-6xl flex flex-col shadow-2xl overflow-hidden relative text-stone-200"
        >
        
        {/* TOP HEADER */}
        <div className="px-3 sm:px-5 py-3 sm:py-3.5 bg-gradient-to-r from-stone-900 via-[#111319] to-stone-900 border-b border-white/10 flex items-center justify-between gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-stone-950 shadow-lg shadow-emerald-500/20 font-black shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-lg font-black text-white tracking-tight uppercase truncate">
                  Kuryer Tizimi
                </h2>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Live
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hidden md:inline-flex items-center gap-1.5">
                  {activeTab === 'driver_app' && '🛵 Kuryer Mobil Ilovasi'}
                  {activeTab === 'orders' && `📦 Buyurtmalar (${pendingOrders.length + onTheRoadOrders.length})`}
                  {activeTab === 'map' && '🧭 Jonli Radar'}
                  {activeTab === 'couriers' && `👥 Kuryerlar (${couriers.length})`}
                  {activeTab === 'settings' && '⚙️ Avto-Sozlamalar'}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block truncate">
                Zakasni qabul qilish, manzil marshruti, tovarlar va naqd pul hisobi
              </p>
            </div>
          </div>

          {/* 3 ta nuqta (More Menu) + Close Modal (X) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative" ref={moreMenuRef}>
            {/* 3 DOTS BUTTON */}
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              title="Kuryer paneli sozlamalari va amallari"
              className={`p-2 sm:px-3 sm:py-2 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                isMoreMenuOpen
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 ring-2 ring-emerald-500/30'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-stone-300 hover:text-white'
              }`}
            >
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs font-bold hidden sm:inline">Menyu</span>
            </button>

            {/* Close modal */}
            <button
              onClick={() => setIsCourierPanelOpen(false)}
              className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-stone-300 hover:text-rose-400 transition-colors cursor-pointer"
              title="Yopish"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* 3-DOTS DROPDOWN POPUP MENU */}
            {isMoreMenuOpen && (
              <div 
                className="fixed left-3 right-3 top-16 sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:absolute z-50 w-auto sm:w-96 max-w-sm max-h-[80vh] overflow-y-auto overscroll-contain rounded-3xl bg-[#0e1017] sm:bg-[#0e1017]/98 border border-white/15 shadow-2xl shadow-black/95 backdrop-blur-2xl p-4 text-stone-200 animate-in fade-in zoom-in-95 duration-100 space-y-3 divide-y divide-white/10 select-none"
                style={{ scrollbarWidth: 'thin' }}
              >
                
                {/* 1. TEZKOR SOZLAMALAR & QULFLASH */}
                <div className="space-y-2 pt-0.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-stone-400 uppercase tracking-wider px-1">
                    <span>Boshqaruv & Sozlamalar</span>
                    <span className="text-[10px] text-emerald-400 font-mono">PIN: 0254</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {/* Qulflash */}
                    <button
                      onClick={() => {
                        setIsCourierAuthenticated(false);
                        setIsMoreMenuOpen(false);
                      }}
                      className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/30 text-xs font-bold text-stone-300 hover:text-rose-300 transition-all cursor-pointer"
                    >
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span>Qulflash</span>
                    </button>

                    {/* Avto Taqsimlash Toggle */}
                    <button
                      onClick={() => updateAutoDispatchSettings({ autoAssignEnabled: !autoDispatchSettings.autoAssignEnabled })}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        autoDispatchSettings.autoAssignEnabled
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                          : 'bg-white/5 border-white/10 text-stone-400 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Zap className={`w-3.5 h-3.5 ${autoDispatchSettings.autoAssignEnabled ? 'text-emerald-400' : 'text-stone-500'}`} />
                        <span>Avto:</span>
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-black ${
                        autoDispatchSettings.autoAssignEnabled ? 'bg-emerald-500/30 text-emerald-300' : 'bg-white/10 text-stone-400'
                      }`}>
                        {autoDispatchSettings.autoAssignEnabled ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  </div>

                  {/* Ovozli bildirishnoma Switch */}
                  <button
                    onClick={toggleSound}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-stone-300 hover:text-white transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
                      <span>Ovozli signallar</span>
                    </span>
                    <span className={`text-[11px] font-bold ${soundEnabled ? 'text-emerald-400' : 'text-stone-500'}`}>
                      {soundEnabled ? 'Yoqilgan' : "O'chirilgan"}
                    </span>
                  </button>
                </div>

                {/* 2. JONLI KO'RSATKICHLAR (METRICS) */}
                <div className="pt-3 space-y-2">
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-1">
                    Jonli Statistikalar
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                      <span className="text-stone-400 text-[11px]">Onlayn:</span>
                      <span className="font-bold text-white ml-auto">{onlineCouriers.length} ta</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
                      <span className="text-stone-400 text-[11px]">Yo‘lda:</span>
                      <span className="font-bold text-amber-400 ml-auto">{onTheRoadOrders.length} ta</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
                      <span className="text-stone-400 text-[11px]">Kutilmoqda:</span>
                      <span className="font-bold text-blue-400 ml-auto">{pendingOrders.length} ta</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0"></span>
                      <span className="text-stone-400 text-[11px]">Yetkazildi:</span>
                      <span className="font-bold text-emerald-400 ml-auto">{completedOrders.length} ta</span>
                    </div>
                  </div>
                </div>

                {/* 3. TEZKOR TEST BUYURTMALARI */}
                <div className="pt-3 space-y-2">
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-1">
                    Tezkor Buyurtma Yaratish
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        handleCreateTestOrder('cash');
                        setIsMoreMenuOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Naqd pul zakasi</span>
                    </button>
                    <button
                      onClick={() => {
                        handleCreateTestOrder('click');
                        setIsMoreMenuOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-xs font-bold text-blue-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Onlayn zakas</span>
                    </button>
                  </div>
                </div>

                {/* 4. BO'LIMLARGA O'TISH (TABS) */}
                <div className="pt-3 space-y-1.5">
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-1">
                    Barcha Bo‘limlar
                  </div>
                  <div className="space-y-1">
                    {[
                      { id: 'driver_app', label: '🛵 Kuryer Mobil Ilovasi', icon: Smartphone, badge: driverAssignedOrder && !driverAssignedOrder.isAcceptedByCourier ? '1' : null },
                      { id: 'orders', label: '📦 Buyurtmalar & Taqsimot', icon: Layers, badge: pendingOrders.length > 0 ? `${pendingOrders.length}` : null },
                      { id: 'map', label: '🧭 Samarqand Jonli Radari', icon: Compass },
                      { id: 'couriers', label: `👥 Kuryerlar Floti (${couriers.length})`, icon: UserCheck },
                      { id: 'settings', label: '⚙️ Avto-Dispetcher Sozlamalari', icon: Gauge },
                    ].map(tab => {
                      const Icon = tab.icon;
                      const isSelected = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id as TabType);
                            setIsMoreMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                              : 'text-stone-300 hover:bg-white/5 hover:text-white border border-transparent'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{tab.label}</span>
                          </span>
                          {tab.badge && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold animate-pulse">
                              {tab.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* TAB CONTENT AREA */}
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto bg-[#0e1017]">
          
          {/* ========================================================================= */}
          {/* 1. TAB: DRIVER MOBILE APP (PRODUCTION READY DRIVER INTERFACE)              */}
          {/* ========================================================================= */}
          {activeTab === 'driver_app' && (
            <div className="max-w-2xl mx-auto space-y-4">
              
              {/* Driver Switcher Bar */}
              <div className="flex items-center justify-between bg-white/[0.03] p-3 rounded-2xl border border-white/10 text-xs">
                <span className="text-stone-400 font-medium">Faol kuryer:</span>
                <select
                  value={currentDriver?.id}
                  onChange={e => setActiveCourierDriverId(e.target.value)}
                  className="bg-[#141722] text-emerald-400 font-bold border border-white/10 rounded-xl px-3 py-1.5 focus:outline-hidden cursor-pointer"
                >
                  {couriers.map(c => (
                    <option key={c.id} value={c.id} className="text-white">
                      {c.name} ({c.vehicleName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Main Driver Panel Container */}
              <div className="rounded-3xl bg-[#10131c] border border-white/10 shadow-2xl p-4 sm:p-6 space-y-4">
                
                {/* Driver Profile Bar */}
                <div className="flex items-center justify-between bg-white/[0.03] p-3.5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentDriver?.avatar}
                      alt={currentDriver?.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-emerald-500/30 ring-2 ring-emerald-500/20 shadow-md"
                    />
                    <div>
                      <h4 className="font-black text-white text-base">{currentDriver?.name}</h4>
                      <p className="text-xs text-stone-400 flex items-center gap-1.5 mt-0.5">
                        <span>{currentDriver?.vehicleName}</span>
                        <span className="font-mono text-amber-400 font-bold">({currentDriver?.vehiclePlate})</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Bugungi Hamyon</span>
                    <span className="font-mono font-black text-emerald-400 text-base sm:text-lg">
                      {formatCurrency(currentDriver?.earningsToday || 0)}
                    </span>
                  </div>
                </div>

                {/* ============================================================= */}
                {/* CASE 1: ORDER IS ASSIGNED BUT NOT YET ACCEPTED (INCOMING ALERT) */}
                {/* USER REQUIREMENT: 🟢 Yashil "Qabul qilish" + 🔴 Qizil "Bekor qilish" */}
                {/* ============================================================= */}
                {driverAssignedOrder && !driverAssignedOrder.isAcceptedByCourier && (
                  <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-amber-500/20 via-orange-500/10 to-transparent border-2 border-orange-500/50 shadow-2xl shadow-orange-500/20 space-y-4 animate-in zoom-in-95 duration-300">
                    
                    {/* Ringing / Urgency Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3.5 w-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500"></span>
                        </span>
                        <span className="text-xs font-black text-orange-300 uppercase tracking-wide animate-pulse">
                          ⚡ Yangi Zakas Kelib Tushdi!
                        </span>
                      </div>
                      <span className="font-mono font-black text-orange-400 text-xs px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30">
                        #{driverAssignedOrder.orderId}
                      </span>
                    </div>

                    {/* Quick Preview Information */}
                    <div className="space-y-2 bg-black/40 p-3.5 rounded-2xl border border-white/10 text-xs">
                      <div className="flex items-start gap-2 text-stone-200">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-white">{driverAssignedOrder.address}</p>
                          {driverAssignedOrder.landmark && (
                            <p className="text-stone-400 text-[11px]">{driverAssignedOrder.landmark}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <span className="text-stone-400">Tovarlar soni:</span>
                        <span className="font-bold text-white">{driverAssignedOrder.items.length} xil mahsulot</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">To‘lov turi:</span>
                        <span className={`font-bold uppercase ${
                          driverAssignedOrder.paymentMethod === 'cash' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {driverAssignedOrder.paymentMethod === 'cash' ? '💵 Naqd pul' : `💳 ${driverAssignedOrder.paymentMethod.toUpperCase()}`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Jami summa:</span>
                        <span className="font-mono font-black text-emerald-400 text-base">
                          {formatCurrency(driverAssignedOrder.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* 🟢 Yashil "Zakasni qabul qilish" va 🔴 Qizil "Zakasni bekor qilish" TUGMALARI */}
                    <div className="space-y-2.5 pt-1">
                      {/* GREEN ACCEPT BUTTON */}
                      <button
                        onClick={() => acceptOrderByCourier(driverAssignedOrder.orderId)}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 hover:from-emerald-400 hover:to-green-400 text-stone-950 font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer ring-4 ring-emerald-500/30"
                      >
                        <CheckCheck className="w-6 h-6" />
                        <span>ZAKASNI QABUL QILISH</span>
                      </button>

                      {/* RED REJECT BUTTON */}
                      <button
                        onClick={() => rejectOrderByCourier(driverAssignedOrder.orderId)}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer border border-rose-500/50"
                      >
                        <XCircle className="w-5 h-5" />
                        <span>ZAKASNI BEKOR QILISH</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ============================================================= */}
                {/* CASE 2: ORDER IS ACCEPTED -> FULL DETAILED DASHBOARD           */}
                {/* USER REQUIREMENT: Mijoz, Manzil, Tovarlar, Naqd summa          */}
                {/* ============================================================= */}
                {driverAssignedOrder && driverAssignedOrder.isAcceptedByCourier && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    
                    {/* Header Banner */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                        <span className="text-xs font-black text-emerald-300 uppercase">
                          Buyurtma qabul qilindi • Yo‘ldasiz
                        </span>
                      </div>
                      <span className="font-mono font-bold text-white text-xs">
                        #{driverAssignedOrder.orderId}
                      </span>
                    </div>

                    {/* 1. 👤 KIMGA OBORISH KERAK (Mijoz ma'lumotlari) */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase text-stone-400 tracking-wider">
                          👤 Kimga oborish kerak
                        </span>
                        <span className="text-[11px] font-bold text-amber-400">
                          {driverAssignedOrder.timeSlot === 'tezkor' ? '⚡ Tezkor yetkazish' : driverAssignedOrder.timeSlot}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-black text-white text-sm">{driverAssignedOrder.fullName}</h4>
                          <p className="font-mono text-xs text-stone-300 mt-0.5">{driverAssignedOrder.phone}</p>
                        </div>

                        {/* Direct Call and Chat Buttons */}
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${driverAssignedOrder.phone.replace(/\D/g, '')}`}
                            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/30 transition-transform active:scale-95"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Qo‘ng‘iroq</span>
                          </a>

                          <a
                            href={`sms:${driverAssignedOrder.phone.replace(/\D/g, '')}`}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10 transition-colors"
                            title="SMS yozish"
                          >
                            <MessageSquare className="w-4 h-4 text-blue-400" />
                          </a>
                        </div>
                      </div>

                      {/* Customer Note / Comment */}
                      {driverAssignedOrder.comment && (
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-amber-300 flex items-start gap-2">
                          <span className="text-amber-400">💬</span>
                          <span><strong>Mijoz izohi:</strong> {driverAssignedOrder.comment}</span>
                        </div>
                      )}
                    </div>

                    {/* 2. 📍 QAYERGA OBORISH KERAK (Yetkazish manzili va Marshrut) */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase text-stone-400 tracking-wider">
                          📍 Qayerga oborish kerak
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold">Samarqand</span>
                      </div>

                      <div className="space-y-1">
                        <p className="font-black text-white text-sm leading-snug">
                          {driverAssignedOrder.address}
                        </p>
                        {driverAssignedOrder.landmark && (
                          <p className="text-xs text-stone-400 flex items-center gap-1">
                            <span className="text-emerald-400">•</span>
                            <span>Mo‘ljal: {driverAssignedOrder.landmark}</span>
                          </p>
                        )}
                      </div>

                      {/* Map Navigation Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <a
                          href={`https://yandex.com/maps/?text=${encodeURIComponent(driverAssignedOrder.address)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2.5 px-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Yandex Xarita</span>
                        </a>

                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(driverAssignedOrder.address)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Google Xarita</span>
                        </a>
                      </div>
                    </div>

                    {/* 3. 🛍️ QANAQA TOVAR OBORILMOQDA (Tovarlar to'liq ro'yxati) */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase text-stone-400 tracking-wider">
                          🛍️ Qanaqa tovar oborilmoqda ({driverAssignedOrder.items.length} xil)
                        </span>
                        <span className="text-xs text-stone-400">
                          Jami: {driverAssignedOrder.items.reduce((acc, it) => acc + it.quantity, 0)} dona
                        </span>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                        {driverAssignedOrder.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5 gap-3"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-white text-xs truncate">{item.product.name}</p>
                                <p className="text-[10px] text-stone-400">
                                  {formatCurrency(item.product.price)} / {item.product.unit}
                                </p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-bold text-amber-400 text-xs block">
                                × {item.quantity} {item.product.unit}
                              </span>
                              <span className="font-mono text-[11px] text-stone-300">
                                {formatCurrency(item.product.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4. 💵 TO'LOV TURI VA SUMMA (Naqd pul yoki Onlayn) */}
                    <div className={`p-4 rounded-2xl border-2 space-y-2 ${
                      driverAssignedOrder.paymentMethod === 'cash'
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10'
                        : 'bg-emerald-500/10 border-emerald-500/40'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-stone-300">
                          {driverAssignedOrder.paymentMethod === 'cash' ? '💵 Naqd pul hisobi' : '💳 Onlayn to‘lov'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          driverAssignedOrder.paymentMethod === 'cash'
                            ? 'bg-amber-500 text-stone-950'
                            : 'bg-emerald-500 text-stone-950'
                        }`}>
                          {driverAssignedOrder.paymentMethod.toUpperCase()}
                        </span>
                      </div>

                      {/* PROMINENT AMOUNT DISPLAY */}
                      {driverAssignedOrder.paymentMethod === 'cash' ? (
                        <div className="py-2">
                          <span className="text-xs text-amber-300 font-bold block">
                            MIJOZDAN NAQD PUL OLINADI:
                          </span>
                          <span className="font-mono font-black text-amber-400 text-2xl sm:text-3xl block tracking-tight">
                            {formatCurrency(driverAssignedOrder.totalAmount)}
                          </span>
                          <p className="text-[11px] text-amber-200/80 mt-1 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Mijozdan to‘liq naqd qabul qiling va qaytimni bering.</span>
                          </p>
                        </div>
                      ) : (
                        <div className="py-2">
                          <span className="text-xs text-emerald-300 font-bold block">
                            ONLAYN TO‘LANGAN (Mijozdan pul olinmaydi):
                          </span>
                          <span className="font-mono font-black text-emerald-400 text-2xl sm:text-3xl block tracking-tight">
                            {formatCurrency(driverAssignedOrder.totalAmount)}
                          </span>
                          <p className="text-[11px] text-emerald-200/80 mt-1 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Buyurtma {driverAssignedOrder.paymentMethod.toUpperCase()} orqali to‘liq to‘langan.</span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 5. 🚀 PROGRESS VA TOPSHIRISH TUGMASI */}
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] text-stone-300">
                          <span>Yetkazish progressi:</span>
                          <span className="font-mono font-bold text-orange-400">
                            {driverAssignedOrder.deliveryProgress || 10}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 transition-all duration-300"
                            style={{ width: `${driverAssignedOrder.deliveryProgress || 10}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Fast forward simulator control */}
                      <button
                        onClick={() => advanceDeliveryProgress(driverAssignedOrder.orderId, 30)}
                        className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-white/10 cursor-pointer"
                      >
                        <FastForward className="w-3.5 h-3.5 text-amber-400" />
                        <span>Harakatni tezlashtirish (+30%)</span>
                      </button>

                      {/* COMPLETE DELIVERY BUTTON */}
                      <button
                        onClick={() => completeDelivery(driverAssignedOrder.orderId)}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-stone-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Mijozga tovarlarni topshirdim (Yetkazildi)</span>
                      </button>
                    </div>

                  </div>
                )}

                {/* ============================================================= */}
                {/* CASE 3: NO ACTIVE JOB FOR THIS DRIVER                         */}
                {/* ============================================================= */}
                {!driverAssignedOrder && (
                  <div className="text-center py-10 px-4 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
                      🛵
                    </div>
                    <h4 className="font-bold text-white text-sm">Hozircha faol buyurtma yo‘q</h4>
                    <p className="text-xs text-stone-400 max-w-xs mx-auto">
                      Do‘konga yangi buyurtma tushganda sizga "Zakasni qabul qilish" tugmasi chiqadi.
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <button
                        onClick={() => handleCreateTestOrder('cash')}
                        className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-bold text-amber-300 cursor-pointer"
                      >
                        + Test Naqd Zakas
                      </button>

                      <button
                        onClick={() => handleCreateTestOrder('click')}
                        className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-bold text-emerald-300 cursor-pointer"
                      >
                        + Test Onlayn Zakas
                      </button>
                    </div>
                  </div>
                )}

                {/* Driver Daily Stats Footer */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs pt-2 border-t border-white/5">
                  <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
                    <span className="text-stone-400 text-[10px] block">Bugun topshirildi</span>
                    <span className="font-black text-white text-base">{currentDriver?.completedDeliveriesToday} ta</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
                    <span className="text-stone-400 text-[10px] block">Kuryer Reytingi</span>
                    <span className="font-black text-amber-400 text-base">⭐ {currentDriver?.rating}</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. TAB: ORDERS & DISPATCH OVERVIEW                                        */}
          {/* ========================================================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-white text-base">Buyurtmalar va Taqsimot Paneli</h3>
                  <p className="text-xs text-stone-400">Barcha buyurtmalarni kuryerlarga biriktirish, qabul qilish va boshqarish</p>
                </div>

                {pendingOrders.length > 0 && (
                  <button
                    onClick={() => autoAssignAllPendingOrders()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-stone-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Barcha kutilayotganlarni avto-biriktirish ({pendingOrders.length} ta)</span>
                  </button>
                )}
              </div>

              {/* Orders List */}
              <div className="space-y-3">
                {orders.map(order => {
                  const isPending = order.status === 'Tayyorlanmoqda';
                  const isOnRoad = order.status === "Kuryer yo'lda";
                  const isDelivered = order.status === 'Yetkazildi';
                  const availableCouriers = couriers.filter(c => c.status === 'online');

                  return (
                    <div
                      key={order.orderId}
                      className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                        isOnRoad
                          ? 'bg-orange-500/[0.03] border-orange-500/30'
                          : isPending
                          ? 'bg-blue-500/[0.03] border-blue-500/30'
                          : 'bg-white/[0.02] border-white/10'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        
                        {/* Order & Customer Info */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-mono font-black text-orange-400 text-sm">#{order.orderId}</span>
                            <span className="font-black text-white text-sm">{order.fullName}</span>
                            <a href={`tel:${order.phone.replace(/\D/g, '')}`} className="text-amber-400 font-mono text-xs flex items-center gap-1 hover:underline">
                              <Phone className="w-3 h-3" /> {order.phone}
                            </a>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              isOnRoad ? 'bg-orange-500 text-stone-950' : isPending ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-stone-950'
                            }`}>
                              {order.status}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-stone-300">
                              {order.paymentMethod === 'cash' ? '💵 Naqd pul' : `💳 ${order.paymentMethod.toUpperCase()}`}
                            </span>
                          </div>

                          <p className="text-xs text-stone-300 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="break-words">{order.address}</span>
                          </p>

                          {/* Items and total */}
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-400 pt-1">
                            <span className="font-semibold text-stone-300">Tarkib:</span>
                            {order.items.map((item, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-stone-300">
                                {item.product.name} × {item.quantity}
                              </span>
                            ))}
                            <span className="font-mono font-black text-emerald-400 ml-2 text-sm">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </div>

                          {/* Live Delivery Progress Bar if On the Road */}
                          {isOnRoad && (
                            <div className="pt-2 space-y-1 max-w-xl">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-orange-300 font-bold flex items-center gap-1">
                                  🛵 {order.courierName} yo‘lda ({order.courierVehicle})
                                </span>
                                <span className="font-mono font-black text-emerald-400">
                                  {order.deliveryProgress || 10}% • ~{order.estimatedMinutes || 10} daqiqa
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 transition-all duration-500"
                                  style={{ width: `${order.deliveryProgress || 10}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions / Dispatch Controls */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0 lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-white/5">
                          
                          {/* If Pending: Auto-assign or Manual Selection */}
                          {isPending && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => autoAssignOrder(order.orderId)}
                                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                              >
                                <Zap className="w-3.5 h-3.5" />
                                <span>Avto-biriktirish</span>
                              </button>

                              <select
                                onChange={e => {
                                  if (e.target.value) assignCourierToOrder(order.orderId, e.target.value);
                                }}
                                defaultValue=""
                                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-hidden cursor-pointer"
                              >
                                <option value="" disabled className="bg-stone-900">Qo‘lda kuryer tanlash...</option>
                                {availableCouriers.map(c => (
                                  <option key={c.id} value={c.id} className="bg-stone-900 text-white">
                                    {c.name} ({c.vehicleName})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* If On the Road & not yet accepted */}
                          {isOnRoad && !order.isAcceptedByCourier && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => acceptOrderByCourier(order.orderId)}
                                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs flex items-center gap-1 cursor-pointer shadow-md"
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>Qabul qilish</span>
                              </button>

                              <button
                                onClick={() => rejectOrderByCourier(order.orderId)}
                                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Bekor qilish</span>
                              </button>
                            </div>
                          )}

                          {/* If On the Road & accepted */}
                          {isOnRoad && order.isAcceptedByCourier && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => advanceDeliveryProgress(order.orderId, 25)}
                                title="Harakatni 25% tezlashtirish"
                                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-stone-300 flex items-center gap-1 cursor-pointer"
                              >
                                <FastForward className="w-3.5 h-3.5 text-amber-400" />
                                <span>+25%</span>
                              </button>

                              <button
                                onClick={() => completeDelivery(order.orderId)}
                                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Mijozga topshirildi</span>
                              </button>

                              <button
                                onClick={() => unassignCourierFromOrder(order.orderId)}
                                title="Kuryerni qaytarish"
                                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs cursor-pointer"
                              >
                                Bekor
                              </button>
                            </div>
                          )}

                          {/* If Delivered */}
                          {isDelivered && (
                            <div className="text-right">
                              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Muvaffaqiyatli yetkazildi
                              </span>
                              <span className="text-[10px] text-stone-400 block font-mono">
                                Kuryer: {order.courierName || 'Kuryer'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. TAB: LIVE SAMARQAND RADAR MAP                                          */}
          {/* ========================================================================= */}
          {activeTab === 'map' && (
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">Samarqand Shahri Jonli Kuryer Radari</span>
                  <span className="text-stone-400">• Harakatlanayotgan kuryerlar real vaqtda</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span>Do‘kon (Markaz)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
                    <span>Kuryer yo‘lda</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                    <span>Mijoz manzili</span>
                  </div>
                </div>
              </div>

              {/* Interactive Vector Radar Map */}
              <div className="relative flex-1 min-h-[380px] rounded-3xl bg-[#090b10] border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center p-4">
                
                {/* Grid Lines Background */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none"></div>

                {/* Radar Sweep Animation */}
                <div className="absolute w-[500px] h-[500px] rounded-full border border-emerald-500/10 pointer-events-none"></div>
                <div className="absolute w-[300px] h-[300px] rounded-full border border-emerald-500/20 pointer-events-none"></div>
                <div className="absolute w-[150px] h-[150px] rounded-full border border-emerald-500/30 pointer-events-none"></div>

                {/* 1. Baraka Supermarket Hub (Registon ko'chasi 14) - Center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-stone-950 flex items-center justify-center font-black shadow-xl shadow-emerald-500/40 ring-4 ring-emerald-500/30">
                      🏪
                    </div>
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping"></span>
                  </div>
                  <div className="mt-1 px-2.5 py-1 rounded-full bg-black/90 border border-emerald-500/40 text-[10px] font-black text-emerald-300 shadow-xl whitespace-nowrap">
                    BARAKA MARKET (Markaz)
                  </div>
                </div>

                {/* 2. Sug'diyona District (Top Left) */}
                <div className="absolute top-[18%] left-[18%] flex flex-col items-center">
                  <div className="w-7 h-7 rounded-xl bg-white/5 border border-white/20 flex items-center justify-center text-xs">
                    🏘️
                  </div>
                  <span className="mt-1 text-[10px] font-bold text-stone-400 bg-black/60 px-2 py-0.5 rounded-md border border-white/5">
                    Sug‘diyona mavzesi
                  </span>
                </div>

                {/* 3. Registon Square (Top Right) */}
                <div className="absolute top-[20%] right-[22%] flex flex-col items-center">
                  <div className="w-7 h-7 rounded-xl bg-white/5 border border-white/20 flex items-center justify-center text-xs">
                    🏛️
                  </div>
                  <span className="mt-1 text-[10px] font-bold text-stone-400 bg-black/60 px-2 py-0.5 rounded-md border border-white/5">
                    Registon maydoni
                  </span>
                </div>

                {/* 4. Siyob District (Bottom Right) */}
                <div className="absolute bottom-[20%] right-[18%] flex flex-col items-center">
                  <div className="w-7 h-7 rounded-xl bg-white/5 border border-white/20 flex items-center justify-center text-xs">
                    🛍️
                  </div>
                  <span className="mt-1 text-[10px] font-bold text-stone-400 bg-black/60 px-2 py-0.5 rounded-md border border-white/5">
                    Siyob bozori & Dahbed
                  </span>
                </div>

                {/* 5. Gagarin / Vokzal (Bottom Left) */}
                <div className="absolute bottom-[22%] left-[20%] flex flex-col items-center">
                  <div className="w-7 h-7 rounded-xl bg-white/5 border border-white/20 flex items-center justify-center text-xs">
                    🚆
                  </div>
                  <span className="mt-1 text-[10px] font-bold text-stone-400 bg-black/60 px-2 py-0.5 rounded-md border border-white/5">
                    Gagarin & Vokzal
                  </span>
                </div>

                {/* ACTIVE COURIER VEHICLES MOVING ON MAP */}
                {couriers.map((courier, idx) => {
                  const activeOrder = orders.find(o => o.orderId === courier.currentOrderId || (o.courierId === courier.id && o.status === "Kuryer yo'lda"));
                  const isBusy = courier.status === 'busy' && activeOrder;
                  const progress = activeOrder?.deliveryProgress || (idx * 25) % 90;

                  const positions = [
                    { top: `${35 + Math.sin(idx * 1.5) * 15}%`, left: `${40 + (isBusy ? progress * 0.4 : 10)}%` },
                    { top: `${55 - (isBusy ? progress * 0.3 : 5)}%`, left: `${30 + (isBusy ? progress * 0.35 : 15)}%` },
                    { top: `${25 + (isBusy ? progress * 0.25 : 10)}%`, left: `${60 - (isBusy ? progress * 0.2 : 5)}%` },
                    { top: `${65 - (isBusy ? progress * 0.2 : 8)}%`, left: `${65 - (isBusy ? progress * 0.3 : 10)}%` },
                    { top: `${45 + Math.cos(idx) * 10}%`, left: `${50 + (isBusy ? progress * 0.25 : 8)}%` },
                  ];
                  const pos = positions[idx % positions.length];

                  return (
                    <div
                      key={courier.id}
                      style={{ top: pos.top, left: pos.left }}
                      onClick={() => setSelectedCourierOnMap(courier)}
                      className={`absolute z-30 flex flex-col items-center cursor-pointer transition-all duration-1000 ${
                        selectedCourierOnMap?.id === courier.id ? 'scale-125 z-40' : 'hover:scale-110'
                      }`}
                    >
                      <div className="relative">
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg border text-base ${
                          isBusy 
                            ? 'bg-gradient-to-tr from-orange-500 to-amber-400 text-stone-950 border-orange-300 ring-4 ring-orange-500/30 animate-pulse' 
                            : courier.status === 'online'
                            ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-stone-950 border-emerald-300'
                            : 'bg-stone-800 text-stone-400 border-stone-600'
                        }`}>
                          {courier.vehicleType === 'motor' ? '🛵' : courier.vehicleType === 'car' ? '🚗' : courier.vehicleType === 'scooter' ? '🛴' : courier.vehicleType === 'damas' ? '🚐' : '🚲'}
                        </div>
                      </div>

                      <div className="mt-1 px-2 py-0.5 rounded-md bg-black/90 border border-white/10 text-[9px] font-bold text-white whitespace-nowrap shadow-md">
                        {courier.name}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Courier Details on Map */}
              {selectedCourierOnMap && (
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedCourierOnMap.avatar}
                      alt={selectedCourierOnMap.name}
                      className="w-10 h-10 rounded-xl object-cover border border-white/10"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{selectedCourierOnMap.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          selectedCourierOnMap.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' : selectedCourierOnMap.status === 'busy' ? 'bg-orange-500/20 text-orange-400' : 'bg-stone-700 text-stone-400'
                        }`}>
                          {selectedCourierOnMap.status === 'busy' ? 'Band (Yetkazmoqda)' : selectedCourierOnMap.status === 'online' ? 'Bo‘sh (Tayyor)' : 'Oflayn'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 flex items-center gap-2 mt-0.5">
                        <span>🚘 {selectedCourierOnMap.vehicleName} ({selectedCourierOnMap.vehiclePlate})</span>
                        <span>•</span>
                        <span>⭐ {selectedCourierOnMap.rating}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveCourierDriverId(selectedCourierOnMap.id);
                        setActiveTab('driver_app');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-stone-950 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Kuryer Ilovasini ochish</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. TAB: COURIERS FLEET                                                    */}
          {/* ========================================================================= */}
          {activeTab === 'couriers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-white text-base">Kuryerlar Jamoasi (Flot)</h3>
                  <p className="text-xs text-stone-400">Samarqand shahri bo‘yicha faol kuryerlar ro‘yxati va ko‘rsatkichlari</p>
                </div>
                <button
                  onClick={() => setIsAddCourierOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Yangi kuryer qo‘shish</span>
                </button>
              </div>

              {/* Courier Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {couriers.map(courier => {
                  const isOnline = courier.status === 'online';
                  const isBusy = courier.status === 'busy';

                  return (
                    <div
                      key={courier.id}
                      className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-4"
                    >
                      <div>
                        {/* Header with Avatar & Status */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={courier.avatar}
                              alt={courier.name}
                              className="w-12 h-12 rounded-2xl object-cover border border-white/10"
                            />
                            <div>
                              <h4 className="font-bold text-white text-sm">{courier.name}</h4>
                              <p className="text-xs text-stone-400 flex items-center gap-1">
                                <Phone className="w-3 h-3 text-emerald-400" />
                                <span>{courier.phone}</span>
                              </p>
                            </div>
                          </div>

                          {/* Status toggle */}
                          <button
                            onClick={() => updateCourierStatus(courier.id, isOnline ? 'offline' : 'online')}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border transition-all cursor-pointer ${
                              isBusy
                                ? 'bg-orange-500/20 border-orange-500/30 text-orange-400'
                                : isOnline
                                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                                : 'bg-stone-800 border-stone-700 text-stone-400'
                            }`}
                          >
                            {isBusy ? 'Band (Yo‘lda)' : isOnline ? 'Onlayn' : 'Oflayn'}
                          </button>
                        </div>

                        {/* Vehicle & Metrics */}
                        <div className="space-y-2 text-xs bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                          <div className="flex items-center justify-between text-stone-300">
                            <span className="text-stone-400">Transport:</span>
                            <span className="font-semibold text-white">{courier.vehicleName}</span>
                          </div>
                          <div className="flex items-center justify-between text-stone-300">
                            <span className="text-stone-400">Davlat raqami:</span>
                            <span className="font-mono font-bold text-amber-400">{courier.vehiclePlate}</span>
                          </div>
                          <div className="flex items-center justify-between text-stone-300">
                            <span className="text-stone-400">Joylashuv:</span>
                            <span className="text-stone-200">{courier.currentLocationName}</span>
                          </div>
                          <div className="flex items-center justify-between text-stone-300">
                            <span className="text-stone-400">Bugungi daromad:</span>
                            <span className="font-mono font-black text-emerald-400">{formatCurrency(courier.earningsToday)}</span>
                          </div>
                          <div className="flex items-center justify-between text-stone-300">
                            <span className="text-stone-400">Yetkazilgan buyurtmalar:</span>
                            <span className="font-bold text-white">{courier.completedDeliveriesToday} ta</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => {
                            setActiveCourierDriverId(courier.id);
                            setActiveTab('driver_app');
                          }}
                          className="flex-1 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Kuryer ilovasini ochish</span>
                        </button>

                        <button
                          onClick={() => deleteCourier(courier.id)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="O‘chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. TAB: AUTOMATION SETTINGS                                               */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="font-black text-white text-base">Avtomatlashtirish Sozlamalari</h3>
                <p className="text-xs text-stone-400">Kuryer algoritmi, yetkazish tezligi va xizmat haqi parametrlari</p>
              </div>

              <div className="space-y-4">
                {/* 1. Auto Assign Switch */}
                <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-white text-sm">Aqlli Avto-Biriktirish (Auto-Dispatch)</h4>
                    <p className="text-xs text-stone-400">Yangi buyurtma tushganda eng yaqin va bo‘sh kuryerga avtomatik biriktiradi</p>
                  </div>
                  <button
                    onClick={() => updateAutoDispatchSettings({ autoAssignEnabled: !autoDispatchSettings.autoAssignEnabled })}
                    className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                      autoDispatchSettings.autoAssignEnabled ? 'bg-emerald-500' : 'bg-stone-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      autoDispatchSettings.autoAssignEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 2. Auto Delivery Simulation */}
                <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-white text-sm">Jonli Harakat va Avto-Yetkazish Simulyatori</h4>
                    <p className="text-xs text-stone-400">Kuryer zakasni qabul qilgandan so‘ng xaritada avtomatik progress qiladi</p>
                  </div>
                  <button
                    onClick={() => updateAutoDispatchSettings({ autoDeliverySimEnabled: !autoDispatchSettings.autoDeliverySimEnabled })}
                    className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                      autoDispatchSettings.autoDeliverySimEnabled ? 'bg-orange-500' : 'bg-stone-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      autoDispatchSettings.autoDeliverySimEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 3. Simulation Speed */}
                <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div>
                    <h4 className="font-bold text-white text-sm">Simulyatsiya Tezligi</h4>
                    <p className="text-xs text-stone-400">Test qilish va ko‘rgazma uchun harakat tezligini tanlang</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'fast', label: 'Tezkor (~15 soniya)' },
                      { id: 'normal', label: 'O‘rtacha (~35 soniya)' },
                      { id: 'slow', label: 'Sekin (~1 daqiqa)' }
                    ].map(speed => (
                      <button
                        key={speed.id}
                        onClick={() => updateAutoDispatchSettings({ simulationSpeed: speed.id as 'fast' | 'normal' | 'slow' })}
                        className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                          autoDispatchSettings.simulationSpeed === speed.id
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md'
                            : 'bg-white/5 border-white/10 text-stone-400 hover:text-white'
                        }`}
                      >
                        {speed.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Courier Fee per order */}
                <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-white text-sm">Har bir yetkazish uchun kuryer haqi</h4>
                    <p className="text-xs text-stone-400">Buyurtma topshirilganda kuryer hamyoniga qo‘shiladigan summa</p>
                  </div>
                  <div className="font-mono font-black text-emerald-400 text-base">
                    {formatCurrency(autoDispatchSettings.perDeliveryFeeToCourier)}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ADD COURIER MODAL OVERLAY */}
        {isAddCourierOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#10121a] border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-white text-base">Yangi Kuryer Qo‘shish</h3>
                <button onClick={() => setIsAddCourierOpen(false)} className="text-stone-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddNewCourierSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-stone-400 mb-1">Ism va Familiya:</label>
                  <input
                    type="text"
                    required
                    value={newCourierName}
                    onChange={e => setNewCourierName(e.target.value)}
                    placeholder="Masalan: Behruz Rahimov"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1">Telefon raqami:</label>
                  <input
                    type="text"
                    required
                    value={newCourierPhone}
                    onChange={e => setNewCourierPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-hidden focus:border-emerald-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-stone-400 mb-1">Transport turi:</label>
                    <select
                      value={newCourierVehicleType}
                      onChange={e => setNewCourierVehicleType(e.target.value as CourierVehicleType)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden"
                    >
                      <option value="motor" className="bg-stone-900">Motoroller</option>
                      <option value="car" className="bg-stone-900">Avtomobil</option>
                      <option value="scooter" className="bg-stone-900">Skuter</option>
                      <option value="damas" className="bg-stone-900">Damas</option>
                      <option value="bike" className="bg-stone-900">Velosiped</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1">Transport modeli:</label>
                    <input
                      type="text"
                      value={newCourierVehicleName}
                      onChange={e => setNewCourierVehicleName(e.target.value)}
                      placeholder="Yamaha / Spark"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 mb-1">Davlat raqami / Id:</label>
                  <input
                    type="text"
                    value={newCourierPlate}
                    onChange={e => setNewCourierPlate(e.target.value)}
                    placeholder="30 777 SAM"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-hidden"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddCourierOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 font-bold"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black"
                  >
                    Saqlash
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
