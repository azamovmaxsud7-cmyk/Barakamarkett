import React, { useState, useRef } from 'react';
import { ChefHat, Clock, Users, Plus, Check, Sparkles, UtensilsCrossed, X, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MEAL_KITS } from '../data/products';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/formatters';
import { sounds } from '../utils/audio';
import { MealKit } from '../types';

const HOLD_DURATION = 900; // 900ms hold to trigger courier panel PIN modal

export const MealKitsSection: React.FC = () => {
  const { 
    products, 
    addToCart, 
    setIsCartOpen,
    setIsCourierPanelOpen,
    setIsCourierAuthenticated
  } = useStore();

  const [selectedKit, setSelectedKit] = useState<MealKit | null>(null);

  // Secret long-press hold state for "PISHIRISHGA TAYYOR & YARIM TAYYOR"
  const [isHoldingCourier, setIsHoldingCourier] = useState(false);
  const [courierHoldProgress, setCourierHoldProgress] = useState(0);
  const courierHoldTimerRef = useRef<NodeJS.Timeout | null>(null);
  const courierProgressAnimRef = useRef<number | null>(null);
  const courierHoldStartTimeRef = useRef<number>(0);
  const didTriggerCourierRef = useRef(false);

  const updateProgress = () => {
    const elapsed = Date.now() - courierHoldStartTimeRef.current;
    const pct = Math.min(100, Math.round((elapsed / HOLD_DURATION) * 100));
    setCourierHoldProgress(pct);
    if (elapsed < HOLD_DURATION) {
      courierProgressAnimRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const startCourierHold = () => {
    didTriggerCourierRef.current = false;
    setIsHoldingCourier(true);
    setCourierHoldProgress(0);
    courierHoldStartTimeRef.current = Date.now();
    courierProgressAnimRef.current = requestAnimationFrame(updateProgress);

    courierHoldTimerRef.current = setTimeout(() => {
      didTriggerCourierRef.current = true;
      if (courierProgressAnimRef.current) {
        cancelAnimationFrame(courierProgressAnimRef.current);
      }
      setIsHoldingCourier(false);
      setCourierHoldProgress(0);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 60, 100]);
      }
      sounds.playNotification();
      setIsCourierAuthenticated(false);
      setIsCourierPanelOpen(true);
    }, HOLD_DURATION);
  };

  const endCourierHold = () => {
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
  };

  const handleAddBundle = (kit: MealKit, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sounds.playAddToCart();

    kit.productIds.forEach(pid => {
      const prod = products.find(p => p.id === pid);
      if (prod) {
        addToCart(prod, 1);
      }
    });

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
    setIsCartOpen(true);
    setSelectedKit(null);
  };

  return (
    <section className="py-4 sm:py-6 border-t border-white/10 w-full max-w-full overflow-hidden box-border" id="meal-kits-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 px-1">
        <div>
          {/* Secret Long-press trigger on "PISHIRISHGA TAYYOR & YARIM TAYYOR" */}
          <div
            onMouseDown={startCourierHold}
            onMouseUp={endCourierHold}
            onMouseLeave={endCourierHold}
            onTouchStart={startCourierHold}
            onTouchEnd={endCourierHold}
            onTouchCancel={endCourierHold}
            onContextMenu={(e) => e.preventDefault()}
            className={`inline-flex items-center gap-1.5 font-bold text-[10px] sm:text-xs uppercase tracking-widest mb-1 select-none cursor-pointer transition-all px-2 py-0.5 rounded-lg ${
              isHoldingCourier
                ? 'bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-400/80 scale-105'
                : 'text-orange-400 hover:text-orange-300'
            }`}
            title="Bosib tursangiz kuryer paneliga kirish kodi (0254) ochiladi"
          >
            <div className="relative">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              {isHoldingCourier && (
                <div className="absolute -inset-1.5 rounded-full border border-dashed border-emerald-400 animate-spin pointer-events-none" />
              )}
            </div>
            <span>Pishirishga Tayyor & Yarim Tayyor</span>
            {isHoldingCourier && courierHoldProgress > 20 && (
              <span className="text-[10px] font-mono text-emerald-300 ml-1">
                {courierHoldProgress}%
              </span>
            )}
          </div>

          <h2 className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight uppercase">
            Tayyor Taom <span className="text-orange-500">To‘plamlari</span>
          </h2>
        </div>
        <p className="text-stone-400 text-xs max-w-md hidden sm:block">
          Muzlatilgan barak (chuchvara), somsa va xonaki taomlar to‘plami
        </p>
      </div>

      {/* Horizontal Scrolling Meal Kits Row: Compact, Only Name & Price */}
      <div className="flex items-stretch overflow-x-auto gap-3.5 pb-3 pt-1 px-1 scrollbar-none snap-x snap-mandatory scroll-smooth w-full">
        {MEAL_KITS.map(kit => {
          const kitProducts = kit.productIds
            .map(id => products.find(p => p.id === id))
            .filter(Boolean);

          const originalTotal = kitProducts.reduce(
            (sum, p) => sum + (p ? p.price : 0),
            0
          );
          const bundleDiscount = Math.round((originalTotal * kit.discount) / 100);
          const discountedTotal = originalTotal - bundleDiscount;

          return (
            <motion.div
              key={kit.id}
              whileHover={{ y: -3 }}
              onClick={() => {
                sounds.playClick();
                setSelectedKit(kit);
              }}
              className="min-w-[155px] xs:min-w-[175px] sm:min-w-[205px] md:min-w-[225px] max-w-[170px] xs:max-w-[190px] sm:max-w-[220px] md:max-w-[240px] shrink-0 snap-start bg-[#121622] rounded-2xl border border-white/10 shadow-lg hover:border-orange-500/40 transition-all overflow-hidden flex flex-col justify-between group backdrop-blur-xl cursor-pointer select-none"
            >
              {/* Banner Image */}
              <div className="relative h-28 xs:h-32 sm:h-36 overflow-hidden bg-black/40">
                <img
                  src={kit.image}
                  alt={kit.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121622] via-[#121622]/40 to-transparent" />

                {/* Bundle Discount Badge */}
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 bg-orange-500 text-stone-950 font-black text-[10px] rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    -{kit.discount}%
                  </span>
                </div>
              </div>

              {/* Body: Only Name & Pricing */}
              <div className="p-3 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-orange-400 transition-colors leading-snug line-clamp-2 min-h-[34px]">
                    {kit.title}
                  </h3>
                </div>

                {/* Pricing & Add to Cart button */}
                <div className="pt-2.5 mt-2 border-t border-white/10 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] text-stone-400 line-through">
                      {formatCurrency(originalTotal)}
                    </div>
                    <div className="text-xs sm:text-sm font-black text-orange-400 font-mono">
                      {formatCurrency(discountedTotal)}
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleAddBundle(kit, e)}
                    className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-stone-950 font-black text-xs shadow-md shadow-orange-500/25 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Savatga</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full Details Modal: Opens when user clicks a meal kit */}
      <AnimatePresence>
        {selectedKit && (() => {
          const kitProducts = selectedKit.productIds
            .map(id => products.find(p => p.id === id))
            .filter(Boolean);

          const originalTotal = kitProducts.reduce(
            (sum, p) => sum + (p ? p.price : 0),
            0
          );
          const bundleDiscount = Math.round((originalTotal * selectedKit.discount) / 100);
          const discountedTotal = originalTotal - bundleDiscount;

          return (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-[#121622] border border-white/15 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col text-stone-200"
              >
                {/* Header Image */}
                <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-black/50 shrink-0">
                  <img
                    src={selectedKit.image}
                    alt={selectedKit.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121622] via-[#121622]/30 to-transparent" />

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => setSelectedKit(null)}
                    className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-stone-300 hover:text-white flex items-center justify-center border border-white/10 cursor-pointer shadow-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Discount Badge */}
                  <div className="absolute top-3.5 left-3.5">
                    <span className="px-3 py-1 bg-orange-500 text-stone-950 font-black text-xs rounded-full shadow-lg flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      -{selectedKit.discount}% Tejamkor To‘plam
                    </span>
                  </div>

                  {/* Meta Chips on Image */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2">
                    <span className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-semibold text-stone-200">
                      <Clock className="w-3.5 h-3.5 text-orange-400" />
                      {selectedKit.cookingTime}
                    </span>
                    <span className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-semibold text-amber-400">
                      <Users className="w-3.5 h-3.5" />
                      {selectedKit.servings}
                    </span>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-4 sm:p-6 flex flex-col gap-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white">
                      {selectedKit.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
                      {selectedKit.description}
                    </p>
                  </div>

                  {/* Included Ingredients Section */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2.5">
                      To‘plam tarkibi ({kitProducts.length} ta mahsulot):
                    </h4>
                    <div className="space-y-2">
                      {kitProducts.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/5"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={p?.image}
                              alt={p?.name}
                              className="w-10 h-10 rounded-lg object-cover bg-black/40"
                            />
                            <div>
                              <div className="text-xs sm:text-sm font-semibold text-white">
                                {p?.name}
                              </div>
                              <div className="text-[11px] text-stone-400">
                                {p?.weightOrVolume || p?.unit}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs font-mono font-bold text-amber-400">
                            {formatCurrency(p ? p.price : 0)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Summary & Action */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-4 mt-2">
                    <div>
                      <div className="text-xs text-stone-400 line-through">
                        {formatCurrency(originalTotal)}
                      </div>
                      <div className="text-base sm:text-lg font-black text-orange-400 font-mono">
                        {formatCurrency(discountedTotal)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddBundle(selectedKit)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-stone-950 font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>To‘plamni savatga qo‘shish</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </section>
  );
};
