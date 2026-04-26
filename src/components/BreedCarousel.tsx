"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import styles from "./BreedCarousel.module.css";

type Breed = {
  id: string;
  name: string;
  pet_type: string;
  description: string;
  photo_url?: string;
};

export default function BreedCarousel() {
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchBreeds() {
      const { data } = await supabase.from("breeds").select("*");
      if (data) setBreeds(data);
    }
    fetchBreeds();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.subtitle}>Encyclopedia</span>
          <h2>Explore Breeds</h2>
        </div>
        <div className={styles.controls}>
          <button onClick={() => scroll("left")} className={styles.arrow}>←</button>
          <button onClick={() => scroll("right")} className={styles.arrow}>→</button>
        </div>
      </div>

      <div className={styles.carouselContainer} ref={scrollRef}>
        {breeds.map((breed) => (
          <div key={breed.id} className={`${styles.breedCard} glass`}>
            <div className={styles.imageWrapper}>
              {breed.photo_url ? (
                <Image src={breed.photo_url} alt={breed.name} fill className={styles.image} />
              ) : (
                <div className={styles.placeholder}>🐕</div>
              )}
            </div>
            <div className={styles.info}>
              <h3>{breed.name}</h3>
              <p>{breed.description.substring(0, 60)}...</p>
              <button className={styles.learnMore}>Learn More</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
