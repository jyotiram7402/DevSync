import { Plus } from "lucide-react";

import { HEADING } from "@/components/sections/landing-type";
import { Container } from "@/components/shared/container";
import { RETENTION_DAYS } from "@/lib/retention";

const FAQS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "Do I need to install anything?",
    a: "No. CopyAnywhere is a website: sign in from any up-to-date browser, including on a work computer where you can't install apps. On your phone you can add it to your home screen so it opens like an app.",
  },
  {
    q: "What can I send?",
    a: "Text, code, links, photos and screenshots, PDFs, Word, Excel and PowerPoint files, archives, audio and video. Files can be up to 10 MB each.",
  },
  {
    q: "How fast is it?",
    a: "Usually about a second. Your other devices update on their own; there's nothing to refresh.",
  },
  {
    q: "How long do things stay?",
    a: `Snippets and files stay for ${RETENTION_DAYS} days, then they're deleted, so nothing piles up. Pin or favorite anything you want to keep. Quick Notes and Spaces stay until you delete them.`,
  },
  {
    q: "Can I share with other people?",
    a: "Yes, with Spaces. Make a room for a project, invite people with a link or a code, and everything shared in the room shows up for everyone in it.",
  },
  {
    q: "Is it free?",
    a: "Yes. Everything in CopyAnywhere is free to use right now.",
  },
];

/** Short answers to what people ask first. Native <details>, so it works without JavaScript. */
export function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="sheet-top scroll-mt-20">
      <Container className="grid gap-10 px-4 pb-20 sm:px-6 sm:pb-28 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-16">
        <h2 id="faq-title" className={HEADING}>
          Questions
        </h2>
        <div className="flex flex-col border-t-2 border-foreground">
          {FAQS.map((item) => (
            <details key={item.q} className="group border-b border-border">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-xl font-bold tracking-[-0.01em] [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus
                  className="size-6 shrink-0 text-primary-ink transition-transform duration-base ease-out group-open:rotate-45"
                  aria-hidden="true"
                />
              </summary>
              <p className="max-w-prose pb-6 text-lg text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
