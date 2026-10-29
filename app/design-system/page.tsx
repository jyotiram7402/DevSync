import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DesignSystemShowcase } from "@/components/design-system/showcase";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

/**
 * Dev preview of every primitive in every state, for design review. Available
 * locally and on Vercel preview deployments; a 404 in production.
 */
export default function DesignSystemPage() {
  const isProduction = process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview";
  if (isProduction) notFound();

  return <DesignSystemShowcase />;
}
