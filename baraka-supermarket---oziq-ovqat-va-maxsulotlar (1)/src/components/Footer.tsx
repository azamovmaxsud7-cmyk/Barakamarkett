import React, { useState, useRef, useCallback } from 'react';
import { 
  PhoneCall, 
  MapPin, 
  Clock, 
  Mail, 
  Heart,
  Layers
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { useStore } from '../context/StoreContext';
import { CategoryId } from '../types';
import { sounds } from '../utils/audio';

export const Footer: React.FC = () => {
  const { setFilters, settings, setIsCourierPanelOpen, setIsCourierAuthenticated } = useStore();

  const [courierHoldProgress, setCourierHoldProgress] = useState(0);
  const [isHoldingCourier, setIsHoldingCourier] = useState(false);
  const courierHoldTimerRef = useRef<NodeJS.Timeout | null>(null);
  const courierProgressAnimRef = useRef<number | null>(null);
  const courierHoldStartTimeRef = useRef<number>(0);

  const HOLD_DURATION = 1400;

  const cancelCourierHold = useCallback(() => {
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
  }, []);

  const updateCourierProgress = useCallback(() => {
    if (!courierHoldStartTimeRef.current) return;
    const elapsed = Date.now() - courierHoldStartTimeRef.current;
    const progress = Math.min(100, Math.round((elapsed / HOLD_DURATION) * 100));
    setCourierHoldProgress(progress);

    if (elapsed < HOLD_DURATION) {
      courierProgressAnimRef.current = requestAnimationFrame(updateCourierProgress);
    }
  }, []);

  const handleCourierHoldStart = () => {
    setIsHoldingCourier(true);
    courierHoldStartTimeRef.current = Date.now();
    setCourierHoldProgress(0);

    courierProgressAnimRef.current = requestAnimationFrame(updateCourierProgress);

    courierHoldTimerRef.current = setTimeout(() => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 60, 100]);
      }
      sounds.playNotification();
      setIsCourierAuthenticated(false);
      setIsCourierPanelOpen(true);
      cancelCourierHold();
    }, HOLD_DURATION);
  };

  const handleCourierHoldEnd = () => {
    cancelCourierHold();
  };

  return (
    <footer className="mt-16 sm:mt-20 border-t border-white/10 bg-[#050505] text-stone-400 relative z-10 select-none">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand info */}
        <div>
          <div 
            onMouseDown={handleCourierHoldStart}
            onMouseUp={handleCourierHoldEnd}
            onMouseLeave={cancelCourierHold}
            onTouchStart={handleCourierHoldStart}
            onTouchEnd={handleCourierHoldEnd}
            onTouchCancel={cancelCourierHold}
            onContextMenu={(e) => e.preventDefault()}
            className={`inline-flex items-center gap-3 mb-4 cursor-pointer p-1.5 -m-1.5 rounded-2xl transition-all duration-200 ${
              isHoldingCourier ? 'bg-orange-500/15 ring-2 ring-orange-500/50 scale-102' : 'hover:opacity-90'
            }`}
            title="Baraka Market (Bosib turganda kuryer dasturi ochiladi)"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-300 flex items-center justify-center text-black font-black shadow-lg shadow-orange-500/20 shrink-0">
              <span className="text-xl font-black">B</span>
              {isHoldingCourier && (
                <div className="absolute -inset-1 rounded-xl border-2 border-dashed border-orange-400 animate-spin pointer-events-none" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-white tracking-tight">BARAKA</span>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full">
                  MARKET
                </span>
                {isHoldingCourier && courierHoldProgress > 10 && (
                  <span className="text-[10px] font-mono font-bold text-orange-400 bg-black/90 px-1.5 py-0.5 rounded-full border border-orange-500/40">
                    {courierHoldProgress}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed mb-4">
            O‘zbekiston bo‘ylab eng qulay, zamonaviy va tezkor onlayn supermarket boshqaruvi va do‘koni.
          </p>
          <div className="flex items-center gap-2 text-xs text-stone-300 font-mono">
            <PhoneCall className="w-4 h-4 text-orange-400" />
            <span>{settings.hotline}</span>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-400" />
            Bo‘limlar
          </h4>
          <ul className="space-y-2 text-xs">
            {CATEGORIES.map(cat => (
              <li key={cat.id}>
                <button
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      category: cat.id as CategoryId,
                      subcategory: 'all',
                      searchQuery: ''
                    }));
                    const smart = document.getElementById('smart-shopping-section');
                    if (smart) smart.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="hover:text-orange-400 transition-colors cursor-pointer flex items-center gap-2 text-stone-400"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
            Mijozlar uchun
          </h4>
          <ul className="space-y-2 text-xs text-stone-400">
            <li><a href="#" className="hover:text-white transition-colors">Yetkazib berish shartlari</a></li>
            <li><a href="#" className="hover:text-white transition-colors">To‘lov usullari (Naqd / Karta)</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Halol va sifat kafolati</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Ommaviy oferta</a></li>
          </ul>
        </div>

        {/* Contacts */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
            Biz bilan bog‘lanish
          </h4>
          <ul className="space-y-2.5 text-xs text-stone-400">
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{settings.address}</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span>info@barakamarket.uz</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Har kuni: {settings.workingHours}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/5 py-6 px-4 text-center text-xs text-stone-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Baraka Supermarket. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1 text-stone-400">
              <span>Muhabbat bilan tayyorlandi</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
