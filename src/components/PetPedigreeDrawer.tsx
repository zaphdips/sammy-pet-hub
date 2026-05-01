"use client";

import { X, ShieldCheck, Heart, MapPin, Calendar, Award, Activity } from "lucide-react";
import styles from "./PetPedigreeDrawer.module.css";
import Image from "next/image";

export default function PetPedigreeDrawer({ isOpen, onClose, pet }: { 
  isOpen: boolean, 
  onClose: () => void, 
  pet: any 
}) {
  if (!pet) return null;

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose}></div>}
      
      <div className={`${styles.drawer} ${isOpen ? styles.open : ""}`}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <Award size={24} color="var(--primary-green)" />
            <h2>Pet Pedigree Dossier</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.heroImage}>
            {pet.photo_url ? (
               <Image src={pet.photo_url} alt={pet.pet_name} fill className={styles.image} />
            ) : (
               <div className={styles.placeholder}>🐾</div>
            )}
            <div className={styles.heroBadge}>Elite Match</div>
          </div>

          <div className={styles.mainInfo}>
            <div className={styles.nameSection}>
              <h1>{pet.pet_name}</h1>
              <span className={styles.breedLabel}>{pet.breed}</span>
            </div>

            <div className={styles.healthStatus}>
              <div className={styles.statusItem}>
                <ShieldCheck size={18} color="#22c55e" />
                <span>Fully Vaccinated</span>
              </div>
              <div className={styles.statusItem}>
                <Activity size={18} color="#3b82f6" />
                <span>Health Certified</span>
              </div>
            </div>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailCard}>
              <Calendar size={20} />
              <label>Age</label>
              <strong>{pet.age}</strong>
            </div>
            <div className={styles.detailCard}>
              <Heart size={20} />
              <label>Gender</label>
              <strong>{pet.gender}</strong>
            </div>
            <div className={styles.detailCard}>
              <MapPin size={20} />
              <label>Location</label>
              <strong>{pet.location}</strong>
            </div>
          </div>

          <div className={styles.pedigreeSection}>
            <h3>Lineage & Traits</h3>
            <div className={styles.traitList}>
              <div className={styles.trait}><span>Purebred</span> <strong>Yes</strong></div>
              <div className={styles.trait}><span>Champion Bloodline</span> <strong>Yes</strong></div>
              <div className={styles.trait}><span>Registration</span> <strong>AKC Verified</strong></div>
            </div>
          </div>

          <div className={styles.actionSection}>
             <a href={`https://wa.me/${pet.owner_contact}`} target="_blank" className={styles.contactBtn}>
               Request Match Interview
             </a>
             <p>Member communication is secured by Pet Corner.</p>
          </div>
        </div>
      </div>
    </>
  );
}
