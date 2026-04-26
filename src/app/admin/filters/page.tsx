"use client";

/**
 * Simplified Filter Management (Noob-Friendly)
 *
 * WHY: Organized into 3 clear "Command Centers". 
 * Includes step-by-step instructions and a non-breaking layout.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Dog, Pill, ToyBrick, X, Info, HelpCircle } from "lucide-react";
import styles from "./Filters.module.css";

export default function SimplifiedFilters() {
  const [filters, setFilters] = useState<any[]>([]);
  const [activeCenter, setActiveCenter] = useState<string>("pets");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newOption, setNewOption] = useState<any>({ group_key: "pet_type", label: "", parent_value: null });

  useEffect(() => { fetchFilters(); }, []);

  async function fetchFilters() {
    setLoading(true);
    const { data } = await supabase.from("filter_options").select("*").order("label");
    if (data) setFilters(data);
    setLoading(false);
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = newOption.label.toLowerCase().replace(/\s+/g, "_");
    const { error } = await supabase.from("filter_options").insert([{
      group_key: newOption.group_key,
      label: newOption.label,
      value: val,
      parent_value: newOption.parent_value || null
    }]);

    if (!error) {
      setNewOption({ group_key: "pet_type", label: "", parent_value: null });
      setIsModalOpen(false);
      fetchFilters();
    }
  };

  const centers = [
    { 
      id: "pets", 
      name: "🐶 Pet Categories", 
      desc: "Manage species (Dogs/Cats), specific breeds, and age/size groups.",
      groups: [
        { key: "pet_type", label: "Species", desc: "Main animal types" },
        { key: "pet_breed", label: "Breeds", desc: "Specific types (e.g. Bulldog)" },
        { key: "pet_age", label: "Age Groups", desc: "Puppy, Senior, etc." },
        { key: "pet_size", label: "Sizes", desc: "Small, Medium, Large" },
        { key: "request_reason", label: "Request Reasons", desc: "Reasons for 'Request Pet'" }
      ]
    },
    { 
      id: "meds", 
      name: "💊 Medication Center", 
      desc: "Add specific medicine types, brands, and forms (Pill/Liquid).",
      groups: [
        { key: "medication_type", label: "Med Types", desc: "e.g. Antibiotics, Supplements" },
        { key: "medication_form", label: "Medicine Form", desc: "e.g. Pills, Liquid, Powder" },
        { key: "health_benefit", label: "Health Benefits", desc: "e.g. Joints, Digestion" },
        { key: "product_manufacturer", label: "Brands", desc: "Manufacturers" }
      ]
    },
    { 
      id: "toys", 
      name: "🧸 Toy Center", 
      desc: "Organize your pet toys by type, material, and brand.",
      groups: [
        { key: "toy_type", label: "Toy Types", desc: "e.g. Chews, Puzzles" },
        { key: "toy_material", label: "Material", desc: "e.g. Plush, Rubber, Latex" },
        { key: "product_manufacturer", label: "Brands", desc: "Manufacturers" }
      ]
    }
  ];

  if (loading) return <div className={styles.loader}>Setting up your Command Center...</div>;

  const currentCenter = centers.find(c => c.id === activeCenter);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Category Manager</h1>
        <p>Follow the centers below to organize your pets and shop items.</p>
      </header>

      {/* STEP 1: Select Center */}
      <div className={styles.centerSelector}>
        {centers.map((c) => (
          <button 
            key={c.id} 
            className={`${styles.centerCard} ${activeCenter === c.id ? styles.activeCard : ""}`}
            onClick={() => setActiveCenter(c.id)}
          >
            <div className={styles.cardInfo}>
              <h3>{c.name}</h3>
              <p>{c.desc}</p>
            </div>
            <div className={styles.countBadge}>
               {filters.filter(f => c.groups.some(g => g.key === f.group_key)).length} Active
            </div>
          </button>
        ))}
      </div>

      {/* STEP 2: Manage Sub-categories */}
      <div className={`${styles.workspace} glass`}>
        <div className={styles.workspaceHeader}>
          <div>
            <h2>Managing {currentCenter?.name}</h2>
            <p>Add or delete options that appear in your website filters.</p>
          </div>
          <button className={styles.primaryAddBtn} onClick={() => {
            setNewOption({ ...newOption, group_key: currentCenter?.groups[0].key });
            setIsModalOpen(true);
          }}>
            <Plus size={20} /> Add New Option
          </button>
        </div>

        <div className={styles.grid}>
          {currentCenter?.groups.map(group => (
            <div key={group.key} className={styles.groupCard}>
              <div className={styles.groupHead}>
                <h4>{group.label}</h4>
                <div className={styles.tooltip}>
                  <HelpCircle size={14} />
                  <span className={styles.tooltipText}>{group.desc}</span>
                </div>
              </div>
              <div className={styles.list}>
                {filters.filter(f => f.group_key === group.key).map(f => (
                  <div key={f.id} className={styles.pill}>
                    <span className={styles.pillLabel}>{f.label}</span>
                    {f.parent_value && <span className={styles.parentTag}>({f.parent_value})</span>}
                    <button onClick={() => {
                       if(window.confirm(`Remove ${f.label}?`)) {
                         supabase.from("filter_options").delete().eq("id", f.id).then(() => fetchFilters());
                       }
                    }} className={styles.deletePill}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {filters.filter(f => f.group_key === group.key).length === 0 && (
                  <div className={styles.empty}>Empty</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Banner */}
      <div className={styles.helpBanner}>
        <Info size={18} />
        <span>Adding an option here will instantly make it appear as a choice on your public website.</span>
      </div>

      {/* Simplified Add Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} glass`}>
            <div className={styles.modalHeader}>
              <h3>Add to {currentCenter?.name}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAdd} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Step 1: Choose where to add it</label>
                <select 
                  value={newOption.group_key}
                  onChange={e => setNewOption({ ...newOption, group_key: e.target.value })}
                >
                  {currentCenter?.groups.map(g => (
                    <option key={g.key} value={g.key}>{g.label}</option>
                  ))}
                </select>
              </div>

              {["pet_breed", "medication_type", "toy_type", "product_manufacturer", "medication_form", "toy_material", "health_benefit"].includes(newOption.group_key) && (
                <div className={styles.inputGroup}>
                  <label>Step 2: Which {newOption.group_key === "pet_breed" ? "animal" : "category"} is this for?</label>
                  <select 
                    required
                    value={newOption.parent_value || ""}
                    onChange={e => setNewOption({ ...newOption, parent_value: e.target.value })}
                  >
                    <option value="">Select Parent...</option>
                    {newOption.group_key === "pet_breed" ? (
                      filters.filter(f => f.group_key === "pet_type").map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))
                    ) : (
                      <>
                        <option value="medication">Medication Center</option>
                        <option value="toy">Toy Center</option>
                        <option value="food">Food Center</option>
                        <option value="accessories">Accessories Center</option>
                      </>
                    )}
                  </select>
                </div>
              )}

              <div className={styles.inputGroup}>
                <label>Step 3: Enter the name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Golden Retriever"
                  value={newOption.label}
                  onChange={e => setNewOption({ ...newOption, label: e.target.value })}
                />
              </div>

              <button type="submit" className={styles.submitBtn}>Finish & Save</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
