"use client";

/**
 * Admin Pets Management
 *
 * Allows admin to add, edit, and view all pet listings.
 * Images are uploaded to Supabase Storage (pet-images bucket).
 * All inputs are validated before submission.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { validatePetForm, ALLOWED_GENDERS } from "@/lib/validation";
import ImageUpload from "@/components/ImageUpload";
import styles from "./PetsManagement.module.css";

const EMPTY_FORM = { name: "", type: "dog", breed: "", age: "Puppy", gender: "Male", size: "Medium", description: "", photo_urls: [] as string[] };

export default function PetsManagement() {
  const [pets, setPets] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { 
    fetchPets(); 
    fetchOptions();
  }, []);

  async function fetchOptions() {
    const { data } = await supabase.from("filter_options").select("*");
    if (data) setOptions(data);
  }

  async function fetchPets() {
    const { data } = await supabase.from("pets").select("*").order("created_at", { ascending: false });
    if (data) setPets(data);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate before touching the DB
    const validation = validatePetForm(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("pets").insert([{
      name: formData.name,
      type: formData.type,
      breed: formData.breed,
      age: formData.age,
      gender: formData.gender,
      description: formData.description,
      photo_urls: formData.photo_urls || [],
      photo_url: formData.photo_urls?.[0] || null,
      is_available: true,
    }]);

    if (error) {
      setErrors({ form: "Failed to save. Check your permissions." });
      console.error("[Admin Pets] Insert error:", error.message);
    } else {
      setIsAdding(false);
      setFormData(EMPTY_FORM);
      setErrors({});
      fetchPets();
    }
    setSaving(false);
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await supabase.from("pets").update({ is_available: !current }).eq("id", id);
    fetchPets();
  };

  const deletePet = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) return;
    const { error } = await supabase.from("pets").delete().eq("id", id);
    if (error) alert("Failed to delete.");
    else fetchPets();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Manage Pet Listings</h1>
        <button className={styles.addBtn} onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "Cancel" : "+ Add New Pet"}
        </button>
      </div>

      {isAdding && (
        <form className={`${styles.form} glass`} onSubmit={handleSubmit}>
          <h2>New Pet Listing</h2>

          {/* Image upload — goes to Supabase Storage */}
          <div className={styles.imageGrid}>
            <label>Pet Gallery (Max 5 Photos)</label>
            <div className={styles.uploadRow}>
              {[0, 1, 2, 3, 4].map((i) => (
                <ImageUpload 
                  key={i}
                  bucket="pet-images" 
                  label={i === 0 ? "Main Photo" : `Photo ${i+1}`}
                  onUpload={(url) => {
                    const newUrls = [...(formData.photo_urls || [])];
                    newUrls[i] = url;
                    setFormData({ ...formData, photo_urls: newUrls });
                  }} 
                />
              ))}
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Pet Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Bella"
              />
              {errors.name && <span className={styles.error}>{errors.name}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label>Type *</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                <option value="">Select Type</option>
                {options.filter(o => o.group_key === "pet_type").map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Breed *</label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                placeholder="e.g. Golden Retriever"
              />
              {errors.breed && <span className={styles.error}>{errors.breed}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label>Age Group *</label>
              <select value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })}>
                <option value="">Select Age</option>
                {options.filter(o => o.group_key === "pet_age").map((a) => (
                   <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Gender *</label>
              <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                {ALLOWED_GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Size *</label>
              <select value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })}>
                <option value="">Select Size</option>
                {options.filter(o => o.group_key === "pet_size").map((s) => (
                   <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell adopters about this pet's personality..."
              rows={3}
            />
            {errors.description && <span className={styles.error}>{errors.description}</span>}
          </div>

          {errors.form && <div className={styles.formError}>{errors.form}</div>}

          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? "Saving..." : "Save Pet Listing"}
          </button>
        </form>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Photo</th><th>Name</th><th>Breed</th><th>Type</th><th>Age</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pets.map((pet) => (
              <tr key={pet.id}>
                <td>
                  {pet.photo_url
                    ? <img src={pet.photo_url} alt={pet.name} className={styles.thumb} />
                    : <span className={styles.noPhoto}>🐾</span>}
                </td>
                <td><strong>{pet.name}</strong></td>
                <td>{pet.breed}</td>
                <td>{pet.type}</td>
                <td>{pet.age}</td>
                <td>
                  <span className={pet.is_available ? styles.statusAvailable : styles.statusAdopted}>
                    {pet.is_available ? "Available" : "Adopted"}
                  </span>
                </td>
                <td>
                  <div className={styles.rowActions}>
                    <button
                      className={styles.toggleBtn}
                      onClick={() => toggleAvailability(pet.id, pet.is_available)}
                    >
                      {pet.is_available ? "Adopted" : "Available"}
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => deletePet(pet.id, pet.name)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
