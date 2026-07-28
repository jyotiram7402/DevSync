import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";

const TECH = [
  { name: "Next.js 15", role: "App Router & RSC" },
  { name: "React 19", role: "UI runtime" },
  { name: "TypeScript", role: "End-to-end types" },
  { name: "Tailwind CSS", role: "Design system" },
  { name: "Supabase", role: "DB · Auth · Realtime" },
  { name: "Vercel", role: "Hosting & CI" },
] as const;

export function TechStack() {
  return (
    <section id="tech" className="py-24">
      <Container className="flex flex-col gap-12">
        <SectionHeader
          eyebrow="Built on a modern stack"
          title="Production-grade foundations"
          description="Boring, reliable, best-in-class tools — chosen so the product can scale without a rewrite."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TECH.map((tech, index) => (
            <div
              key={tech.name}
              className="flex items-center justify-between rounded-xl border bg-card px-5 py-4 transition-colors animate-fade-up hover:border-foreground/20"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="font-mono text-sm font-medium">{tech.name}</span>
              <span className="text-xs text-muted-foreground">{tech.role}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
