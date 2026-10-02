import { CategoryId, Product } from '../types';

export const DAILY_DEAL_CATEGORY_IDS: CategoryId[] = [
  'meva_sabzavot',
  'ichimliklar',
  'sut',
  'gosht',
  'non_qandolat',
  'baqqollik',
  'xojalik'
];

const DISCOUNT_TIERS = [15, 12, 14, 18, 15, 20, 16];

export const getDayOfYear = (date = new Date()): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

/**
 * Ensures that EVERY DAY, EXACTLY 1 product from each of the 7 categories receives a discount.
 * All other products are strictly sold at their standard regular price (no discounts, no old prices).
 * Total discounted products in the entire supermarket = EXACTLY 7.
 */
export const applyDailyCategoryDiscounts = (baseProducts: Product[], dayNumber = getDayOfYear()): Product[] => {
  // 1. Reset every product to its regular price (removing any hardcoded discount)
  const list: Product[] = baseProducts.map(p => {
    // If it had an oldPrice higher than price, the oldPrice was the regular selling price
    const regularPrice = p.oldPrice && p.oldPrice > p.price ? p.oldPrice : p.price;
    const { oldPrice, discountPercent, ...rest } = p;
    return {
      ...rest,
      price: regularPrice,
      oldPrice: undefined,
      discountPercent: undefined
    };
  });

  // 2. For each of the 7 categories, pick EXACTLY ONE product for the day
  DAILY_DEAL_CATEGORY_IDS.forEach((catId, catIndex) => {
    const catProducts = list.filter(p => p.categoryId === catId);
    if (catProducts.length === 0) return;

    // Deterministic selection based on current day number
    const selectedIdx = (dayNumber + catIndex * 3) % catProducts.length;
    const targetProduct = catProducts[selectedIdx];
    const discount = DISCOUNT_TIERS[catIndex % DISCOUNT_TIERS.length];

    const originalPrice = targetProduct.price;
    const discountedPrice = Math.round((originalPrice * (1 - discount / 100)) / 100) * 100;

    const masterIdx = list.findIndex(p => p.id === targetProduct.id);
    if (masterIdx !== -1) {
      list[masterIdx] = {
        ...targetProduct,
        oldPrice: originalPrice,
        price: discountedPrice,
        discountPercent: discount
      };
    }
  });

  return list;
};
