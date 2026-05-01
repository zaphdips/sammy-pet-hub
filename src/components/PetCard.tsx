import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useRouter } from "next/navigation";
import { Heart, Info, MapPin, X, Calendar, Dog } from "lucide-react";
import styles from "./PetCard.module.css";
import ShowcaseModal from "./ShowcaseModal";

type PetCardProps = {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: string;
  gender: string;
  price?: number; // Added price for direct sales
  size?: string;
  description?: string;
  photoUrl?: string;
  photo_urls?: string[];
  isAvailable: boolean;
  rating?: number;
  isVerifiedBreeder?: boolean;
  badgeText?: string;
};

export default function PetCard({ 
  id,
  name, 
  type, 
  breed, 
  age, 
  gender, 
  price = 150000, // Default premium price if not set
  size,
  description,
  photoUrl, 
  photo_urls,
  isAvailable,
  rating,
  isVerifiedBreeder,
  badgeText
}: PetCardProps) {
  const [showcaseOpen, setShowcaseOpen] = useState(false);
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const router = useRouter();

  const images = photo_urls && photo_urls.length > 0 ? photo_urls : (photoUrl ? [photoUrl] : []);
  const primaryImg = images[0] || null;

  const handleBuyNow = () => {
    if (!isAvailable) return;
    
    addToCart({
      id,
      name,
      category: "Pet Adoption",
      price: price
    });
  };
  return (
    <>
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          {primaryImg ? (
            <img src={primaryImg} alt={name} className={styles.image} />
          ) : (
            <div className={styles.placeholder}>
              <span>🐾</span>
            </div>
          )}
          <div className={styles.overlay}>
            <span className={isAvailable ? styles.availableBadge : styles.soldBadge}>
              {isAvailable ? "For Sale" : "Sold"}
            </span>
            <button className={styles.likeBtn} aria-label="Favorite">
              <Heart size={20} />
            </button>
          </div>
        </div>
        
        <div className={styles.content}>
          <div className={styles.header}>
            <h3 className={styles.title}>{name}</h3>
            {(rating !== undefined || isVerifiedBreeder) && (
              <div className={styles.ratingRow}>
                 {rating !== undefined && <span className={styles.stars}>{"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}</span>}
                 {isVerifiedBreeder && <span className={styles.reviews}>Verified Breeder</span>}
              </div>
            )}
          </div>
          
          <div className={styles.tagCloud}>
            <span className={styles.tag}>Vaccinated</span>
            <span className={styles.tag}>Health Checked</span>
          </div>
          
          <div className={styles.traits}>
            <div className={styles.trait}>
              <Calendar size={14} />
              <span>{age}</span>
            </div>
            <div className={styles.trait}>
              <Dog size={14} />
              <span>{breed}</span>
            </div>
          </div>
          
          <div className={styles.footer}>
            <div className={styles.pricing}>
              <span className={styles.currentPrice}>{formatPrice(price)}</span>
            </div>

            {badgeText && (
              <div className={styles.badgeWrapper}>
                <span className={styles.easyRepeatBadge}>{badgeText}</span>
              </div>
            )}
          </div>
        </div>

        <button 
          className={styles.buyBtn}
          disabled={!isAvailable}
          onClick={handleBuyNow}
        >
          {isAvailable ? "Add to basket" : "Sold"}
        </button>
      </div>

      <ShowcaseModal 
        isOpen={showcaseOpen} 
        onClose={() => setShowcaseOpen(false)}
        data={{
          id,
          name,
          description: description || "",
          photo_urls: images,
          price: price.toString(),
          type: "pet",
          specs: [
            { label: "Breed", value: breed },
            { label: "Age", value: age },
            { label: "Gender", value: gender },
            { label: "Size", value: size || "Medium" }
          ]
        }}
      />
    </>
  );
}
