"use client";

/**
 * Terms of Use
 * Brand name is read from site_settings so the admin can update it
 * from Admin → Settings → Brand & Identity without a code deploy.
 */

import { CheckSquare, Users, FileDigit, AlertTriangle, Power, Gavel, Mail } from "lucide-react";
import { useSiteSettings } from "@/lib/useSiteSettings";
import styles from "../privacy/Legal.module.css";

export default function TermsOfUse() {
  const { settings } = useSiteSettings();
  const siteName = settings.site_name || "Pet Corner";
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.paper}>
          <div className={styles.header}>
            <h1>Terms of Use</h1>
            <p className={styles.lastUpdated}>Last Updated: April 2026</p>
          </div>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><CheckSquare size={20} /></div>
              <h2>1. Acceptance of Terms</h2>
            </div>
            <p>By accessing {siteName}, you agree to these Terms. If you disagree, do not use the platform.</p>
          </section>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><Users size={20} /></div>
              <h2>2. Acceptable Use</h2>
            </div>
            <p>You must not:</p>
            <ul>
              <li>Post false or misleading pet listings.</li>
              <li>Abuse the mating or adoption matchmaking features.</li>
              <li>Attempt to hack, scrape, or disrupt the service.</li>
              <li>Use the platform to facilitate illegal animal trade or cruelty.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><FileDigit size={20} /></div>
              <h2>3. User Content</h2>
            </div>
            <p>
              You own the content you post. By posting, you grant {siteName} a non-exclusive,
              royalty-free licence to display it on the platform. We reserve the right to remove
              content that violates these terms.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><AlertTriangle size={20} /></div>
              <h2>4. Liability Limits</h2>
            </div>
            <p>
              {siteName} acts as a platform connecting pet owners and breeders. We are not
              responsible for the conduct of users or the accuracy of listings. We are not liable
              for indirect or consequential damages arising from use of the platform.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><Power size={20} /></div>
              <h2>5. Termination</h2>
            </div>
            <p>We reserve the right to suspend or terminate accounts that violate these terms without notice.</p>
          </section>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><Gavel size={20} /></div>
              <h2>6. Governing Law</h2>
            </div>
            <p>These terms are governed by the laws of the Federal Republic of Nigeria.</p>
          </section>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><Mail size={20} /></div>
              <h2>7. Contact</h2>
            </div>
            <p>legal@petcorner.com</p>
          </section>
        </div>
      </div>
    </main>
  );
}
