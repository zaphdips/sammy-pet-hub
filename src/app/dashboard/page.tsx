"use client";

/**
 * Member Dashboard — Amazon-Style E-Commerce Home
 *
 * WHY: Compact, high-density layout modeled after Amazon/Chewy.
 * Single auto-sliding promo banner (not 3 stacked cards),
 * 2x2 category cards with headers, dense product carousels.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import PetCard from "@/components/PetCard";
import ProductCard from "@/components/ProductCard";
import ScrollCarousel from "@/components/ScrollCarousel";
import Image from "next/image";
import {
  ShoppingBag,
  Pill,
  Dog,
  Stethoscope,
  Mail,
  Clock,
  Package,
  Heart,
  Scissors,
  Bone,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Star
} from "lucide-react";
import styles from "./Dashboard.module.css";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useSiteSettings } from "@/lib/useSiteSettings";

/* ------------------------------------------------------------------ */
/*  Recently-viewed tracking helpers                                   */
/* ------------------------------------------------------------------ */

const RECENT_KEY = "sammy_recently_viewed";

type RecentItem = {
  id: string;
  type: "product" | "pet";
  timestamp: number;
};

function getRecentlyViewed(): RecentItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/*  Category cards config (Amazon-style 2x2 blocks with headers)       */
/* ------------------------------------------------------------------ */

const IconMap: Record<string, any> = {
  Bone, Dog, ShoppingBag, Sparkles, Pill, Scissors, Heart, Stethoscope
};

const DEFAULT_CATEGORY_CARDS = [
  {
    title: "Pet Food & Treats",
    link: "/shop?category=food",
    items: [
      { name: "Dry Food", icon: Bone, color: "#FFF3E0", iconColor: "#E65100", slug: "food" },
      { name: "Wet Food", icon: Bone, color: "#FFF8E1", iconColor: "#FF8F00", slug: "food" },
      { name: "Treats", icon: Sparkles, color: "#F1F8E9", iconColor: "#558B2F", slug: "food" },
      { name: "Supplements", icon: Pill, color: "#E8F5E9", iconColor: "#2E7D32", slug: "medication" },
    ],
  },
  {
    title: "Toys & Play",
    link: "/shop?category=toy",
    items: [
      { name: "Chew Toys", icon: Dog, color: "#E8F5E9", iconColor: "#2E7D32", slug: "toy" },
      { name: "Interactive", icon: Sparkles, color: "#E3F2FD", iconColor: "#1565C0", slug: "toy" },
      { name: "Outdoor", icon: Heart, color: "#FFF3E0", iconColor: "#E65100", slug: "toy" },
      { name: "Plush", icon: Heart, color: "#FCE4EC", iconColor: "#AD1457", slug: "toy" },
    ],
  },
  {
    title: "Health & Medication",
    link: "/shop?category=medication",
    items: [
      { name: "Vitamins", icon: Pill, color: "#E3F2FD", iconColor: "#1565C0", slug: "medication" },
      { name: "Flea & Tick", icon: Stethoscope, color: "#E8F5E9", iconColor: "#2E7D32", slug: "medication" },
      { name: "Dental Care", icon: Sparkles, color: "#FFF3E0", iconColor: "#E65100", slug: "medication" },
      { name: "First Aid", icon: Heart, color: "#FCE4EC", iconColor: "#AD1457", slug: "medication" },
    ],
  },
  {
    title: "Grooming & Care",
    link: "/shop?category=grooming",
    items: [
      { name: "Shampoo", icon: Scissors, color: "#FCE4EC", iconColor: "#AD1457", slug: "grooming" },
      { name: "Brushes", icon: Scissors, color: "#F3E5F5", iconColor: "#6A1B9A", slug: "grooming" },
      { name: "Nail Care", icon: Scissors, color: "#E3F2FD", iconColor: "#1565C0", slug: "grooming" },
      { name: "Accessories", icon: ShoppingBag, color: "#FFF3E0", iconColor: "#E65100", slug: "accessories" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Greeting helper                                                    */
/* ------------------------------------------------------------------ */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ------------------------------------------------------------------ */
/*  Jiji-style Horizontal Filters Component                            */
/* ------------------------------------------------------------------ */

function JijiFilters({ categories }: { categories: any[] }) {
  // Flatten items for quick filters
  const allItems = categories.flatMap(c => c.items || []);
  if (allItems.length === 0) return null;
  
  return (
    <section className={styles.jijiFiltersStrip}>
      <div className={styles.jijiFiltersScroll}>
        {allItems.map((item: any, i) => (
          <Link key={i} href={`/shop?category=${item.slug}`} className={styles.jijiFilterBox}>
            <div className={styles.jijiFilterIcon} style={{ background: item.color, color: item.iconColor }}>
              <item.icon size={20} />
            </div>
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Promo Slider Component (Amazon-style auto-slide with dots)         */
/* ------------------------------------------------------------------ */

function PromoSlider({ promotions }: { promotions: any[] }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % promotions.length);
    }, 5000);
  }, [promotions.length]);

  useEffect(() => {
    if (promotions.length <= 1) return;
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [promotions.length, startTimer]);

  const goTo = (idx: number) => {
    setCurrent(idx);
    startTimer(); // reset timer on manual nav
  };

  const prev = () => goTo((current - 1 + promotions.length) % promotions.length);
  const next = () => goTo((current + 1) % promotions.length);

  if (promotions.length === 0) return null;

  const promo = promotions[current];

  return (
    <div className={styles.promoSlider}>
      <div className={styles.promoSlide}>
        <Image
          src={promo.image_url}
          alt={promo.title}
          fill
          className={styles.promoImage}
          sizes="(max-width: 768px) 100vw, 60vw"
          priority
        />
        <div className={styles.promoOverlay} />
        <div className={styles.promoContent}>
          <h3 className={styles.promoTitle}>{promo.title}</h3>
          <p className={styles.promoDesc}>{promo.description}</p>
          <Link href={promo.button_link} className={styles.promoBtn}>
            {promo.button_text}
          </Link>
        </div>
      </div>

      {/* Navigation arrows */}
      {promotions.length > 1 && (
        <>
          <button className={`${styles.promoArrow} ${styles.promoArrowLeft}`} onClick={prev} aria-label="Previous">
            <ChevronLeft size={20} />
          </button>
          <button className={`${styles.promoArrow} ${styles.promoArrowRight}`} onClick={next} aria-label="Next">
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {promotions.length > 1 && (
        <div className={styles.promoDots}>
          {promotions.map((_, i) => (
            <button
              key={i}
              className={`${styles.promoDot} ${i === current ? styles.promoDotActive : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function MemberDashboard() {
  const { addToCart } = useCart();
  const { settings } = useSiteSettings();

  const [user, setUser] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [categoryCards, setCategoryCards] = useState<any[]>(DEFAULT_CATEGORY_CARDS);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [recentPets, setRecentPets] = useState<any[]>([]);
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      const [pRes, prodRes, promoRes, categoriesRes, settingsRes] = await Promise.all([
        supabase.from("pets").select("*").eq("is_available", true).limit(8),
        supabase.from("products").select("*").limit(8),
        supabase
          .from("promotions")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .limit(5),
        supabase.from("dashboard_categories").select("*, dashboard_category_items(*)").order("sort_order", { ascending: true }),
        supabase.from("site_settings").select("key, value").in("key", ["vet_whatsapp"]),
      ]);

      if (pRes.data) setPets(pRes.data);
      if (prodRes.data) setProducts(prodRes.data);

      if (categoriesRes.data && categoriesRes.data.length > 0) {
        const mappedCats = categoriesRes.data.map((cat: any) => {
          const items = (cat.dashboard_category_items || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
          return {
            title: cat.title,
            link: cat.link,
            items: items.map((i: any) => ({
              name: i.name,
              icon: IconMap[i.icon_name] || Star,
              color: i.color,
              iconColor: i.icon_color,
              slug: i.slug
            }))
          };
        });
        setCategoryCards(mappedCats);
      }

      const mockPromos = [
        {
          id: "promo1",
          title: "New pet? You've got this.",
          description: "All they need, plus 10% off your first shop when you join Pets Club.",
          button_text: "Shop essentials",
          button_link: "/shop",
          image_url:
            "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1000",
        },
        {
          id: "promo2",
          title: "Picnic days are here",
          description: "Playful toys, tasty treats & days out essentials.",
          button_text: "Shop now",
          button_link: "/shop",
          image_url:
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=1000",
        },
        {
          id: "promo3",
          title: "The bank holiday feeling",
          description: "Enjoy savings on pet accessories for the whole month.",
          button_text: "Shop now",
          button_link: "/shop",
          image_url:
            "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=1000",
        },
      ];
      setPromotions(promoRes.data && promoRes.data.length > 0 ? promoRes.data : mockPromos);

      const wa = settingsRes.data?.find((s) => s.key === "vet_whatsapp")?.value;
      if (wa) setWhatsapp(wa);

      // Recently viewed
      const recent = getRecentlyViewed();
      if (recent.length > 0) {
        const productIds = recent.filter((r) => r.type === "product").map((r) => r.id);
        const petIds = recent.filter((r) => r.type === "pet").map((r) => r.id);
        if (productIds.length > 0) {
          const { data } = await supabase.from("products").select("*").in("id", productIds);
          if (data) setRecentProducts(data);
        }
        if (petIds.length > 0) {
          const { data } = await supabase.from("pets").select("*").in("id", petIds);
          if (data) setRecentPets(data);
        }
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  const hasRecentItems = recentProducts.length > 0 || recentPets.length > 0;

  if (loading) {
    return (
      <div className={styles.loader}>
        <div className={styles.loaderSpinner} />
        <span>Loading your dashboard…</span>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* ─── 1. WELCOME BAR ─── */}
      <section className={styles.welcomeBar}>
        <span className={styles.welcomeText}>
          {getGreeting()}, <strong>{firstName}</strong> 👋
        </span>
        <div className={styles.quickActions}>
          <Link href="/shop" className={styles.quickPill}>
            <ShoppingBag size={16} /> Shop
          </Link>
          <Link href="/#vets" className={styles.quickPill}>
            <Stethoscope size={16} /> Vet
          </Link>
          <Link href="/adoption" className={styles.quickPill}>
            <Dog size={16} /> Pets
          </Link>
          <Link href="/profile" className={styles.quickPill}>
            <Package size={16} /> Orders
          </Link>
          <Link href="/mating" className={styles.quickPill}>
            <Heart size={16} /> Breeding
          </Link>
        </div>
      </section>

      {/* ─── 2. PROMO SLIDER + CATEGORY CARDS (Amazon layout) ─── */}
      <section className={styles.heroRow}>
        {/* Auto-sliding promo — single card visible at a time */}
        <div className={styles.heroPromo}>
          <PromoSlider promotions={promotions} />
        </div>

        {/* Category cards grid — Amazon-style 2x2 blocks */}
        <div className={styles.heroCategoryCards}>
          {categoryCards.slice(0, 2).map((card) => (
            <div key={card.title} className={styles.catCard}>
              <h3 className={styles.catCardTitle}>{card.title}</h3>
              <div className={styles.catCardGrid}>
                {card.items.map((item: any) => (
                  <Link
                    key={item.name}
                    href={`/shop?category=${item.slug}`}
                    className={styles.catCardItem}
                    style={{ "--cat-bg": item.color, "--cat-icon": item.iconColor } as React.CSSProperties}
                  >
                    <div className={styles.catCardIcon}>
                      <item.icon size={20} />
                    </div>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
              <Link href={card.link} className={styles.catCardSeeAll}>
                See all deals <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 2b. MORE CATEGORY CARDS (second row) ─── */}
      <section className={styles.categoryRow}>
        {categoryCards.slice(2).map((card) => (
          <div key={card.title} className={styles.catCard}>
            <h3 className={styles.catCardTitle}>{card.title}</h3>
            <div className={styles.catCardGrid}>
              {card.items.map((item: any) => (
                <Link
                  key={item.name}
                  href={`/shop?category=${item.slug}`}
                  className={styles.catCardItem}
                  style={{ "--cat-bg": item.color, "--cat-icon": item.iconColor } as React.CSSProperties}
                >
                  <div className={styles.catCardIcon}>
                    <item.icon size={20} />
                  </div>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
            <Link href={card.link} className={styles.catCardSeeAll}>
              See all deals <ChevronRight size={14} />
            </Link>
          </div>
        ))}
      </section>

      {/* ─── 2c. JIJI-STYLE FILTERS ─── */}
      <JijiFilters categories={categoryCards} />

      {/* ─── 3. CONTINUE WHERE YOU LEFT OFF ─── */}
      {hasRecentItems && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.titleWithIcon}>
              <Clock className={styles.sectionIcon} />
              <h2>Continue where you left off</h2>
            </div>
          </div>
          <ScrollCarousel>
            {recentProducts.map((p) => (
              <ProductCard
                key={p.id}
                {...p}
                photoUrl={p.photo_url || p.photoUrl}
                onBuy={(item: any) => addToCart(item)}
                rating={p.rating ?? 5.0}
                reviewCount={p.review_count ?? 0}
                badgeText={p.badge_text || ""}
              />
            ))}
            {recentPets.map((pet) => (
              <PetCard
                key={pet.id}
                {...pet}
                photoUrl={pet.photo_url}
                isAvailable={pet.is_available}
              />
            ))}
          </ScrollCarousel>
        </section>
      )}

      {/* ─── 4. TRENDING PRODUCTS ─── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleWithIcon}>
            <Sparkles className={styles.sectionIcon} />
            <h2>Trending Now</h2>
          </div>
          <Link href="/shop" className={styles.viewAll}>
            See all <ChevronRight size={16} />
          </Link>
        </div>
        <ScrollCarousel>
          {products.map((p) => (
            <ProductCard
              key={p.id}
              {...p}
              photoUrl={p.photo_url || p.photoUrl}
              onBuy={(item: any) => addToCart(item)}
              rating={p.rating ?? 5.0}
              reviewCount={p.review_count ?? 0}
              badgeText={p.badge_text || ""}
            />
          ))}
        </ScrollCarousel>
      </section>

      {/* ─── 5. NEWEST PET ARRIVALS ─── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleWithIcon}>
            <Dog className={styles.sectionIcon} />
            <h2>Newest Pet Arrivals</h2>
          </div>
          <Link href="/adoption" className={styles.viewAll}>
            See all <ChevronRight size={16} />
          </Link>
        </div>
        <ScrollCarousel>
          {pets.map((pet) => (
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
      </section>

      {/* ─── 6. PET HEALTH & SERVICES ─── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleWithIcon}>
            <Stethoscope className={styles.sectionIcon} />
            <h2>Pet Health & Services</h2>
          </div>
        </div>

        <div className={styles.healthGrid}>
          <Link href="/#vets" className={styles.healthCard}>
            <div className={styles.healthIconWrap} style={{ background: "#E8F5E9" }}>
              <Stethoscope size={22} color="#2E7D32" />
            </div>
            <div className={styles.healthText}>
              <h3>Symptom Checker</h3>
              <p>Identify common pet health issues quickly.</p>
            </div>
            <ChevronRight size={18} className={styles.healthArrow} />
          </Link>

          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.healthCard} ${styles.vetHighlight}`}
          >
            <div className={styles.healthIconWrap} style={{ background: "#E8F5E9" }}>
              <Mail size={22} color="#2E7D32" />
            </div>
            <div className={styles.healthText}>
              <h3>Talk to a Vet</h3>
              <p>Direct access to certified veterinarians.</p>
              <span className={styles.vetBadge}>24/7</span>
            </div>
            <ChevronRight size={18} className={styles.healthArrow} />
          </a>

          <Link href="/#vets" className={styles.healthCard}>
            <div className={styles.healthIconWrap} style={{ background: "#FFF3E0" }}>
              <Dog size={22} color="#E65100" />
            </div>
            <div className={styles.healthText}>
              <h3>Pet Encyclopedia</h3>
              <p>Breeds, care guides, and training tips.</p>
            </div>
            <ChevronRight size={18} className={styles.healthArrow} />
          </Link>
        </div>
      </section>
    </div>
  );
}
