import { Shield, Lock, Eye, FileText, ClipboardCheck, Scale, Mail } from "lucide-react";
import styles from "./Legal.module.css";

export const metadata = {
  title: "Privacy Policy | Sammy Pet Hub",
  description: "How Sammy Pet Hub collects, uses, and protects your personal data.",
};

export default function PrivacyPolicy() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.paper}>
          <div className={styles.header}>
            <h1>Privacy Policy</h1>
            <p className={styles.lastUpdated}>Last Updated: April 2026</p>
          </div>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><Shield size={20} /></div>
              <h2>1. Who We Are</h2>
            </div>
            <p>
              Sammy Pet Hub ("we", "us", "our") operates the platform available at sammypethub.com. 
              This policy explains how we collect and use your personal information in compliance 
              with the GDPR, NDPR (Nigeria Data Protection Regulation), and CCPA.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><ClipboardCheck size={20} /></div>
              <h2>2. Data We Collect</h2>
            </div>
            <ul>
              <li><strong>Account Data</strong>: Email address, name, and password hash when you register.</li>
              <li><strong>Profile Data</strong>: Pet preferences, adoption requests, and mating listings you create.</li>
              <li><strong>Usage Data</strong>: Pages visited, search queries, and feature interactions (anonymised).</li>
              <li><strong>Cookies</strong>: Session tokens and preference cookies. See our Cookie Policy for details.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><Eye size={20} /></div>
              <h2>3. How We Use Your Data</h2>
            </div>
            <ul>
              <li>To provide and personalise the Sammy Pet Hub service.</li>
              <li>To process adoption requests and connect you with breeders.</li>
              <li>To send account-related emails (confirmations, password resets).</li>
              <li>To comply with legal obligations.</li>
            </ul>
            <p>We do <strong>not</strong> sell your personal data to third parties.</p>
          </section>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><Lock size={20} /></div>
              <h2>4. Data Retention</h2>
            </div>
            <p>
              We retain your data for as long as your account is active. 
              If you delete your account, your data is permanently erased within 30 days, 
              except where retention is required by law.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><Scale size={20} /></div>
              <h2>5. Your Rights</h2>
            </div>
            <p>Under GDPR and NDPR, you have the right to:</p>
            <ul>
              <li><strong>Access</strong>: Request a copy of your data.</li>
              <li><strong>Correction</strong>: Fix inaccurate data.</li>
              <li><strong>Erasure</strong>: Request deletion of your data ("right to be forgotten").</li>
              <li><strong>Portability</strong>: Export your data in a machine-readable format.</li>
              <li><strong>Object</strong>: Opt out of data processing for marketing.</li>
            </ul>
            <p>To exercise any right, email us at <strong>privacy@sammypethub.com</strong>.</p>
          </section>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><FileText size={20} /></div>
              <h2>6. Security</h2>
            </div>
            <p>
              We use industry-standard security practices including encrypted connections (TLS),
              database row-level security, and hashed passwords. No system is 100% secure,
              but we commit to prompt disclosure of any breach.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><Mail size={20} /></div>
              <h2>7. Contact</h2>
            </div>
            <p>
              Data Controller: Sammy Pet Hub<br />
              Email: privacy@sammypethub.com
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
