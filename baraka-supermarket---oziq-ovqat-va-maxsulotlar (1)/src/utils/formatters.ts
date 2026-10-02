/**
 * Format a number into Uzbek So'm currency format (e.g. 12 500 so'm)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('uz-UZ').format(Math.round(amount)) + " so'm";
}

/**
 * Format percentage discount
 */
export function formatDiscount(percent?: number): string {
  if (!percent) return '';
  return `-${percent}%`;
}

/**
 * Calculate bundle savings
 */
export function calculateSavings(original: number, discounted: number): number {
  return Math.max(0, original - discounted);
}
