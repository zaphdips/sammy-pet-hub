import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sammy Pet Hub | Premium Pet Sales & Supplies",
  description: "The one-stop destination for premium pet sales, high-quality accessories, specialized medication, and professional vet consultations.",
  keywords: "pet sales, buy dogs, buy cats, pet shop, pet supplies, vet consultation, dog breeders",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Outfit:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
