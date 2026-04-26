"use client";

/**
 * Illness Guide Management
 *
 * Manage the "Symptoms & Illnesses" section of the site.
 * Admin can upload photos of sick pets and describe the symptoms.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ImageUpload from "@/components/ImageUpload";
import { Plus, Trash2, X, Activity } from "lucide-react";
import styles from "../pets/PetsManagement.module.css"; // Reuse table/form styles

export default function IllnessManagement() {
  const [illnesses, setIllnesses] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: "", signs: "", explanation: "", photo_url: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchIllnesses(); }, []);

  async function fetchIllnesses() {
    const { data } = await supabase.from("pet_illnesses").select("*").order("created_at", { ascending: false });
    if (data) setIllnesses(data);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.photo_url) return alert("Name and Photo are required.");

    setSaving(true);
    const { error } = await supabase.from("pet_illnesses").insert([formData]);
    if (!error) {
      setIsAdding(false);
      setFormData({ name: "", signs: "", explanation: "", photo_url: "" });
      fetchIllnesses();
    }
    setSaving(false);
  };

  const deleteIllness = async (id: string) => {
    if (!window.confirm("Delete this entry?")) return;
    await supabase.from("pet_illnesses").delete().eq("id", id);
    fetchIllnesses();
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Symptoms & Illness Guide</h1>
        <button className={styles.addBtn} onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "Cancel" : "+ Add New Entry"}
        </button>
      </header>

      {isAdding && (
        <form className={`${styles.form} glass`} onSubmit={handleSubmit}>
          <h2>New Illness/Symptom Entry</h2>
          
          <ImageUpload bucket="content-images" label="Illustration Photo" onUpload={(url) => setFormData({ ...formData, photo_url: url })} />
          
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Illness Name *</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Parvovirus" />
            </div>
            <div className={styles.inputGroup}>
              <label>Visible Signs (Symptoms)</label>
              <input type="text" value={formData.signs} onChange={e => setFormData({ ...formData, signs: e.target.value })} placeholder="e.g. Vomiting, Lethargy" />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Medical Explanation</label>
            <textarea value={formData.explanation} onChange={e => setFormData({ ...formData, explanation: e.target.value })} placeholder="Describe the illness and advice..." rows={3} />
          </div>

          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? "Saving..." : "Save Entry"}
          </button>
        </form>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr><th>Photo</th><th>Name</th><th>Signs</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {illnesses.map((item) => (
              <tr key={item.id}>
                <td><img src={item.photo_url} alt={item.name} className={styles.thumb} /></td>
                <td><strong>{item.name}</strong></td>
                <td>{item.signs}</td>
                <td>
                  <button className={styles.deleteBtn} onClick={() => deleteIllness(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
