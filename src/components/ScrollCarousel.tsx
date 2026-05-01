"use client";

import React, { useRef, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import styles from "./ScrollCarousel.module.css";

export default function ScrollCarousel({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    
    // Calculate progress percentage
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(100);
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const progress = (scrollLeft / maxScroll) * 100;
    setScrollProgress(progress);
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < maxScroll - 1); // -1 for rounding errors
  };

  useEffect(() => {
    handleScroll(); // Initial check
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, [children]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const clientWidth = scrollRef.current.clientWidth;
    const scrollAmount = direction === "left" ? -clientWidth / 2 : clientWidth / 2;
    
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <div className={styles.carouselContainer}>
      <div 
        className={styles.scrollArea} 
        ref={scrollRef} 
        onScroll={handleScroll}
      >
        {React.Children.map(children, child => (
          <div className={styles.item}>{child}</div>
        ))}
      </div>
      
      <div className={styles.controls}>
        <button 
          className={styles.arrowBtn} 
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className={styles.progressBarContainer}>
          <div 
            className={styles.progressBar} 
            style={{ width: `${Math.max(5, scrollProgress)}%` }} // Minimum width so it's always visible
          />
        </div>
        
        <button 
          className={styles.arrowBtn} 
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          aria-label="Scroll right"
        >
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
