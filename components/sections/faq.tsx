import { ChevronDown } from "lucide-react";

import { SectionHeading } from "@/components/sections/section-heading";
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
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 border-b border-border">
      <Container className="grid gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
        <SectionHeading id="faq-title" title="Questions" description="Short answers to what people ask first." />
        <div className="flex flex-col divide-y divide-border border-y border-border">
          {FAQS.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-left text-base font-medium [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDown
                  className="size-5 shrink-0 text-muted-foreground transition-transform duration-base group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="max-w-prose pb-5 text-sm text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
