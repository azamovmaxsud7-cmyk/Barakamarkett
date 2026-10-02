import React, { useEffect, useState } from 'react';
import { 
  X, 
  CreditCard, 
  Sparkles, 
  QrCode, 
  Copy, 
  Check, 
  Award, 
  ArrowUpRight, 
  ShieldCheck, 
  Coins, 
  Gift
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/formatters';

export const BarakaClubModal: React.FC = () => {
  const { 
    isLoyaltyModalOpen, 
    setIsLoyaltyModalOpen, 
    loyaltyCard,
    setIsCartOpen
  } = useStore();

  const [copied, setCopied] = useState(false);

  // Lock body scroll and ESC listener
  useEffect(() => {
    if (isLoyaltyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsLoyaltyModalOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isLoyaltyModalOpen, setIsLoyaltyModalOpen]);

  if (!isLoyaltyModalOpen) return null;

  const handleCopyCardNumber = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(loyaltyCard.cardNumber.replace(/\s+/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Dark backdrop */}
      <div 
        onClick={() => setIsLoyaltyModalOpen(false)}
        className="fixed inset-0 bg-[#07080b]/98 sm:bg-black/95 backdrop-blur-2xl transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#0e1015] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/90 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Baraka Club Plus
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-black">
                  {loyaltyCard.cashbackTier}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Supermarket sodiqlik dasturi & Keshbek
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLoyaltyModalOpen(false)}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Virtual Supermarket Loyalty Card */}
          <div className="relative rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-amber-600 via-orange-600 to-amber-900 text-white shadow-2xl shadow-orange-950/50 border border-amber-400/30 overflow-hidden">
            {/* Background texture & shapes */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-black/20 rounded-full blur-xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col justify-between h-44 sm:h-48">
              {/* Card top */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg sm:text-xl font-black tracking-tight">BARAKA</span>
                    <span className="px-1.5 py-0.2 text-[9px] font-black uppercase tracking-widest bg-black text-amber-400 rounded">
                      PLUS
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-200/80 font-medium tracking-wide">
                    Supermarket VIP Sodiqlik Kartasi
                  </span>
                </div>

                {/* Golden Chip */}
                <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-200 via-yellow-100 to-amber-400 border border-amber-500/50 shadow-inner flex items-center justify-center">
                  <div className="w-8 h-5 border border-amber-600/30 rounded flex flex-col justify-around py-0.5 px-1">
                    <div className="w-full h-0.5 bg-amber-600/30" />
                    <div className="w-full h-0.5 bg-amber-600/30" />
                  </div>
                </div>
              </div>

              {/* Card Number */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-base sm:text-lg tracking-widest font-bold text-white/95 drop-shadow">
                  {loyaltyCard.cardNumber}
                </span>
                <button
                  onClick={handleCopyCardNumber}
                  title="Karta raqamini nusxalash"
                  className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-amber-200 hover:text-white transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Card bottom: Name & Tier */}
              <div className="flex items-end justify-between border-t border-white/15 pt-2.5">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-amber-200/70 block">
                    Karta egasi
                  </span>
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                    {loyaltyCard.holderName}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-widest text-amber-200/70 block">
                    Keshbek stavkasi
                  </span>
                  <span className="text-xs sm:text-sm font-black bg-black/30 px-2 py-0.5 rounded-md border border-white/10">
                    +{loyaltyCard.cashbackPercent}% Har xariddan
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Balance & Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2 text-stone-400 text-xs mb-1">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>To‘plangan ballar</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-400">
                {formatCurrency(loyaltyCard.pointsBalance)}
              </div>
              <span className="text-[10px] text-stone-400">
                1 ball = 1 so‘m (To‘lovda ishlatish mumkin)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2 text-stone-400 text-xs mb-1">
                <Gift className="w-4 h-4 text-emerald-400" />
                <span>Jami tejalgan summa</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">
                {formatCurrency(loyaltyCard.totalSavings)}
              </div>
              <span className="text-[10px] text-stone-400">
                Aksiya va keshbeklar hisobiga
              </span>
            </div>
          </div>

          {/* QR Code For In-Store Supermarket Checkout */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-lg">
                <QrCode className="w-10 h-10 text-black" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  Supermarket kassasida skanerlang
                </h4>
                <p className="text-[11px] text-stone-400">
                  Offlayn xarid qilganda ushbu QR kodni kassirga ko‘rsating
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20 whitespace-nowrap">
              Faol
            </span>
          </div>

          {/* Tier Progress Bar */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-stone-300 font-medium">Platina (3% keshbek) darajasigacha:</span>
              <span className="font-mono font-bold text-amber-400">{loyaltyCard.levelProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${loyaltyCard.levelProgress}%` }}
              />
            </div>
            <span className="text-[10px] text-stone-400 mt-2 block">
              Yana 150 000 so‘mlik xarid qiling va 3% keshbek darajasiga chiqing!
            </span>
          </div>

          {/* How to use */}
          <div className="space-y-2 pt-1 text-xs text-stone-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Har bir onlayn va offlayn buyurtmadan 2% avtomatik qaytariladi</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Ballar bilan butun savatcha narxining 100% gacha to‘lash mumkin</span>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between gap-3">
          <span className="text-xs text-stone-400">
            Balansingiz: <strong className="text-amber-400">{formatCurrency(loyaltyCard.pointsBalance)}</strong>
          </span>
          <button
            onClick={() => {
              setIsLoyaltyModalOpen(false);
              setIsCartOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-orange-500/20"
          >
            <span>Savatchada ishlatish</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
