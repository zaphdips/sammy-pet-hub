"use client";

/**
 * AppShell — The Conditional UI Wrapper
 *
 * WHY: This component checks the current URL.
 * If the user is in /admin, it hides the public Navbar, Footer, and FAB.
 * This ensures the Admin Portal remains a clean, focused workspace.
 */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import VetSmartFAB from "@/components/VetSmartFAB";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider, useCart } from "@/context/CartContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { ToastProvider } from "@/components/Toast";
import styles from "./AppShell.module.css";

function ShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const { cart, isCartOpen, closeCart, openCart, removeFromCart } = useCart();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdminPage = pathname?.startsWith("/admin");
  const isPublicPage = pathname === "/about" || pathname === "/";

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (isAdminPage) {
    return <>{children}</>;
  }

  // If logged in, use the Dashboard Layout
  if (session && !isAdminPage && !isPublicPage) {
    return (
      <div className={styles.dashboardWrapper}>
        {/* Responsive Sidebar */}
        <div className={`${styles.sidebarContainer} ${isMobileSidebarOpen ? styles.mobileOpen : ''}`}>
           <DashboardSidebar />
        </div>
        
        {isMobileSidebarOpen && (
          <div className={styles.sidebarOverlay} onClick={() => setIsMobileSidebarOpen(false)}></div>
        )}

        <div className={styles.mainContent}>
          <DashboardHeader 
            onCartClick={openCart} 
            cartCount={cart.length} 
            onMenuClick={() => setIsMobileSidebarOpen(true)}
            userInitial={session?.user?.email?.charAt(0).toUpperCase() || "U"}
          />
          <main className={styles.mainScrollArea}>
             {children}
          </main>
        </div>
        <CartDrawer 
          isOpen={isCartOpen} 
          onClose={closeCart} 
          cart={cart} 
          onRemove={removeFromCart} 
        />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <CookieBanner />
      <VetSmartFAB />
    </>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <CurrencyProvider>
        <CartProvider>
          <ShellContent>{children}</ShellContent>
        </CartProvider>
      </CurrencyProvider>
    </ToastProvider>
  );
}
