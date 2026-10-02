import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Lock, Delete, X, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sounds } from '../../utils/audio';

interface CourierPinLockProps {
  onSuccess: () => void;
  onClose: () => void;
}

const CORRECT_PIN = '0254';

export const CourierPinLock: React.FC<CourierPinLockProps> = ({ onSuccess, onClose }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleKeyPress = useCallback((digit: string) => {
    if (pin.length < 4) {
      sounds.playClick();
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);
      setErrorMessage('');

      if (newPin.length === 4) {
        if (newPin === CORRECT_PIN) {
          sounds.playSuccess();
          setTimeout(() => {
            onSuccess();
          }, 200);
        } else {
          sounds.playRemove();
          setError(true);
          setErrorMessage("Noto'g'ri PIN-kod! Qaytadan urinib ko'ring");
          setTimeout(() => {
            setPin('');
          }, 700);
        }
      }
    }
  }, [pin, onSuccess]);

  const handleDelete = () => {
    sounds.playClick();
    setPin(prev => prev.slice(0, -1));
    setError(false);
    setErrorMessage('');
  };

  const handleClear = () => {
    sounds.playClick();
    setPin('');
    setError(false);
    setErrorMessage('');
  };

  // Physical keyboard listener
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow || '';
    };
  }, [handleKeyPress, onClose]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#07080b] sm:bg-black/95 backdrop-blur-2xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-[#0e1017] border border-white/10 rounded-3xl w-full max-w-sm p-6 sm:p-7 flex flex-col items-center shadow-2xl relative text-stone-200"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon Header */}
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
            <KeyRound className="w-8 h-8 animate-pulse" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-black text-white text-center tracking-tight">
            Kuryer Paneli Himoyasi
          </h3>
          <p className="text-xs text-stone-400 text-center mt-1 mb-5">
            Tizimga kirish uchun 4 xonali PIN-kodni kiriting
          </p>

          {/* PIN Indicators (4 dots) */}
          <div className="flex items-center justify-center gap-3.5 mb-5">
            {[0, 1, 2, 3].map(index => {
              const isFilled = pin.length > index;
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    error
                      ? 'bg-rose-500 ring-4 ring-rose-500/30 scale-110 animate-bounce'
                      : isFilled
                      ? 'bg-emerald-400 ring-4 ring-emerald-400/30 scale-110 shadow-lg shadow-emerald-500/50'
                      : 'bg-white/10 border border-white/20'
                  }`}
                />
              );
            })}
          </div>

          {/* Error message */}
          {errorMessage && (
            <p className="text-xs text-rose-400 font-bold mb-3 animate-in fade-in">
              {errorMessage}
            </p>
          )}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 w-full max-w-[260px] mb-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyPress(digit)}
                className="h-12 rounded-2xl bg-white/5 hover:bg-emerald-500/20 active:bg-emerald-500/30 border border-white/10 hover:border-emerald-500/30 text-white font-mono font-black text-lg transition-all flex items-center justify-center cursor-pointer select-none active:scale-95"
              >
                {digit}
              </button>
            ))}

            {/* Clear button */}
            <button
              type="button"
              onClick={handleClear}
              className="h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white font-bold text-xs transition-all flex items-center justify-center cursor-pointer select-none active:scale-95"
            >
              C
            </button>

            {/* 0 */}
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-12 rounded-2xl bg-white/5 hover:bg-emerald-500/20 active:bg-emerald-500/30 border border-white/10 hover:border-emerald-500/30 text-white font-mono font-black text-lg transition-all flex items-center justify-center cursor-pointer select-none active:scale-95"
            >
              0
            </button>

            {/* Backspace */}
            <button
              type="button"
              onClick={handleDelete}
              className="h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-all flex items-center justify-center cursor-pointer select-none active:scale-95"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Security Subtitle */}
          <div className="w-full pt-4 border-t border-white/5 flex items-center justify-center text-[11px] text-stone-500">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-500/70" />
              <span>Himoyalangan xizmat tizimi (Demo: 0254)</span>
            </span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
