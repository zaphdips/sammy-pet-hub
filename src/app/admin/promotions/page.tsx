"use client";

/**
 * Admin Promotions — Homepage Banner & Promo Card Manager
 *
 * Manage the promotional cards shown on the homepage carousel.
 * Each promo has a title, description, button, image, and optional
 * expiry date and badge label (e.g. "NEW" or "SALE" overlay).
 *
 * Promos are shown on the homepage in sort_order ascending order.
 * Expired promos (expires_at < now) are automatically hidden from visitors.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ImageUpload from "@/components/ImageUpload";
import {
  Megaphone,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ArrowUpDown,
  Eye,
  EyeOff,
  ExternalLink,
  Info,
} from "lucide-react";
import Link from "next/link";
import styles from "./Promotions.module.css";

// ─── Empty form state ─────────────────────────────────────────────────────────
const EMPTY_FORM = {
  title: "",
  description: "",
  button_text: "Shop Now",
  button_link: "/shop",
  image_url: "",
  badge_label: "",
  sort_order: 0,
  expires_at: "",    // ISO date string or empty
  placement: "homepage",
  is_active: true,
};

type PromoForm = typeof EMPTY_FORM;

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminPromotions() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PromoForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Fetch all promotions, newest first ──
  async function fetchPromos() {
    setLoading(true);
    const { data } = await supabase
      .from("promotions")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) setPromos(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchPromos();
  }, []);

  // ── Field helper ──
  const f = (key: keyof PromoForm, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ── Validate ──
  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "Title is required.";
    if (!form.description.trim()) newErrors.description = "Description is required.";
    if (!form.button_text.trim()) newErrors.button_text = "Button text is required.";
    if (!form.button_link.trim()) newErrors.button_link = "Button link is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ── Add a new promo ──
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      button_text: form.button_text.trim(),
      button_link: form.button_link.trim(),
      image_url: form.image_url,
      badge_label: form.badge_label.trim() || null,
      sort_order: Number(form.sort_order),
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      placement: form.placement,
      is_active: form.is_active,
    };

    const { error } = await supabase.from("promotions").insert([payload]);

    if (error) {
      setErrors({ form: "Failed to save promotion: " + error.message });
    } else {
      setIsAdding(false);
      setForm(EMPTY_FORM);
      setErrors({});
      fetchPromos();
    }
    setSaving(false);
  }

  // ── Toggle active/inactive ──
  async function toggleActive(id: string, current: boolean) {
    await supabase.from("promotions").update({ is_active: !current }).eq("id", id);
    fetchPromos();
  }

  // ── Delete ──
  async function deletePromo(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await supabase.from("promotions").delete().eq("id", id);
    fetchPromos();
  }

  // ── Is a promo currently expired? ──
  function isExpired(promo: any): boolean {
    return promo.expires_at && new Date(promo.expires_at) < new Date();
  }

  return (
    <div className={styles.container}>
      {/* ── Page Header ── */}
      <header className={styles.header}>
        <div className={styles.titleBox}>
          <Megaphone size={28} />
          <div>
            <h1>Promotions & Banners</h1>
            <p>
              Manage the promotional cards shown on the{" "}
              <Link href="/" target="_blank" className={styles.inlineLink}>
                homepage <ExternalLink size={12} />
              </Link>
              . Changes go live immediately.
            </p>
          </div>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => {
            setIsAdding((v) => !v);
            setErrors({});
            setForm(EMPTY_FORM);
          }}
        >
          {isAdding ? "Cancel" : <><Plus size={18} /> Add Promo</>}
        </button>
      </header>

      {/* ── Info callout ── */}
      <div className={styles.infoBanner}>
        <Info size={16} />
        <span>
          Promos are displayed in <strong>Sort Order</strong> (lowest first).
          Promos with an expiry date are automatically hidden from visitors once the date passes.
          To control <strong>how many promos appear</strong>, adjust{" "}
          <Link href="/admin/settings" className={styles.inlineLink}>
            Platform Settings → Homepage Promo Limit
          </Link>
          .
        </span>
      </div>

      {/* ── Add Form ── */}
      {isAdding && (
        <form className={`${styles.form} glass`} onSubmit={handleAdd}>
          <h2>New Promotion</h2>

          {/* Image upload */}
          <div className={styles.imageSection}>
            <label>Banner Image</label>
            <ImageUpload
              bucket="promo-images"
              label="Upload Banner Image"
              onUpload={(url) => f("image_url", url)}
            />
            {form.image_url && (
              <img src={form.image_url} alt="Preview" className={styles.imagePreview} />
            )}
          </div>

          <div className={styles.formGrid}>
            {/* Title */}
            <div className={styles.inputGroup}>
              <label>Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => f("title", e.target.value)}
                placeholder="e.g. New pet? You've got this."
              />
              {errors.title && <span className={styles.error}>{errors.title}</span>}
            </div>

            {/* Badge label */}
            <div className={styles.inputGroup}>
              <label>Badge Label <span className={styles.optional}>(Optional overlay)</span></label>
              <input
                type="text"
                value={form.badge_label}
                onChange={(e) => f("badge_label", e.target.value)}
                placeholder="e.g. NEW, SALE, LIMITED"
              />
            </div>

            {/* Button text */}
            <div className={styles.inputGroup}>
              <label>Button Text *</label>
              <input
                type="text"
                value={form.button_text}
                onChange={(e) => f("button_text", e.target.value)}
                placeholder="e.g. Shop Now"
              />
              {errors.button_text && <span className={styles.error}>{errors.button_text}</span>}
            </div>

            {/* Button link */}
            <div className={styles.inputGroup}>
              <label>Button Link *</label>
              <input
                type="text"
                value={form.button_link}
                onChange={(e) => f("button_link", e.target.value)}
                placeholder="e.g. /shop or https://..."
              />
              {errors.button_link && <span className={styles.error}>{errors.button_link}</span>}
            </div>

            {/* Sort order */}
            <div className={styles.inputGroup}>
              <label>Sort Order <span className={styles.optional}>(lower = shown first)</span></label>
              <input
                type="number"
                min="0"
                value={form.sort_order}
                onChange={(e) => f("sort_order", e.target.value)}
              />
            </div>

            {/* Expiry date */}
            <div className={styles.inputGroup}>
              <label>Expires On <span className={styles.optional}>(Optional — hides promo after this date)</span></label>
              <input
                type="date"
                value={form.expires_at}
                onChange={(e) => f("expires_at", e.target.value)}
              />
            </div>

            {/* Active toggle */}
            <div className={styles.inputGroup}>
              <label>Status</label>
              <select
                value={form.is_active ? "true" : "false"}
                onChange={(e) => f("is_active", e.target.value === "true")}
              >
                <option value="true">Active — visible to visitors</option>
                <option value="false">Draft — hidden from visitors</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className={styles.inputGroup}>
            <label>Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => f("description", e.target.value)}
              placeholder="Short tagline shown under the title on the card."
              rows={2}
            />
            {errors.description && <span className={styles.error}>{errors.description}</span>}
          </div>

          {errors.form && <div className={styles.formError}>{errors.form}</div>}

          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? "Saving…" : "Save Promotion"}
          </button>
        </form>
      )}

      {/* ── Promo Table ── */}
      {loading ? (
        <div className={styles.emptyState}>Loading promotions…</div>
      ) : promos.length === 0 ? (
        <div className={styles.emptyState}>
          <Megaphone size={40} />
          <h3>No promotions yet</h3>
          <p>Add your first promo card to display it on the homepage.</p>
          <button className={styles.addBtn} onClick={() => setIsAdding(true)}>
            <Plus size={18} /> Add Your First Promo
          </button>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title & Description</th>
                <th>Button</th>
                <th>
                  <ArrowUpDown size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
                  Order
                </th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((promo) => (
                <tr key={promo.id} className={isExpired(promo) ? styles.expiredRow : ""}>
                  <td>
                    {promo.image_url ? (
                      <img src={promo.image_url} alt={promo.title} className={styles.thumb} />
                    ) : (
                      <span className={styles.noImage}>No image</span>
                    )}
                  </td>
                  <td>
                    <strong>{promo.title}</strong>
                    {promo.badge_label && (
                      <span className={styles.badge}>{promo.badge_label}</span>
                    )}
                    <p className={styles.promoDesc}>{promo.description?.substring(0, 60)}…</p>
                  </td>
                  <td>
                    <a href={promo.button_link} target="_blank" className={styles.promoLink}>
                      {promo.button_text} <ExternalLink size={12} />
                    </a>
                  </td>
                  <td className={styles.centerCell}>{promo.sort_order ?? 0}</td>
                  <td>
                    {promo.expires_at
                      ? isExpired(promo)
                        ? <span className={styles.expiredTag}>Expired</span>
                        : new Date(promo.expires_at).toLocaleDateString()
                      : <span className={styles.noExpiry}>Never</span>}
                  </td>
                  <td>
                    <span className={promo.is_active && !isExpired(promo) ? styles.statusActive : styles.statusDraft}>
                      {isExpired(promo) ? "Expired" : promo.is_active ? "Active" : "Draft"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        className={styles.toggleBtn}
                        title={promo.is_active ? "Hide from visitors" : "Show to visitors"}
                        onClick={() => toggleActive(promo.id, promo.is_active)}
                      >
                        {promo.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                        {promo.is_active ? "Hide" : "Show"}
                      </button>
                      <button
                        className={styles.deleteBtn}
                        title="Delete permanently"
                        onClick={() => deletePromo(promo.id, promo.title)}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
