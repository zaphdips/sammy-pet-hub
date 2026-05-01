import Image from "next/image";
import Link from "next/link";
import { useCurrency } from "@/context/CurrencyContext";
import styles from "./ProductCard.module.css";

type ProductCardProps = {
  id?: string;
  name: string;
  category: string;
  price: number;
  discountPrice?: number;
  photoUrl: string;
  description: string;
  rating?: number;
  reviewCount?: number;
  badgeText?: string;
  isSoldOut?: boolean;
  stockCount?: number;
  onBuy?: (product: any) => void;
};

export default function ProductCard({ 
  id,
  name, 
  category, 
  price, 
  discountPrice, 
  photoUrl, 
  description,
  rating,
  reviewCount,
  badgeText,
  isSoldOut,
  stockCount,
  onBuy
}: ProductCardProps) {
  const hasDiscount = discountPrice && discountPrice < price;
  const { formatPrice } = useCurrency();

  // Internal fallback logic for missing images
  const finalPhotoUrl = photoUrl || (category?.toLowerCase() === 'toy' 
    ? 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&q=80&w=400' 
    : 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=400');

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {id ? (
          <Link href={`/shop/${id}`}>
            {finalPhotoUrl ? (
              <Image src={finalPhotoUrl} alt={name} fill className={styles.image} />
            ) : (
              <div className={styles.placeholder}>🎁</div>
            )}
            {hasDiscount && <span className={styles.saleBadge}>Sale</span>}
          </Link>
        ) : (
          <>
            {finalPhotoUrl ? (
              <Image src={finalPhotoUrl} alt={name} fill className={styles.image} />
            ) : (
              <div className={styles.placeholder}>🎁</div>
            )}
            {hasDiscount && <span className={styles.saleBadge}>Sale</span>}
          </>
        )}
      </div>

      <div className={styles.content}>
        {id ? (
          <Link href={`/shop/${id}`} className={styles.titleLink}>
            <h3 className={styles.title}>{name}</h3>
          </Link>
        ) : (
          <h3 className={styles.title}>{name}</h3>
        )}
        {rating !== undefined && reviewCount !== undefined && (
          <div className={styles.ratingRow}>
            <span className={styles.stars}>{"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}</span>
            <span className={styles.reviews}>{reviewCount} reviews</span>
          </div>
        )}
        <p className={styles.desc}>{description.substring(0, 40)}...</p>
        
        <div className={styles.footer}>
          <div className={styles.pricing}>
            {hasDiscount ? (
              <span className={styles.currentPrice}>{formatPrice(discountPrice)}</span>
            ) : (
              <span className={styles.currentPrice}>{formatPrice(price)}</span>
            )}
          </div>
          
          {badgeText && (
            <div className={styles.badgeWrapper}>
               <span className={styles.easyRepeatBadge}>{badgeText}</span>
            </div>
          )}
        </div>

        {stockCount !== undefined && stockCount > 0 && !isSoldOut && (
          <div className={styles.stockStatus}>
             Only {stockCount} left in stock
          </div>
        )}
      </div>
      
      {isSoldOut ? (
        <button className={`${styles.buyBtn} ${styles.soldOutBtn}`} disabled>
          Sold Out
        </button>
      ) : (
        <button className={styles.buyBtn} onClick={() => onBuy?.({ name, category, price: discountPrice || price })}>
          Add to basket
        </button>
      )}
    </div>
  );
}
