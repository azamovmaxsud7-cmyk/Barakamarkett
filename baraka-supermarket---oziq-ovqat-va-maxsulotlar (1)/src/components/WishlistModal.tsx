import React, { useEffect } from 'react';
import { X, Heart, Trash2, ShoppingBag, Plus } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';

export const WishlistModal: React.FC = () => {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlist,
    products,
    toggleWishlist,
    addToCart,
    mobileGridCols
  } = useStore();

  // Lock body scroll and handle ESC key
  useEffect(() => {
    if (isWishlistOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsWishlistOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isWishlistOpen, setIsWishlistOpen]);

  if (!isWishlistOpen) return null;

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const handleAddAllToCart = () => {
    wishlistProducts.forEach(product => {
      addToCart(product, 1);
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#07080b]/98 sm:bg-black/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-[#09090b] text-white rounded-3xl sm:rounded-4xl shadow-2xl border border-white/10 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-tight">
                Sevimli Mahsulotlarim
              </h2>
              <span className="text-[11px] sm:text-xs text-stone-400">
                {wishlist.length} ta saqlangan mahsulot
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {wishlist.length > 0 && (
              <button
                onClick={handleAddAllToCart}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-400 text-black rounded-full text-xs font-black shadow-lg uppercase tracking-wider transition-transform hover:scale-105 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Barchasini savatga olish</span>
              </button>
            )}
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-2 sm:p-2.5 text-stone-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-[#050505]">
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-16 sm:py-20 px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-stone-500 border border-white/10">
                <Heart className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                Sevimli mahsulotlar ro‘yxati bo‘sh
              </h3>
              <p className="text-xs text-stone-400 max-w-xs mx-auto mb-6">
                Mahsulot kartochkalaridagi yurakcha belgisini bosib, o‘zingizga yoqqan mahsulotlarni bu yerda saqlang.
              </p>
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-400 text-black text-xs font-black rounded-full shadow-lg uppercase tracking-wider cursor-pointer"
              >
                Katalogga qaytish
              </button>
            </div>
          ) : (
            <div className={`grid ${
              mobileGridCols === 3 ? 'grid-cols-3' : 'grid-cols-2'
            } sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-3 md:gap-4`}>
              {wishlistProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
