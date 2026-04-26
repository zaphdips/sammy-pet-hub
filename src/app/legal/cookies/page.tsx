import { Info, Database, Eye, Mail } from "lucide-react";
import styles from "../privacy/Legal.module.css";

export const metadata = {
  title: "Cookie Policy | Sammy Pet Hub",
};

export default function CookiePolicy() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.paper}>
          <div className={styles.header}>
            <h1>Cookie Policy</h1>
            <p className={styles.lastUpdated}>Last Updated: April 2026</p>
          </div>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><Info size={20} /></div>
              <h2>1. What Are Cookies?</h2>
            </div>
            <p>Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and session.</p>
          </section>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><Database size={20} /></div>
              <h2>2. Cookies We Use</h2>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr><th>Cookie</th><th>Category</th><th>Purpose</th><th>Duration</th></tr>
                </thead>
                <tbody>
                  <tr><td>sb-auth-token</td><td>Essential</td><td>Keeps you logged in securely</td><td>Session</td></tr>
                  <tr><td>cookie_consent</td><td>Essential</td><td>Remembers your cookie preference</td><td>1 Year</td></tr>
                  <tr><td>theme</td><td>Preference</td><td>Saves your dark/light mode choice</td><td>1 Year</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><Eye size={20} /></div>
              <h2>3. Your Choices</h2>
            </div>
            <p>
              Essential cookies cannot be disabled as they are required for the site to work.
              You can manage preference cookies via your browser settings or by clearing your cookies at any time.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><Mail size={20} /></div>
              <h2>4. Contact</h2>
            </div>
            <p>privacy@sammypethub.com</p>
          </section>
        </div>
      </div>
    </main>
  );
}
