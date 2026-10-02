import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Heart, 
  Star, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  MapPin, 
  ShoppingBag,
  Info,
  CheckCircle2,
  Flame,
  Award
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCurrency, formatDiscount } from '../utils/formatters';

export const ProductQuickViewModal: React.FC = () => {
  const {
    activeProductModal,
    closeProductModal,
    addToCart,
    toggleWishlist,
    isInWishlist,
    getCartItemQuantity
  } = useStore();

  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    setQuantity(1);
  }, [activeProductModal]);

  // Handle ESC key and body scroll lock only when modal is open
  useEffect(() => {
    if (!activeProductModal) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeProductModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow || '';
    };
  }, [activeProductModal, closeProductModal]);

  if (!activeProductModal) return null;

  const product = activeProductModal;
  const inWishlist = isInWishlist(product.id);
  const cartQty = getCartItemQuantity(product.id);

  const handleAdd = () => {
    addToCart(product, quantity);
    closeProductModal();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#07080b]/98 sm:bg-black/95 backdrop-blur-2xl flex items-center justify-center p-2.5 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-[#0c0c0e] text-white rounded-3xl sm:rounded-4xl shadow-2xl border border-white/10 flex flex-col md:flex-row animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closeProductModal}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/15 shadow-lg backdrop-blur-md transition-transform hover:scale-105 cursor-pointer"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Left Side: Product Image & Badges */}
        <div className="md:w-1/2 relative bg-black/50 min-h-[220px] sm:min-h-[280px] md:min-h-full flex items-center justify-center p-4 sm:p-6 border-b md:border-b-0 md:border-r border-white/10 shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full max-h-[260px] sm:max-h-[340px] object-cover rounded-2xl shadow-2xl"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-1 z-10">
            {product.discountPercent && (
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-black bg-rose-500 text-white rounded-full shadow-lg">
                {formatDiscount(product.discountPercent)} Chegirma
              </span>
            )}
            {product.isHalal && (
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold bg-amber-400 text-black rounded-full shadow-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                100% Halol
              </span>
            )}
            {product.isFresh && (
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold bg-emerald-500 text-black rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Sarxil & Yangi
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Product Information */}
        <div className="md:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col justify-between">
          <div>
            {/* Origin & Rating */}
            <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full">
                {product.brand || product.origin}
              </span>
              <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                <span>{product.rating}</span>
                <span className="text-stone-500 font-normal">({product.reviewCount} ta sharh)</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
              {product.name}
            </h2>

            {/* Sub-label */}
            <p className="text-[11px] sm:text-xs text-stone-400 mt-1 font-medium">
              Hajmi / Og‘irligi: <strong className="text-stone-200">{product.weightOrVolume}</strong> • Birlik: {product.unit}
            </p>

            {/* Price Box */}
            <div className="my-3.5 sm:my-5 p-3 sm:p-4 bg-white/5 rounded-2xl border border-white/10 flex items-baseline gap-2.5 sm:gap-3 flex-wrap">
              <span className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-400 font-mono">
                {formatCurrency(product.price * quantity)}
              </span>
              {product.oldPrice && (
                <span className="text-xs sm:text-sm text-stone-500 line-through">
                  {formatCurrency(product.oldPrice * quantity)}
                </span>
              )}
              {quantity > 1 && (
                <span className="text-[10px] sm:text-xs text-stone-400 ml-auto font-mono">
                  ({formatCurrency(product.price)} / 1 {product.unit})
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-3.5 sm:mb-4">
              {product.description}
            </p>

            {/* Features metadata list */}
            <div className="grid grid-cols-2 gap-2 text-[11px] sm:text-xs mb-3.5 sm:mb-4">
              <div className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/5 text-stone-300">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Kelib chiqishi: <strong className="text-white">{product.origin}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/5 text-stone-300">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Saqlash: <strong className="text-white">{product.shelfLife}</strong></span>
              </div>
            </div>

            {/* Nutrition Facts if available */}
            {product.nutrition && (
              <div className="mb-3.5 sm:mb-4 p-3 sm:p-3.5 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 sm:mb-2 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-orange-400" />
                  <span>100g ozuqaviy qiymati:</span>
                </div>
                <div className="grid grid-cols-4 gap-1 sm:gap-1.5 text-center text-xs">
                  <div className="bg-black/40 p-1.5 sm:p-2 rounded-xl border border-white/5">
                    <span className="text-[9px] sm:text-[10px] text-stone-500 block">Kaloriya</span>
                    <strong className="text-stone-200 font-bold text-[11px] sm:text-xs">{product.nutrition.calories}</strong>
                  </div>
                  <div className="bg-black/40 p-1.5 sm:p-2 rounded-xl border border-white/5">
                    <span className="text-[9px] sm:text-[10px] text-stone-500 block">Oqsil</span>
                    <strong className="text-stone-200 font-bold text-[11px] sm:text-xs">{product.nutrition.protein}g</strong>
                  </div>
                  <div className="bg-black/40 p-1.5 sm:p-2 rounded-xl border border-white/5">
                    <span className="text-[9px] sm:text-[10px] text-stone-500 block">Yog‘</span>
                    <strong className="text-stone-200 font-bold text-[11px] sm:text-xs">{product.nutrition.fat}g</strong>
                  </div>
                  <div className="bg-black/40 p-1.5 sm:p-2 rounded-xl border border-white/5">
                    <span className="text-[9px] sm:text-[10px] text-stone-500 block">Uglevod</span>
                    <strong className="text-stone-200 font-bold text-[11px] sm:text-xs">{product.nutrition.carbs}g</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-3.5 sm:pt-4 border-t border-white/10 flex items-center gap-2 sm:gap-3">
            {/* Quantity Selector */}
            <div className="flex items-center bg-white/5 border border-white/15 rounded-xl sm:rounded-2xl p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1.5 sm:p-2 text-stone-300 hover:bg-white/10 rounded-lg sm:rounded-xl transition-colors cursor-pointer"
                aria-label="Kamaytirish"
              >
                <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <span className="w-7 sm:w-9 text-center font-mono font-black text-amber-300 text-xs sm:text-sm">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-1.5 sm:p-2 text-stone-300 hover:bg-white/10 rounded-lg sm:rounded-xl transition-colors cursor-pointer"
                aria-label="Ko'paytirish"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${
                inWishlist
                  ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'border-white/15 bg-white/5 text-stone-300 hover:text-rose-400'
              }`}
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${inWishlist ? 'fill-current' : ''}`} />
            </button>

            {/* Add to Cart button */}
            <button
              onClick={handleAdd}
              className="flex-1 py-3 sm:py-3.5 px-3 sm:px-4 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 active:scale-98 text-black rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shadow-xl shadow-orange-500/20 flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer uppercase tracking-wider whitespace-nowrap"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Savatga qo‘shish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
