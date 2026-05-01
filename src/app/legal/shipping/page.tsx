import { Truck, RotateCcw, Package, AlertCircle, Clock, Mail, ShieldCheck } from "lucide-react";
import styles from "../privacy/Legal.module.css";

export const metadata = {
  title: "Shipping & Returns | Pet Corner",
  description: "Shipping logistics and return policies for pets and products.",
};

export default function ShippingPage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.paper}>
          <div className={styles.header}>
            <h1>Shipping & Returns</h1>
            <p className={styles.lastUpdated}>Last Updated: April 2026</p>
          </div>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><Truck size={20} /></div>
              <h2>1. Pet Transportation</h2>
            </div>
            <p>
              The safety of our pets is our top priority. We offer two methods of pet delivery:
            </p>
            <ul>
              <li><strong>Certified Pet Couriers</strong>: Specialized climate-controlled transport for long-distance deliveries.</li>
              <li><strong>Local Pickup</strong>: Available at verified breeder locations. Appointment required.</li>
              <li><strong>Air Travel</strong>: Only available via pet-safe airline programs (subject to weather and airline availability).</li>
            </ul>
          </section>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><Package size={20} /></div>
              <h2>2. Product Shipping</h2>
            </div>
            <p>
              Accessories, toys, and medications are shipped via standard courier services:
            </p>
            <ul>
              <li><strong>Processing Time</strong>: Orders are processed within 1-2 business days.</li>
              <li><strong>Standard Delivery</strong>: 3-5 business days depending on location.</li>
              <li><strong>Expedited Shipping</strong>: Available at checkout for medications and urgent supplies.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><RotateCcw size={20} /></div>
              <h2>3. Return Policy</h2>
            </div>
            <p>
              Our return policy differs based on the item type:
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr><th>Item Category</th><th>Returnable?</th><th>Window</th></tr>
                </thead>
                <tbody>
                  <tr><td>Live Animals</td><td>No*</td><td>See Health Guarantee</td></tr>
                  <tr><td>Medications</td><td>No</td><td>Safety Restriction</td></tr>
                  <tr><td>Toys & Accessories</td><td>Yes</td><td>14 Days</td></tr>
                  <tr><td>Pet Food</td><td>Yes*</td><td>7 Days (Unopened)</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><AlertCircle size={20} /></div>
              <h2>4. Damaged or Incorrect Items</h2>
            </div>
            <p>
              If a product arrives damaged or is not what you ordered, please contact us within 
              <strong> 48 hours</strong> of receipt with photos of the item and packaging. 
              We will provide a replacement or full refund at no extra cost.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}><Mail size={20} /></div>
              <h2>5. Contact Us</h2>
            </div>
            <p>
              For shipping status or return requests, please email:<br />
              <strong>support@petcorner.com</strong>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
