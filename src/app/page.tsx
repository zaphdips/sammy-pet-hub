"use client";

/**
 * Premium Home Page (Overhaul)
 * 
 * WHY: Replaces the basic hero and sections with high-end glassmorphism,
 * Lucide icons, and dynamic spacing.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowRight, ShieldCheck, Heart, Stethoscope, ShoppingBag, Zap } from "lucide-react";
import Image from "next/image";
import BreedCarousel from "@/components/BreedCarousel";
import SymptomGuide from "@/components/SymptomGuide";
import VetConsultation from "@/components/VetConsultation";
import PetCard from "@/components/PetCard";
import ProductCard from "@/components/ProductCard";
import { useRouter } from "next/navigation";
import styles from "./Home.module.css";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [previewPets, setPreviewPets] = useState<any[]>([]);
  const [previewProducts, setPreviewProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    hero_tagline: "Get Your FUR-ever Companion",
    hero_subtitle: "Connect with breeders, find accessories, and get vet support."
  });

  useEffect(() => {
    // Auth & Redirect Check
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setRedirecting(true);
        router.push("/dashboard");
        return; // Don't render the page for logged-in users
      }
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", session.user.id).single();
        setIsAdmin(profile?.role === "admin");
      }
    }
    checkSession();

    async function fetchPreviews() {
      const [pRes, prodRes] = await Promise.all([
        supabase.from("pets").select("*").eq("is_available", true).limit(4),
        supabase.from("products").select("*").eq("is_active", true).limit(4)
      ]);
      if (pRes.data) setPreviewPets(pRes.data);
      if (prodRes.data) setPreviewProducts(prodRes.data);
    }
    fetchPreviews();

    async function fetchSettings() {
      // Only fetch the two keys we actually use — not the entire table
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["hero_tagline", "hero_subtitle"]);
      if (data) {
        const s = { ...settings };
        data.forEach(item => {
          if (item.key === "hero_tagline") s.hero_tagline = item.value;
          if (item.key === "hero_subtitle") s.hero_subtitle = item.value;
        });
        setSettings(s);
      }
    }
    fetchSettings();
  }, [router]);

  // Don't flash the homepage while redirecting a logged-in user
  if (redirecting) return null;

  const features = [
    { title: "Secure Adoption", icon: Heart, color: "#ef4444", desc: "Verified breeders and health-guaranteed pets." },
    { title: "Premium Shop", icon: ShoppingBag, color: "#3b82f6", desc: "Top-tier accessories and medication for your pets." },
    { title: "Vet Assistance", icon: Stethoscope, color: "#10b981", desc: "24/7 support from certified veterinarians." },
    { title: "Verified Health", icon: ShieldCheck, color: "#f59e0b", desc: "Comprehensive health records for every animal." },
  ];

  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Zap size={14} />
            <span>Over 5,000+ pets matched</span>
          </div>
          <h1>{settings.hero_tagline}</h1>
          <p>{settings.hero_subtitle}</p>
          <div className={styles.heroActions}>
            {isAdmin ? (
              <Link href="/admin" className={styles.primaryBtn}>
                Go to Dashboard <ArrowRight size={20} />
              </Link>
            ) : user ? (
              <Link href="/adoption" className={styles.primaryBtn}>
                Find Your Pet <ArrowRight size={20} />
              </Link>
            ) : (
              <Link href="/auth" className={styles.primaryBtn}>
                Join the Hub <ArrowRight size={20} />
              </Link>
            )}
            
            {user ? (
              <Link href="/profile" className={styles.secondaryBtn}>
                My Profile
              </Link>
            ) : (
              <Link href="/shop" className={styles.secondaryBtn}>
                Shop Accessories
              </Link>
            )}
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.imageContainer}>
            <Image 
              src="/banners/hero.png" 
              alt="Happy Pets" 
              fill 
              className={styles.heroImage} 
              priority 
            />
            <div className={styles.imageOverlay}></div>
          </div>
          <div className={styles.floatingCard}>
            <Heart size={24} color="#ef4444" fill="#ef4444" />
            <span>Adoption Ready</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featuresGrid}>
          {features.map((f, i) => (
            <div key={i} className={`${styles.featureCard} glass`}>
              <div className={styles.featureIcon} style={{ color: f.color, backgroundColor: `${f.color}15` }}>
                <f.icon size={28} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* 1. FEATURED PETS PREVIEW */}
      <section className={styles.previewSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.subTitle}>Available Right Now</span>
          <h2>Newest Pet Arrivals</h2>
          <p>Meet our newest furry friends looking for their permanent homes.</p>
        </div>
        <div className={styles.previewGrid}>
          {previewPets.map(pet => (
            <PetCard key={pet.id} {...pet} photoUrl={pet.photo_url} isAvailable={pet.is_available} />
          ))}
        </div>
        <div className={styles.centerCTA}>
           <Link href="/adoption" className={styles.outlineBtn}>View All Pets <ArrowRight size={18} /></Link>
        </div>
      </section>

      {/* 2. FEATURED PRODUCTS PREVIEW */}
      <section className={styles.previewSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.subTitle}>Essential Supplies</span>
          <h2>Trending in the Shop</h2>
          <p>Top-rated toys, medications, and accessories for your companions.</p>
        </div>
        <div className={styles.previewGrid}>
          {previewProducts.map(prod => (
            <ProductCard key={prod.id} {...prod} />
          ))}
        </div>
        <div className={styles.centerCTA}>
           <Link href="/shop" className={styles.outlineBtn}>Explore Full Shop <ArrowRight size={18} /></Link>
        </div>
      </section>

      {/* Encyclopedia Section */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.subTitle}>Knowledge Base</span>
          <h2>Breed Encyclopedia</h2>
          <p>Learn about different breeds, their temperaments, and care needs.</p>
        </div>
        <BreedCarousel />
      </section>

      {/* Health Section */}
      <section className={styles.healthSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.subTitle}>Pet Health</span>
          <h2>Symptom Checker</h2>
          <p>Quick guide to understanding your pet's behavior and health signs.</p>
        </div>
        <SymptomGuide />
      </section>

      {/* Vet Section */}
      <VetConsultation />
    </main>
  );
}
