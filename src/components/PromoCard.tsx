import Image from "next/image";
import Link from "next/link";
import styles from "./PromoCard.module.css";

type PromoCardProps = {
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
};

export default function PromoCard({ title, description, imageUrl, buttonText, buttonLink }: PromoCardProps) {
  return (
    <div className={styles.card}>
      <Image src={imageUrl} alt={title} fill className={styles.image} />
      <div className={styles.contentWrapper}>
        <div className={styles.insetCard}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.desc}>{description}</p>
          <Link href={buttonLink} className={styles.actionBtn}>
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
}
