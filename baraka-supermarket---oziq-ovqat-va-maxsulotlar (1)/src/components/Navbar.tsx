import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
   ShoppingBag, 
   Heart, 
   Search, 
   Layers, 
   MapPin, 
   Award, 
   X, 
   ChevronDown, 
   Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/formatters';
import { sounds } from '../utils/audio';

export const Navbar: React.FC = () => {
  const {
    cartTotalCount,
    cartSubtotal,
    wishlist,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsAdminOpen,
    setIsCourierPanelOpen,
    setIsCourierAuthenticated,
    filters,
    setFilters,
    products,
    openProductModal,
    loyaltyCard,
    activeBranch,
    setIsCatalogOpen,
    setIsLoyaltyModalOpen,
    setIsBranchModalOpen,
    deliveryMode,
    setActiveTab
  } = useStore();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Secret Long Press on 'B' Logo for Admin Access
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHoldingB, setIsHoldingB] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnimRef = useRef<number | null>(null);
  const holdStartTimeRef = useRef<number>(0);
  const didTriggerAdminRef = useRef<boolean>(false);

  // Secret Long Press on Delivery/Truck for Courier Access
  const [courierHoldProgress, setCourierHoldProgress] = useState(0);
  const [isHoldingCourier, setIsHoldingCourier] = useState(false);
  const courierHoldTimerRef = useRef<NodeJS.Timeout | null>(null);
  const courierProgressAnimRef = useRef<number | null>(null);
  const courierHoldStartTimeRef = useRef<number>(0);
  const didTriggerCourierRef = useRef<boolean>(false);

  const HOLD_DURATION = 1400; // 1.4 seconds to unlock

  const cancelHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressAnimRef.current) {
      cancelAnimationFrame(progressAnimRef.current);
      progressAnimRef.current = null;
    }
    setIsHoldingB(false);
    setHoldProgress(0);
  }, []);

  const cancelCourierHold = useCallback(() => {
    if (courierHoldTimerRef.current) {
      clearTimeout(courierHoldTimerRef.current);
      courierHoldTimerRef.current = null;
    }
    if (courierProgressAnimRef.current) {
      cancelAnimationFrame(courierProgressAnimRef.current);
      courierProgressAnimRef.current = null;
    }
    setIsHoldingCourier(false);
    setCourierHoldProgress(0);
  }, []);

  const updateProgress = useCallback(() => {
    if (!holdStartTimeRef.current) return;
    const elapsed = Date.now() - holdStartTimeRef.current;
    const progress = Math.min(100, Math.round((elapsed / HOLD_DURATION) * 100));
    setHoldProgress(progress);

    if (elapsed < HOLD_DURATION) {
      progressAnimRef.current = requestAnimationFrame(updateProgress);
    }
  }, []);

  const updateCourierProgress = useCallback(() => {
    if (!courierHoldStartTimeRef.current) return;
    const elapsed = Date.now() - courierHoldStartTimeRef.current;
    const progress = Math.min(100, Math.round((elapsed / HOLD_DURATION) * 100));
    setCourierHoldProgress(progress);

    if (elapsed < HOLD_DURATION) {
      courierProgressAnimRef.current = requestAnimationFrame(updateCourierProgress);
    }
  }, []);

  const handleHoldStart = () => {
    didTriggerAdminRef.current = false;
    setIsHoldingB(true);
    holdStartTimeRef.current = Date.now();
    setHoldProgress(0);

    progressAnimRef.current = requestAnimationFrame(updateProgress);

    holdTimerRef.current = setTimeout(() => {
      didTriggerAdminRef.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 60, 100]);
      }
      sounds.playNotification();
      setIsAdminOpen(true);
      cancelHold();
    }, HOLD_DURATION);
  };

  const handleHoldEnd = () => {
    const wasAdminTriggered = didTriggerAdminRef.current;
    cancelHold();

    if (!wasAdminTriggered) {
      setFilters(prev => ({ ...prev, category: 'all', subcategory: 'all', searchQuery: '' }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCourierHoldStart = () => {
    didTriggerCourierRef.current = false;
    setIsHoldingCourier(true);
    courierHoldStartTimeRef.current = Date.now();
    setCourierHoldProgress(0);

    courierProgressAnimRef.current = requestAnimationFrame(updateCourierProgress);

    courierHoldTimerRef.current = setTimeout(() => {
      didTriggerCourierRef.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 60, 100]);
      }
      sounds.playNotification();
      setIsCourierAuthenticated(false);
      setIsCourierPanelOpen(true);
      cancelCourierHold();
    }, HOLD_DURATION);
  };

  const handleCourierHoldEnd = () => {
    cancelCourierHold();
  };

  // Keyboard shortcut '/' to search & Alt+K for courier panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'k') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        sounds.playClick();
        setIsCourierAuthenticated(false);
        setIsCourierPanelOpen(true);
        return;
      }

      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsCourierPanelOpen, setIsCourierAuthenticated]);

  // Filtered autocomplete search results
  const searchResults = filters.searchQuery.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(filters.searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-40 bg-[#07080b]/92 backdrop-blur-2xl border-b border-white/10 transition-all">
      {/* Main Navbar Bar */}
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-4 box-border">
        
        {/* Brand Logo + Supermarket Badge */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          {/* 'B' Icon Button with Hold-to-Unlock Admin */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={cancelHold}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            onTouchCancel={cancelHold}
            onContextMenu={(e) => e.preventDefault()}
            title="Baraka Market"
            className={`relative w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-300 flex items-center justify-center text-black font-black shadow-md shadow-orange-500/20 transition-all cursor-pointer shrink-0 ${
              isHoldingB ? 'ring-4 ring-orange-400/80 scale-105 shadow-orange-500/50' : 'hover:scale-105'
            }`}
          >
            <span className="text-base sm:text-xl font-black select-none pointer-events-none">B</span>

            {/* Long-press Progress Ring Indicator */}
            {isHoldingB && (
              <div className="absolute -inset-1 rounded-2xl border-2 border-dashed border-amber-300 animate-spin pointer-events-none" />
            )}

            {/* Progress Percentage Tooltip */}
            {isHoldingB && holdProgress > 15 && (
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/90 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-400/40 shadow-xl whitespace-nowrap animate-in fade-in zoom-in-75">
                {holdProgress}%
              </div>
            )}
          </motion.div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => {
                setActiveTab('home');
                setFilters(prev => ({ ...prev, category: 'all', subcategory: 'all', searchQuery: '' }));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left cursor-pointer min-w-0"
            >
              <span className="text-xl sm:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-stone-100 to-stone-300">
                BARAKA
              </span>
            </button>

            {/* MARKET Badge with secret Hold for Courier Access */}
            <div
              onMouseDown={handleCourierHoldStart}
              onMouseUp={handleCourierHoldEnd}
              onMouseLeave={cancelCourierHold}
              onTouchStart={handleCourierHoldStart}
              onTouchEnd={handleCourierHoldEnd}
              onTouchCancel={cancelCourierHold}
              onContextMenu={(e) => e.preventDefault()}
              title="Supermarket"
              className={`relative px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-md sm:rounded-lg transition-all cursor-pointer select-none ${
                isHoldingCourier 
                  ? 'bg-emerald-500 text-black ring-2 ring-emerald-400 scale-105' 
                  : 'bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30'
              }`}
            >
              <span>MARKET</span>
              {isHoldingCourier && (
                <div className="absolute -inset-1 rounded-md border border-dashed border-emerald-400 animate-spin pointer-events-none" />
              )}
              {isHoldingCourier && courierHoldProgress > 10 && (
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-black/95 text-emerald-400 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/30 whitespace-nowrap">
                  {courierHoldProgress}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar with live autocomplete */}
        <div className="flex-1 max-w-xl relative hidden md:block">
          <div className={`relative flex items-center rounded-2xl border transition-all duration-300 bg-white/[0.04] backdrop-blur-xl ${
            isSearchFocused ? 'border-orange-500/80 ring-2 ring-orange-500/20 shadow-lg shadow-orange-500/10' : 'border-white/10 hover:border-white/20'
          }`}>
            <Search className="w-4 h-4 text-stone-400 ml-3.5 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={filters.searchQuery}
              onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
              placeholder="10 000+ mahsulot, go‘sht, sut, mevalar..."
              className="w-full py-2.5 px-3 bg-transparent text-white text-sm focus:outline-hidden placeholder:text-stone-500"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="p-1 mr-2 text-stone-400 hover:text-white rounded-full hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden lg:inline-block mr-3 px-2 py-0.5 text-[11px] font-mono text-stone-400 bg-white/5 rounded-md border border-white/10">
              /
            </kbd>
          </div>

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {isSearchFocused && filters.searchQuery.trim().length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[#0d0d10] rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50 backdrop-blur-2xl"
              >
                <div className="p-2.5 border-b border-white/10 bg-white/[0.02] flex justify-between items-center text-xs text-stone-400 px-4">
                  <span>Qidiruv natijalari:</span>
                  <span className="font-mono text-orange-400 font-bold">{searchResults.length} ta mahsulot</span>
                </div>
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {searchResults.map(product => (
                      <button
                        key={product.id}
                        onClick={() => openProductModal(product)}
                        className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-10 h-10 object-cover rounded-lg border border-white/10" 
                          />
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                              {product.name}
                            </p>
                            <p className="text-xs text-stone-400">{product.weightOrVolume}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black font-mono text-white">{formatCurrency(product.price)}</p>
                          {product.oldPrice && (
                            <p className="text-xs text-stone-400 line-through font-mono">
                              {formatCurrency(product.oldPrice)}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-stone-400 text-sm">
                    "{filters.searchQuery}" bo‘yicha mahsulot topilmadi
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions (Wishlist & Cart) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Wishlist Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsWishlistOpen(true)}
            className="relative p-2 sm:p-2.5 text-stone-300 hover:text-rose-400 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl sm:rounded-2xl transition-colors cursor-pointer"
            title="Sevimli mahsulotlar"
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-rose-500 text-white text-[9px] sm:text-[10px] font-black rounded-full flex items-center justify-center shadow-md shadow-rose-500/40">
                {wishlist.length}
              </span>
            )}
          </motion.button>

          {/* Cart Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 sm:gap-2.5 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-black px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-md shadow-orange-500/20 transition-all cursor-pointer font-bold"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartTotalCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 sm:w-5 sm:h-5 bg-black text-amber-300 text-[9px] sm:text-[10px] font-black rounded-full flex items-center justify-center shadow-md">
                  {cartTotalCount}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-[10px] uppercase font-black tracking-wider text-black/70">Savatcha</span>
              <span className="text-xs font-black tracking-tight font-mono">
                {cartSubtotal > 0 ? formatCurrency(cartSubtotal) : "0 so'm"}
              </span>
            </div>
          </motion.button>
        </div>

      </div>

      {/* Mobile Search input */}
      <div className="px-3 sm:px-4 pb-2.5 md:hidden">
        <div className="relative flex items-center rounded-xl border border-white/10 bg-white/5">
          <Search className="w-4 h-4 text-stone-400 ml-3 shrink-0" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="10 000+ mahsulot, go‘sht, sut izlash..."
            className="w-full py-2 px-2.5 bg-transparent text-white text-xs focus:outline-hidden placeholder:text-stone-500"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="p-1 mr-2 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
