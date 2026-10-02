import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  Percent, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  ShieldCheck, 
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES } from '../data/categories';
import { CategoryId } from '../types';

export const CatalogMegaMenu: React.FC = () => {
  const { 
    isCatalogOpen, 
    setIsCatalogOpen, 
    setFilters,
    products
  } = useStore();

  const [activeCategoryId, setActiveCategoryId] = useState<CategoryId>('sut');

  // Lock body scroll and ESC listener
  useEffect(() => {
    if (isCatalogOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsCatalogOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isCatalogOpen, setIsCatalogOpen]);

  if (!isCatalogOpen) return null;

  const currentCategory = CATEGORIES.find(c => c.id === activeCategoryId) || CATEGORIES[0];
  const categoryProducts = products.filter(p => p.categoryId === activeCategoryId);
  const discountedCount = categoryProducts.filter(p => p.oldPrice && p.oldPrice > p.price).length;

  const handleSelectSubcategory = (catId: CategoryId, subId: string) => {
    setFilters(prev => ({
      ...prev,
      category: catId,
      subcategory: subId,
      searchQuery: ''
    }));
    setIsCatalogOpen(false);
    const target = document.getElementById('smart-shopping-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenFullCategory = (catId: CategoryId) => {
    setFilters(prev => ({
      ...prev,
      category: catId,
      subcategory: 'all',
      searchQuery: ''
    }));
    setIsCatalogOpen(false);
    const target = document.getElementById('smart-shopping-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <AnimatePresence>
      {isCatalogOpen && (
        <div className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center sm:p-4 bg-[#07080b] sm:bg-black/95 backdrop-blur-2xl overflow-hidden">
          {/* Desktop backdrop click catcher */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCatalogOpen(false)}
            className="hidden sm:block fixed inset-0 bg-black/95 backdrop-blur-2xl"
          />

          {/* Main Mega Menu Container */}
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full h-full sm:h-[88vh] sm:max-w-6xl bg-[#090a0e] border-0 sm:border sm:border-white/10 rounded-none sm:rounded-3xl shadow-2xl shadow-black overflow-hidden flex flex-col z-10"
          >
            {/* Header */}
            <div className="p-3.5 sm:p-4 md:p-5 border-b border-white/10 flex items-center justify-between bg-black/60 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-lg md:text-xl font-black text-white tracking-tight truncate">
                      Supermarket Katalogi
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                      {CATEGORIES.length} Bo‘lim
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-stone-400 truncate">
                    Barcha sifatli mahsulotlar toifalari
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setFilters(prev => ({ ...prev, onlyDiscount: true, category: 'all', subcategory: 'all' }));
                    setIsCatalogOpen(false);
                    const deals = document.getElementById('daily-deals-section');
                    if (deals) deals.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-black font-black text-xs hover:bg-amber-300 transition-colors cursor-pointer shadow-md shadow-amber-400/20"
                >
                  <Percent className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Sariq narxlar</span>
                </button>

                <button
                  onClick={() => setIsCatalogOpen(false)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/15"
                  aria-label="Katalogni yopish"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Category Horizontal Pill Scroller */}
            <div className="md:hidden border-b border-white/10 bg-black/40 p-2 overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
              {CATEGORIES.map(cat => {
                const isActive = cat.id === activeCategoryId;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-orange-500 text-stone-950 font-black shadow-md shadow-orange-500/30'
                        : 'bg-white/5 text-stone-300 hover:text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Mega Menu Body (Multi-Column Layout on Desktop, Fluid on Mobile) */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0 bg-[#090a0e]">
              {/* Left Column: Category Tabs (Visible on Desktop) */}
              <div className="hidden md:block md:col-span-4 bg-black/40 border-r border-white/5 p-2 sm:p-3 overflow-y-auto max-h-full scrollbar-thin">
                <div className="space-y-1">
                  {CATEGORIES.map(cat => {
                    const isActive = cat.id === activeCategoryId;
                    return (
                      <button
                        key={cat.id}
                        onMouseEnter={() => setActiveCategoryId(cat.id)}
                        onClick={() => setActiveCategoryId(cat.id)}
                        className={`w-full text-left p-2.5 sm:p-3 rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                          isActive 
                            ? 'bg-orange-500/20 text-white border border-orange-500/30 shadow-sm' 
                            : 'text-stone-300 hover:bg-white/5 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xl sm:text-2xl shrink-0 p-1.5 rounded-lg bg-white/5 group-hover:scale-105 transition-transform">
                            {cat.icon}
                          </span>
                          <div className="min-w-0">
                            <div className="font-bold text-sm truncate flex items-center gap-1.5">
                              <span>{cat.name}</span>
                            </div>
                            <span className="text-[11px] text-stone-400 block truncate">
                              {cat.tagline}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/10 text-stone-300">
                            {cat.itemCount} ta
                          </span>
                          <ChevronRight className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-stone-600'}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Middle & Right Column: Subcategories & Showcase */}
              <div className="col-span-1 md:col-span-8 p-3 sm:p-5 md:p-6 overflow-y-auto max-h-full bg-[#090a0e] scrollbar-thin flex flex-col justify-between">
                <div>
                  {/* Category Header Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-white/10 mb-4 sm:mb-5">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl sm:text-3xl md:text-4xl p-2 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                        {currentCategory.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-xl md:text-2xl font-black text-white">
                            {currentCategory.name}
                          </h3>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                            {currentCategory.badge}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 mt-0.5 max-w-xl">
                          {currentCategory.description}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenFullCategory(currentCategory.id)}
                      className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-stone-950 text-xs font-black transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20"
                    >
                      <span>Barchasini ko‘rish ({currentCategory.itemCount} ta)</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subcategories Grid */}
                  <div className="mb-5 sm:mb-6">
                    <h4 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-2.5 sm:mb-3 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Kichik bo‘limlar:</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
                      {currentCategory.subcategories.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => handleSelectSubcategory(currentCategory.id, sub.id)}
                          className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-orange-500/40 text-left transition-all group cursor-pointer flex items-center justify-between gap-2"
                        >
                          <span className="text-xs sm:text-sm font-semibold text-stone-200 group-hover:text-white transition-colors">
                            {sub.name}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-stone-600 group-hover:text-orange-400 transition-colors shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Highlights Banner */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black shrink-0">
                        <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-white flex items-center gap-1.5">
                          <span>Bu bo‘limda {discountedCount} ta Sariq narx (Aksiya)</span>
                        </h5>
                        <p className="text-[11px] text-stone-300">
                          Eng arzon supermarket narxlari va Baraka Club ballari
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setFilters(prev => ({ ...prev, category: currentCategory.id, onlyDiscount: true }));
                        setIsCatalogOpen(false);
                        const target = document.getElementById('smart-shopping-section');
                        if (target) target.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-black text-xs cursor-pointer transition-colors text-center"
                    >
                      Aksiyalarni ko‘rish
                    </button>
                  </div>
                </div>

                {/* Quick Guarantees Footer */}
                <div className="pt-3 sm:pt-4 border-t border-white/5 grid grid-cols-3 gap-2 text-center mt-5">
                  <div className="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] text-stone-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Har kuni yangi</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] text-stone-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>100% Halol</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] text-stone-400">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>25 daq yetkazish</span>
                  </div>
                </div>

              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
