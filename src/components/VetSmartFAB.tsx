"use client";

/**
 * VetSmartFAB — Floating Action Button
 *
 * WHY: A "smart" movable icon that follows the user.
 * Expands on hover/click to provide instant access to vet help.
 * Uses Lucide icons for a premium feel.
 */

import { useState, useEffect } from "react";
import { MessageCircle, Mail, PhoneCall, X, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "./VetSmartFAB.module.css";

export default function VetSmartFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({ whatsapp: "", email: "" });

  useEffect(() => {
    async function fetchConfig() {
      const { data } = await supabase.from("site_settings").select("*");
      if (data) {
        const cfg = { whatsapp: "", email: "" };
        data.forEach(s => {
          if (s.key === "vet_whatsapp") cfg.whatsapp = s.value;
          if (s.key === "vet_email") cfg.email = s.value;
        });
        setConfig(cfg);
      }
    }
    fetchConfig();
  }, []);

  const handleContact = (platform: "wa" | "email") => {
    if (platform === "wa") {
      window.open(`https://wa.me/${config.whatsapp}`, "_blank");
    } else {
      window.location.href = `mailto:${config.email}`;
    }
  };

  return (
    <div className={styles.fabContainer}>
      {isOpen && (
        <div className={`${styles.menu} glass`}>
          <div className={styles.menuHeader}>
            <ShieldCheck size={18} color="var(--primary-green)" />
            <span>Certified Vet Help</span>
          </div>
          <button onClick={() => handleContact("wa")} className={styles.menuItem}>
            <MessageCircle size={20} />
            <span>Chat on WhatsApp</span>
          </button>
          <button onClick={() => handleContact("email")} className={styles.menuItem}>
            <Mail size={20} />
            <span>Send Email Query</span>
          </button>
          <p className={styles.timer}>Avg. response: 15 mins</p>
        </div>
      )}

      <button 
        className={`${styles.mainBtn} ${isOpen ? styles.active : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Contact Vet"
      >
        {isOpen ? <X size={28} /> : <PhoneCall size={28} className={styles.phoneIcon} />}
        {!isOpen && <span className={styles.pulse}></span>}
      </button>
    </div>
  );
}
