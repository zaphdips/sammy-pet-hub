"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PetCard from "@/components/PetCard";
import { Search, Filter, Dog, Cat, Calendar, X, Send, PawPrint } from "lucide-react";
import { useSearchParams } from "next/navigation";
import styles from "./Adoption.module.css";
import { useToast } from "@/components/Toast";

export default function AdoptionPage() {
  const searchParams = useSearchParams();
  const [pets, setPets] = useState<any[]>([]);
  const [filters, setFilters] = useState({ 
    type: "all", 
    age: "all", 
    gender: "all", 
    size: "all", 
    breed: searchParams.get("breed") || "all", 
    search: searchParams.get("search") || "" 
  });
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({ type: "", breed: "", notes: "", contact: "" });
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setFilters(f => ({
      ...f,
      breed: searchParams.get("breed") || "all",
      search: searchParams.get("search") || ""
    }));
  }, [searchParams]);

  useEffect(() => {
    async function fetchInitialData() {
      const { data: optData } = await supabase.from("filter_options").select("*");
      if (optData) setOptions(optData);
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    async function fetchPets() {
      setLoading(true);
      let query = supabase.from("pets").select("*").eq("is_available", true);
      
      if (filters.type !== "all") query = query.eq("type", filters.type);
      if (filters.age !== "all") query = query.eq("age", filters.age);
      if (filters.gender !== "all") query = query.eq("gender", filters.gender);
      if (filters.size !== "all") query = query.eq("size", filters.size);
      
      // Fuzzy Case-Insensitive Breed Matching
      if (filters.breed !== "all" && filters.breed !== "") {
        query = query.ilike("breed", `%${filters.breed}%`);
      }
      
      // Fuzzy Name Search
      if (filters.search && filters.search.trim() !== "") {
        query = query.ilike("name", `%${filters.search}%`);
      }
      
      const { data } = await query.order("created_at", { ascending: false });
      if (data) setPets(data);
      setLoading(false);
    }
    fetchPets();
  }, [filters]);

  const handlePetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.type && !requestForm.breed) {
      showToast("Please tell us what kind of pet you're looking for.", "warning");
      return;
    }
    setSubmittingRequest(true);
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from("pet_requests").insert([{
      pet_type: requestForm.type,
      breed: requestForm.breed,
      notes: requestForm.notes,
      contact: requestForm.contact,
      user_id: session?.user?.id ?? null,
    }]);
    setSubmittingRequest(false);
    if (error) {
      showToast("Couldn't send your request. Please try again.", "error");
    } else {
      showToast("Request sent! We'll reach out when we find your match. 🐾", "success");
      setIsRequestOpen(false);
      setRequestForm({ type: "", breed: "", notes: "", contact: "" });
    }
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <span className={styles.badge}>Pet Sales</span>
        <h1 className="gradient-text">Find Your New Best Friend</h1>
        <p>Premium pets, health-checked and ready for their new homes.</p>
      </header>

      <div className={`${styles.filterBar} glass`}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>

        <div className={styles.controls}>
          <div className={styles.selectGroup}>
            <Dog size={16} className={styles.selectIcon} />
            <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}>
              <option value="all">Any Species</option>
              {options.filter(o => o.group_key === "pet_type").map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.selectGroup}>
            <Filter size={16} className={styles.selectIcon} />
            <select value={filters.breed} onChange={(e) => setFilters({...filters, breed: e.target.value})}>
              <option value="all">Any Breed</option>
              {options
                .filter(o => o.group_key === "pet_breed" && (filters.type === "all" || o.parent_value === filters.type))
                .map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))
              }
            </select>
          </div>

          <div className={styles.selectGroup}>
            <Calendar size={16} className={styles.selectIcon} />
            <select value={filters.age} onChange={(e) => setFilters({...filters, age: e.target.value})}>
              <option value="all">Any Age</option>
              {options.filter(o => o.group_key === "pet_age").map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.selectGroup}>
            <Calendar size={16} className={styles.selectIcon} />
            <select value={filters.gender} onChange={(e) => setFilters({...filters, gender: e.target.value})}>
              <option value="all">Any Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className={styles.selectGroup}>
            <Filter size={16} className={styles.selectIcon} />
            <select value={filters.size} onChange={(e) => setFilters({...filters, size: e.target.value})}>
              <option value="all">Any Size</option>
              {options.filter(o => o.group_key === "pet_size").map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.skeletonGrid}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={`${styles.skeletonImage} ${styles.shimmer}`} />
              <div className={styles.skeletonBody}>
                <div className={`${styles.skeletonLine} ${styles.skeletonLineWide} ${styles.shimmer}`} />
                <div className={`${styles.skeletonLine} ${styles.skeletonLineNarrow} ${styles.shimmer}`} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {pets.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <PawPrint size={64} strokeWidth={1.2} />
              </div>
              <h3>No pets found matching your filters</h3>
              <p>We couldn't find any pets with your exact criteria. Try broadening your search or clear your filters.</p>
              <button
                className={styles.emptyResetBtn}
                onClick={() => setFilters({ type: "all", age: "all", gender: "all", size: "all", breed: "all", search: "" })}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {pets.map((pet) => (
                <PetCard 
                  key={pet.id}
                  name={pet.name}
                  type={pet.type}
                  breed={pet.breed}
                  age={pet.age}
                  gender={pet.gender}
                  photoUrl={pet.photo_url}
                  isAvailable={pet.is_available}
                />
              ))}
            </div>
          )}
        </>
      )}

      {!loading && (
        <section className={`${styles.requestSection} glass`}>
          <div className={styles.requestContent}>
            <h3>Can't find the breed you're looking for?</h3>
            <p>Tell us what you're dreaming of, and we'll help you find your perfect match.</p>
          </div>
          <button className={styles.requestBtn} onClick={() => setIsRequestOpen(true)}>Request a Pet</button>
        </section>
      )}

      {/* Request a Pet Modal */}
      {isRequestOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} glass`}>
            <button className={styles.closeBtn} onClick={() => setIsRequestOpen(false)}>
              <X size={24} />
            </button>
            <div className={styles.modalHeader}>
              <span className={styles.modalEmoji}>🐾</span>
              <h2>Request a Pet</h2>
              <p>Describe your dream companion and we'll source them for you.</p>
            </div>
            <form onSubmit={handlePetRequest} className={styles.modalForm}>
              <div className={styles.inputGroup}>
                <label>Pet Type</label>
                <select value={requestForm.type} onChange={e => setRequestForm({...requestForm, type: e.target.value})}>
                  <option value="">Select a type...</option>
                  <option value="dog">Dog 🐶</option>
                  <option value="cat">Cat 🐱</option>
                  <option value="bird">Bird 🦜</option>
                  <option value="rabbit">Rabbit 🐰</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Preferred Breed (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Golden Retriever, Persian Cat..."
                  value={requestForm.breed}
                  onChange={e => setRequestForm({...requestForm, breed: e.target.value})}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Additional Notes</label>
                <textarea
                  placeholder="Age preference, colour, temperament, budget..."
                  value={requestForm.notes}
                  onChange={e => setRequestForm({...requestForm, notes: e.target.value})}
                  rows={3}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Your WhatsApp / Email</label>
                <input
                  type="text"
                  placeholder="So we can reach you when we find a match"
                  value={requestForm.contact}
                  onChange={e => setRequestForm({...requestForm, contact: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={submittingRequest}>
                <Send size={18} />
                {submittingRequest ? "Sending..." : "Send Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
