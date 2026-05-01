"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowRight, ShieldCheck, Heart, Stethoscope, ShoppingBag, Star, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Home.module.css";
import PetCard from "@/components/PetCard";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import PromoCard from "@/components/PromoCard";
import ScrollCarousel from "@/components/ScrollCarousel";
import { useSiteSettings } from "@/lib/useSiteSettings";

export default function Home() {
  const { addToCart } = useCart();
  const { settings } = useSiteSettings();
  const [previewPets, setPreviewPets] = useState<any[]>([]);
  const [previewProducts, setPreviewProducts] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);

  // Read limits from site_settings (with numeric fallbacks)
  const petLimit     = parseInt(settings.homepage_pet_limit     || "4",  10);
  const productLimit = parseInt(settings.homepage_product_limit || "4",  10);
  const promoLimit   = parseInt(settings.homepage_promo_limit   || "3",  10);

  useEffect(() => {
    const fetchPreviews = async () => {
      const { data: pets }  = await supabase.from("pets").select("*").limit(petLimit);
      const { data: prods } = await supabase.from("products").select("*").limit(productLimit);
      const { data: promos } = await supabase
        .from("promotions")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(promoLimit);
      
      const mockPets = [
        { id: "m1", name: "Bella", breed: "Golden Retriever", age: "Puppy", gender: "Female", price: 250000, isAvailable: true, photo_urls: ["https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800"] },
        { id: "m2", name: "Max", breed: "German Shepherd", age: "Adult", gender: "Male", price: 180000, isAvailable: true, photo_urls: ["https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=800"] },
        { id: "m3", name: "Luna", breed: "Persian Cat", age: "Kitten", gender: "Female", price: 120000, isAvailable: true, photo_urls: ["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800"] },
        { id: "m4", name: "Charlie", breed: "French Bulldog", age: "Puppy", gender: "Male", price: 300000, isAvailable: true, photo_urls: ["https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800"] },
      ];

      const mockProds = [
        { id: "p1", name: "Premium Dog Kibble", category: "Food", price: 15000, photoUrl: "https://images.unsplash.com/photo-1585499193151-0f50d54c4e1c?auto=format&fit=crop&q=80&w=800", description: "High-protein formula for active breeds." },
        { id: "p2", name: "Orthopedic Pet Bed", category: "Accessories", price: 25000, photoUrl: "https://images.unsplash.com/photo-1591584539339-a4e215943920?auto=format&fit=crop&q=80&w=800", description: "Memory foam comfort for your pet's joints." },
        { id: "p3", name: "Interactive Cat Toy", category: "Toys", price: 4500, photoUrl: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&q=80&w=800", description: "Keep your feline engaged for hours." },
        { id: "p4", name: "Pet Shampoo & Conditioner", category: "Grooming", price: 8000, photoUrl: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=800", description: "Organic ingredients for a shiny coat." },
      ];

      const mockPromos = [
        { id: "promo1", title: "New pet? You've got this.", description: "All they need, plus 10% off your first shop when you join Pets Club.", button_text: "Shop essentials", button_link: "/shop", image_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1000" },
        { id: "promo2", title: "Picnic days are here", description: "Playful toys, tasty treats & days out essentials.", button_text: "Shop now", button_link: "/shop", image_url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=1000" },
        { id: "promo3", title: "The bank holiday feeling", description: "Enjoy savings on pet accessories for the whole month.", button_text: "Shop now", button_link: "/shop", image_url: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=1000" }
      ];

      // Merge DB results with fallback seed data so the page is never empty
      // (Fallback is only shown when the DB tables are empty during development)
      setPreviewPets(pets && pets.length > 0 ? [...pets, ...mockPets].slice(0, petLimit) : mockPets.slice(0, petLimit));
      setPreviewProducts(prods && prods.length > 0 ? [...prods, ...mockProds].slice(0, productLimit) : mockProds.slice(0, productLimit));
      setPromotions(promos && promos.length > 0 ? promos : mockPromos.slice(0, promoLimit));
    };
    fetchPreviews();
  }, [petLimit, productLimit, promoLimit]);

  return (
    <main className={styles.main}>
      {/* Split Hero Banner */}
      <section className={styles.heroSplit}>
        <div className={styles.heroText}>
          <h1>The ultimate corner for your furry family.</h1>
          <p>Connecting verified breeders, premium supplies, and expert vet care all in one place. Your pet's happiness starts here.</p>
          <Link href="/auth" className={styles.primaryCTA}>
            Start Your Journey <ArrowRight size={20} />
          </Link>
        </div>
        <div className={styles.heroImageContainer}>
          <Image 
            src="/banners/pet-corner-hero.png" 
            alt="Happy pets" 
            fill 
            className={styles.heroImg}
            priority
          />
        </div>
      </section>

      {/* Trust Ribbon */}
      <section className={styles.trustRibbon}>
        <div className={styles.trustItem}><ShieldCheck size={18} /> Verified Breeders</div>
        <div className={styles.trustItem}><Heart size={18} /> Health Guaranteed</div>
        <div className={styles.trustItem}><Stethoscope size={18} /> 24/7 Vet Support</div>
        <div className={styles.trustItem}><ShoppingBag size={18} /> Premium Supplies</div>
      </section>

      {/* Featured Products Section (Moved up) */}
      <section className={styles.featuredSection}>
        <div className={styles.sectionHeading}>
          <h2>Shop the Best for Your Pets</h2>
          <p>Explore our premium selection of toys and healthcare products.</p>
        </div>
        <ScrollCarousel>
          {previewProducts.map(product => (
            <ProductCard 
              key={product.id} 
              {...product} 
              photoUrl={product.photo_url || product.photoUrl || product.photo_urls?.[0]} 
              onBuy={(p) => addToCart(p)} 
              rating={product.rating ?? 5.0}
              reviewCount={product.review_count ?? 0}
              badgeText={product.badge_text || ""}
            />
          ))}
        </ScrollCarousel>
        <Link href="/shop" className={styles.outlineCTA}>Visit the Shop</Link>
      </section>

      {/* Promo Feature Cards */}
      <section className={styles.promoSection}>
        <div className={styles.promoGrid}>
          {promotions.map((promo) => (
            <PromoCard 
              key={promo.id}
              title={promo.title}
              description={promo.description}
              buttonText={promo.button_text}
              buttonLink={promo.button_link}
              imageUrl={promo.image_url}
            />
          ))}
        </div>
      </section>

      {/* Newest Arrivals Grid */}
      <section className={`${styles.featuredSection} ${styles.offWhiteBg}`}>
        <div className={styles.sectionHeading}>
          <h2>Newest Arrivals</h2>
          <p>Meet our latest furry friends looking for their permanent homes.</p>
        </div>
        <ScrollCarousel>
          {previewPets.map(pet => (
            <PetCard 
              key={pet.id} 
              {...pet} 
              photoUrl={pet.photo_url} 
              isAvailable={pet.is_available}
              rating={pet.rating ?? 4.5}
              isVerifiedBreeder={pet.is_verified_breeder ?? false}
              badgeText={pet.badge_text || ""}
            />
          ))}
        </ScrollCarousel>
        <Link href="/adoption" className={styles.outlineCTA}>View All Pets</Link>
      </section>

      {/* Final CTA Section */}
      <section className={styles.featuredSection} style={{ background: "var(--brand-primary)", color: "white" }}>
        <div className={styles.sectionHeading}>
          <h2 style={{ color: "white" }}>Ready to give a pet<br />a forever home?</h2>
          <p style={{ color: "rgba(255,255,255,0.7)" }}>Join Pet Corner today and become part of our growing community of happy pet owners.</p>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "32px" }}>
          <Link href="/auth" className={styles.primaryCTA} style={{ background: "white", color: "var(--brand-primary)" }}>
            Get Started Now
          </Link>
        </div>
      </section>
    </main>
  );
}
