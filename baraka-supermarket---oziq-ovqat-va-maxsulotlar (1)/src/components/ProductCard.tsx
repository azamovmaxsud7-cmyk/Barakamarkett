import React from 'react';
import { Heart, Plus, Minus, Eye, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatCurrency, formatDiscount } from '../utils/formatters';
import { sounds } from '../utils/audio';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    addToCart,
    updateQuantity,
    getCartItemQuantity,
    toggleWishlist,
    isInWishlist,
    openProductModal
  } = useStore();

  const quantity = getCartItemQuantity(product.id);
  const inWishlist = isInWishlist(product.id);
  const hasDiscount = Boolean(product.discountPercent || (product.oldPrice && product.oldPrice > product.price));

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playAddToCart();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
    addToCart(product, 1);
  };

  const handleMinus = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    updateQuantity(product.id, quantity - 1);
  };

  const handlePlus = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    addToCart(product, 1);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    toggleWishlist(product.id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileTap={{ scale: 0.98 }}
      className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#121622] hover:bg-[#161b2a] hover:border-orange-500/40 transition-all duration-200 overflow-hidden shadow-md hover:shadow-xl hover:shadow-orange-500/10 cursor-pointer"
      onClick={() => openProductModal(product)}
    >
      {/* Top Image area */}
      <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-black/40">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121622] via-transparent to-transparent opacity-60" />

        {/* Clean Discount Tag (No clutter!) */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 z-10">
            <span className="px-2 py-0.5 text-[10px] sm:text-xs font-black bg-rose-500 text-white rounded-lg shadow-md font-mono">
              {product.discountPercent ? formatDiscount(product.discountPercent) : 'Aksiya'}
            </span>
          </div>
        )}

        {/* Wishlist Heart Icon */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label="Sevimlilar"
          className={`absolute top-2 right-2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full backdrop-blur-md border transition-all flex items-center justify-center cursor-pointer ${
            inWishlist
              ? 'bg-rose-500 text-white border-rose-400 shadow-md'
              : 'bg-black/50 hover:bg-black/80 text-stone-300 hover:text-rose-400 border-white/15'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Content Details */}
      <div className="p-2.5 sm:p-3.5 flex flex-col justify-between flex-1 gap-2">
        <div>
          {/* Brand or Category */}
          <p className="text-[10px] sm:text-xs font-semibold text-orange-400/90 uppercase tracking-wider truncate">
            {product.brand || product.origin || 'Baraka'}
          </p>

          {/* Product Name */}
          <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug mt-0.5">
            {product.name}
          </h3>

          {/* Weight / Unit */}
          <p className="text-[11px] text-stone-400 mt-0.5 truncate">
            {product.weightOrVolume}
          </p>
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <div className={`text-xs xs:text-sm sm:text-base font-black font-mono truncate ${
              hasDiscount ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {formatCurrency(product.price)}
            </div>
            {product.oldPrice && product.oldPrice > product.price && (
              <div className="text-[10px] sm:text-xs text-stone-500 line-through truncate font-mono">
                {formatCurrency(product.oldPrice)}
              </div>
            )}
          </div>

          {/* Clean Cart Button or Stepper */}
          <div className="shrink-0" onClick={e => e.stopPropagation()}>
            {quantity === 0 ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={handleAdd}
                aria-label="Savatga qo'shish"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-stone-950 font-black flex items-center justify-center shadow-md shadow-orange-500/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </motion.button>
            ) : (
              <div className="flex items-center bg-white/10 border border-white/20 rounded-xl overflow-hidden shadow-sm h-7 sm:h-8">
                <button
                  type="button"
                  onClick={handleMinus}
                  className="w-6 sm:w-7 h-full text-stone-300 hover:bg-white/15 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                  aria-label="Kamaytirish"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-1.5 font-mono font-black text-xs text-amber-300 min-w-[18px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handlePlus}
                  className="w-6 sm:w-7 h-full text-stone-300 hover:bg-white/15 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                  aria-label="Ko'paytirish"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
