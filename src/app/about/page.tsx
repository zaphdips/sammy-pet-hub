"use client";

/**
 * About Page
 *
 * FAQ items are loaded from the `content_blocks` table in Supabase
 * so they can be edited from Admin → Content → FAQ tab without a code deploy.
 *
 * The hero section and body copy are currently static but the text strings
 * match what is seeded in the content_blocks table (about_* keys),
 * ready for future dynamic loading if needed.
 */

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, Heart, Users, CheckCircle, ArrowRight, Plus, Minus } from "lucide-react";
import styles from "./About.module.css";
import Link from "next/link";

// ─── About page ──────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <main className={styles.main}>
      {/* Hero Banner */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>Our Mission</div>
          <h1 className="gradient-text">Connecting Pets with Loving Homes</h1>
          <p>
            We are dedicated to ensuring every pet finds a family, and every family finds their perfect companion.
            With verified breeders, premium care, and expert vets.
          </p>
        </div>
        <div className={styles.heroImageWrapper}>
          <Image
            src="/banners/starry_cat_new.png"
            alt="Cat with starry eyes"
            fill
            className={styles.heroImage}
            priority
          />
        </div>
      </section>

      {/* Body copy */}
      <section className={styles.contentSection}>
        <div className={styles.contentText}>
          <h2 className="gradient-text">Why Choose Us?</h2>
          <p>
            Founded on the principle that pets deserve the absolute best, we were created to bridge the gap
            between ethical breeders, essential pet care, and future pet parents.
          </p>
          <p>
            We don&apos;t just facilitate adoptions; we provide a lifelong ecosystem. From finding your pet to
            ensuring they have the best nutrition, toys, and medical care, we are with you every step of the way.
          </p>

          <ul className={styles.featureList}>
            <li><CheckCircle size={20} className={styles.checkIcon} /> Strict breeder verification processes</li>
            <li><CheckCircle size={20} className={styles.checkIcon} /> Comprehensive health and vaccination tracking</li>
            <li><CheckCircle size={20} className={styles.checkIcon} /> On-demand access to certified veterinarians</li>
            <li><CheckCircle size={20} className={styles.checkIcon} /> Premium curated shop for all pet needs</li>
          </ul>

          <Link href="/adoption" className={styles.ctaBtn}>
            Find Your Companion <ArrowRight size={20} />
          </Link>
        </div>
        <div className={styles.contentVisual}>
          <div className={styles.imageBox}>
            <Image src="/banners/happy_owner.png" alt="Happy Pet Owner" fill className={styles.coverImage} />
          </div>
        </div>
      </section>

      {/* FAQ — loaded from Supabase content_blocks table */}
      <FAQSection />
    </main>
  );
}

// ─── FAQ Section (DB-driven) ──────────────────────────────────────────────────

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);

  useEffect(() => {
    // Fetch FAQ items from content_blocks where block_key starts with "faq_"
    supabase
      .from("content_blocks")
      .select("title, body")
      .like("block_key", "faq_%")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setFaqs(data.map((row) => ({ question: row.title, answer: row.body })));
        } else {
          // Fallback static FAQ shown if the content_blocks table is empty or seed hasn't run
          setFaqs([
            {
              question: "How do I know the breeders are verified?",
              answer: "We personally visit and audit every breeder in our network to ensure they meet our strict ethical and health standards. Every pet comes with a certified health guarantee.",
            },
            {
              question: "What happens if my pet has a health issue after adoption?",
              answer: "All pets adopted through us are covered by our 30-day comprehensive health guarantee. Our 24/7 vet support is also available to help you immediately.",
            },
            {
              question: "How long does shipping take for supplies?",
              answer: "Orders are typically processed within 24 hours. Delivery takes 1–3 business days depending on your location.",
            },
            {
              question: "Can I talk to a vet before making a purchase?",
              answer: "Absolutely! You can book a consultation with one of our certified vets anytime to discuss your pet needs.",
            },
          ]);
        }
      });
  }, []);

  return (
    <section id="faq" className={styles.faqSection}>
      <div className={styles.heroContent} style={{ marginBottom: "40px" }}>
        <h2>Common Questions</h2>
        <p>Everything you need to know about us.</p>
      </div>
      <div className={styles.faqList}>
        {faqs.map((faq, index) => (
          <div key={index} className={styles.faqItem}>
            <button
              className={styles.faqHeader}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              {faq.question}
              <span>{openIndex === index ? <Minus size={20} /> : <Plus size={20} />}</span>
            </button>
            <div className={`${styles.faqAnswer} ${openIndex === index ? styles.open : ""}`}>
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
