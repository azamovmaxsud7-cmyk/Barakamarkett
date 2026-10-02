import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Banknote, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ShoppingBag,
  Sparkles,
  ChevronRight,
  Award,
  Store,
  Zap,
  Gift
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PaymentMethod, DeliveryTimeSlot } from '../types';
import { formatCurrency } from '../utils/formatters';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    cartDiscount,
    deliveryFee,
    cartFinalTotal,
    appliedPromo,
    deliveryLocation,
    placeOrder,
    activeBranch,
    deliveryMode,
    loyaltyCard
  } = useStore();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [address, setAddress] = useState(deliveryLocation);
  const [landmark, setLandmark] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('payme');
  const [timeSlot, setTimeSlot] = useState<DeliveryTimeSlot>('tezkor');
  const [comment, setComment] = useState('');
  const [useBonusPoints, setUseBonusPoints] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Lock body scroll and handle ESC key
  useEffect(() => {
    if (isCheckoutOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsCheckoutOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isCheckoutOpen, setIsCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const pointsDeduction = useBonusPoints ? Math.min(loyaltyCard.pointsBalance, cartFinalTotal) : 0;
  const effectiveTotal = Math.max(0, cartFinalTotal - pointsDeduction);
  const cashbackEarned = Math.round(effectiveTotal * (loyaltyCard.cashbackPercent / 100));

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Ismingizni kiriting';
    if (!phone.trim() || phone.replace(/\D/g, '').length < 9) {
      newErrors.phone = 'To‘g‘ri telefon raqam kiriting';
    }
    if (deliveryMode === 'express' && !address.trim()) {
      newErrors.address = 'Yetkazish manzilini kiriting';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      placeOrder({
        fullName,
        phone,
        address: deliveryMode === 'pickup' ? `${activeBranch.name} (Olib ketish)` : address,
        landmark,
        paymentMethod,
        timeSlot,
        comment,
        usedBonusPoints: pointsDeduction
      });
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#07080b]/98 sm:bg-black/95 backdrop-blur-2xl flex items-center justify-center p-2.5 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0c0c0e] text-white rounded-3xl sm:rounded-4xl shadow-2xl border border-white/10 flex flex-col md:flex-row animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setIsCheckoutOpen(false)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Left column: Checkout form */}
        <div className="md:w-3/5 p-4 sm:p-6 md:p-8 overflow-y-auto">
          
          {/* Branch & Mode indicator */}
          <div className="mb-4 p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              {deliveryMode === 'express' ? (
                <Zap className="w-4 h-4 text-orange-400 shrink-0" />
              ) : (
                <Store className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <div>
                <span className="font-bold text-white block">
                  {deliveryMode === 'express' ? 'Supermarket Express Yetkazish' : 'Filialdan Olib Ketish'}
                </span>
                <span className="text-[11px] text-stone-400">
                  {activeBranch.name} • {activeBranch.deliveryTimeMinutes}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
              Ochiq 24/7
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold shrink-0">
              1
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-tight">
                Buyurtmani rasmiylashtirish
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-400">
                Kassaga bormasdan, eng yangi mahsulotlarni qabul qiling
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span>Ism va familiyangiz *</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Masalan: Sardor Alimov"
                className={`w-full px-3.5 py-2.5 bg-white/5 border rounded-xl text-xs sm:text-sm text-white focus:outline-hidden transition-all ${
                  errors.fullName ? 'border-rose-500' : 'border-white/10 focus:border-orange-500'
                }`}
              />
              {errors.fullName && <p className="text-[10px] text-rose-400 mt-1">{errors.fullName}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>Telefon raqamingiz *</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className={`w-full px-3.5 py-2.5 bg-white/5 border rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-hidden transition-all ${
                  errors.phone ? 'border-rose-500' : 'border-white/10 focus:border-orange-500'
                }`}
              />
              {errors.phone && <p className="text-[10px] text-rose-400 mt-1">{errors.phone}</p>}
            </div>

            {/* Delivery Address (If express) */}
            {deliveryMode === 'express' && (
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>Yetkazib berish manzili *</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Shahar, ko‘cha, uy raqami, xonadon..."
                  className={`w-full px-3.5 py-2.5 bg-white/5 border rounded-xl text-xs sm:text-sm text-white focus:outline-hidden transition-all ${
                    errors.address ? 'border-rose-500' : 'border-white/10 focus:border-orange-500'
                  }`}
                />
                {errors.address && <p className="text-[10px] text-rose-400 mt-1">{errors.address}</p>}
              </div>
            )}

            {/* Landmark & Comment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">Mo‘ljal (Ixtiyoriy)</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                  placeholder="Maktab yoki masjid yonida..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">Kuryer uchun izoh</label>
                <input
                  type="text"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Masalan: Domofon 45, eshik oldida..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-hidden focus:border-orange-500"
                />
              </div>
            </div>

            {/* Time Slot Selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>Yetkazish vaqti:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'tezkor', label: '⚡ Tezkor (20-30 daq)' },
                  { id: '09:00 - 13:00', label: '09:00 - 13:00' },
                  { id: '13:00 - 17:00', label: '13:00 - 17:00' },
                  { id: '17:00 - 21:00', label: '17:00 - 21:00' }
                ].map(slot => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setTimeSlot(slot.id as DeliveryTimeSlot)}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                      timeSlot === slot.id
                        ? 'bg-orange-500/20 border-orange-500 text-orange-300 shadow-md'
                        : 'bg-white/5 border-white/10 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                <span>To‘lov usulini tanlang:</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'payme', label: 'Payme', icon: '💳' },
                  { id: 'click', label: 'Click', icon: '📲' },
                  { id: 'cash', label: 'Naqd / Karta', icon: '💵' }
                ].map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === method.id
                        ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-orange-500 text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-stone-400 hover:text-white'
                    }`}
                  >
                    <span>{method.icon}</span>
                    <span>{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Loyalty Points deduction option */}
            {loyaltyCard.pointsBalance > 0 && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      <span>Baraka Club ballari bilan to‘lash</span>
                      <span className="text-amber-400">({formatCurrency(loyaltyCard.pointsBalance)})</span>
                    </div>
                    <span className="text-[10px] text-stone-400">
                      Balansingizdan {formatCurrency(Math.min(loyaltyCard.pointsBalance, cartFinalTotal))} chegiriladi
                    </span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  id="useBonusPoints"
                  checked={useBonusPoints}
                  onChange={e => setUseBonusPoints(e.target.checked)}
                  className="w-5 h-5 accent-amber-500 cursor-pointer rounded"
                />
              </div>
            )}

            {/* Mobile Submit Button */}
            <div className="pt-2 md:hidden">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-black font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all uppercase tracking-wider"
              >
                {isSubmitting ? (
                  <span>Rasmiylashtirilmoqda...</span>
                ) : (
                  <>
                    <span>Buyurtmani tasdiqlash • {formatCurrency(effectiveTotal)}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right column: Order Summary */}
        <div className="md:w-2/5 bg-white/[0.02] border-t md:border-t-0 md:border-l border-white/10 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                Buyurtmangiz tarkibi
              </h3>
              <span className="text-xs font-mono font-bold text-stone-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                {cart.length} xil mahsulot
              </span>
            </div>

            {/* Order Items Preview */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1 divide-y divide-white/5">
              {cart.map(item => (
                <div key={item.product.id} className="pt-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-stone-200 truncate">{item.product.name}</p>
                      <p className="text-[10px] text-stone-400">{item.quantity} × {formatCurrency(item.product.price)}</p>
                    </div>
                  </div>
                  <span className="font-black text-stone-200 font-mono shrink-0">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-4 border-t border-white/10 space-y-2 text-xs text-stone-400">
              <div className="flex justify-between">
                <span>Mahsulotlar narxi:</span>
                <span className="font-mono text-stone-200">{formatCurrency(cartSubtotal)}</span>
              </div>
              
              {cartDiscount > 0 && (
                <div className="flex justify-between text-rose-400 font-semibold">
                  <span>Chegirma (Promokod):</span>
                  <span className="font-mono">-{formatCurrency(cartDiscount)}</span>
                </div>
              )}

              {pointsDeduction > 0 && (
                <div className="flex justify-between text-amber-400 font-semibold">
                  <span>Baraka Club ballari:</span>
                  <span className="font-mono">-{formatCurrency(pointsDeduction)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Yetkazib berish:</span>
                <span className={`font-mono ${deliveryFee === 0 || deliveryMode === 'pickup' ? 'text-emerald-400 font-bold' : 'text-stone-200'}`}>
                  {deliveryFee === 0 || deliveryMode === 'pickup' ? 'BEPUL' : formatCurrency(deliveryFee)}
                </span>
              </div>

              {/* Cash Back Incentive */}
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-emerald-400 font-bold text-xs mt-3">
                <span className="flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5" />
                  Keshbek hisobingizga:
                </span>
                <span className="font-mono">+{formatCurrency(cashbackEarned)}</span>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white uppercase tracking-wider">Jami to‘lov:</span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {formatCurrency(effectiveTotal)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 hidden md:block">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 active:scale-98 text-black font-black text-sm rounded-2xl shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all uppercase tracking-wider"
            >
              {isSubmitting ? (
                <span>Rasmiylashtirilmoqda...</span>
              ) : (
                <>
                  <span>Buyurtmani tasdiqlash</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 mt-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Xavfsiz va kafolatlangan yetkazish</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
