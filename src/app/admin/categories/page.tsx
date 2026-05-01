"use client";

/**
 * Admin Categories
 *
 * Manage the dashboard category cards (Amazon-style 2x2 grid).
 * Groups and their sub-items.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  Plus,
  Trash2,
  Edit2,
  Bone,
  Dog,
  ShoppingBag,
  Sparkles,
  Pill,
  Scissors,
  Heart,
  Stethoscope,
  Star
} from "lucide-react";
import styles from "./Categories.module.css";

// Map string names to Lucide icons
const IconMap: Record<string, any> = {
  Bone, Dog, ShoppingBag, Sparkles, Pill, Scissors, Heart, Stethoscope
};

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCategories() {
    setLoading(true);
    const { data, error } = await supabase
      .from("dashboard_categories")
      .select("*, dashboard_category_items(*)")
      .order("sort_order", { ascending: true });
    
    if (data) {
      // Sort items within categories
      data.forEach(c => {
        if (c.dashboard_category_items) {
          c.dashboard_category_items.sort((a: any, b: any) => a.sort_order - b.sort_order);
        }
      });
      setCategories(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function deleteCategory(id: string, title: string) {
    if (!window.confirm(`Delete category "${title}" and all its items?`)) return;
    await supabase.from("dashboard_categories").delete().eq("id", id);
    fetchCategories();
  }

  async function deleteItem(id: string, name: string) {
    if (!window.confirm(`Delete item "${name}"?`)) return;
    await supabase.from("dashboard_category_items").delete().eq("id", id);
    fetchCategories();
  }

  if (loading) return <div className={styles.container}>Loading categories...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleBox}>
          <LayoutDashboard size={28} />
          <div>
            <h1>Dashboard Categories</h1>
            <p>Manage the Amazon-style category blocks on the dashboard.</p>
          </div>
        </div>
        <button className={styles.addBtn} onClick={() => alert("To add categories, use the DB interface for now.")}>
          <Plus size={18} /> Add Category Group
        </button>
      </header>

      <div className={styles.grid}>
        {categories.map((cat) => (
          <div key={cat.id} className={styles.categoryCard}>
            <div className={styles.categoryHeader}>
              <div>
                <h3>{cat.title}</h3>
                <a href={cat.link} target="_blank" className={styles.categoryLink}>{cat.link}</a>
              </div>
              <div className={styles.actions}>
                <button className={styles.deleteBtn} onClick={() => deleteCategory(cat.id, cat.title)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className={styles.itemsList}>
              {cat.dashboard_category_items?.map((item: any) => {
                const IconComponent = IconMap[item.icon_name] || Star;
                return (
                  <div key={item.id} className={styles.itemRow}>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemIcon} style={{ background: item.color, color: item.icon_color }}>
                        <IconComponent size={14} />
                      </div>
                      <span>{item.name}</span>
                    </div>
                    <div className={styles.actions}>
                      <button className={styles.deleteBtn} onClick={() => deleteItem(item.id, item.name)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
              <button className={styles.addBtn} style={{ marginTop: '8px', alignSelf: 'flex-start', padding: '4px 8px', fontSize: '0.7rem' }}>
                <Plus size={12} /> Add Item
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <p>No categories found. Run the SQL script.</p>
        )}
      </div>
    </div>
  );
}
