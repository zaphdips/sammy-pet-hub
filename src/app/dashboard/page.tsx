"use client";

/**
 * Member Dashboard
 *
 * WHY: Replaces the static landing page for logged-in users.
 * Features a high-conversion layout with Hot Sales, Pets, Meds, and Toys.
 * Includes a persistent sidebar for navigation trajectory.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PetCard from "@/components/PetCard";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";
import { Sparkles, ArrowRight, ShoppingBag, Pill, Dog, Flame, Stethoscope, Mail } from "lucide-react";
import styles from "./Dashboard.module.css";
import Link from "next/link";

export default function MemberDashboard() {
  const [pets, setPets] = useState<any[]>([]);
  const [meds, setMeds] = useState<any[]>([]);
  const [toys, setToys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [whatsapp, setWhatsapp] = useState("2348000000000");

  useEffect(() => {
    async function fetchData() {
      const [pRes, mRes, tRes, settingsRes] = await Promise.all([
        supabase.from("pets").select("*").eq("is_available", true).limit(4),
        supabase.from("products").select("*").eq("category", "medication").limit(4),
        supabase.from("products").select("*").eq("category", "toy").limit(4),
        supabase.from("site_settings").select("key, value").in("key", ["vet_whatsapp"]),
      ]);
      if (pRes.data) setPets(pRes.data);
      if (mRes.data) setMeds(mRes.data);
      if (tRes.data) setToys(tRes.data);
      const wa = settingsRes.data?.find(s => s.key === "vet_whatsapp")?.value;
      if (wa) setWhatsapp(wa);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className={styles.loader}>Initializing your Command Center...</div>;

  return (
    <div className={styles.dashboard}>
      {/* 1. HOT SALE BANNER */}
      <section className={`${styles.hotSale} glass`}>
        <div className={styles.saleContent}>
          <div className={styles.saleBadge}><Flame size={16} /> Flash Sale</div>
          <h1>Weekend Blowout!</h1>
          <p>Get up to <strong>30% OFF</strong> all dog toys and vitamins. Limited time only!</p>
          <Link href="/shop" className={styles.saleBtn}>Shop the Sale <ArrowRight size={18} /></Link>
        </div>
        <div className={styles.saleImage}>
           <div className={styles.mascotFrame}>
             <Image 
              src="/cool_dog_mascot.png" 
              alt="Cool Dog Mascot" 
              width={350} 
              height={350} 
              className={styles.mascotImg}
            />
           </div>
        </div>
      </section>

      {/* 2. PETS SECTION */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleWithIcon}>
            <Dog className={styles.sectionIcon} />
            <h2>Newest Pet Arrivals</h2>
          </div>
          <Link href="/adoption" className={styles.viewAll}>View All <ArrowRight size={14} /></Link>
        </div>
        <div className={styles.horizontalScroll}>
          {pets.map(pet => (
            <div key={pet.id} className={styles.cardWrap}>
               <PetCard {...pet} photoUrl={pet.photo_url} isAvailable={pet.is_available} />
            </div>
          ))}
        </div>
      </section>

      {/* 3. MEDICATIONS SECTION */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleWithIcon}>
            <Pill className={styles.sectionIcon} />
            <h2>Essential Medications</h2>
          </div>
          <Link href="/shop?category=medication" className={styles.viewAll}>View All <ArrowRight size={14} /></Link>
        </div>
        <div className={styles.horizontalScroll}>
          {meds.map(med => (
            <div key={med.id} className={styles.cardWrap}>
               <ProductCard {...med} />
            </div>
          ))}
        </div>
      </section>

      {/* 4. TOYS SECTION */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleWithIcon}>
            <ShoppingBag className={styles.sectionIcon} />
            <h2>Trending Toys</h2>
          </div>
          <Link href="/shop?category=toy" className={styles.viewAll}>View All <ArrowRight size={14} /></Link>
        </div>
        <div className={styles.horizontalScroll}>
          {toys.map(toy => (
            <div key={toy.id} className={styles.cardWrap}>
               <ProductCard {...toy} />
            </div>
          ))}
        </div>
      </section>

      {/* 5. HEALTH & WELLNESS SECTION */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleWithIcon}>
            <Stethoscope className={styles.sectionIcon} />
            <h2>Pet Health & Wellness</h2>
          </div>
        </div>
        
        <div className={styles.healthGrid}>
          {/* Symptom Card */}
          <div className={`${styles.healthCard} glass`}>
            <h3>Symptom Checker</h3>
            <p>Quickly identify common pet health issues and get professional advice.</p>
            <Link href="/#vets" className={styles.healthLink}>Check Symptoms <ArrowRight size={16} /></Link>
          </div>

          {/* Talk to Vet Card */}
          <div className={`${styles.healthCard} ${styles.vetCard} glass`}>
            <div className={styles.vetBadge}>24/7 Support</div>
            <h3>Talk to a Vet</h3>
            <p>Direct access to certified veterinarians for any urgent inquiries.</p>
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className={styles.vetBtn}>
               <Mail size={18} /> Inquire on WhatsApp
            </a>
          </div>

          {/* Encyclopedia Card */}
          <div className={`${styles.healthCard} glass`}>
            <h3>Pet Encyclopedia</h3>
            <p>Comprehensive guide to breeds, care requirements, and training tips.</p>
            <Link href="/#vets" className={styles.healthLink}>Explore Library <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
