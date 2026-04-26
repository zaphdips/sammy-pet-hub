import { Heart, Stethoscope, ShieldCheck, Clock, FileText, AlertTriangle, Mail } from "lucide-react";
import styles from "../privacy/Legal.module.css";

export const metadata = {
  title: "Pet Health Guarantee | Sammy Pet Hub",
  description: "Comprehensive health guarantee for every pet sold through Sammy Pet Hub.",
};

export default function HealthGuaranteePage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.paper}>
          <div className={styles.header}>
            <h1>Pet Health Guarantee</h1>
            <p className={styles.lastUpdated}>Last Updated: April 2026</p>
          </div>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><ShieldCheck size={20} /></div>
              <h2>1. Our Commitment</h2>
            </div>
            <p>
              Every pet listed on Sammy Pet Hub undergoes a mandatory health check by a certified 
              veterinarian before being listed. We guarantee that your pet is in good health and free 
              from contagious diseases at the time of sale.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><Stethoscope size={20} /></div>
              <h2>2. Initial Veterinary Exam</h2>
            </div>
            <p>
              Buyer must have the pet examined by a licensed veterinarian within <strong>72 hours</strong> 
              of receiving the pet. This ensures that the pet has transitioned safely and is healthy in its 
              new environment.
            </p>
            <ul>
              <li>Failure to perform this exam voids the health guarantee.</li>
              <li>A copy of the vet's report must be kept for any future claims.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><Clock size={20} /></div>
              <h2>3. Genetic Health Guarantee</h2>
            </div>
            <p>
              We provide a <strong>1-Year Genetic Health Guarantee</strong>. If your pet is diagnosed 
              with a life-threatening hereditary or congenital defect within one year of purchase, 
              we will provide a replacement pet of equal value or a partial refund.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><AlertTriangle size={20} /></div>
              <h2>4. Exclusions</h2>
            </div>
            <p>This guarantee does not cover:</p>
            <ul>
              <li>Illnesses caused by neglect, accident, or improper care.</li>
              <li>Internal or external parasites (fleas, ticks, worms) common in puppies.</li>
              <li>Minor conditions such as low blood sugar or travel stress.</li>
              <li>Any veterinary costs incurred by the buyer during the exam or care.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><FileText size={20} /></div>
              <h2>5. Claim Process</h2>
            </div>
            <p>
              To make a claim, you must provide a written statement from a licensed veterinarian 
              clearly stating the diagnosis and that the condition is congenital/hereditary. 
              We reserve the right to a second opinion from our own veterinarian.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><Mail size={20} /></div>
              <h2>6. Contact</h2>
            </div>
            <p>
              For health-related inquiries or claims, please email:<br />
              <strong>health@sammypethub.com</strong>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
