"use client";

/**
 * Premium Showcase Modal
 *
 * WHY: Provides a high-end detail view for both pets and products.
 * Includes a multi-image gallery, bold info layout, and quick CTAs.
 */

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { X, MessageCircle, ShoppingCart, ChevronLeft, ChevronRight, Info, CheckCircle } from "lucide-react";
import styles from "./ShowcaseModal.module.css";

type ShowcaseProps = {
  isOpen: boolean;
  onClose: () => void;
  data: {
    id?: string;
    name: string;
    description: string;
    price?: string;
    discount_price?: string;
    photo_urls: string[];
    specs: { label: string; value: string | null }[];
    type: "pet" | "product";
  };
};

export default function ShowcaseModal({ isOpen, onClose, data }: ShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { addToCart } = useCart();
  const router = useRouter();
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleBuy = () => {
    const priceValue = parseFloat(data.price?.replace(/[^0-9.]/g, '') || "0");
    addToCart({
      id: data.id,
      name: data.name,
      category: data.type === 'pet' ? 'Pet Adoption' : 'Product',
      price: priceValue
    });
    onClose();
    router.push("/checkout");
  };

  const images = data.photo_urls?.filter(url => !!url) || [];
  const hasMultiple = images.length > 1;

  const nextImg = () => setActiveIndex((prev) => (prev + 1) % images.length);
  const prevImg = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Hi Sammy Pet Hub! I'm interested in ${data.name}. Can I get more details?`);
    window.open(`https://wa.me/2348000000000?text=${text}`, "_blank"); // Replace with dynamic contact
  };

  return createPortal(
    <div className={styles.overlay}>
      <div className={`${styles.modal} glass`}>
        <button className={styles.closeBtn} onClick={onClose}><X size={32} /></button>
        
        <div className={styles.layout}>
          {/* Left: Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainStage}>
              {images.length > 0 ? (
                <img src={images[activeIndex]} alt={data.name} className={styles.mainImage} />
              ) : (
                <div className={styles.placeholder}>🐾</div>
              )}
              
              {hasMultiple && (
                <div className={styles.navArrows}>
                  <button onClick={prevImg}><ChevronLeft /></button>
                  <button onClick={nextImg}><ChevronRight /></button>
                </div>
              )}
            </div>
            
            {hasMultiple && (
              <div className={styles.thumbnails}>
                {images.map((img, i) => (
                  <button 
                    key={i} 
                    className={`${styles.thumbBtn} ${i === activeIndex ? styles.activeThumb : ""}`}
                    onClick={() => setActiveIndex(i)}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className={styles.info}>
            <header className={styles.header}>
              <span className={styles.typeTag}>{data.type === 'pet' ? 'Pet Spotlight' : 'Product Details'}</span>
              <h1>{data.name}</h1>
              {data.price && (
                <div className={styles.priceArea}>
                  <span className={styles.price}>₦{data.price}</span>
                  {data.discount_price && <span className={styles.discount}>₦{data.discount_price}</span>}
                </div>
              )}
            </header>

            <section className={styles.description}>
              <h3>About this {data.type}</h3>
              <p>{data.description || "No description provided."}</p>
            </section>

            <section className={styles.specs}>
              <h3>Key Information</h3>
              <div className={styles.specsGrid}>
                {data.specs.map((spec, i) => spec.value && (
                  <div key={i} className={styles.specItem}>
                    <label>{spec.label}</label>
                    <span>{spec.value}</span>
                  </div>
                ))}
              </div>
            </section>

            <div className={styles.ctas}>
              <button className={styles.buyBtn} onClick={handleBuy}>
                {data.type === 'pet' ? 'Buy this Pet' : 'Add to Cart'}
                {data.type === 'product' ? <ShoppingCart size={20} /> : <CheckCircle size={20} />}
              </button>
              <button className={styles.whatsappBtn} onClick={handleWhatsApp}>
                Inquire on WhatsApp
                <MessageCircle size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
