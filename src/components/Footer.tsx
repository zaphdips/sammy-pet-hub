"use client";

/**
 * Footer
 *
 * Brand name, tagline, copyright company name, and social media links
 * are loaded from `site_settings` in Supabase so the admin can update
 * them from Admin → Settings → Brand & Identity / Social & App Links.
 *
 * Social icons are only rendered if the URL is non-empty.
 * App store badges are only rendered if the URL is non-empty.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Minus } from "lucide-react";
import { FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon } from "./icons";
import { useSiteSettings } from "@/lib/useSiteSettings";
import styles from "./Footer.module.css";

// ─── Footer nav link groups (these rarely change, kept in code) ───────────────
const FOOTER_SECTIONS = [
  {
    id: "support",
    title: "Customer Support",
    links: [
      { label: "Contact Us",            href: "/contact" },
      { label: "Delivery Information",  href: "/legal/shipping" },
      { label: "Returns & Refunds",     href: "/legal/shipping" },
      { label: "FAQs",                  href: "/#faq" },
      { label: "Health Guarantee",      href: "/legal/health-guarantee" },
    ],
  },
  {
    id: "about",
    title: "About Us",
    links: [
      { label: "Our Story",         href: "/about" },
      { label: "Verified Breeders", href: "/adoption" },
      { label: "Vet Network",       href: "/#vets" },
      { label: "Careers",           href: "/careers" },
      { label: "Privacy Policy",    href: "/legal/privacy" },
    ],
  },
  {
    id: "shop",
    title: "Shop Categories",
    links: [
      { label: "Dog Supplies",   href: "/shop" },
      { label: "Cat Supplies",   href: "/shop" },
      { label: "Pet Medication", href: "/shop" },
      { label: "Specialist Food",href: "/shop" },
      { label: "Accessories",    href: "/shop" },
    ],
  },
];

export default function Footer() {
  const { settings } = useSiteSettings();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Read from settings with sensible defaults
  const siteName    = settings.site_name    || "Pet Corner";
  const companyName = settings.company_name || "Pet Corner Ltd.";
  const tagline     = settings.site_tagline || "Your premium destination for everything pets. From verified adoptions to expert vet care.";

  // Social links — only show if the admin has filled them in
  const socials = [
    { key: "social_facebook",  Icon: FacebookIcon,  label: "Facebook" },
    { key: "social_instagram", Icon: InstagramIcon, label: "Instagram" },
    { key: "social_twitter",   Icon: TwitterIcon,   label: "Twitter / X" },
    { key: "social_youtube",   Icon: YoutubeIcon,   label: "YouTube" },
  ].filter((s) => !!settings[s.key]);

  // App store badges — only show if the admin has filled in the URLs
  const appStoreUrl  = settings.app_store_url  || "";
  const playStoreUrl = settings.play_store_url || "";

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Accordion columns (mobile) / grid columns (desktop) */}
        <div className={styles.sections}>
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.id} className={styles.section}>
              <button
                className={styles.sectionHeader}
                onClick={() => toggleSection(section.id)}
              >
                {section.title}
                <span className={styles.icon}>
                  {openSections[section.id] ? <Minus size={18} /> : <Plus size={18} />}
                </span>
              </button>
              <div className={`${styles.links} ${openSections[section.id] ? styles.open : ""}`}>
                {section.links.map((link, i) => (
                  <Link key={i} href={link.href}>{link.label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Brand & Social */}
        <div className={styles.brandSection}>
          <div className={styles.brandInfo}>
            <span className={styles.logo}>{siteName}</span>
            <p>{tagline}</p>

            {/* Social icons — only rendered when URL is set */}
            {socials.length > 0 && (
              <div className={styles.socials}>
                {socials.map(({ key, Icon, label }) => (
                  <a key={key} href={settings[key]} target="_blank" rel="noopener noreferrer" aria-label={label}>
                    <Icon />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* App store badges — only rendered when URLs are set */}
          {(appStoreUrl || playStoreUrl) && (
            <div className={styles.appSection}>
              <p>Download our app</p>
              <div className={styles.appButtons}>
                {appStoreUrl && (
                  <a href={appStoreUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                      alt="Download on the App Store"
                    />
                  </a>
                )}
                {playStoreUrl && (
                  <a href={playStoreUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                      alt="Get it on Google Play"
                    />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomContainer}>
          <p>© {new Date().getFullYear()} {companyName}. All rights reserved.</p>
          <div className={styles.legalLinks}>
            <Link href="/legal/terms">Terms & Conditions</Link>
            <Link href="/legal/privacy">Privacy Policy</Link>
            <Link href="/legal/cookies">Cookies</Link>
            <Link href="/legal/shipping">Shipping & Returns</Link>
            <Link href="/legal/health-guarantee">Health Guarantee</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
