"use client";

/**
 * Admin Content Management
 *
 * Manage four types of site content from one place:
 *
 *  TAB 1 — Breed Encyclopedia   (breeds table)
 *  TAB 2 — Symptom Guide        (symptoms table)
 *  TAB 3 — FAQ                  (content_blocks where block_key starts with "faq_")
 *  TAB 4 — About Page Copy      (content_blocks where block_key starts with "about_")
 *
 * For FAQ and About, the "title" field is the heading/question
 * and "body" is the answer/paragraph text.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ImageUpload from "@/components/ImageUpload";
import {
  BookOpen,
  HelpCircle,
  Info,
  ArrowRight,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Link from "next/link";
import styles from "../pets/PetsManagement.module.css";
import contentStyles from "./Content.module.css";

// ─── Tab definitions ─────────────────────────────────────────────────────────
type TabId = "breeds" | "symptoms" | "faq" | "about";

const TABS: { id: TabId; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: "breeds",
    label: "Breed Encyclopedia",
    icon: <BookOpen size={16} />,
    description: "Manage breed profiles shown in the Breed Guide section.",
  },
  {
    id: "symptoms",
    label: "Symptom Guide",
    icon: <HelpCircle size={16} />,
    description: "Manage symptom entries shown in the Pet Health section.",
  },
  {
    id: "faq",
    label: "FAQ",
    icon: <HelpCircle size={16} />,
    description: "Edit the FAQ items shown on the About page. Changes go live immediately.",
  },
  {
    id: "about",
    label: "About Page Copy",
    icon: <Info size={16} />,
    description: "Edit the headline and body paragraphs on the About page.",
  },
];

// ─── Empty form states ────────────────────────────────────────────────────────
const EMPTY_BREED = { name: "", type: "dog", description: "", photo_url: "" };
const EMPTY_SYMPTOM = { name: "", pet_type: "dog", description: "", advice: "" };
const EMPTY_BLOCK = { title: "", body: "", sort_order: 0 };

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState<TabId>("breeds");
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [breedForm, setBreedForm] = useState(EMPTY_BREED);
  const [symptomForm, setSymptomForm] = useState(EMPTY_SYMPTOM);
  const [blockForm, setBlockForm] = useState(EMPTY_BLOCK);

  // ── Fetch items for the active tab ──
  async function fetchData() {
    setLoading(true);
    let data: any[] | null = null;

    if (activeTab === "breeds") {
      const res = await supabase.from("breeds").select("*").order("created_at", { ascending: false });
      data = res.data;
    } else if (activeTab === "symptoms") {
      const res = await supabase.from("symptoms").select("*").order("created_at", { ascending: false });
      data = res.data;
    } else if (activeTab === "faq") {
      // Load content_blocks where the key starts with "faq_"
      const res = await supabase
        .from("content_blocks")
        .select("*")
        .like("block_key", "faq_%")
        .order("sort_order", { ascending: true });
      data = res.data;
    } else if (activeTab === "about") {
      // Load content_blocks where the key starts with "about_"
      const res = await supabase
        .from("content_blocks")
        .select("*")
        .like("block_key", "about_%")
        .order("sort_order", { ascending: true });
      data = res.data;
    }

    if (data) setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
    setIsAdding(false);
  }, [activeTab]);

  // ── Delete a row ──
  async function deleteItem(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const table =
      activeTab === "breeds" ? "breeds" :
      activeTab === "symptoms" ? "symptoms" :
      "content_blocks";
    await supabase.from(table).delete().eq("id", id);
    fetchData();
  }

  // ── Update a content_block field inline ──
  async function updateBlock(id: string, field: "title" | "body", value: string) {
    await supabase.from("content_blocks").update({ [field]: value, updated_at: new Date().toISOString() }).eq("id", id);
  }

  // ── Shift sort_order up or down ──
  async function shiftOrder(item: any, direction: "up" | "down") {
    const newOrder = direction === "up" ? item.sort_order - 1 : item.sort_order + 1;
    await supabase.from("content_blocks").update({ sort_order: newOrder }).eq("id", item.id);
    fetchData();
  }

  // ── Add handlers ──
  async function handleAddBreed(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("breeds").insert([breedForm]);
    if (!error) { setIsAdding(false); setBreedForm(EMPTY_BREED); fetchData(); }
    setSaving(false);
  }

  async function handleAddSymptom(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("symptoms").insert([symptomForm]);
    if (!error) { setIsAdding(false); setSymptomForm(EMPTY_SYMPTOM); fetchData(); }
    setSaving(false);
  }

  async function handleAddBlock(e: React.FormEvent) {
    e.preventDefault();
    if (!blockForm.title.trim()) return;
    setSaving(true);

    // Generate a unique key from the title
    const prefix = activeTab === "faq" ? "faq_" : "about_";
    const key = prefix + blockForm.title.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").substring(0, 40) + "_" + Date.now();

    const { error } = await supabase.from("content_blocks").insert([{
      block_key: key,
      title: blockForm.title.trim(),
      body: blockForm.body.trim(),
      sort_order: Number(blockForm.sort_order),
      is_active: true,
    }]);

    if (!error) { setIsAdding(false); setBlockForm(EMPTY_BLOCK); fetchData(); }
    setSaving(false);
  }

  const isBlockTab = activeTab === "faq" || activeTab === "about";
  const currentTab = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className={styles.container}>
      {/* ── Page Header ── */}
      <div className={styles.header}>
        <div>
          <h1>Content Management</h1>
          <p style={{ color: "var(--saas-text-muted)", fontSize: "0.9rem", marginTop: 4 }}>
            {currentTab.description}
          </p>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => { setIsAdding((v) => !v); }}
        >
          {isAdding ? "Cancel" : `+ Add ${activeTab === "faq" ? "FAQ Item" : activeTab === "about" ? "Paragraph" : activeTab === "breeds" ? "Breed" : "Symptom"}`}
        </button>
      </div>

      {/* ── CTA: redirect to promotions for banner management ── */}
      {(activeTab === "faq" || activeTab === "about") && (
        <div className={contentStyles.ctaBanner}>
          <Info size={16} />
          <span>
            To manage homepage promo banners and ads, go to{" "}
            <Link href="/admin/promotions" className={contentStyles.ctaLink}>
              Promotions <ArrowRight size={13} />
            </Link>
            . To change the site name and tagline, go to{" "}
            <Link href="/admin/settings" className={contentStyles.ctaLink}>
              Platform Settings <ArrowRight size={13} />
            </Link>
            .
          </span>
        </div>
      )}

      {/* ── Tab Bar ── */}
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? styles.activeTab : ""}
            onClick={() => { setActiveTab(tab.id); setIsAdding(false); }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════
          ADD FORMS — shown when isAdding is true
          ════════════════════════════════════════════════════════ */}

      {/* Breed form */}
      {isAdding && activeTab === "breeds" && (
        <form className={`${styles.form} glass`} onSubmit={handleAddBreed}>
          <h2>New Breed Entry</h2>
          <ImageUpload bucket="breed-images" label="Breed Photo" onUpload={(url) => setBreedForm({ ...breedForm, photo_url: url })} />
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Breed Name *</label>
              <input type="text" required value={breedForm.name} onChange={(e) => setBreedForm({ ...breedForm, name: e.target.value })} />
            </div>
            <div className={styles.inputGroup}>
              <label>Pet Type</label>
              <select value={breedForm.type} onChange={(e) => setBreedForm({ ...breedForm, type: e.target.value })}>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
              </select>
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>Description</label>
            <textarea required rows={3} value={breedForm.description} onChange={(e) => setBreedForm({ ...breedForm, description: e.target.value })} />
          </div>
          <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? "Saving…" : "Save Breed"}</button>
        </form>
      )}

      {/* Symptom form */}
      {isAdding && activeTab === "symptoms" && (
        <form className={`${styles.form} glass`} onSubmit={handleAddSymptom}>
          <h2>New Symptom Guide</h2>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Symptom Name *</label>
              <input type="text" required placeholder="e.g. Excessive Scratching" value={symptomForm.name} onChange={(e) => setSymptomForm({ ...symptomForm, name: e.target.value })} />
            </div>
            <div className={styles.inputGroup}>
              <label>Pet Type</label>
              <select value={symptomForm.pet_type} onChange={(e) => setSymptomForm({ ...symptomForm, pet_type: e.target.value })}>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>What it might mean</label>
            <textarea required rows={2} value={symptomForm.description} onChange={(e) => setSymptomForm({ ...symptomForm, description: e.target.value })} />
          </div>
          <div className={styles.inputGroup}>
            <label>Advice / Action Plan</label>
            <textarea required rows={3} value={symptomForm.advice} onChange={(e) => setSymptomForm({ ...symptomForm, advice: e.target.value })} />
          </div>
          <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? "Saving…" : "Save Symptom"}</button>
        </form>
      )}

      {/* FAQ / About block form */}
      {isAdding && isBlockTab && (
        <form className={`${styles.form} glass`} onSubmit={handleAddBlock}>
          <h2>{activeTab === "faq" ? "New FAQ Item" : "New Paragraph"}</h2>
          <div className={styles.inputGroup}>
            <label>{activeTab === "faq" ? "Question *" : "Section Heading *"}</label>
            <input
              type="text"
              required
              placeholder={activeTab === "faq" ? "e.g. How do I adopt a pet?" : "e.g. Our Mission"}
              value={blockForm.title}
              onChange={(e) => setBlockForm({ ...blockForm, title: e.target.value })}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>{activeTab === "faq" ? "Answer" : "Body Text"}</label>
            <textarea
              rows={4}
              value={blockForm.body}
              onChange={(e) => setBlockForm({ ...blockForm, body: e.target.value })}
              placeholder={activeTab === "faq" ? "Write the answer here…" : "Write the paragraph here…"}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Sort Order <span style={{ fontWeight: 400, color: "var(--saas-text-muted)" }}>(lower = shown first)</span></label>
            <input type="number" min="0" value={blockForm.sort_order} onChange={(e) => setBlockForm({ ...blockForm, sort_order: Number(e.target.value) })} />
          </div>
          <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? "Saving…" : `Save ${activeTab === "faq" ? "FAQ Item" : "Paragraph"}`}</button>
        </form>
      )}

      {/* ════════════════════════════════════════════════════════
          CONTENT TABLES / LISTS
          ════════════════════════════════════════════════════════ */}

      {loading ? (
        <div style={{ padding: "60px", textAlign: "center", color: "var(--saas-text-muted)" }}>Loading…</div>
      ) : items.length === 0 ? (
        <div style={{ padding: "60px", textAlign: "center", color: "var(--saas-text-muted)" }}>
          No items yet. Click <strong>"+ Add…"</strong> above to create the first one.
        </div>
      ) : isBlockTab ? (
        /* ── FAQ / About: inline editable cards ── */
        <div className={contentStyles.blockList}>
          {items.map((item, idx) => (
            <div key={item.id} className={contentStyles.blockCard}>
              <div className={contentStyles.blockOrder}>
                <button title="Move up" onClick={() => shiftOrder(item, "up")} disabled={idx === 0}><ArrowUp size={14} /></button>
                <span>{item.sort_order}</span>
                <button title="Move down" onClick={() => shiftOrder(item, "down")} disabled={idx === items.length - 1}><ArrowDown size={14} /></button>
              </div>
              <div className={contentStyles.blockFields}>
                <div className={contentStyles.blockField}>
                  <label>{activeTab === "faq" ? "Question" : "Heading"}</label>
                  <input
                    defaultValue={item.title}
                    onBlur={(e) => updateBlock(item.id, "title", e.target.value)}
                    className={contentStyles.blockInput}
                  />
                </div>
                <div className={contentStyles.blockField}>
                  <label>{activeTab === "faq" ? "Answer" : "Body Text"}</label>
                  <textarea
                    defaultValue={item.body}
                    rows={3}
                    onBlur={(e) => updateBlock(item.id, "body", e.target.value)}
                    className={contentStyles.blockTextarea}
                  />
                </div>
              </div>
              <button className={contentStyles.deleteBtn} onClick={() => deleteItem(item.id, item.title)} title="Delete this item">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* ── Breeds / Symptoms: standard table ── */
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                {activeTab === "breeds" ? (
                  <><th>Photo</th><th>Name</th><th>Type</th><th>Description</th><th>Actions</th></>
                ) : (
                  <><th>Symptom</th><th>Pet Type</th><th>Advice</th><th>Actions</th></>
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  {activeTab === "breeds" ? (
                    <>
                      <td>{item.photo_url ? <img src={item.photo_url} alt={item.name} className={styles.thumb} /> : "🐾"}</td>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.type}</td>
                      <td>{item.description?.substring(0, 60)}…</td>
                      <td><button className={styles.deleteBtn} onClick={() => deleteItem(item.id, item.name)}>Delete</button></td>
                    </>
                  ) : (
                    <>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.pet_type}</td>
                      <td>{item.advice?.substring(0, 60)}…</td>
                      <td><button className={styles.deleteBtn} onClick={() => deleteItem(item.id, item.name)}>Delete</button></td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
