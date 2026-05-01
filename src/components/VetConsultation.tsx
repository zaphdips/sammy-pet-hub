"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./VetConsultation.module.css";

export default function VetConsultation() {
  const [queryType, setQueryType] = useState("General");
  const [petName, setPetName] = useState("");
  const [message, setMessage] = useState("");
  const [config, setConfig] = useState({
    whatsapp: "",
    email: "",
    responseTime: "15min",
    expertCount: "50+"
  });

  useEffect(() => {
    const REQUIRED_KEYS = ["vet_whatsapp", "vet_email", "vet_response_time", "vet_expert_count"];
    async function fetchConfig() {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", REQUIRED_KEYS);
      if (data) {
        const newConfig = { ...config };
        data.forEach(s => {
          if (s.key === "vet_whatsapp") newConfig.whatsapp = s.value;
          if (s.key === "vet_email") newConfig.email = s.value;
          if (s.key === "vet_response_time") newConfig.responseTime = s.value;
          if (s.key === "vet_expert_count") newConfig.expertCount = s.value;
        });
        setConfig(newConfig);
      }
    }
    fetchConfig();
  }, []);

  const handleConsult = (platform: "whatsapp" | "email") => {
    const text = `Hi, I have a ${queryType} query for my pet ${petName ? petName : ""}. \n\nDetails: ${message}`;
    
    if (platform === "whatsapp") {
      const url = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    } else {
      const subject = `Vet Consultation: ${queryType}`;
      const url = `mailto:${config.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
      window.location.href = url;
    }
  };

  return (
    <section className={styles.section} id="vets">
      <div className={`${styles.card} glass`}>
        <div className={styles.infoSide}>
          <span className={styles.badge}>24/7 Support</span>
          <h2>Professional Vet Assistance</h2>
          <p>
            Get instant support from certified veterinarians. 
            Choose your preferred platform to start a consultation.
          </p>
          
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <strong>{config.responseTime}</strong>
              <span>Avg. Response</span>
            </div>
            <div className={styles.statItem}>
              <strong>{config.expertCount}</strong>
              <span>Expert Vets</span>
            </div>
          </div>
        </div>

        <div className={styles.formSide}>
          <div className={styles.inputGroup}>
            <label>I have a query about...</label>
            <select 
              value={queryType} 
              onChange={(e) => setQueryType(e.target.value)}
              className={styles.select}
            >
              <option>General Health</option>
              <option>Emergency</option>
              <option>Nutrition & Diet</option>
              <option>Behavioral</option>
              <option>Vaccination</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label>Pet's Name (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Bella" 
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Describe the situation</label>
            <textarea 
              placeholder="Tell us what's happening..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={styles.textarea}
            />
          </div>

          <div className={styles.actions}>
            <button 
              onClick={() => handleConsult("whatsapp")} 
              className={styles.whatsappBtn}
            >
              Consult via WhatsApp
            </button>
            <button 
              onClick={() => handleConsult("email")} 
              className={styles.emailBtn}
            >
              Consult via Email
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
