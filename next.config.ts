import type { NextConfig } from "next";

/**
 * Security headers applied to every response.
 *
 * The Content-Security-Policy below only uses directives that can't break the
 * app: no embedding by other sites, no <base> or plugin tricks, and forms post
 * only to this site. A script/connect allow-list would need per-request nonces
 * (Next.js injects inline scripts for hydration) and the Supabase REST +
 * Realtime origins, so it is left for later.
 */
const contentSecurityPolicy = [
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
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
