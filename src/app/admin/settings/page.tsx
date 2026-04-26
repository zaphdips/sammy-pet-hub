"use client";

/**
 * Admin Settings Page
 *
 * WHY: High-power configuration page for global site values.
 * Allows editing vet contact info, hero text, and SEO metadata.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Settings, Save, RefreshCw, ShieldCheck } from "lucide-react";
import styles from "./Settings.module.css";

export default function AdminSettings() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("*").order("key");
    if (data) setSettings(data);
    setLoading(false);
  }

  const updateSetting = async (key: string, value: string) => {
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update({ value })
      .eq("key", key);
    
    if (error) alert("Error saving setting: " + error.message);
    setSaving(false);
  };

  if (loading) return <div className={styles.loader}>Loading Configuration...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleBox}>
          <Settings size={28} />
          <div>
            <h1>Platform Settings</h1>
            <p>Manage global variables and contact configurations.</p>
          </div>
        </div>
        <button onClick={fetchSettings} className={styles.refreshBtn}>
          <RefreshCw size={18} />
          Reload
        </button>
      </header>

      <div className={`${styles.card} glass`}>
        <div className={styles.cardHeader}>
          <ShieldCheck size={20} color="var(--primary-green)" />
          <h3>General Configuration</h3>
        </div>

        <div className={styles.settingsGrid}>
          {settings.map((s) => (
            <div key={s.key} className={styles.settingItem}>
              <div className={styles.labelBox}>
                <label>{s.key.replace(/_/g, " ")}</label>
                <p>{s.description || "System setting used across the platform."}</p>
              </div>
              <div className={styles.inputBox}>
                <input 
                  type="text" 
                  defaultValue={s.value}
                  onBlur={(e) => updateSetting(s.key, e.target.value)}
                />
                <span className={styles.saveStatus}>Autosaves on blur</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className={styles.footer}>
        <p>Changes take effect immediately across all client sessions.</p>
      </footer>
    </div>
  );
}
