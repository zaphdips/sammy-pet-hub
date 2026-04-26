import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <span>🐾 Sammy Pet Hub</span>
          <p>Get Your FUR-ever Companion</p>
        </div>

        <div className={styles.links}>
          <div className={styles.col}>
            <h4>Platform</h4>
            <Link href="/adoption">Find a Pet</Link>
            <Link href="/shop">Shop</Link>
            <Link href="/mating">Mating</Link>
            <Link href="/#vets">Vet Consult</Link>
          </div>
          <div className={styles.col}>
            <h4>Legal</h4>
            <Link href="/legal/privacy">Privacy Policy</Link>
            <Link href="/legal/terms">Terms of Use</Link>
            <Link href="/legal/cookies">Cookie Policy</Link>
            <Link href="/legal/shipping">Shipping & Returns</Link>
            <Link href="/legal/health-guarantee">Health Guarantee</Link>
          </div>
          <div className={styles.col}>
            <h4>Contact</h4>
            <a href="mailto:hello@sammypethub.com">hello@sammypethub.com</a>
            <a href="mailto:privacy@sammypethub.com">privacy@sammypethub.com</a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} Sammy Pet Hub. All rights reserved.</p>
        <p>Built with ❤️ for pets everywhere.</p>
      </div>
    </footer>
  );
}
