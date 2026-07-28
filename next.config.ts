import type { NextConfig } from "next";

/**
 * Security headers applied to every response.
 *
 * NOTE: A full Content-Security-Policy is intentionally NOT set in this
 * foundation sprint. A correct CSP for this app requires per-request nonces
 * (Next.js injects inline scripts for hydration) and an allow-list for the
 * Supabase REST + Realtime origins. That is introduced alongside the auth
 * sprint via middleware, as specified in docs/architecture/10-Security-Architecture.md.
 * The headers below are safe, non-breaking hardening that can ship today.
 */
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  /**
   * Linting is a CI/local concern (`npm run lint`), not a deploy gate, so a
   * lint issue never blocks a release. TypeScript errors DO fail the build
   * (typescript.ignoreBuildErrors is left at its default `false`) — types are
   * the real correctness gate. See eslint.config.js and docs/architecture/13-Git-Strategy.md.
   */
  eslint: {
    ignoreDuringBuilds: true,
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
