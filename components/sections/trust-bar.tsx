import { Chrome, Code2, Globe, Laptop, Smartphone, Terminal } from "lucide-react";

import { Container } from "@/components/shared/container";

const PLATFORMS = [
  { label: "Chrome", icon: Chrome },
  { label: "Android", icon: Smartphone },
  { label: "Windows", icon: Laptop },
  { label: "macOS", icon: Laptop },
  { label: "Linux", icon: Terminal },
  { label: "Any browser", icon: Globe },
] as const;

export function TrustBar() {
  return (
    <section className="border-y bg-muted/30 py-10">
      <Container className="flex flex-col items-center gap-6">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Works everywhere you already work
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {PLATFORMS.map(({ label, icon: Icon }) => (
            <li
              key={label}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </li>
          ))}
          <li className="flex items-center gap-2 rounded-full border border-dashed px-3 py-1 text-sm text-muted-foreground">
            <Code2 className="size-4" aria-hidden="true" />
            VS Code
            <span className="rounded-full bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
              SOON
            </span>
          </li>
        </ul>
      </Container>
    </section>
  );
}
