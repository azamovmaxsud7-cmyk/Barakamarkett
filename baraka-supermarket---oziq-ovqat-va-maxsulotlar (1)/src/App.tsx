import React from 'react';
import { 
  StoreProvider, 
  useStore 
} from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { DailyDeals } from './components/DailyDeals';
import { MealKitsSection } from './components/MealKitsSection';
import { CategoriesScreen } from './components/CategoriesScreen';
import { BottomNavBar } from './components/BottomNavBar';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { WishlistModal } from './components/WishlistModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CourierPanelModal } from './components/courier/CourierPanelModal';
import { CatalogMegaMenu } from './components/CatalogMegaMenu';
import { BarakaClubModal } from './components/BarakaClubModal';
import { BranchDeliveryModal } from './components/BranchDeliveryModal';
import { InventoryAuditModal } from './components/inventory/InventoryAuditModal';

const AppContent: React.FC = () => {
  const { activeTab } = useStore();

  return (
    <div className="min-h-screen w-full max-w-full bg-[#07080b] text-[#f0f0f0] font-sans selection:bg-orange-500 selection:text-black flex flex-col justify-between relative overflow-x-hidden">
      {/* Ambient Glow Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-0">
        <div className="absolute top-[-100px] left-[-100px] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-orange-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-amber-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] right-[5%] w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-emerald-500/[0.05] blur-[130px] rounded-full" />
      </div>

      {/* Dynamic View based on Active Tab */}
      {activeTab === 'categories' ? (
        <CategoriesScreen />
      ) : (
        <>
          {/* Main Sticky Navbar on Home page */}
          <Navbar />

          <main className="w-full max-w-7xl mx-auto px-3 sm:px-5 md:px-6 pb-28 pt-2 sm:pt-4 space-y-4 sm:space-y-6 relative z-10 box-border">
            {/* 1. Daily Deals section with 7 products (1 per category) */}
            <DailyDeals />

            {/* 2. Ready Meal & Semi-finished food sets (Barak, somsa xamiri, etc.) */}
            <MealKitsSection />
          </main>
        </>
      )}

      {/* Persistent Bottom Navigation Bar */}
      <BottomNavBar />

      {/* Modals, Drawers & Supermarket Controls */}
      <CatalogMegaMenu />
      <BarakaClubModal />
      <BranchDeliveryModal />
      <ProductQuickViewModal />
      <CartDrawer />
      <CheckoutModal />
      <WishlistModal />
      <OrderSuccessModal />
      <AdminDashboard />
      <CourierPanelModal />
      <InventoryAuditModal />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
