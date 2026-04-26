"use client";

/**
 * Cookie Consent Banner
 *
 * WHY: Required by GDPR, NDPR, and ePrivacy directive.
 * Shows once on first visit. Stores consent in localStorage.
 * Does NOT set analytics cookies until consent is given.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./CookieBanner.module.css";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if the user hasn't already consented
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={styles.banner} role="dialog" aria-label="Cookie consent">
      <p>
        We use essential cookies to keep you logged in. 
        See our{" "}
        <Link href="/legal/cookies" className={styles.link}>Cookie Policy</Link>{" "}
        for details.
      </p>
      <div className={styles.actions}>
        <button onClick={decline} className={styles.declineBtn}>Decline</button>
        <button onClick={accept} className={styles.acceptBtn}>Accept</button>
      </div>
    </div>
  );
}
