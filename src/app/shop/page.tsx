"use client";

/**
 * Premium Shop Page
 *
 * WHY: Replaces the basic buttons with a clean, pill-based filtering system.
 * Uses Lucide icons and better spacing for a boutique feel.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import { ShoppingBag, Filter, Sparkles, Pill, Plus, X, PackageSearch, ArrowLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./Shop.module.css";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/Toast";

export default function ShopPage() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [filter, setFilter] = useState(searchParams.get("category") || "all");
  const [targetPet, setTargetPet] = useState("all");
  const [subCat, setSubCat] = useState("all");
  const [manufacturer, setManufacturer] = useState("all");
  const [medForm, setMedForm] = useState("all");
  const [toyMaterial, setToyMaterial] = useState("all");
  const [healthBenefit, setHealthBenefit] = useState("all");
  const [options, setOptions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRequestModal, setRequestModal] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setFilter(searchParams.get("category") || "all");
  }, [searchParams]);

  useEffect(() => {
    async function fetchInitial() {
      const { data } = await supabase.from("filter_options").select("*");
      if (data) {
        setOptions(data);
        const cats = data.filter(o => o.group_key === "product_category");
        setCategories([{ label: "All Items", value: "all" }, ...cats]);
      }
    }
    fetchInitial();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      let query = supabase.from("products").select("*");
      
      if (filter !== "all") query = query.eq("category", filter);
      if (targetPet !== "all") query = query.eq("target_pet", targetPet);
      if (subCat !== "all") query = query.eq("sub_category", subCat);
      if (manufacturer !== "all") query = query.eq("manufacturer", manufacturer);
      if (medForm !== "all") query = query.eq("medication_form", medForm);
      if (toyMaterial !== "all") query = query.eq("toy_material", toyMaterial);
      if (healthBenefit !== "all") query = query.eq("health_benefit", healthBenefit);
      
      // Fuzzy Name Search with Reset Logic
      if (search && search.trim() !== "") {
        query = query.ilike("name", `%${search}%`);
      }
      
      const { data } = await query;
      if (data) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, [filter, targetPet, subCat, manufacturer, medForm, toyMaterial, healthBenefit, search]);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Link href="/" className={styles.backBtn}>
          <ArrowLeft size={18} /> Back to Home
        </Link>
        <header className={styles.header}>
          <div className={styles.badge}>Official Shop</div>
          <h1 className="gradient-text">Pet Care Essentials</h1>
          <p>Expertly curated toys, premium medication, and accessories for your companions.</p>
        </header>

      <div className={styles.filterTopBar}>
        <div className={styles.categoryTabs}>
          {categories.map((c) => (
            <button 
              key={c.value}
              className={`${styles.filterTab} ${filter === c.value ? styles.active : ""}`} 
              onClick={() => setFilter(c.value)}
            >
              <span>{c.label}</span>
            </button>
          ))}
        </div>
        <button className={styles.filterToggleBtn} onClick={() => setIsFilterDrawerOpen(true)}>
          <Filter size={18} /> Filters
        </button>
      </div>

      {isFilterDrawerOpen && (
        <div className={styles.filterDrawerOverlay} onClick={() => setIsFilterDrawerOpen(false)}>
          <div className={`${styles.filterDrawer} glass`} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h2>Filters</h2>
              <button className={styles.closeDrawerBtn} onClick={() => setIsFilterDrawerOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className={styles.drawerContent}>
              <div className={styles.filterGroup}>
                <label>Target Pet</label>
                <select value={targetPet} onChange={(e) => setTargetPet(e.target.value)}>
                  <option value="all">For All Pets</option>
                  <option value="dog">For Dogs Only</option>
                  <option value="cat">For Cats Only</option>
                  <option value="bird">For Birds Only</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Manufacturer / Brand</label>
                <select value={manufacturer} onChange={(e) => setManufacturer(e.target.value)}>
                  <option value="all">All Brands</option>
                  {options.filter(o => o.table_name === 'product_manufacturers').map(opt => (
                    <option key={opt.id} value={opt.option_value}>{opt.option_label}</option>
                  ))}
                </select>
              </div>

              {filter === 'medication' && (
                <>
                  <div className={styles.filterGroup}>
                    <label>Medication Form</label>
                    <select value={medForm} onChange={(e) => setMedForm(e.target.value)}>
                      <option value="all">Any Form</option>
                      {options.filter(o => o.table_name === 'product_med_forms').map(opt => (
                        <option key={opt.id} value={opt.option_value}>{opt.option_label}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.filterGroup}>
                    <label>Health Benefit</label>
                    <select value={healthBenefit} onChange={(e) => setHealthBenefit(e.target.value)}>
                      <option value="all">Any Benefit</option>
                      {options.filter(o => o.table_name === 'product_health_benefits').map(opt => (
                        <option key={opt.id} value={opt.option_value}>{opt.option_label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {filter === 'toy' && (
                <div className={styles.filterGroup}>
                  <label>Material</label>
                  <select value={toyMaterial} onChange={(e) => setToyMaterial(e.target.value)}>
                    <option value="all">Any Material</option>
                    {options.filter(o => o.table_name === 'product_toy_materials').map(opt => (
                      <option key={opt.id} value={opt.option_value}>{opt.option_label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.filterGroup}>
                <label>Specific Type</label>
                <select value={subCat} onChange={(e) => setSubCat(e.target.value)}>
                  <option value="all">All Types</option>
                  {categories.filter(c => c.parent_category === filter).map(cat => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <button 
                className={styles.resetFiltersBtn}
                onClick={() => {
                  setTargetPet("all"); setSubCat("all"); setManufacturer("all");
                  setMedForm("all"); setToyMaterial("all"); setHealthBenefit("all");
                  setIsFilterDrawerOpen(false);
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.skeletonGrid}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={`${styles.skeletonImage} ${styles.shimmer}`} />
              <div className={styles.skeletonBody}>
                <div className={`${styles.skeletonLine} ${styles.skeletonLineWide} ${styles.shimmer}`} />
                <div className={`${styles.skeletonLine} ${styles.skeletonLineNarrow} ${styles.shimmer}`} />
                <div className={`${styles.skeletonLine} ${styles.skeletonLineNarrow} ${styles.shimmer}`} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard 
              key={product.id}
              id={product.id}
              name={product.name}
              category={product.category}
              price={product.price}
              discountPrice={product.discount_price}
              photoUrl={product.photo_url || product.photo_urls?.[0]}
              description={product.description}
              isSoldOut={product.is_sold_out || product.stock_count <= 0}
              stockCount={product.stock_count}
              onBuy={(p) => addToCart(p)}
            />
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <PackageSearch size={64} strokeWidth={1.2} />
          </div>
          <h3>Nothing found here yet</h3>
          <p>We couldn't find any products matching your filters. Try broadening your search or check back soon as we restock regularly!</p>
          <button
            className={styles.emptyResetBtn}
            onClick={() => { setFilter("all"); setTargetPet("all"); setSearch(""); }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* REQUEST SECTION */}
      <section className={styles.requestSection}>
        <div className={`${styles.requestCard} glass`}>
          <div className={styles.requestContent}>
            <div className={styles.requestBadge}>Concierge Service</div>
            <h2>Can't find what you're looking for?</h2>
            <p>If you need a specific medication, rare toy, or specialized gear that isn't in our catalog, let our team source it for you.</p>
            <button className={styles.requestBtn} onClick={() => setRequestModal(true)}>
              <Plus size={18} /> Request a Product
            </button>
          </div>
          <div className={styles.requestIllustration}>
            <ShoppingBag size={120} />
          </div>
        </div>
      </section>

      {/* REQUEST MODAL */}
      {isRequestModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} glass`}>
             <button className={styles.closeBtn} onClick={() => setRequestModal(false)}>
               <X size={24} />
             </button>
             
             <div className={styles.modalHeader}>
               <h2>Special Request</h2>
               <p>Tell us what you need, and we'll notify you as soon as we source it.</p>
             </div>

             <form className={styles.form} onSubmit={(e) => {
               e.preventDefault();
               showToast("Request sent! Our concierge team will get back to you soon. 🛍️", "success");
               setRequestModal(false);
             }}>
               <div className={styles.inputGroup}>
                 <label>Product Name / Description</label>
                 <input type="text" placeholder="e.g. 500mg Heartworm Medication" required />
               </div>

               <div className={styles.row}>
                 <div className={styles.inputGroup}>
                   <label>Category</label>
                   <select>
                     <option>Medication</option>
                     <option>Toys</option>
                     <option>Accessories</option>
                     <option>Other</option>
                   </select>
                 </div>
                 <div className={styles.inputGroup}>
                   <label>Urgency Level</label>
                   <select>
                     <option>Normal</option>
                     <option>Urgent (Needed within 48h)</option>
                     <option>Future Interest</option>
                   </select>
                 </div>
               </div>

               <button type="submit" className={styles.submitBtn}>
                 Submit Request
               </button>
             </form>
          </div>
        </div>
      )}
      </div>
    </main>
  );
}
