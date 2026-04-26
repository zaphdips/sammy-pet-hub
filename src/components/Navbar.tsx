"use client";

import { useEffect, useState } from "react";
import { supabase, checkIsAdmin } from "@/lib/supabase";
import { User, Shield, LogOut, ChevronDown, Menu, X } from "lucide-react";
import SearchBar from "./SearchBar";
import styles from "./Navbar.module.css";
import Link from "next/link";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsAdmin(await checkIsAdmin());
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setIsAdmin(session?.user ? await checkIsAdmin() : false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className={`${styles.navbar} glass`}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logo}>
          <span>🐾 Sammy Hub</span>
        </Link>

        {/* Navigation Links */}
        <div className={`${styles.navLinks} ${isMenuOpen ? styles.mobileOpen : ""}`}>
          <Link href="/about" onClick={() => setIsMenuOpen(false)}>About Us</Link>
          <Link href="/adoption" onClick={() => setIsMenuOpen(false)}>Pet Sales</Link>
          <Link href="/shop" onClick={() => setIsMenuOpen(false)}>Shop</Link>
          <Link href="/mating" onClick={() => setIsMenuOpen(false)}>Mating Match</Link>
          <Link href="/#vets" onClick={() => setIsMenuOpen(false)}>Vet Help</Link>
          
          {/* Mobile Profile Link */}
          {user && (
            <Link href="/profile" className={styles.mobileOnly} onClick={() => setIsMenuOpen(false)}>
               View My Profile
            </Link>
          )}
          {!user && (
            <Link href="/auth" className={styles.mobileOnly} onClick={() => setIsMenuOpen(false)}>
               Sign In
            </Link>
          )}
        </div>

        <div className={styles.rightSection}>
          <div className={styles.desktopSearch}><SearchBar /></div>
          
          {isAdmin && (
            <Link href="/admin" className={`${styles.adminBadge} ${styles.hideOnMobile}`}>
              <Shield size={16} />
              <span>Admin</span>
            </Link>
          )}

          {user ? (
            <Link href="/profile" className={`${styles.profileLink} ${styles.hideOnMobile}`}>
              <div className={styles.avatar}>
                {user.user_metadata?.full_name?.[0] ?? user.email?.[0]}
              </div>
              <span className={styles.userName}>
                {user.user_metadata?.full_name?.split(" ")[0] ?? "Profile"}
              </span>
            </Link>
          ) : (
            <Link href="/auth" className={`${styles.loginBtn} ${styles.hideOnMobile}`}>Sign In</Link>
          )}

          {/* Mobile Toggle */}
          <button className={styles.menuToggle} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
