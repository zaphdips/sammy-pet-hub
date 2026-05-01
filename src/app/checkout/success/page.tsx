"use client";

/**
 * Guest Checkout Success Page
 *
 * WHY: Guests don't have a /profile/orders page, so they need
 * a dedicated confirmation page with their order reference.
 */

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import styles from "./Success.module.css";

function SuccessContent() {
  const params = useSearchParams();
  const ref = params.get("ref") || "N/A";
  const email = params.get("email") || "";

  return (
    <div className={styles.page}>
      <div className={`${styles.card} glass`}>
        <div className={styles.iconCircle}>
          <CheckCircle size={48} color="var(--primary-green)" />
        </div>
        
        <h1>Order Confirmed!</h1>
        <p className={styles.subtitle}>Thank you for shopping with Pet Corner</p>

        <div className={styles.detailBox}>
          <div className={styles.row}>
            <span>Order Reference</span>
            <strong>{ref}</strong>
          </div>
          {email && (
            <div className={styles.row}>
              <span>Confirmation sent to</span>
              <strong>{email}</strong>
            </div>
          )}
        </div>

        <div className={styles.infoNote}>
          <Mail size={18} />
          <p>A confirmation email with your order details and tracking info will be sent shortly.</p>
        </div>

        <div className={styles.actions}>
          <Link href="/shop" className={styles.continueBtn}>
            Continue Shopping <ArrowRight size={18} />
          </Link>
          <Link href="/auth" className={styles.accountBtn}>
            Create an Account for Order Tracking
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
