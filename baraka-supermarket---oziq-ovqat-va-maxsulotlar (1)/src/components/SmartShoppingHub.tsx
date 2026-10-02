import React, { useState } from 'react';
import { 
  ArrowUpDown, 
  X
} from 'lucide-react';
import { Product, SortOption } from '../types';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { sounds } from '../utils/audio';

export const SmartShoppingHub: React.FC = () => {
  const { 
    products, 
    filters, 
    setFilters, 
    resetFilters
  } = useStore();

  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Filter products for home page
  const getFilteredProducts = (): Product[] => {
    let list = [...products];

    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );
    }

    if (filters.onlyDiscount) {
      list = list.filter(p => (p.discountPercent && p.discountPercent > 0) || p.oldPrice);
    }

    // Sort products
    return list.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'discount':
          return (b.discountPercent || 0) - (a.discountPercent || 0);
        case 'popular':
        default:
          return (b.reviewCount || 0) - (a.reviewCount || 0);
      }
    });
  };

  const filteredProducts = getFilteredProducts();
  const displayedProducts = filteredProducts.slice(0, visibleCount);

  return (
    <section className="py-2 sm:py-4 w-full" id="smart-shopping-section">
      {/* Header with Title and Sorting */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-base sm:text-xl font-black text-white tracking-tight">
            Ommabop mahsulotlar
          </h2>
          <p className="text-[11px] text-stone-400">
            {filteredProducts.length} ta mahsulot
          </p>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={e => {
                sounds.playClick();
                setFilters(prev => ({ ...prev, sortBy: e.target.value as SortOption }));
              }}
              className="appearance-none bg-[#121622] text-stone-300 text-xs font-semibold py-1.5 pl-3 pr-7 rounded-xl border border-white/10 focus:outline-hidden focus:border-orange-500 cursor-pointer"
            >
              <option value="popular">Ommabop</option>
              <option value="price_asc">Avval arzon</option>
              <option value="price_desc">Avval qimmat</option>
              <option value="discount">Chegirmali</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setFilters(prev => ({ ...prev, searchQuery: '' }));
              }}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-300 hover:text-white transition-colors cursor-pointer"
              title="Qidiruvni tozalash"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Products Grid - 2 columns on mobile */}
      {displayedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
          {displayedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-stone-400">
          <p className="text-sm font-medium">Mahsulot topilmadi</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-2 px-3 py-1.5 bg-orange-500 text-black rounded-xl text-xs font-bold cursor-pointer"
          >
            Barchasini ko‘rish
          </button>
        </div>
      )}

      {/* Show more button */}
      {displayedProducts.length < filteredProducts.length && (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setVisibleCount(prev => prev + 10);
            }}
            className="px-6 py-2.5 rounded-xl bg-[#121622] hover:bg-[#181d2a] border border-white/10 text-stone-200 hover:text-white text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            Yana ko‘rsatish (+{Math.min(10, filteredProducts.length - displayedProducts.length)})
          </button>
        </div>
      )}
    </section>
  );
};
