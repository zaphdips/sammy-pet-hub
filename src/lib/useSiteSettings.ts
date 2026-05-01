/**
 * useSiteSettings — Shared hook for reading site_settings from Supabase.
 *
 * Returns a flat key→value map so any component can do:
 *   const { settings } = useSiteSettings();
 *   const siteName = settings.site_name ?? "Pet Corner";
 *
 * The result is cached in module-level memory so the DB is only
 * queried once per browser session, not once per component mount.
 */

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

// ─── Module-level cache so we only hit Supabase once per page load ───
let cachedSettings: Record<string, string> | null = null;
let fetchPromise: Promise<Record<string, string>> | null = null;

async function loadSettings(): Promise<Record<string, string>> {
  // Return cached result immediately if available
  if (cachedSettings) return cachedSettings;

  // If a fetch is already in flight, wait for that one (avoids duplicate requests)
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    const { data, error } = await supabase.from("site_settings").select("key, value");
    if (error || !data) {
      console.warn("[useSiteSettings] Failed to load settings:", error?.message);
      return {};
    }
    // Build a flat { key: value } map for easy consumption
    const map: Record<string, string> = {};
    for (const row of data) {
      map[row.key] = row.value ?? "";
    }
    cachedSettings = map;
    return map;
  })();

  return fetchPromise;
}

/** Call this anywhere to clear the cache (e.g. after saving settings in the admin). */
export function clearSettingsCache() {
  cachedSettings = null;
  fetchPromise = null;
}

/** The main hook — use this in any React component. */
export function useSiteSettings() {
  const [settings, setSettings] = useState<Record<string, string>>(cachedSettings ?? {});
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    loadSettings().then((result) => {
      setSettings(result);
      setLoading(false);
    });
  }, []);

  return { settings, loading };
}
