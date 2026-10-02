import React, { useRef, useState } from 'react';
import { Home, LayoutGrid } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { sounds } from '../utils/audio';

const HOLD_DURATION = 900; // 900ms hold to unlock courier panel

export const BottomNavBar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab,
    setIsCourierPanelOpen,
    setIsCourierAuthenticated
  } = useStore();

  const [holdingTab, setHoldingTab] = useState<'home' | 'categories' | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const didTriggerHoldRef = useRef(false);

  const startHold = (tab: 'home' | 'categories') => {
    didTriggerHoldRef.current = false;
    setHoldingTab(tab);
    setHoldProgress(0);

    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / HOLD_DURATION) * 100));
      setHoldProgress(pct);
    }, 25);

    holdTimerRef.current = setTimeout(() => {
      didTriggerHoldRef.current = true;
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setHoldingTab(null);
      setHoldProgress(0);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 60, 100]);
      }
      sounds.playNotification();
      setIsCourierAuthenticated(false);
      setIsCourierPanelOpen(true);
    }, HOLD_DURATION);
  };

  const endHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setHoldingTab(null);
    setHoldProgress(0);
  };

  const handleTabClick = (tab: 'home' | 'categories') => {
    // If long press has already triggered, suppress normal tab switch
    if (didTriggerHoldRef.current) {
      didTriggerHoldRef.current = false;
      return;
    }
    sounds.playClick();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav 
      aria-label="Pastki navigatsiya" 
      className="fixed bottom-0 sm:bottom-4 left-0 sm:left-1/2 sm:-translate-x-1/2 right-0 sm:right-auto z-40 bg-[#090c13]/95 backdrop-blur-2xl border-t sm:border border-white/10 px-4 sm:px-8 py-2 pb-safe sm:py-2.5 sm:rounded-2xl transition-all shadow-[0_-10px_25px_rgba(0,0,0,0.5)] sm:shadow-2xl select-none"
    >
      <div className="w-full sm:w-auto max-w-sm sm:min-w-[260px] mx-auto grid grid-cols-2 items-center gap-6 sm:gap-10">
        {/* 1. Bosh sahifa (bosib tursa kuryer paneliga kirish PIN-kodi ochiladi) */}
        <button
          type="button"
          onClick={() => handleTabClick('home')}
          onMouseDown={() => startHold('home')}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onTouchStart={() => startHold('home')}
          onTouchEnd={endHold}
          onTouchCancel={endHold}
          onContextMenu={(e) => e.preventDefault()}
          className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer relative select-none ${
            activeTab === 'home' ? 'text-orange-500 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
          title="Bosh sahifa (bosib tursangiz Kuryer kodi ochiladi)"
        >
          <div className="relative">
            <Home className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${activeTab === 'home' ? 'scale-110' : ''}`} />
            
            {/* Long-press animated ring */}
            {holdingTab === 'home' && (
              <div className="absolute -inset-2 rounded-full border-2 border-dashed border-emerald-400 animate-spin pointer-events-none" />
            )}

            {activeTab === 'home' && (
              <motion.div 
                layoutId="active-nav-dot" 
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full" 
              />
            )}
          </div>
          <span className="text-[11px] sm:text-xs mt-1 tracking-tight truncate">
            {holdingTab === 'home' && holdProgress > 20 ? `${holdProgress}%` : 'Bosh sahifa'}
          </span>
        </button>

        {/* 2. Kategoriyalar (bosib tursa kuryer paneliga kirish PIN-kodi ochiladi) */}
        <button
          type="button"
          onClick={() => handleTabClick('categories')}
          onMouseDown={() => startHold('categories')}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onTouchStart={() => startHold('categories')}
          onTouchEnd={endHold}
          onTouchCancel={endHold}
          onContextMenu={(e) => e.preventDefault()}
          className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer relative select-none ${
            activeTab === 'categories' ? 'text-orange-500 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
          title="Kategoriyalar (bosib tursangiz Kuryer kodi ochiladi)"
        >
          <div className="relative">
            <LayoutGrid className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${activeTab === 'categories' ? 'scale-110' : ''}`} />
            
            {/* Long-press animated ring */}
            {holdingTab === 'categories' && (
              <div className="absolute -inset-2 rounded-full border-2 border-dashed border-emerald-400 animate-spin pointer-events-none" />
            )}

            {activeTab === 'categories' && (
              <motion.div 
                layoutId="active-nav-dot" 
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full" 
              />
            )}
          </div>
          <span className="text-[11px] sm:text-xs mt-1 tracking-tight truncate">
            {holdingTab === 'categories' && holdProgress > 20 ? `${holdProgress}%` : 'Kategoriyalar'}
          </span>
        </button>
      </div>
    </nav>
  );
};
