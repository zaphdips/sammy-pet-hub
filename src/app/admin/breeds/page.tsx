"use client";

/**
 * Breed Knowledge Base Management
 *
 * Manage the "Pet Breeds Scroll Section".
 * Admin can add new breeds, edit about info, and upload high-res images.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ImageUpload from "@/components/ImageUpload";
import { Plus, Trash2, BookOpen } from "lucide-react";
import styles from "../pets/PetsManagement.module.css";

export default function BreedInfoManagement() {
  const [breeds, setBreeds] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ breed_name: "", about: "", photo_url: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchBreeds(); }, []);

  async function fetchBreeds() {
    const { data } = await supabase.from("pet_breed_info").select("*").order("breed_name");
    if (data) setBreeds(data);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.breed_name || !formData.photo_url) return alert("Name and Photo are required.");

    setSaving(true);
    const { error } = await supabase.from("pet_breed_info").insert([formData]);
    if (!error) {
      setIsAdding(false);
      setFormData({ breed_name: "", about: "", photo_url: "" });
      fetchBreeds();
    }
    setSaving(false);
  };

  const deleteBreed = async (id: string) => {
    if (!window.confirm("Remove this breed info?")) return;
    await supabase.from("pet_breed_info").delete().eq("id", id);
    fetchBreeds();
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Breed Knowledge Base</h1>
        <button className={styles.addBtn} onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "Cancel" : "+ Add Breed Spotlight"}
        </button>
      </header>

      {isAdding && (
        <form className={`${styles.form} glass`} onSubmit={handleSubmit}>
          <h2>New Breed Spotlight</h2>
          <p className={styles.formDesc}>This will appear in the scrollable "Pet Breeds" section on the home page.</p>
          
          <ImageUpload bucket="content-images" label="Breed Photo" onUpload={(url) => setFormData({ ...formData, photo_url: url })} />
          
          <div className={styles.inputGroup}>
            <label>Breed Name *</label>
            <input type="text" value={formData.breed_name} onChange={e => setFormData({ ...formData, breed_name: e.target.value })} placeholder="e.g. Siberian Husky" />
          </div>

          <div className={styles.inputGroup}>
            <label>About this Breed</label>
            <textarea value={formData.about} onChange={e => setFormData({ ...formData, about: e.target.value })} placeholder="History, personality, care tips..." rows={5} />
          </div>

          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? "Saving..." : "Publish Spotlight"}
          </button>
        </form>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr><th>Photo</th><th>Breed Name</th><th>About Snippet</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {breeds.map((item) => (
              <tr key={item.id}>
                <td><img src={item.photo_url} alt={item.breed_name} className={styles.thumb} /></td>
                <td><strong>{item.breed_name}</strong></td>
                <td>{item.about?.substring(0, 80)}...</td>
                <td>
                  <button className={styles.deleteBtn} onClick={() => deleteBreed(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
