import Link from "next/link";

import { Container } from "@/components/shared/container";
import { RETENTION_DAYS } from "@/lib/retention";

const LEDGER: ReadonlyArray<{ term: string; answer: string }> = [
  {
    term: "Who can see it",
    answer:
      "Only you. Every account is walled off in the database itself, not just in the app. Spaces are shared only with the people you invite.",
  },
  {
    term: "On the way",
    answer: "Encrypted over HTTPS, between your devices and our servers.",
  },
  {
    term: "How long it stays",
    answer: `${RETENTION_DAYS} days, then it's deleted, so little is left behind on a shared or work computer. Pin or favorite anything you want to keep.`,
  },
  {
    term: "Ads and selling",
    answer: "None. We don't sell your data or use what you save for advertising.",
  },
];

/** Privacy as a plain ledger: what happens to what you copy. */
export function Privacy() {
  return (
    <section id="privacy" aria-labelledby="privacy-title" className="scroll-mt-20 border-b border-border">
      <Container className="grid gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
        <div className="flex flex-col gap-4">
          <h2 id="privacy-title" className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            What happens to what you copy
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">
            What you copy is often personal. The full details are in the{" "}
            <Link href="/privacy" className="font-medium text-primary-ink underline underline-offset-4">
              privacy policy
            </Link>
            .
          </p>
        </div>

        <dl className="border-t border-border">
          {LEDGER.map((row) => (
            <div
              key={row.term}
              className="grid gap-1 border-b border-border py-5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8"
            >
              <dt className="text-base font-semibold">{row.term}</dt>
              <dd className="max-w-prose text-base text-muted-foreground">{row.answer}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
