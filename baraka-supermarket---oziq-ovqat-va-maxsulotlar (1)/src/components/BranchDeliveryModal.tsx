import React, { useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Zap, 
  Store, 
  Check, 
  Phone, 
  Navigation, 
  ShieldCheck 
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SupermarketBranch } from '../types';

export const BranchDeliveryModal: React.FC = () => {
  const { 
    isBranchModalOpen, 
    setIsBranchModalOpen, 
    branches, 
    activeBranch, 
    setActiveBranch,
    deliveryMode,
    setDeliveryMode,
    deliveryLocation,
    setDeliveryLocation
  } = useStore();

  // Lock body scroll and ESC key
  useEffect(() => {
    if (isBranchModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsBranchModalOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isBranchModalOpen, setIsBranchModalOpen]);

  if (!isBranchModalOpen) return null;

  const handleSelectBranch = (branch: SupermarketBranch) => {
    setActiveBranch(branch);
    setDeliveryLocation(`${branch.city}, ${branch.name}`);
    setIsBranchModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Dark backdrop */}
      <div 
        onClick={() => setIsBranchModalOpen(false)}
        className="fixed inset-0 bg-[#07080b]/98 sm:bg-black/95 backdrop-blur-2xl transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-[#0e1015] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/90 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Supermarket Filiali & Yetkazish
              </h3>
              <p className="text-xs text-stone-400">
                Sizga eng yaqin filialni tanlang (20-30 daqiqa express yetkazish)
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsBranchModalOpen(false)}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Delivery Mode Toggle */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2.5 block">
              Xarid turini tanlang:
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setDeliveryMode('express')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  deliveryMode === 'express'
                    ? 'bg-orange-500/15 border-orange-500 text-white shadow-lg'
                    : 'bg-white/[0.03] border-white/10 text-stone-300 hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-400" />
                    <span className="font-bold text-sm">Express Yetkazish</span>
                  </div>
                  {deliveryMode === 'express' && <Check className="w-4 h-4 text-orange-400" />}
                </div>
                <span className="text-[11px] text-stone-400">
                  Eshigingizgacha 20 – 35 daqiqa
                </span>
              </button>

              <button
                onClick={() => setDeliveryMode('pickup')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  deliveryMode === 'pickup'
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg'
                    : 'bg-white/[0.03] border-white/10 text-stone-300 hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-sm">Filialdan olib ketish</span>
                  </div>
                  {deliveryMode === 'pickup' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <span className="text-[11px] text-stone-400">
                  Supermarketdan navbatsiz (0 so‘m)
                </span>
              </button>
            </div>
          </div>

          {/* Branches List */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2.5 block flex items-center justify-between">
              <span>Mavjud Supermarket Filiallari:</span>
              <span className="text-emerald-400 font-normal lowercase">{branches.length} ta filial ochiq</span>
            </span>

            <div className="space-y-2.5">
              {branches.map(branch => {
                const isSelected = activeBranch.id === branch.id;
                return (
                  <div
                    key={branch.id}
                    onClick={() => handleSelectBranch(branch)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 group ${
                      isSelected
                        ? 'bg-gradient-to-r from-orange-500/20 to-orange-500/5 border-orange-500/60 shadow-lg'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-orange-500 text-white' : 'bg-white/10 text-stone-300'
                      }`}>
                        <MapPin className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors truncate">
                            {branch.name}
                          </h4>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                            {branch.workingHours}
                          </span>
                        </div>

                        <p className="text-xs text-stone-400 mt-1 truncate">
                          {branch.address}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-[11px] text-stone-400">
                          <span className="flex items-center gap-1 text-amber-400 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            Yetkazish: {branch.deliveryTimeMinutes}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-stone-400">
                            <Navigation className="w-3 h-3" />
                            {branch.distanceKm} km masofa
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center group-hover:border-orange-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs text-stone-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Mahsulotlar har doim filialdan to‘g‘ridan-to‘g‘ri yangi teriladi</span>
          </span>
          <button
            onClick={() => setIsBranchModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-stone-200 transition-colors cursor-pointer"
          >
            Tanlash
          </button>
        </div>

      </div>
    </div>
  );
};
