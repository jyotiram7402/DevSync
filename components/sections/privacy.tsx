import Link from "next/link";

import { HEADING, LEAD } from "@/components/sections/landing-type";
import { Container } from "@/components/shared/container";
import { RETENTION_DAYS } from "@/lib/retention";

const CLAUSES: ReadonlyArray<{ term: string; answer: string }> = [
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

/** Privacy: the fine print of the form, set large enough to read. */
export function Privacy() {
  return (
    <section id="privacy" aria-labelledby="privacy-title" className="sheet-top scroll-mt-20">
      <Container className="flex flex-col gap-12 px-4 py-20 sm:px-6 sm:py-28">
        <div className="flex flex-col gap-6">
          <h2 id="privacy-title" className={HEADING}>
            The fine print, in large print.
          </h2>
          <p className={LEAD}>
            What you copy is often personal. The full details are in the{" "}
            <Link
              href="/privacy"
              className="font-semibold text-primary-ink underline decoration-2 underline-offset-4 hover:decoration-stamp"
            >
              privacy policy
            </Link>
            .
          </p>
        </div>

        <dl className="grid gap-x-16 border-t-2 border-foreground md:grid-cols-2">
          {CLAUSES.map((clause) => (
            <div key={clause.term} className="flex flex-col gap-2 border-b border-border py-7">
              <dt className="text-2xl font-black tracking-[-0.02em]">{clause.term}</dt>
              <dd className="max-w-prose text-lg text-muted-foreground">{clause.answer}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
