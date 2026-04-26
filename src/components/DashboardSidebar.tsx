"use client";

/**
 * Dashboard Sidebar
 * 
 * WHY: Provides a persistent 'Menu Trajectory' for the Member Dashboard.
 * Helps users navigate quickly between different shop categories and profile sections.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Dog, 
  ShoppingBag, 
  Pill, 
  Heart, 
  ClipboardList, 
  User, 
  Settings,
  Info
} from "lucide-react";
import styles from "./DashboardSidebar.module.css";

const menuItems = [
  { name: "Marketplace", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Pet Sales", icon: Dog, path: "/adoption" },
  { name: "The Shop", icon: ShoppingBag, path: "/shop" },
  { name: "Medication", icon: Pill, path: "/shop?category=medication" },
  { name: "Mating Match", icon: Heart, path: "/mating" },
  { name: "My Orders", icon: ClipboardList, path: "/profile/orders" },
  { name: "My Profile", icon: User, path: "/profile" },
  { name: "About Us", icon: Info, path: "/about" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span>🐾 Sammy Hub</span>
      </div>

      <nav className={styles.nav}>
        <div className={styles.label}>Platform Menu</div>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path} 
              className={`${styles.navLink} ${isActive ? styles.active : ""}`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <Link href="/profile/settings" className={styles.settingsBtn}>
          <Settings size={18} />
          <span>Account Settings</span>
        </Link>
      </div>
    </aside>
  );
}
