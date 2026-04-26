"use client";

import { ShoppingCart, Bell, Search, Menu } from "lucide-react";
import styles from "./DashboardHeader.module.css";

export default function DashboardHeader({ onCartClick, cartCount, onMenuClick, userInitial = "U" }: { 
  onCartClick: () => void, 
  cartCount: number,
  onMenuClick: () => void,
  userInitial?: string
}) {
  return (
    <header className={styles.header}>
      <button className={styles.menuBtn} onClick={onMenuClick}>
        <Menu size={24} />
      </button>

      <div className={styles.searchBar}>
        <Search size={18} className={styles.searchIcon} />
        <input type="text" placeholder="Search for pets, meds, or toys..." />
      </div>

      <div className={styles.actions}>
        <button className={styles.iconBtn}>
          <Bell size={20} />
          <span className={styles.dot}></span>
        </button>

        <button className={styles.cartBtn} onClick={onCartClick}>
          <ShoppingCart size={20} />
          {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
        </button>

        <div className={styles.userProfile}>
          <div className={styles.avatar}>{userInitial}</div>
        </div>
      </div>
    </header>
  );
}
