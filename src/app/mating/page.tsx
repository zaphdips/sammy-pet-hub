"use client";

/**
 * Mating Matchmaker (Dynamic)
 *
 * WHY: Now includes a "Post Your Pet" modal with image upload.
 * Only logged-in users can post. Uses Lucide icons for premium feel.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { Search, Filter, Plus, X, Heart, MapPin, Camera, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import PetPedigreeDrawer from "@/components/PetPedigreeDrawer";
import styles from "./Mating.module.css";
import Link from "next/link";
import { useToast } from "@/components/Toast";

export default function MatingPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [filter, setFilter] = useState({ breed: "", gender: "" });
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedPedigreePet, setSelectedPedigreePet] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  
  // Form State
  const [formData, setFormData] = useState({
    pet_name: "", breed: "", gender: "Male", age: "", location: "", photo_url: "", owner_contact: ""
  });

  // Auth check runs ONCE on mount only — not on every filter change
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  // Fetch ads whenever filters change
  useEffect(() => {
    async function fetchAds() {
      let query = supabase.from("mating_ads").select("*");
      if (filter.breed) query = query.ilike("breed", `%${filter.breed}%`);
      if (filter.gender) query = query.eq("gender", filter.gender);
      
      const { data } = await query.order("created_at", { ascending: false });
      if (data) setAds(data);
    }
    fetchAds();
  }, [filter]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { showToast("Please sign in to post.", "warning"); return; }
    if (!formData.photo_url) { showToast("Please upload a pet photo first!", "warning"); return; }

    setSubmitting(true);
    const { error } = await supabase.from("mating_ads").insert([{
      ...formData,
      user_id: user.id
    }]);

    if (!error) {
      showToast("Your pet has been listed in the Matchmaker! 🐾", "success");
      setModalOpen(false);
      setFormData({ pet_name: "", breed: "", gender: "Male", age: "", location: "", photo_url: "", owner_contact: "" });
      // Instant Refresh
      const { data } = await supabase.from("mating_ads").select("*").order("created_at", { ascending: false });
      if (data) setAds(data);
    } else {
      showToast("Couldn't post your listing. Please try again.", "error");
    }
    setSubmitting(false);
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.badge}>Mating Matchmaker</div>
        <h1 className="gradient-text">Find the Perfect Match</h1>
        <p>Connect with other pet owners for responsible mating matchmaking.</p>
      </header>

      <div className={`${styles.filterBar} glass`}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by breed..." 
            value={filter.breed}
            onChange={(e) => setFilter({ ...filter, breed: e.target.value })}
          />
        </div>
        <div className={styles.controls}>
          <select 
            value={filter.gender}
            onChange={(e) => setFilter({ ...filter, gender: e.target.value })}
          >
            <option value="">Any Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <button className={styles.addBtn} onClick={() => setModalOpen(true)}>
            <Plus size={18} />
            Post Your Pet
          </button>
        </div>
      </div>

      {ads.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🐾</div>
          <h3>No listings yet</h3>
          <p>Be the first to post your pet for a match!</p>
          <button className={styles.addBtn} onClick={() => setModalOpen(true)}>
            <Plus size={18} /> Post Your Pet
          </button>
        </div>
      ) : (
      <div className={styles.grid}>
        {ads.map((ad) => (
            <div key={ad.id} className={`${styles.adCard} glass`}>
              <div className={styles.imageWrapper}>
                {ad.photo_url ? (
                  <Image src={ad.photo_url} alt={ad.pet_name} fill className={styles.image} />
                ) : (
                  <div className={styles.placeholder}>🐕💖</div>
                )}
                
                <div className={styles.verifiedBadge}>
                  <ShieldCheck size={12} /> Verified Pedigree
                </div>
                
                <div className={styles.matchPill}>
                  <Sparkles size={12} /> Available
                </div>
              </div>

              <div className={styles.info}>
                <div className={styles.metaRow}>
                  <span className={styles.breedTag}>{ad.breed}</span>
                  <span className={styles.genderTag}>{ad.gender}</span>
                </div>
                
                <h3>{ad.pet_name}</h3>
                
                <div className={styles.statsGrid}>
                  <div className={styles.stat}>
                    <label>Age</label>
                    <strong>{ad.age}</strong>
                  </div>
                  <div className={styles.stat}>
                    <label>Location</label>
                    <strong>{ad.location}</strong>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <button className={styles.pedigreeBtn} onClick={() => setSelectedPedigreePet(ad)}>
                    View Pedigree <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
        ))}
      </div>
      )}

      <PetPedigreeDrawer 
        isOpen={!!selectedPedigreePet} 
        onClose={() => setSelectedPedigreePet(null)} 
        pet={selectedPedigreePet} 
      />

      {/* Post Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          {!user ? (
            /* AUTH TEASER MODAL FOR GUESTS */
            <div className={`${styles.authModal} glass`}>
               <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>
                 <X size={24} />
               </button>
               <div className={styles.authTeaserIcon}>
                 <Sparkles size={60} color="var(--primary-green)" />
               </div>
               <h2>Join the Sammy Hub!</h2>
               <p>To post your pet and find the perfect match, you need to be a verified member of our hub.</p>
               <div className={styles.benefits}>
                 <div className={styles.benefit}><ShieldCheck size={16} /> Verified Pet Profiles</div>
                 <div className={styles.benefit}><Heart size={16} /> Instant Match Notifications</div>
                 <div className={styles.benefit}><MapPin size={16} /> Local Match Discovery</div>
               </div>
               <Link href="/profile" className={styles.joinBtn}>
                  Create Free Account <ArrowRight size={20} />
               </Link>
            </div>
          ) : (
            /* FULL POSTING MODAL FOR MEMBERS */
            <div className={`${styles.modal} glass`}>
              <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>
                <X size={24} />
              </button>
              
              <div className={styles.modalLayout}>
                {/* Left Side: Photo Upload */}
                <div className={styles.modalSidebar}>
                   <h3>Pet Photo</h3>
                   <p>Upload a clear, beautiful photo of your pet.</p>
                   <div className={styles.uploadArea}>
                      <ImageUpload 
                        bucket="pet-images"
                        onUpload={(url) => setFormData({ ...formData, photo_url: url })} 
                      />
                   </div>
                </div>

                {/* Right Side: Form */}
                <div className={styles.modalFormWrapper}>
                  <div className={styles.formHeader}>
                    <h2>Pet Details</h2>
                    <p>Provide accurate information for better matches.</p>
                  </div>

                  <form onSubmit={handlePost} className={styles.form}>
                    <div className={styles.formGrid}>
                      <div className={styles.inputGroup}>
                        <label>Pet Name</label>
                        <input 
                          required
                          type="text" 
                          placeholder="e.g. Buddy"
                          value={formData.pet_name}
                          onChange={(e) => setFormData({ ...formData, pet_name: e.target.value })}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Breed</label>
                        <input 
                          required
                          type="text" 
                          placeholder="e.g. German Shepherd"
                          value={formData.breed}
                          onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Gender</label>
                        <select 
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Age</label>
                        <input 
                          required
                          type="text" 
                          placeholder="e.g. 2 Years"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Location</label>
                        <input 
                          required
                          type="text" 
                          placeholder="e.g. Lagos, Nigeria"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>WhatsApp Number</label>
                        <input 
                          required
                          type="text" 
                          placeholder="e.g. +234..."
                          value={formData.owner_contact}
                          onChange={(e) => setFormData({ ...formData, owner_contact: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <button 
                      type="submit" 
                      className={styles.submitBtn} 
                      disabled={submitting}
                    >
                      {submitting ? "Posting..." : "Post Match Request"} <Heart size={18} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
