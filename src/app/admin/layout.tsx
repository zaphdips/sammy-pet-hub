"use client";

/**
 * Modern Admin Layout (Overhaul)
 *
 * WHY: Replaces the basic sidebar with a high-end, icon-driven sidebar.
 * Uses Lucide icons and a structured layout for a "command center" feel.
 */

import { useEffect, useState } from "react";
import { supabase, checkIsAdmin } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Dog, 
  ShoppingBag, 
  BookOpen, 
  Users, 
  ArrowLeft,
  Settings,
  LogOut,
  Menu,
  X,
  Truck,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import styles from "./AdminLayout.module.css";
import { useSiteSettings } from "@/lib/useSiteSettings";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "authorized" | "unauthorized">("loading");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { settings } = useSiteSettings();
  const siteName = settings.site_name || "Pet Corner";
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function verifyAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/auth"); return; }
      const isAdmin = await checkIsAdmin();
      if (!isAdmin) { router.push("/?error=unauthorized"); return; }
      setStatus("authorized");
    }
    verifyAdmin();
  }, [router]);

  if (status === "loading") {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner}></div>
        <p>Initializing Secure Session...</p>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard",    icon: LayoutDashboard, path: "/admin" },
    { name: "Pets",         icon: Dog,             path: "/admin/pets" },
    { name: "Inventory",    icon: ShoppingBag,     path: "/admin/products" },
    { name: "Orders",       icon: Truck,           path: "/admin/orders" },
    { name: "Promotions",   icon: Megaphone,       path: "/admin/promotions" },
    { name: "Content",      icon: BookOpen,        path: "/admin/content" },
    { name: "Filters",      icon: Settings,        path: "/admin/filters" },
    { name: "Illness Guide",icon: BookOpen,        path: "/admin/illnesses" },
    { name: "Breed Info",   icon: Users,           path: "/admin/breeds" },
  ];

  return (
    <div className={styles.container}>
      {/* Mobile Toggle */}
      <button className={styles.mobileToggle} onClick={() => setSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoBox}>🐾</div>
          <div className={styles.headerText}>
            <h3>{siteName} Admin</h3>
            <span className={styles.statusBadge}>System Online</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path} 
              className={`${styles.navItem} ${pathname === item.path ? styles.active : ""}`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/admin/settings" className={styles.footerItem}>
            <Settings size={20} />
            <span>Settings</span>
          </Link>
          <Link href="/" className={styles.footerItem}>
            <ArrowLeft size={20} />
            <span>Main Site</span>
          </Link>
          <button onClick={() => supabase.auth.signOut().then(() => router.push("/"))} className={styles.logoutBtn}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className={styles.content}>
        <header className={styles.topBar}>
          <div className={styles.breadcrumb}>
            Admin / <span>{navItems.find(i => i.path === pathname)?.name || "Portal"}</span>
          </div>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>A</div>
          </div>
        </header>
        <div className={styles.pageBody}>
          {children}
        </div>
      </main>
    </div>
  );
}
