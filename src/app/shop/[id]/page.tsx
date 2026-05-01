"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { ArrowLeft, ShieldCheck, Truck, RefreshCw, Star, Tag } from "lucide-react";
import Link from "next/link";
import styles from "./ProductDetail.module.css";
import Image from "next/image";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      
      if (error || !data) {
        console.error("Failed to load product", error);
        router.push("/shop");
        return;
      }
      
      setProduct(data);
      setActiveImage(data.photo_url || data.photo_urls?.[0] || "");
      setLoading(false);
    }
    
    fetchProduct();
  }, [id, router]);

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.loader}>Loading product details...</div>
      </main>
    );
  }

  const isSoldOut = product.is_sold_out || product.stock_count <= 0;
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const currentPrice = hasDiscount ? product.discount_price : product.price;

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const images = product.photo_urls?.length > 0 ? product.photo_urls : [product.photo_url].filter(Boolean);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <Link href="/shop" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Shop
          </Link>
          <span className={styles.divider}>/</span>
          <span className={styles.categoryName}>{product.category}</span>
          <span className={styles.divider}>/</span>
          <span className={styles.currentName}>{product.name}</span>
        </div>

        <div className={styles.layout}>
          {/* LEFT: Image Gallery */}
          <div className={styles.gallerySection}>
            <div className={styles.mainImageWrapper}>
              {activeImage ? (
                <Image src={activeImage} alt={product.name} fill className={styles.mainImage} />
              ) : (
                <div className={styles.placeholder}>🎁 No Image</div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className={styles.thumbnailsList}>
                {images.map((img: string, i: number) => (
                  <button 
                    key={i} 
                    className={`${styles.thumbnailBtn} ${activeImage === img ? styles.activeThumb : ""}`}
                    onClick={() => setActiveImage(img)}
                  >
                    <Image src={img} alt={`View ${i+1}`} fill className={styles.thumbnailImg} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <div className={styles.infoSection}>
            {product.badge_text && (
              <div className={styles.promoBadge}>{product.badge_text}</div>
            )}
            
            <h1 className={styles.title}>{product.name}</h1>
            
            <div className={styles.ratingRow}>
              <span className={styles.stars}>{"★".repeat(Math.round(product.rating || 5))}{"☆".repeat(5 - Math.round(product.rating || 5))}</span>
              <span className={styles.reviewCount}>{product.review_count || 0} reviews</span>
              {product.manufacturer && (
                <>
                   <span className={styles.divider}>•</span>
                   <span className={styles.brandName}>By {product.manufacturer}</span>
                </>
              )}
            </div>

            <div className={styles.priceRow}>
              <span className={styles.currentPrice}>{formatPrice(currentPrice)}</span>
              {hasDiscount && (
                <span className={styles.originalPrice}>{formatPrice(product.price)}</span>
              )}
            </div>

            <p className={styles.description}>{product.description}</p>

            {/* Quantity and Actions */}
            <div className={styles.actionArea}>
              {!isSoldOut && (
                <div className={styles.quantityWrapper}>
                  <label>Quantity</label>
                  <div className={styles.quantityControl}>
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock_count || 99, quantity + 1))} disabled={quantity >= (product.stock_count || 99)}>+</button>
                  </div>
                </div>
              )}

              {isSoldOut ? (
                <button className={`${styles.addToBasketBtn} ${styles.soldOutBtn}`} disabled>
                  Out of Stock
                </button>
              ) : (
                <button className={styles.addToBasketBtn} onClick={handleAddToCart}>
                  Add to Basket
                </button>
              )}
            </div>

            {/* Stock Level Warning */}
            {product.stock_count > 0 && product.stock_count <= 5 && !isSoldOut && (
               <div className={styles.lowStockWarning}>
                 <Tag size={16} /> Only {product.stock_count} left in stock - order soon.
               </div>
            )}

            {/* USPs */}
            <div className={styles.uspList}>
              <div className={styles.uspItem}>
                <Truck size={20} color="var(--primary-green)" />
                <div>
                  <strong>Free Delivery</strong>
                  <span>On orders over ₦15,000</span>
                </div>
              </div>
              <div className={styles.uspItem}>
                <ShieldCheck size={20} color="var(--primary-green)" />
                <div>
                  <strong>Secure Payment</strong>
                  <span>Your data is protected</span>
                </div>
              </div>
              <div className={styles.uspItem}>
                <RefreshCw size={20} color="var(--primary-green)" />
                <div>
                  <strong>Easy Returns</strong>
                  <span>30-day return policy</span>
                </div>
              </div>
            </div>

            {/* Spec Table */}
            <div className={styles.specTable}>
              <h3>Product Specifications</h3>
              <ul>
                <li><strong>Target Pet</strong> <span>{product.target_pet === 'all' ? 'All Pets' : product.target_pet}</span></li>
                <li><strong>Category</strong> <span style={{textTransform: 'capitalize'}}>{product.category}</span></li>
                {product.sub_category && <li><strong>Type</strong> <span>{product.sub_category}</span></li>}
                {product.medication_form && <li><strong>Form</strong> <span>{product.medication_form}</span></li>}
                {product.toy_material && <li><strong>Material</strong> <span>{product.toy_material}</span></li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
