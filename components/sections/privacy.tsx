import { EyeOff, Lock, ShieldCheck, Timer, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/sections/section-heading";
import { Container } from "@/components/shared/container";
import { RETENTION_DAYS } from "@/lib/retention";

const POINTS: ReadonlyArray<{ icon: LucideIcon; title: string; body: string }> = [
  {
    icon: Lock,
    title: "Only you can see your items",
    body: "Each account is walled off in the database itself, not just in the app. Spaces are shared only with the people you invite.",
  },
  {
    icon: ShieldCheck,
    title: "Encrypted on the way",
    body: "Everything travels over HTTPS between your devices and our servers.",
  },
  {
    icon: Timer,
    title: "Nothing piles up",
    body: `Snippets and files are deleted after ${RETENTION_DAYS} days unless you pin or favorite them, so little is left behind on a shared or work computer.`,
  },
  {
    icon: EyeOff,
    title: "No ads, no selling",
    body: "We don't sell your data or use what you save for advertising.",
  },
];

/** Privacy, in plain words, with a link to the full policy. */
export function Privacy() {
  return (
    <section id="privacy" aria-labelledby="privacy-title" className="scroll-mt-20 border-b border-border">
      <Container className="flex flex-col gap-10 px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeading
          id="privacy-title"
          title="Private by default"
          description={
            <>
              What you copy is often personal. Here&apos;s how it&apos;s looked after. The details are in the{" "}
              <Link href="/privacy" className="font-medium text-primary-ink underline underline-offset-4">
                privacy policy
              </Link>
              .
            </>
          }
        />
        <ul className="grid gap-x-12 gap-y-8 md:grid-cols-2">
          {POINTS.map((point) => {
            const Icon = point.icon;
            return (
              <li key={point.title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <h3 className="text-base font-semibold">{point.title}</h3>
                  <p className="text-sm text-muted-foreground">{point.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
