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
import { ToastProvider } from "@/components/Toast";

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
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "100vh",
        background: "var(--bg-primary, #0f172a)"
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: "3px solid rgba(255,255,255,0.1)",
          borderTopColor: "var(--primary-green, #22c55e)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (isAdminPage) {
    return <>{children}</>;
  }

  // If logged in, use the Dashboard Layout
  if (session && !isAdminPage && !isPublicPage) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>
        {/* Responsive Sidebar */}
        <div className={`sidebar-container ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
           <DashboardSidebar />
           {isMobileSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsMobileSidebarOpen(false)}></div>}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <DashboardHeader 
            onCartClick={openCart} 
            cartCount={cart.length} 
            onMenuClick={() => setIsMobileSidebarOpen(true)}
            userInitial={session?.user?.email?.charAt(0).toUpperCase() || "U"}
          />
          <main style={{ 
            flex: 1, 
            backgroundColor: "#f8fafc", 
            overflowY: "auto", 
            position: "relative",
            padding: "20px" 
          }}>
             {children}
          </main>
        </div>
        <CartDrawer 
          isOpen={isCartOpen} 
          onClose={closeCart} 
          cart={cart} 
          onRemove={removeFromCart} 
        />

        <style jsx>{`
          .sidebar-container {
            width: 280px;
            flex-shrink: 0;
            transition: all 0.3s;
          }
          @media (max-width: 1024px) {
            .sidebar-container {
              position: fixed;
              left: -280px;
              z-index: 2000;
              height: 100vh;
            }
            .sidebar-container.mobile-open {
              left: 0;
            }
            .sidebar-overlay {
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              background: rgba(0,0,0,0.4);
              backdrop-filter: blur(4px);
              z-index: -1;
            }
          }
        `}</style>
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
      <CartProvider>
        <ShellContent>{children}</ShellContent>
      </CartProvider>
    </ToastProvider>
  );
}
