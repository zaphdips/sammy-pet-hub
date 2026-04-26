"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ImageUpload from "@/components/ImageUpload";
import styles from "../pets/PetsManagement.module.css";

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState<"breeds" | "symptoms">("breeds");
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [breedForm, setBreedForm] = useState({ name: "", type: "dog", description: "", photo_url: "" });
  const [symptomForm, setSymptomForm] = useState({ name: "", pet_type: "dog", description: "", advice: "" });

  async function fetchData() {
    setLoading(true);
    const table = activeTab === "breeds" ? "breeds" : "symptoms";
    const { data } = await supabase.from(table).select("*").order("created_at", { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleAddBreed = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("breeds").insert([breedForm]);
    if (!error) {
      setIsAdding(false);
      setBreedForm({ name: "", type: "dog", description: "", photo_url: "" });
      fetchData();
    }
  };

  const handleAddSymptom = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("symptoms").insert([symptomForm]);
    if (!error) {
      setIsAdding(false);
      setSymptomForm({ name: "", pet_type: "dog", description: "", advice: "" });
      fetchData();
    }
  };

  const deleteItem = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    const table = activeTab === "breeds" ? "breeds" : "symptoms";
    await supabase.from(table).delete().eq("id", id);
    fetchData();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Content Management</h1>
        <button className={styles.addBtn} onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "Cancel" : `+ Add ${activeTab === "breeds" ? "Breed" : "Symptom"}`}
        </button>
      </div>

      <div className={styles.tabs}>
        <button 
          className={activeTab === "breeds" ? styles.activeTab : ""} 
          onClick={() => { setActiveTab("breeds"); setIsAdding(false); }}
        >
          Breed Encyclopedia
        </button>
        <button 
          className={activeTab === "symptoms" ? styles.activeTab : ""} 
          onClick={() => { setActiveTab("symptoms"); setIsAdding(false); }}
        >
          Symptom Guide
        </button>
      </div>

      {isAdding && activeTab === "breeds" && (
        <form className={`${styles.form} glass`} onSubmit={handleAddBreed}>
          <h2>New Breed Entry</h2>
          <ImageUpload 
            bucket="breed-images" 
            label="Breed Photo" 
            onUpload={(url) => setBreedForm({...breedForm, photo_url: url})} 
          />
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Breed Name</label>
              <input 
                type="text" 
                required 
                value={breedForm.name}
                onChange={(e) => setBreedForm({...breedForm, name: e.target.value})}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Pet Type</label>
              <select 
                value={breedForm.type}
                onChange={(e) => setBreedForm({...breedForm, type: e.target.value})}
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
              </select>
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>Description</label>
            <textarea 
              required
              rows={3}
              value={breedForm.description}
              onChange={(e) => setBreedForm({...breedForm, description: e.target.value})}
            />
          </div>
          <button type="submit" className={styles.saveBtn}>Save Breed</button>
        </form>
      )}

      {isAdding && activeTab === "symptoms" && (
        <form className={`${styles.form} glass`} onSubmit={handleAddSymptom}>
          <h2>New Symptom Guide</h2>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Symptom Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Excessive Scratching"
                value={symptomForm.name}
                onChange={(e) => setSymptomForm({...symptomForm, name: e.target.value})}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Pet Type</label>
              <select 
                value={symptomForm.pet_type}
                onChange={(e) => setSymptomForm({...symptomForm, pet_type: e.target.value})}
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>What it might mean (Description)</label>
            <textarea 
              required
              rows={2}
              value={symptomForm.description}
              onChange={(e) => setSymptomForm({...symptomForm, description: e.target.value})}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Advice / Action Plan</label>
            <textarea 
              required
              rows={3}
              value={symptomForm.advice}
              onChange={(e) => setSymptomForm({...symptomForm, advice: e.target.value})}
            />
          </div>
          <button type="submit" className={styles.saveBtn}>Save Symptom</button>
        </form>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {activeTab === "breeds" ? (
                <>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Actions</th>
                </>
              ) : (
                <>
                  <th>Symptom</th>
                  <th>Pet Type</th>
                  <th>Advice</th>
                  <th>Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                {activeTab === "breeds" ? (
                  <>
                    <td>
                      {item.photo_url ? (
                        <img src={item.photo_url} alt={item.name} className={styles.thumb} />
                      ) : "🐾"}
                    </td>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.type}</td>
                    <td>{item.description?.substring(0, 50)}...</td>
                    <td>
                      <button className={styles.deleteBtn} onClick={() => deleteItem(item.id, item.name)}>Delete</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.pet_type}</td>
                    <td>{item.advice?.substring(0, 50)}...</td>
                    <td>
                      <button className={styles.deleteBtn} onClick={() => deleteItem(item.id, item.name)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
