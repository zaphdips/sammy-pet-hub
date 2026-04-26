"use client";

/**
 * Navbar (Redesigned)
 *
 * WHY: Uses Lucide icons and a more modern, centered layout.
 * Keeps the secure role-based admin link.
 */

import { useEffect, useState } from "react";
import { supabase, checkIsAdmin } from "@/lib/supabase";
import { User, Shield, LogOut, ChevronDown } from "lucide-react";
import SearchBar from "./SearchBar";
import styles from "./Navbar.module.css";
import Link from "next/link";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

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

        <div className={styles.navLinks}>
          <Link href="/about">About Us</Link>
          <Link href="/adoption">Pet Sales</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/mating">Mating Match</Link>
          <Link href="/#vets">Vet Help</Link>
        </div>

        <div className={styles.rightSection}>
          <SearchBar />
          
          {isAdmin && (
            <Link href="/admin" className={styles.adminBadge}>
              <Shield size={16} />
              <span>Admin</span>
            </Link>
          )}

          {user ? (
            <Link href="/profile" className={styles.profileLink}>
              <div className={styles.avatar}>
                {user.user_metadata?.full_name?.[0] ?? user.email?.[0]}
              </div>
              <span className={styles.userName}>
                {user.user_metadata?.full_name?.split(" ")[0] ?? "Profile"}
              </span>
            </Link>
          ) : (
            <Link href="/auth" className={styles.loginBtn}>Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
