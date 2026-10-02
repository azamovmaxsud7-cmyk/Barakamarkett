import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  Tag, 
  Sparkles, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/formatters';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartSubtotal,
    cartDiscount,
    deliveryFee,
    cartFinalTotal,
    freeDeliveryThreshold,
    remainingForFreeDelivery,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    setIsCheckoutOpen,
    products,
    addToCart
  } = useStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Lock body scroll and handle ESC key
  useEffect(() => {
    if (isCartOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsCartOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    if (res.success) {
      setPromoMessage({ text: res.message, isError: false });
      setPromoInput('');
    } else {
      setPromoMessage({ text: res.message, isError: true });
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Upsell suggestion: pick 2 items not in cart
  const cartIds = cart.map(i => i.product.id);
  const upsellItems = products.filter(p => !cartIds.includes(p.id)).slice(0, 3);

  const freeDeliveryPercent = Math.min(100, Math.round((cartSubtotal / freeDeliveryThreshold) * 100));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop click to close */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#07080b]/98 sm:bg-black/95 backdrop-blur-2xl cursor-pointer" 
          onClick={() => setIsCartOpen(false)} 
        />

        {/* Drawer Container */}
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md sm:max-w-lg bg-[#09090b] text-white h-full shadow-2xl flex flex-col z-10 overflow-hidden border-l border-white/10"
          onClick={e => e.stopPropagation()}
        >
          {/* Top Header */}
          <div className="p-3.5 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                  Xaridlar Savatchasi
                </h2>
                <span className="text-xs text-stone-400 font-medium">
                  {cart.length} xil mahsulot tanlangan
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-400 hover:text-rose-300 p-2 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                  title="Savatchani tozalash"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Free Delivery Progress Bar */}
          <div className="px-4 sm:px-5 py-3 bg-emerald-950/30 border-b border-emerald-500/20">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-300 mb-1.5">
              <span className="flex items-center gap-1.5 text-[11px] sm:text-xs">
                <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                {remainingForFreeDelivery === 0 ? (
                  <strong className="text-emerald-400">Yetkazib berish BEPUL! 🎉</strong>
                ) : (
                  <span>
                    Yana <strong className="text-white">{formatCurrency(remainingForFreeDelivery)}</strong> lik xarid qiling
                  </span>
                )}
              </span>
              <span className="font-mono text-emerald-400 font-bold text-xs">{freeDeliveryPercent}%</span>
            </div>

            {/* Progress track */}
            <div className="h-1.5 sm:h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${freeDeliveryPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 divide-y divide-white/5 scrollbar-thin">
            {cart.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-500 border border-white/10">
                  <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1">Savatchangiz bo‘sh</h3>
                <p className="text-xs text-stone-400 max-w-xs mx-auto mb-6 leading-relaxed">
                  Katalogdan kerakli oziq-ovqat mahsulotlarini tanlang va savatchaga qo‘shing.
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-400 text-black rounded-full text-xs font-black shadow-lg shadow-orange-500/20 uppercase tracking-wider cursor-pointer"
                >
                  Xaridni boshlash
                </motion.button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {cart.map(item => (
                  <div key={item.product.id} className="pt-3 flex gap-3 items-center">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover border border-white/10 shrink-0 bg-black/40"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-stone-100 leading-snug truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {item.product.weightOrVolume} • {formatCurrency(item.product.price)}
                      </p>
                      <div className="text-xs sm:text-sm font-black text-emerald-400 mt-0.5 font-mono">
                        {formatCurrency(item.product.price * item.quantity)}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center bg-white/5 rounded-xl p-0.5 border border-white/10 shrink-0">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-mono font-black text-xs text-amber-300">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-stone-500 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Upsell mini recommendations */}
                {upsellItems.length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest block mb-2.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                      Birga xarid qilishadi:
                    </span>
                    <div className="space-y-2">
                      {upsellItems.map(p => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-8 h-8 rounded-lg object-cover border border-white/10"
                            />
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-stone-200 truncate">{p.name}</p>
                              <p className="text-[10px] text-emerald-400 font-mono font-bold">{formatCurrency(p.price)}</p>
                            </div>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => addToCart(p, 1)}
                            className="px-2.5 py-1 bg-white/10 border border-white/15 hover:border-orange-500/50 text-stone-200 hover:text-orange-400 rounded-lg text-[10px] font-bold transition-colors shrink-0 cursor-pointer"
                          >
                            + Qo‘shish
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cart.length > 0 && (
            <div className="p-3.5 sm:p-5 border-t border-white/10 bg-[#050505] shrink-0 space-y-3">
              {/* Promo code form */}
              {appliedPromo ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <span className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-emerald-400" />
                    Promokod: <strong className="text-white">{appliedPromo.code}</strong> (-{appliedPromo.discountPercent}%)
                  </span>
                  <button
                    onClick={removePromoCode}
                    className="text-rose-400 hover:underline text-xs cursor-pointer font-bold"
                  >
                    O‘chirish
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={promoInput}
                      onChange={e => {
                        setPromoInput(e.target.value);
                        setPromoMessage(null);
                      }}
                      placeholder="Promokod: BARAKA2026"
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-stone-500 focus:outline-hidden focus:border-orange-500 uppercase"
                    />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Qo‘llash
                  </motion.button>
                </form>
              )}

              {promoMessage && (
                <p
                  className={`text-[11px] font-medium flex items-center gap-1.5 ${
                    promoMessage.isError ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {promoMessage.isError ? <AlertCircle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                  {promoMessage.text}
                </p>
              )}

              {/* Calculations Breakdown */}
              <div className="space-y-1 text-xs text-stone-400 pt-0.5">
                <div className="flex justify-between">
                  <span>Mahsulotlar summasi:</span>
                  <span className="font-semibold text-stone-200 font-mono">{formatCurrency(cartSubtotal)}</span>
                </div>

                {cartDiscount > 0 && (
                  <div className="flex justify-between text-rose-400 font-semibold">
                    <span>Chegirma (Promokod):</span>
                    <span className="font-mono">-{formatCurrency(cartDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Yetkazib berish:</span>
                  <span className={`font-semibold font-mono ${deliveryFee === 0 ? 'text-emerald-400' : 'text-stone-200'}`}>
                    {deliveryFee === 0 ? 'BEPUL' : formatCurrency(deliveryFee)}
                  </span>
                </div>

                <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-amber-300 font-bold text-[11px]">
                  <span>⭐ Baraka Club ball:</span>
                  <span className="font-mono">+{formatCurrency(Math.round(cartFinalTotal * 0.02))}</span>
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                  <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Jami to‘lov:</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                    {formatCurrency(cartFinalTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleProceedToCheckout}
                className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-black rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-colors cursor-pointer uppercase tracking-wider"
              >
                <span>Buyurtmani rasmiylashtirish</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
