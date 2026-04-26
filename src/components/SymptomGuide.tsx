"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./SymptomGuide.module.css";

type Symptom = {
  id: string;
  pet_type: string;
  name: string;
  illness_name: string;
  description: string;
};

export default function SymptomGuide() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [selectedPet, setSelectedPet] = useState<string>("dog");

  useEffect(() => {
    async function fetchSymptoms() {
      const { data } = await supabase.from("symptoms").select("*");
      if (data) setSymptoms(data);
    }
    fetchSymptoms();
  }, []);

  const filtered = symptoms.filter(s => s.pet_type === selectedPet);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.tag}>Health Center</span>
          <h2>Is Your Pet Acting Strange?</h2>
          <p className={styles.desc}>
            Quickly identify common symptoms and illnesses. 
            Select your pet type to get started.
          </p>

          <div className={styles.petSelector}>
            <button 
              className={selectedPet === "dog" ? styles.active : ""} 
              onClick={() => setSelectedPet("dog")}
            >
              Dogs
            </button>
            <button 
              className={selectedPet === "cat" ? styles.active : ""} 
              onClick={() => setSelectedPet("cat")}
            >
              Cats
            </button>
          </div>

          <div className={styles.symptomList}>
            {filtered.map((s) => (
              <div key={s.id} className={styles.symptomItem}>
                <div className={styles.symptomHeader}>
                  <span className={styles.symptomName}>{s.name}</span>
                  <span className={styles.illnessTag}>{s.illness_name}</span>
                </div>
                <p className={styles.symptomDesc}>{s.description}</p>
                <button className={styles.vetBtn}>Consult a Vet</button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.visualSide}>
          {/* Placeholder for the annotated pet imagery */}
          <div className={`${styles.imagePlaceholder} glass`}>
            <span>🔍</span>
            <p>Interactive Symptom Map Coming Soon</p>
          </div>
        </div>
      </div>
    </section>
  );
}
