import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set explicit Turbopack root to silence warnings
  turbopack: {
    root: __dirname,
  },
  // Include Playwright browser binaries in serverless bundle (Vercel)
  outputFileTracingIncludes: {
    '/api/playwright/**': ['playwright-browsers/**', '.playwright-browsers/**'],
    '/api/selectors/**': ['playwright-browsers/**', '.playwright-browsers/**'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
