import Image from "next/image";
import styles from "./ProductCard.module.css";

type ProductCardProps = {
  name: string;
  category: string;
  price: number;
  discountPrice?: number;
  photoUrl: string;
  description: string;
  onBuy?: (product: any) => void;
};

export default function ProductCard({ 
  name, 
  category, 
  price, 
  discountPrice, 
  photoUrl, 
  description,
  onBuy
}: ProductCardProps) {
  const hasDiscount = discountPrice && discountPrice < price;

  return (
    <div className={`${styles.card} glass`}>
      <div className={styles.imageContainer}>
        {photoUrl ? (
          <Image src={photoUrl} alt={name} fill className={styles.image} />
        ) : (
          <div className={styles.placeholder}>🎁</div>
        )}
        {hasDiscount && <span className={styles.saleBadge}>Sale</span>}
      </div>

      <div className={styles.content}>
        <span className={styles.category}>{category}</span>
        <h3>{name}</h3>
        <p className={styles.desc}>{description.substring(0, 60)}...</p>
        
        <div className={styles.footer}>
          <div className={styles.pricing}>
            {hasDiscount ? (
              <>
                <span className={styles.currentPrice}>₦{discountPrice.toLocaleString()}</span>
                <span className={styles.oldPrice}>₦{price.toLocaleString()}</span>
              </>
            ) : (
              <span className={styles.currentPrice}>₦{price.toLocaleString()}</span>
            )}
          </div>
          
          <div className={styles.btnStack}>
            <button className={styles.buyBtn} onClick={() => onBuy?.({ name, category, price: discountPrice || price })}>
               Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
