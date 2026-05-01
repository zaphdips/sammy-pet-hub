"use client";

import { useEffect, useState } from "react";
import { supabase, checkIsAdmin } from "@/lib/supabase";
import { User, Shield, LogOut, ChevronDown, Menu, X, ShoppingBag } from "lucide-react";
import SearchBar from "./SearchBar";
import styles from "./Navbar.module.css";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useSiteSettings } from "@/lib/useSiteSettings";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { cart } = useCart();
  const { currency, setCurrencyCode } = useCurrency();
  const { settings } = useSiteSettings();
  const siteName = settings.site_name || "Pet Corner";

  const cartItemCount = (cart || []).reduce((total: number, item: any) => total + (item.quantity || 1), 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

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

    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}>
      {/* Top Tier: Hamburger, Logo, Icons */}
      <div className={styles.topTier}>
        <div className={styles.topContainer}>
          <button className={styles.menuToggle} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link href="/" className={styles.logo}>
            <span>{siteName}</span>
          </Link>

          {/* Desktop inline search bar */}
          <div className={styles.desktopSearchInline}>
            <SearchBar />
          </div>

          <div className={styles.iconGroup}>
            {isAdmin && (
              <Link href="/admin" className={`${styles.iconLink} ${styles.hideOnMobile}`}>
                <Shield size={20} />
                <span>Admin</span>
              </Link>
            )}

            <div className={`${styles.currencySelector} ${styles.hideOnMobile}`}>
              <select 
                value={currency.code} 
                onChange={(e) => setCurrencyCode(e.target.value as any)}
                className={styles.currencySelect}
              >
                <option value="GBP">£ GBP</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="NGN">₦ NGN</option>
              </select>
            </div>

            {user ? (
              <Link href="/profile" className={styles.iconLink}>
                <User size={20} />
                <span>Account</span>
              </Link>
            ) : (
              <Link href="/auth" className={styles.iconLink}>
                <User size={20} />
                <span>Sign In</span>
              </Link>
            )}

            <Link href="/checkout" className={styles.cartBtn} aria-label="Cart">
              <div className={styles.cartIconWrapper}>
                <ShoppingBag size={22} />
                {cartItemCount > 0 && (
                  <span className={styles.cartBadge}>{cartItemCount}</span>
                )}
              </div>
              <span>Basket</span>
            </Link>
          </div>
        </div>

        {/* Search Bar — Always visible, full width */}
        <div className={styles.mobileSearchRow}>
          <SearchBar />
        </div>
      </div>

      {/* Bottom Tier: Navigation Links */}
      <div className={`${styles.bottomTier} ${isMenuOpen ? styles.mobileOpen : ""}`}>
        <div className={styles.bottomContainer}>
          <Link href="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link href="/shop" onClick={() => setIsMenuOpen(false)}>Shop</Link>
          <Link href="/adoption" onClick={() => setIsMenuOpen(false)}>Find a Pet</Link>
          <Link href="/mating" onClick={() => setIsMenuOpen(false)}>Breeding</Link>
          <Link href="/about" onClick={() => setIsMenuOpen(false)}>About Us</Link>
          {/* <Link href="/#vets" onClick={() => setIsMenuOpen(false)}>Pet Health</Link> */}
          
          {/* Mobile Currency Selector */}
          <div className={`${styles.mobileOnly} ${styles.mobileCurrency}`}>
            <label>Currency:</label>
            <select 
              value={currency.code} 
              onChange={(e) => setCurrencyCode(e.target.value as any)}
              className={styles.currencySelectMobile}
            >
              <option value="GBP">£ GBP</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="NGN">₦ NGN</option>
            </select>
          </div>
          
          {/* Mobile Profile Link */}
          {user ? (
            <Link href="/profile" className={styles.mobileOnly} onClick={() => setIsMenuOpen(false)}>
               My Account
            </Link>
          ) : (
            <Link href="/auth" className={styles.mobileOnly} onClick={() => setIsMenuOpen(false)}>
               Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
