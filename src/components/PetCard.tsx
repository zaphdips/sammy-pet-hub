import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
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
  isAvailable 
}: PetCardProps) {
  const [showcaseOpen, setShowcaseOpen] = useState(false);
  const { addToCart } = useCart();
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
      <div className={`${styles.card} glass`}>
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
            <h3>{name}</h3>
            <span className={styles.genderBadge}>{gender}</span>
          </div>
          
          <p className={styles.breedInfo}>{breed}</p>
          
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
          
          <div className={styles.priceRow}>
            <span className={styles.priceLabel}>Price</span>
            <span className={styles.priceValue}>₦{price.toLocaleString()}</span>
          </div>

          <div className={styles.btnStack}>
            <button 
              className={styles.buyBtn}
              disabled={!isAvailable}
              onClick={handleBuyNow}
            >
              {isAvailable ? "Add to Cart" : "Sold"}
            </button>
            <button 
              className={styles.detailsBtn} 
              onClick={() => setShowcaseOpen(true)}
            >
               View Details & Gallery
            </button>
          </div>
        </div>
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
