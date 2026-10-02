import React, { useEffect } from 'react';
import { 
  CheckCircle2, 
  ShoppingBag, 
  MapPin, 
  Clock, 
  Phone, 
  ArrowRight, 
  Sparkles, 
  Share2,
  Check
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/formatters';

export const OrderSuccessModal: React.FC = () => {
  const { lastOrder, isOrderSuccessOpen, setIsOrderSuccessOpen } = useStore();

  // Lock body scroll
  useEffect(() => {
    if (isOrderSuccessOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOrderSuccessOpen]);

  if (!isOrderSuccessOpen || !lastOrder) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#07080b]/98 sm:bg-black/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#0c0c0e] text-white rounded-3xl sm:rounded-4xl shadow-2xl border border-white/10 p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow behind the checkmark */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Success Icon */}
        <div className="relative z-10 w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 text-stone-950 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-emerald-500/30">
          <Check className="w-10 h-10 stroke-[3]" />
        </div>

        <div className="relative z-10">
          <span className="px-3.5 py-1 text-xs font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full inline-block mb-2">
            Buyurtma qabul qilindi!
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            Rahmat, {lastOrder.fullName}!
          </h2>

          <p className="text-xs sm:text-sm text-stone-400 mt-2 max-w-sm mx-auto leading-relaxed">
            Sizning buyurtmangiz <strong>#{lastOrder.orderId}</strong> qabul qilindi. Tez orada kuryerimiz siz bilan bog‘lanadi.
          </p>

          {/* Order Details Card */}
          <div className="my-6 p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-stone-400">Buyurtma raqami:</span>
              <span className="font-mono font-black text-orange-400">#{lastOrder.orderId}</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-stone-400">Yetkazish vaqti:</span>
              <span className="font-semibold text-stone-200">{lastOrder.timeSlot}</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-stone-400">To‘lov turi:</span>
              <span className="font-semibold uppercase text-stone-200">{lastOrder.paymentMethod}</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-stone-400">Manzil:</span>
              <span className="font-medium text-stone-200 text-right truncate max-w-[200px]">
                {lastOrder.address}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 text-sm font-black">
              <span className="text-stone-300 uppercase tracking-wider">Jami to‘lov:</span>
              <span className="text-emerald-400 font-mono text-base">{formatCurrency(lastOrder.totalAmount)}</span>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={() => setIsOrderSuccessOpen(false)}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-stone-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-300 transition-all cursor-pointer uppercase tracking-wider"
          >
            Xaridni davom ettirish
          </button>
        </div>
      </div>
    </div>
  );
};
