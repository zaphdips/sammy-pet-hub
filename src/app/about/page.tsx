"use client";

import Image from "next/image";
import { ShieldCheck, Heart, Users, CheckCircle, ArrowRight } from "lucide-react";
import styles from "./About.module.css";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className={styles.main}>
      {/* Hero Banner Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>Our Mission</div>
          <h1 className="gradient-text">Connecting Pets with Loving Homes</h1>
          <p>We are dedicated to ensuring every pet finds a family, and every family finds their perfect companion. With verified breeders, premium care, and expert vets.</p>
        </div>
        <div className={styles.heroImageWrapper}>
          <Image 
            src="/banners/starry_cat.jpg" 
            alt="Cat with starry eyes" 
            fill 
            className={styles.heroImage}
            priority
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.statGrid}>
          <div className={`${styles.statCard} glass`}>
            <h3>5,000+</h3>
            <p>Happy Adoptions</p>
          </div>
          <div className={`${styles.statCard} glass`}>
            <h3>150+</h3>
            <p>Verified Breeders</p>
          </div>
          <div className={`${styles.statCard} glass`}>
            <h3>24/7</h3>
            <p>Vet Support Access</p>
          </div>
          <div className={`${styles.statCard} glass`}>
            <h3>100%</h3>
            <p>Health Guaranteed</p>
          </div>
        </div>
      </section>

      {/* Writeup Section */}
      <section className={styles.contentSection}>
        <div className={styles.contentText}>
          <h2 className="gradient-text">Why Choose Sammy Pet Hub?</h2>
          <p>
            Founded on the principle that pets deserve the absolute best, Sammy Pet Hub 
            was created to bridge the gap between ethical breeders, essential pet care, 
            and future pet parents.
          </p>
          <p>
            We don't just facilitate adoptions; we provide a lifelong ecosystem. 
            From finding your pet to ensuring they have the best nutrition, toys, and 
            medical care, we are with you every step of the way.
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
          <div className={`${styles.imageBox} ${styles.box1}`}>
            <Image src="/banners/hero.png" alt="Happy Dog" fill className={styles.coverImage} />
          </div>
          <div className={`${styles.imageBox} ${styles.box2}`}>
            <div className={styles.placeholderBg}>
              <Heart size={48} color="white" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
