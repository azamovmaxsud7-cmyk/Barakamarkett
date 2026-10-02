export type CategoryId =
  | 'sut'
  | 'gosht'
  | 'meva_sabzavot'
  | 'ichimliklar'
  | 'non_qandolat'
  | 'baqqollik'
  | 'xojalik'
  | 'tozalik';

export interface SubCategory {
  id: string;
  name: string;
  icon?: string;
}

export interface Category {
  id: CategoryId;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  borderColor: string;
  badge: string;
  image: string;
  itemCount: number;
  subcategories: SubCategory[];
}

export interface NutritionInfo {
  calories: number; // kcal / 100g
  protein: number;  // g
  fat: number;      // g
  carbs: number;    // g
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Product {
  id: string;
  name: string;
  uzbekName?: string;
  categoryId: CategoryId;
  subcategoryId: string;
  price: number;
  oldPrice?: number;
  costPrice?: number; // Kelish / Tan narxi (Sklad hisobi va foyda uchun)
  sku?: string; // Tovar artikuli / shtrixkodi
  minStockAlert?: number; // Kam qolganini ogohlantirish
  lastAuditedAt?: string;
  unit: 'kg' | 'dona' | 'litr' | 'qadoq' | 'gramm' | "bog'";
  weightOrVolume?: string;
  image: string;
  gallery?: string[];
  description: string;
  origin: string;
  shelfLife: string;
  isFresh?: boolean;
  isHalal?: boolean;
  isOrganic?: boolean;
  isPopular?: boolean;
  discountPercent?: number;
  isYellowPrice?: boolean; // Korzinka signature "Sariq narx"
  cashbackPercent?: number; // e.g. 3%
  isBuyOneGetOne?: boolean; // 1+1
  isSupermarketChoice?: boolean; // Korzinka / Baraka Tanlovi
  stock: number;
  rating: number;
  reviewCount: number;
  nutrition?: NutritionInfo;
  brand?: string;
  barcode?: string;
}

export interface InventoryAuditItem {
  productId: string;
  productName: string;
  sku: string;
  expectedStock: number;
  actualStock: number;
  difference: number; // actual - expected (manfiy = kamomad/chiqim, musbat = ortiqcha/kirim)
  costPrice: number;
  price: number;
  lossOrGainValue: number; // difference * costPrice
}

export interface InventoryAuditSession {
  id: string;
  auditorName: string;
  auditorRole: string;
  branchId: string;
  branchName: string;
  createdAt: string;
  itemsCount: number;
  countedCount: number;
  discrepanciesCount: number;
  totalMissingQty: number;
  totalSurplusQty: number;
  totalFinancialDiscrepancy: number; // so'mda (kamomad yoki ortiqcha pul)
  items: InventoryAuditItem[];
  status: 'draft' | 'applied';
  note?: string;
}

export interface FinancialHealthMetrics {
  totalInventoryCostValue: number;
  totalInventoryRetailValue: number;
  potentialGrossProfit: number;
  grossMarginPercent: number;
  lossRiskValue: number;
  bankruptcySafetyScore: number; // 0 - 100%
  bankruptcyStatus: 'Xavfsiz (Barqaror)' | 'Ehtiyotkorlik zarur' | 'Xavfli (Bankrotlik xatari)';
  dangerProductsCount: number;
  deadStockValue: number;
  dailyRevenue: number;
  estimatedMonthlyNetProfit: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface MealKit {
  id: string;
  title: string;
  description: string;
  image: string;
  cookingTime: string;
  servings: string;
  difficulty: 'Oson' | "O'rta" | 'Murakkab';
  productIds: string[];
  discount: number; // % discount for bundle
}

export type SortOption =
  | 'popular'
  | 'price_asc'
  | 'price_desc'
  | 'discount'
  | 'rating'
  | 'name';

export type PaymentMethod = 'payme' | 'click' | 'uzum' | 'cash' | 'loyalty_points';

export type DeliveryTimeSlot = 'tezkor' | '09:00 - 12:00' | '13:00 - 17:00' | '18:00 - 22:00';

export type OrderStatus = 'Tayyorlanmoqda' | "Kuryer yo'lda" | 'Yetkazildi' | 'Bekor qilindi';

export type CourierVehicleType = 'motor' | 'car' | 'bike' | 'scooter' | 'damas';
export type CourierStatus = 'online' | 'busy' | 'offline';

export interface Courier {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  vehicleType: CourierVehicleType;
  vehicleName: string;
  vehiclePlate: string;
  status: CourierStatus;
  currentOrderId?: string;
  rating: number;
  completedDeliveriesToday: number;
  earningsToday: number;
  currentLocationName: string;
  speedKmh: number;
  batteryOrFuel: number; // %
  joinedDate: string;
}

export interface AutoDispatchSettings {
  autoAssignEnabled: boolean;
  autoDeliverySimEnabled: boolean;
  simulationSpeed: 'fast' | 'normal' | 'slow';
  perDeliveryFeeToCourier: number;
  soundAlertsEnabled: boolean;
}

export interface LoyaltyCard {
  cardNumber: string;
  holderName: string;
  pointsBalance: number;
  cashbackTier: 'Kumush (1%)' | 'Oltin (2%)' | 'Platina (3%)';
  cashbackPercent: number;
  totalSavings: number;
  qrCode: string;
  levelProgress: number; // 0-100% to next tier
}

export interface SupermarketBranch {
  id: string;
  name: string;
  city: string;
  address: string;
  deliveryTimeMinutes: string;
  distanceKm: number;
  isOpen: boolean;
  workingHours: string;
  isExpressAvailable: boolean;
  phone: string;
}

export interface FilterState {
  searchQuery: string;
  category: CategoryId | 'all';
  subcategory: string | 'all';
  minPrice: number;
  maxPrice: number;
  onlyDiscount: boolean;
  onlyYellowPrice?: boolean;
  onlyCashback?: boolean;
  onlyInStock: boolean;
  onlyHalal: boolean;
  sortBy: SortOption;
}

export interface OrderDetails {
  orderId: string;
  fullName: string;
  phone: string;
  address: string;
  landmark?: string;
  timeSlot: string;
  paymentMethod: PaymentMethod;
  comment?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  totalAmount: number;
  createdAt: string;
  status: OrderStatus;
  // Courier dispatch metadata
  courierId?: string;
  courierName?: string;
  courierPhone?: string;
  courierVehicle?: string;
  courierAvatar?: string;
  isAcceptedByCourier?: boolean;
  deliveryProgress?: number; // 0 to 100
  estimatedMinutes?: number;
  assignedAt?: string;
  completedAt?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercent: number;
  minOrderAmount: number;
  active: boolean;
  usageCount: number;
  description?: string;
}

export interface StoreSettings {
  storeName: string;
  hotline: string;
  workingHours: string;
  address: string;
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  announcementBanner: string;
  isOpen: boolean;
}
