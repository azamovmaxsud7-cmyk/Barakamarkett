import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sounds } from '../utils/audio';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  highlight: string;
  badge: string;
  badgeColor: string;
  image: string;
  buttonText: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Sarxil Sut & Tandir Nonlari',
    subtitle: 'Har kuni ertalab yangi pishgan Samarqand nonlari va tabiiy sut mahsulotlari.',
    highlight: '20% GACHA TEJOV',
    badge: 'Har kuni yangi',
    badgeColor: 'bg-amber-400 text-black',
    image: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Xarid qilish'
  },
  {
    id: 2,
    title: '100% Halol Go‘sht Mahsulotlari',
    subtitle: 'Yosh buzoq va qo‘y go‘shti, tovuq go‘shti va Samarqand qazisi 45 daqiqada.',
    highlight: 'HALOL SERTIFIKATLI',
    badge: '100% Halol',
    badgeColor: 'bg-red-500 text-white',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Buyurtma berish'
  },
  {
    id: 3,
    title: 'Quyoshli Bog‘lardan Meva-Sabzavotlar',
    subtitle: 'Namangan olmasi, Farg‘ona uzumi va sarxil meva-sabzavotlar daladan eshigingizgacha.',
    highlight: 'VITAMINLARGA BOY',
    badge: 'Organik & Yangi',
    badgeColor: 'bg-emerald-500 text-black',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Ko‘rish'
  }
];

export const HeroBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  const handleAction = () => {
    sounds.playClick();
    const smartSection = document.getElementById('smart-shopping-section');
    if (smartSection) {
      smartSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full max-w-full">
      {/* Main Carousel Promo Card */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#121622] border border-white/10 text-white shadow-xl transition-all group w-full">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={slide.id}
              src={slide.image}
              alt={slide.title}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.35, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full h-full object-cover object-center"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d1017] via-[#0d1017]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1017] via-transparent to-transparent" />
        </div>

        {/* Banner Content */}
        <div className="relative z-10 p-4 sm:p-7 md:p-8 flex flex-col justify-between min-h-[170px] sm:min-h-[260px] md:min-h-[290px]">
          <div>
            {/* Badges */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] sm:text-xs font-black uppercase tracking-wider ${slide.badgeColor} shadow-md flex items-center gap-1`}>
                <Sparkles className="w-3 h-3" />
                {slide.badge}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] sm:text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md text-amber-300 border border-white/15">
                {slide.highlight}
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-base sm:text-2xl md:text-3xl font-black tracking-tight text-white max-w-xl leading-tight">
              {slide.title}
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-lg leading-snug line-clamp-2">
              {slide.subtitle}
            </p>
          </div>

          {/* Action Row & Indicators */}
          <div className="pt-3 flex items-center justify-between gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAction}
              className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-stone-950 font-black text-xs sm:text-sm shadow-md shadow-orange-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>{slide.buttonText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>

            {/* Slide Indicators */}
            <div className="flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentSlide === idx ? 'w-5 bg-orange-500' : 'w-1.5 bg-white/20 hover:bg-white/50'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
