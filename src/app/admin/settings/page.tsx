"use client";

/**
 * Admin Settings — Grouped & Tabbed Configuration Panel
 *
 * Each setting lives in the `site_settings` table in Supabase.
 * Changes autosave on blur with a visible confirmation tick.
 *
 * TABS:
 *  1. Brand & Identity  — site name, company name, tagline, URL
 *  2. SEO               — title, description, keywords
 *  3. Social & App      — social profile URLs, app store links
 *  4. Currency          — exchange rates for USD, EUR, NGN
 *  5. Platform Limits   — how many items show on each page section
 *  6. Copy Snippets     — WhatsApp message templates, etc.
 */

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { clearSettingsCache } from "@/lib/useSiteSettings";
import {
  Settings,
  RefreshCw,
  Globe,
  Search,
  Share2,
  DollarSign,
  SlidersHorizontal,
  MessageSquare,
  Check,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import styles from "./Settings.module.css";

// ─── Types ───────────────────────────────────────────────────────────────────

type SaveState = "idle" | "saving" | "saved" | "error";

interface SettingRow {
  key: string;
  value: string;
  description: string;
}

// ─── Which keys belong to each tab ───────────────────────────────────────────

const TABS = [
  {
    id: "brand",
    label: "Brand & Identity",
    icon: Globe,
    description: "Your site name, company details, and public-facing identity.",
    keys: ["site_name", "company_name", "site_tagline", "site_url"],
  },
  {
    id: "seo",
    label: "SEO",
    icon: Search,
    description: "Control how your site appears in Google search results.",
    keys: ["seo_title", "seo_description", "seo_keywords"],
  },
  {
    id: "social",
    label: "Social & App Links",
    icon: Share2,
    description: "Social media profile URLs and mobile app store links. Leave any field blank to hide it.",
    keys: [
      "social_facebook",
      "social_instagram",
      "social_twitter",
      "social_youtube",
      "app_store_url",
      "play_store_url",
    ],
  },
  {
    id: "currency",
    label: "Currency",
    icon: DollarSign,
    description: "Exchange rates relative to GBP (your base currency). e.g. if USD rate is 1.25, then £1.00 = $1.25.",
    keys: ["currency_usd_rate", "currency_eur_rate", "currency_ngn_rate", "free_shipping_threshold"],
  },
  {
    id: "limits",
    label: "Platform Limits",
    icon: SlidersHorizontal,
    description: "Control how many items appear in each section of the site without touching code.",
    keys: [
      "homepage_pet_limit",
      "homepage_product_limit",
      "homepage_promo_limit",
      "search_result_limit",
    ],
  },
  {
    id: "copy",
    label: "Copy Snippets",
    icon: MessageSquare,
    description: "Customisable text snippets used across the site. Use {name} as a placeholder where the item name should appear.",
    keys: ["whatsapp_inquiry_template", "health_guarantee_days"],
  },
];

// Which keys use a textarea (longer text)
const TEXTAREA_KEYS = new Set([
  "site_tagline",
  "seo_description",
  "seo_keywords",
  "whatsapp_inquiry_template",
]);

// Which keys use a number input
const NUMBER_KEYS = new Set([
  "currency_usd_rate",
  "currency_eur_rate",
  "currency_ngn_rate",
  "homepage_pet_limit",
  "homepage_product_limit",
  "homepage_promo_limit",
  "search_result_limit",
  "free_shipping_threshold",
  "health_guarantee_days",
]);

// Which keys are URLs (use url input type)
const URL_KEYS = new Set([
  "site_url",
  "social_facebook",
  "social_instagram",
  "social_twitter",
  "social_youtube",
  "app_store_url",
  "play_store_url",
]);

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminSettings() {
  const [allSettings, setAllSettings] = useState<Record<string, SettingRow>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("brand");
  // Track per-key save state so we show ✓ next to the right field
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});

  // ── Fetch all settings from Supabase ──
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value, description")
      .order("key");

    if (!error && data) {
      const map: Record<string, SettingRow> = {};
      for (const row of data) {
        map[row.key] = row;
      }
      setAllSettings(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ── Save a single setting on blur ──
  const saveSetting = async (key: string, value: string) => {
    setSaveStates((prev) => ({ ...prev, [key]: "saving" }));

    const { error } = await supabase
      .from("site_settings")
      .update({ value })
      .eq("key", key);

    if (error) {
      setSaveStates((prev) => ({ ...prev, [key]: "error" }));
    } else {
      // Update local state so the value is reflected immediately
      setAllSettings((prev) => ({
        ...prev,
        [key]: { ...prev[key], value },
      }));
      // Clear the in-memory settings cache so Navbar/Footer pick up changes on next render
      clearSettingsCache();
      setSaveStates((prev) => ({ ...prev, [key]: "saved" }));
      // Reset icon to idle after 2 seconds
      setTimeout(() => {
        setSaveStates((prev) => ({ ...prev, [key]: "idle" }));
      }, 2000);
    }
  };

  if (loading) {
    return <div className={styles.loader}>Loading Settings...</div>;
  }

  const currentTab = TABS.find((t) => t.id === activeTab)!;
  const TabIcon = currentTab.icon;

  return (
    <div className={styles.container}>
      {/* ── Page Header ── */}
      <header className={styles.header}>
        <div className={styles.titleBox}>
          <Settings size={28} />
          <div>
            <h1>Platform Settings</h1>
            <p>Changes autosave and take effect immediately — no code deploy needed.</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button onClick={fetchSettings} className={styles.refreshBtn}>
            <RefreshCw size={16} />
            Reload
          </button>
          {/* Quick link to the live site */}
          <a
            href={allSettings["site_url"]?.value || "/"}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.previewBtn}
          >
            <ExternalLink size={16} />
            View Live Site
          </a>
        </div>
      </header>

      {/* ── CTA Callout: point admins to related sections ── */}
      <div className={styles.ctaBanner}>
        <p>
          <strong>Tip:</strong> To manage homepage banners and promotional cards, go to{" "}
          <Link href="/admin/promotions" className={styles.ctaLink}>
            Promotions <ArrowRight size={14} />
          </Link>
          . To edit FAQ and About page copy, go to{" "}
          <Link href="/admin/content" className={styles.ctaLink}>
            Content <ArrowRight size={14} />
          </Link>
          .
        </p>
      </div>

      <div className={styles.pageLayout}>
        {/* ── Vertical Tab Sidebar ── */}
        <nav className={styles.tabNav}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabActive : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── Settings Panel for the active tab ── */}
        <div className={styles.tabPanel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <TabIcon size={20} />
              <div>
                <h2>{currentTab.label}</h2>
                <p>{currentTab.description}</p>
              </div>
            </div>
          </div>

          <div className={styles.settingsList}>
            {currentTab.keys.map((key) => {
              const row = allSettings[key];
              // If the key doesn't exist yet in the DB, show a placeholder
              if (!row) {
                return (
                  <div key={key} className={styles.settingItem}>
                    <div className={styles.labelBox}>
                      <label>{key.replace(/_/g, " ")}</label>
                      <p className={styles.missingNote}>
                        ⚠️ This setting is missing from the database. Run the seed SQL file to add it.
                      </p>
                    </div>
                  </div>
                );
              }

              const isTextarea = TEXTAREA_KEYS.has(key);
              const isNumber = NUMBER_KEYS.has(key);
              const isUrl = URL_KEYS.has(key);
              const saveState = saveStates[key] ?? "idle";

              // Format the key into a human-readable label
              const label = key
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());

              return (
                <div key={key} className={styles.settingItem}>
                  {/* Label + description */}
                  <div className={styles.labelBox}>
                    <label htmlFor={`setting-${key}`}>{label}</label>
                    <p>{row.description || "No description available."}</p>
                  </div>

                  {/* Input */}
                  <div className={styles.inputBox}>
                    {isTextarea ? (
                      <textarea
                        id={`setting-${key}`}
                        defaultValue={row.value}
                        rows={3}
                        className={styles.textarea}
                        onBlur={(e) => saveSetting(key, e.target.value)}
                      />
                    ) : (
                      <input
                        id={`setting-${key}`}
                        type={isNumber ? "number" : isUrl ? "url" : "text"}
                        defaultValue={row.value}
                        step={isNumber ? "0.01" : undefined}
                        min={isNumber ? "0" : undefined}
                        onBlur={(e) => saveSetting(key, e.target.value)}
                      />
                    )}

                    {/* Inline save feedback */}
                    <span className={`${styles.saveStatus} ${styles[`save_${saveState}`]}`}>
                      {saveState === "saving" && "Saving…"}
                      {saveState === "saved" && <><Check size={12} /> Saved</>}
                      {saveState === "error" && "⚠️ Error saving"}
                      {saveState === "idle" && "Autosaves on blur"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>All changes take effect immediately for every visitor — no restart required.</p>
      </footer>
    </div>
  );
}
