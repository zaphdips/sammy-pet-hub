import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Supabase Storage — allows all project buckets
        protocol: "https",
        hostname: "jpwjppdeeckeijycwnpb.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Control referrer info
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Allow AsyncPay iframe + Supabase + Google Fonts
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.asyncpay.io",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://jpwjppdeeckeijycwnpb.supabase.co https://images.unsplash.com https://upload.wikimedia.org",
              "frame-src https://app.asyncpay.io https://api.asyncpay.io https://checkout.asyncpay.io",
              "connect-src 'self' https://jpwjppdeeckeijycwnpb.supabase.co https://api.asyncpay.io https://checkout.asyncpay.io",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
