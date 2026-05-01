"use client";

import { X, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import styles from "./CartDrawer.module.css";
import Link from "next/link";

export default function CartDrawer({ isOpen, onClose, cart, onRemove }: { 
  isOpen: boolean, 
  onClose: () => void, 
  cart: any[],
  onRemove: (index: number) => void
}) {
  const { formatPrice } = useCurrency();
  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className={styles.overlay} onClick={onClose}></div>}

      {/* Drawer */}
      <div className={`${styles.drawer} ${isOpen ? styles.open : ""}`}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <ShoppingBag size={24} />
            <h2>My Cart</h2>
            <span className={styles.itemCount}>{cart.length}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          {cart.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🛍️</div>
              <p>Your premium bag is empty.</p>
              <Link href="/shop" className={styles.shopNow} onClick={onClose}>
                Browse the Hub <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <div className={styles.itemList}>
              {cart.map((item, idx) => (
                <div key={idx} className={styles.cartItem}>
                  <div className={styles.itemThumb}>📦</div>
                  <div className={styles.itemInfo}>
                    <h3>{item.name}</h3>
                    <span>{item.category}</span>
                    <div className={styles.price}>{formatPrice(item.price || 0)}</div>
                  </div>
                  <button className={styles.removeBtn} onClick={() => onRemove(idx)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <p className={styles.taxInfo}>Taxes and shipping calculated at checkout.</p>
            <Link href="/checkout" className={styles.checkoutBtn} onClick={onClose}>
              Proceed to Checkout <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
