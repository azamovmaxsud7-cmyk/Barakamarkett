import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Clock, Plus, Minus, Sparkles, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { CategoryId, Product } from '../types';
import { sounds } from '../utils/audio';
import { formatCurrency } from '../utils/formatters';

// 7 store categories - 1 product chosen from each category per day
const DAILY_DEAL_CATEGORIES: { id: CategoryId; name: string }[] = [
  { id: 'meva_sabzavot', name: 'Meva va sabzavotlar' },
  { id: 'ichimliklar', name: 'Ichimliklar & sharbatlar' },
  { id: 'sut', name: 'Sut mahsulotlari' },
  { id: 'gosht', name: "Go'sht va parranda" },
  { id: 'non_qandolat', name: 'Non va qandolatchilik' },
  { id: 'baqqollik', name: 'Baqqollik & donlar' },
  { id: 'xojalik', name: 'Xo‘jalik & tozalik' }
];

export const DailyDeals: React.FC = () => {
  const { 
    products, 
    addToCart, 
    updateQuantity, 
    getCartItemQuantity, 
    openProductModal, 
    setActiveTab 
  } = useStore();

  // Function to calculate exact remaining time until midnight (00:00:00)
  const calculateTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diffMs = midnight.getTime() - now.getTime();

    const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeUntilMidnight);
  const [currentDayNumber, setCurrentDayNumber] = useState(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  });

  // Calculate promotional date range capsule (e.g., 02.10 - 08.10)
  const dateRangeStr = useMemo(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const startStr = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}`;
    const nextWeek = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
    const endStr = `${pad(nextWeek.getDate())}.${pad(nextWeek.getMonth() + 1)}`;
    return `${startStr} - ${endStr}`;
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeUntilMidnight();
      setTimeLeft(remaining);

      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now.getTime() - start.getTime();
      const dayNum = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (dayNum !== currentDayNumber) {
        setCurrentDayNumber(dayNum);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentDayNumber]);

  // Exactly 7 products: 1 from each category, rotating daily
  const dailyDealsProducts = useMemo(() => {
    const list = products.filter(p => Boolean(p.discountPercent && p.discountPercent > 0));
    // Fallback if none yet: take first 7
    return list.length > 0 ? list : products.slice(0, 7);
  }, [products]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    sounds.playAddToCart();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
    addToCart(product, 1);
  };

  const handleIncrement = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    sounds.playClick();
    addToCart(product, 1);
  };

  const handleDecrement = (e: React.MouseEvent, productId: string, currentQty: number) => {
    e.stopPropagation();
    sounds.playClick();
    updateQuantity(productId, currentQty - 1);
  };

  return (
    <section className="py-2 sm:py-4 w-full max-w-full overflow-hidden" id="daily-deals-section">
      {/* Section Header: Matching Tayyor Taom To'plamlari */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4 sm:mb-5 px-1">
        <div>
          <div className="flex items-center gap-1.5 text-orange-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest mb-1">
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-current" />
            <span>KUNLIK MAXSUS AKSIYALAR</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className="flex items-center gap-2 text-white hover:text-orange-400 group transition-colors cursor-pointer text-left"
          >
            <h2 className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight uppercase">
              KUNLIK <span className="text-orange-500">SUPER NARXLAR</span>
            </h2>
            <ChevronRight className="w-5 h-5 text-orange-500 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 24-Hour Live Countdown Timer */}
        <div className="flex items-center gap-2 bg-[#121622] border border-white/10 px-3.5 py-1.5 rounded-2xl shadow-sm self-start sm:self-auto">
          <Clock className="w-4 h-4 text-orange-400 shrink-0" />
          <span className="text-[11px] text-stone-400 font-medium hidden sm:inline">Tugashiga:</span>
          <div className="flex items-center font-mono font-black text-xs sm:text-sm text-amber-400 tracking-wider">
            <span>{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="animate-pulse mx-0.5">:</span>
            <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="animate-pulse mx-0.5">:</span>
            <span className="text-orange-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* Horizontal Scrolling Products Row: Styled 100% Identical to Tayyor Taom To'plamlari */}
      <div className="flex items-stretch overflow-x-auto gap-3.5 pb-3 pt-1 px-1 scrollbar-none snap-x snap-mandatory scroll-smooth w-full">
        {dailyDealsProducts.map(product => {
          const quantity = getCartItemQuantity(product.id);

          return (
            <motion.div
              key={`deal-${currentDayNumber}-${product.id}`}
              whileHover={{ y: -3 }}
              onClick={() => openProductModal(product)}
              className="min-w-[155px] xs:min-w-[175px] sm:min-w-[205px] md:min-w-[225px] max-w-[170px] xs:max-w-[190px] sm:max-w-[220px] md:max-w-[240px] shrink-0 snap-start bg-[#121622] rounded-2xl border border-white/10 shadow-lg hover:border-orange-500/40 transition-all overflow-hidden flex flex-col justify-between group backdrop-blur-xl cursor-pointer select-none"
            >
              {/* 1. Banner Image with Gradient & Badges */}
              <div className="relative h-28 xs:h-32 sm:h-36 overflow-hidden bg-black/40">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121622] via-[#121622]/40 to-transparent" />

                {/* Orange Super Chegirma Badge */}
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 bg-orange-500 text-stone-950 font-black text-[10px] rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    -{product.discountPercent}%
                  </span>
                </div>
              </div>

              {/* 2. Body Details: Only Name & Pricing */}
              <div className="p-3 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-orange-400 transition-colors leading-snug line-clamp-2 min-h-[34px]">
                    {product.name}
                  </h3>
                </div>

                {/* 3. Pricing & Action Button */}
                <div className="pt-2.5 mt-2 border-t border-white/10 flex items-center justify-between gap-2">
                  <div>
                    {product.oldPrice && (
                      <div className="text-[10px] text-stone-400 line-through">
                        {formatCurrency(product.oldPrice)}
                      </div>
                    )}
                    <div className="text-xs sm:text-sm font-black text-orange-400 font-mono">
                      {formatCurrency(product.price)}
                    </div>
                  </div>

                  {quantity === 0 ? (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleAddToCart(e, product)}
                      className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-stone-950 font-black text-xs shadow-md shadow-orange-500/25 flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Savatga</span>
                    </motion.button>
                  ) : (
                    <div className="flex items-center gap-1 bg-white/10 border border-white/10 rounded-xl p-0.5">
                      <button
                        type="button"
                        onClick={(e) => handleDecrement(e, product.id, quantity)}
                        className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-xs transition-all cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-black text-xs text-white px-1.5">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleIncrement(e, product)}
                        className="w-6 h-6 rounded-lg bg-orange-500 hover:bg-orange-400 text-stone-950 flex items-center justify-center font-bold text-xs transition-all cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
