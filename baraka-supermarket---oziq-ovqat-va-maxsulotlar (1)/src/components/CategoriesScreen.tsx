import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  ScanLine, 
  ChevronRight, 
  Sparkles, 
  X,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES } from '../data/categories';
import { CategoryId, Product } from '../types';
import { ProductCard } from './ProductCard';
import { sounds } from '../utils/audio';

export const CategoriesScreen: React.FC = () => {
  const { 
    setActiveTab, 
    products, 
    setFilters 
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Filter categories by search
  const filteredCategories = CATEGORIES.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.subcategories.some(sub => sub.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeCategoryObj = CATEGORIES.find(c => c.id === selectedCategory);

  // Filter products when inside a category
  const categoryProducts = selectedCategory 
    ? products.filter(p => {
        if (p.categoryId !== selectedCategory) return false;
        if (selectedSubcategory !== 'all' && p.subcategoryId !== selectedSubcategory) return false;
        if (searchQuery.trim()) {
          return p.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
      })
    : [];

  const handleCategoryClick = (catId: CategoryId) => {
    sounds.playClick();
    setSelectedCategory(catId);
    setSelectedSubcategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    sounds.playClick();
    if (selectedCategory) {
      setSelectedCategory(null);
      setSelectedSubcategory('all');
    } else {
      setActiveTab('home');
    }
  };

  const handleSimulateScan = () => {
    sounds.playNotification();
    setIsScanning(true);
    setScanMessage('Shtrix-kod skanerlanmoqda...');

    setTimeout(() => {
      setIsScanning(false);
      // Pick a popular product
      const sample = products[0];
      setScanMessage(`Topildi: ${sample.name}`);
      setTimeout(() => setScanMessage(null), 3000);
      setFilters(prev => ({
        ...prev,
        searchQuery: sample.name
      }));
      setActiveTab('home');
    }, 1200);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 md:px-6 pb-28 pt-2 sm:pt-4 text-white">
      {/* Top Header matching Screenshot 2 */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/10 active:scale-95 border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer"
            aria-label="Orqaga"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white">
              {activeCategoryObj ? activeCategoryObj.name : 'Mahsulot kategoriyalari'}
            </h1>
            <p className="text-xs text-stone-400">
              {activeCategoryObj 
                ? `${categoryProducts.length} ta saralangan mahsulot` 
                : `${CATEGORIES.length} ta asosiy bo‘lim`}
            </p>
          </div>
        </div>

        {/* Right Search toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSimulateScan}
            title="Shtrix-kod skaneri"
            className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/10 flex items-center justify-center text-orange-400 active:scale-95 transition-all cursor-pointer"
          >
            <ScanLine className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Barcode scanner notification banner */}
      <AnimatePresence>
        {scanMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 rounded-2xl bg-orange-500/20 border border-orange-500/40 text-amber-300 text-xs font-bold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 animate-spin text-orange-400" />
            <span>{scanMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Input with Barcode Scanner Icon inside right */}
      <div className="relative mb-5">
        <div className="relative flex items-center rounded-2xl border border-white/10 bg-[#121622] focus-within:border-orange-500/80 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all shadow-md">
          <Search className="w-5 h-5 text-stone-400 ml-4 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={activeCategoryObj ? `${activeCategoryObj.name} bo‘yicha qidirish...` : "Kategoriyalar bo‘yicha qidirish..."}
            className="w-full py-3 px-3 bg-transparent text-white text-sm focus:outline-hidden placeholder:text-stone-500"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1 mr-2 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSimulateScan}
              title="Shtrix-kodni skanerlash"
              className="p-2 mr-3 text-stone-400 hover:text-orange-400 active:scale-95 transition-colors cursor-pointer"
            >
              <ScanLine className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: CATEGORIES GRID (When no category is selected) */}
      {!selectedCategory && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredCategories.map(category => {
            const count = products.filter(p => p.categoryId === category.id).length || category.itemCount;
            return (
              <motion.div
                key={category.id}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryClick(category.id)}
                className="group relative bg-[#121623] hover:bg-[#171c2b] border border-white/10 hover:border-orange-500/40 rounded-2xl p-3 sm:p-4 flex flex-col justify-between transition-all cursor-pointer shadow-lg shadow-black/40 overflow-hidden"
              >
                {/* Background glow on hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 group-hover:bg-orange-500/10 blur-2xl rounded-full transition-all pointer-events-none" />

                {/* Category Image Box */}
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-black/40 border border-white/5">
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121623] via-transparent to-transparent opacity-80" />
                  
                  {/* Category Emoji Badge */}
                  <span className="absolute top-2 left-2 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-base shadow-sm">
                    {category.icon}
                  </span>
                </div>

                {/* Category Info */}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1 leading-snug">
                    {category.name}
                  </h3>
                  <div className="flex items-center justify-between mt-1 text-xs text-stone-400">
                    <span>{count} ta mahsulot</span>
                    <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: CATEGORY DETAIL & PRODUCTS (When a category is clicked) */}
      {selectedCategory && activeCategoryObj && (
        <div>
          {/* Subcategories Horizontal Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none no-scrollbar">
            {activeCategoryObj.subcategories.map(sub => (
              <button
                key={sub.id}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setSelectedSubcategory(sub.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedSubcategory === sub.id
                    ? 'bg-orange-500 text-black border-orange-400 font-bold shadow-md shadow-orange-500/20'
                    : 'bg-white/[0.04] text-stone-300 hover:text-white border-white/10 hover:border-white/20'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {categoryProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
              {categoryProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-stone-400">
              <p className="text-base font-medium">Ushbu toifada mahsulot topilmadi</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedSubcategory('all');
                  setSearchQuery('');
                }}
                className="mt-3 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Barcha toifalarni ko‘rsatish
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
