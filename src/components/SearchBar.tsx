"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./SearchBar.module.css";

type SearchResult = {
  id: string;
  name: string;
  category: "Pets" | "Breeds" | "Products" | "Symptoms";
};

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  // Tracks the latest request so stale results from older fetches are discarded
  const requestIdRef = useRef(0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      // Increment and capture this request's ID
      const currentId = ++requestIdRef.current;
      setIsLoading(true);
      try {
        const [petsRes, breedsRes, productsRes, illnessesRes] = await Promise.all([
          supabase.from("pets").select("id, name").ilike("name", `%${query}%`).limit(3),
          supabase.from("filter_options").select("value, label").eq("group_key", "pet_breed").ilike("label", `%${query}%`).limit(3),
          supabase.from("products").select("id, name").ilike("name", `%${query}%`).limit(3),
          supabase.from("pet_illnesses").select("id, name").ilike("name", `%${query}%`).limit(3),
        ]);

        // Discard this result if a newer request has already started
        if (currentId !== requestIdRef.current) return;

        const combined: any[] = [
          ...(petsRes.data?.map(i => ({ id: i.id, name: i.name, category: "Pets", type: "pet" })) || []),
          ...(breedsRes.data?.map(i => ({ id: i.value, name: i.label, category: "Breeds", type: "breed" })) || []),
          ...(productsRes.data?.map(i => ({ id: i.id, name: i.name, category: "Products", type: "product" })) || []),
          ...(illnessesRes.data?.map(i => ({ id: i.id, name: i.name, category: "Health", type: "illness" })) || []),
        ];

        setResults(combined);
        setIsOpen(true);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        if (currentId === requestIdRef.current) setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: any) => {
    setIsOpen(false);
    setQuery("");
    
    if (item.type === "pet") {
      window.location.href = `/adoption?search=${encodeURIComponent(item.name)}`;
    } else if (item.type === "breed") {
      // Pass the name (label) instead of the value ID to match the pets table
      window.location.href = `/adoption?breed=${encodeURIComponent(item.name)}`;
    } else if (item.type === "product") {
      window.location.href = `/shop?search=${encodeURIComponent(item.name)}`;
    } else if (item.type === "illness") {
      window.location.href = "/#vets";
    }
  };

  return (
    <div className={styles.searchWrapper} ref={searchRef}>
      <div className={`${styles.searchBox} ${isOpen ? styles.active : ""}`}>
        <svg 
          className={styles.searchIcon} 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          placeholder="Search pets, toys, breeds..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className={styles.searchInput}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              window.location.href = `/adoption?search=${encodeURIComponent(query)}`;
            }
          }}
        />
        {isLoading && <div className={styles.loader}></div>}
      </div>

      {isOpen && results.length > 0 && (
        <div className={`${styles.resultsDropdown} glass`}>
          {["Pets", "Breeds", "Products", "Health"].map((cat) => {
            const catResults = results.filter((r: any) => r.category === cat);
            if (catResults.length === 0) return null;
            return (
              <div key={cat} className={styles.categoryGroup}>
                <div className={styles.categoryLabel}>{cat}</div>
                {catResults.map((res: any) => (
                  <div 
                    key={res.id + res.category} 
                    className={styles.resultItem}
                    onClick={() => handleSelect(res)}
                  >
                    {res.name}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className={`${styles.resultsDropdown} glass`}>
          <div className={styles.noResults}>No matches found for "{query}"</div>
        </div>
      )}
    </div>
  );
}
