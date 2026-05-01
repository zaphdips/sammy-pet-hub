/**
 * Root Layout — SEO Metadata
 *
 * The default title and description are set here as static fallbacks.
 * They are also stored in `site_settings` (seo_title, seo_description, seo_keywords)
 * and can be edited from Admin → Settings → SEO tab.
 *
 * NOTE: Because Next.js metadata is resolved at build time for static pages,
 * fully dynamic per-request metadata would require either:
 *   a) Using generateMetadata() with a server-side supabase fetch, or
 *   b) Using a client-side <Head> override (which doesn't affect the initial HTML).
 *
 * For now, the static defaults here serve as the fallback. The admin's SEO
 * settings are honoured by updating these defaults when deploying a new build.
 * A future enhancement can upgrade this to generateMetadata() with a server fetch.
 */

import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pet Corner | Premium Pet Care & Supplies",
  description:
    "The one-stop destination for premium pet sales, high-quality accessories, specialised medication, and professional vet consultations.",
  keywords: "pet sales, buy dogs, buy cats, pet shop, pet supplies, vet consultation, dog breeders",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Merriweather:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
