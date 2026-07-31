import { ChevronDown } from "lucide-react";

import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";

const FAQS = [
  {
    q: "Do I need to install anything?",
    a: "No. CopyAnywhere runs entirely in your browser, which is the whole point — it works on locked-down work machines where you cannot install software. There is also an optional Android app and browser extension if you want share-sheet and one-click capture.",
  },
  {
    q: "What kinds of files can I sync?",
    a: "Text, code, links, images, PDFs, Word, Excel, PowerPoint, ZIP archives, audio and video. If you can copy it or share it, it syncs.",
  },
  {
    q: "How fast is “realtime”?",
    a: "Typically under a second. A persistent secure connection pushes changes to every signed-in device as soon as they are saved — there is no refresh button and no polling delay.",
  },
  {
    q: "What happens if I am offline?",
    a: "You can keep saving. Items are queued locally and sync automatically the moment your connection returns, so you never lose anything you captured on a train or a plane.",
  },
  {
    q: "Is my content private?",
    a: "Yes. Every item is scoped to your own workspace by row-level security enforced in the database, and all traffic runs over TLS. Nothing is shared unless you explicitly share it.",
  },
  {
    q: "Does my content stay forever?",
    a: "By default items expire automatically after a short window so nothing piles up — especially useful on shared or work machines. Pin or favorite anything you want to keep permanently.",
  },
  {
    q: "Is it really free?",
    a: "Yes. The free plan covers everyday personal use with no credit card. Paid plans for larger storage and team workspaces are coming later.",
  },
] as const;

export function FAQ() {
  return (
    <section id="faq" className="py-24">
      <Container className="flex flex-col gap-12">
        <SectionHeader
          eyebrow="FAQ"
          title="Questions, answered"
          description="Everything people ask before they sign up."
        />
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
          {FAQS.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border bg-card px-5 transition-colors hover:border-brand/40 open:border-brand/40"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-sm font-medium marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {item.q}
                <ChevronDown
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
