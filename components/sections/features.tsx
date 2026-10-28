import { ListTodo, Pin, Search, Users, type LucideIcon } from "lucide-react";

import { SectionHeading } from "@/components/sections/section-heading";
import { Container } from "@/components/shared/container";
import { KindIcon } from "@/components/ui/kind-badge";
import type { ItemKind } from "@/lib/item-kinds";
import { RETENTION_DAYS } from "@/lib/retention";

const KINDS: ReadonlyArray<{ kind: ItemKind; title: string; body: string }> = [
  { kind: "text", title: "Text", body: "Addresses, messages, notes, anything you'd paste." },
  { kind: "code", title: "Code and commands", body: "Every space and line break kept, so it runs." },
  { kind: "error", title: "Errors and logs", body: "Stack traces in full, to read where your editor is." },
  { kind: "link", title: "Links", body: "Open them on the other device in one tap." },
  { kind: "image", title: "Photos and screenshots", body: "The full-quality file, not a squashed copy." },
  { kind: "doc", title: "PDFs and documents", body: "Word, Excel and PowerPoint files too." },
  { kind: "file", title: "Any other file", body: "Archives, audio and video, up to 10 MB each." },
];

const EXTRAS: ReadonlyArray<{ icon: LucideIcon; title: string; body: string }> = [
  {
    icon: Users,
    title: "Spaces, for working with others",
    body: "Make a room for a project and invite people with a link or a code. Paste an error there and everyone in the room sees it right away.",
  },
  {
    icon: ListTodo,
    title: "Quick Notes",
    body: "To-dos and reminders that follow you from your phone to your laptop.",
  },
  {
    icon: Search,
    title: "Search",
    body: "Find anything you've saved by a word in it.",
  },
  {
    icon: Pin,
    title: "Keeps itself tidy",
    body: `Snippets and files clear themselves after ${RETENTION_DAYS} days. Pin or favorite anything you want to keep.`,
  },
];

/** What you can send (every kind the app handles), and what else comes with it. */
export function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="scroll-mt-20 border-b border-border">
      <Container className="flex flex-col gap-12 px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex flex-col gap-10">
          <SectionHeading
            id="features-title"
            title="Not just text"
            description="Whatever you copy or share on one device, you can pick up on the other."
          />
          <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {KINDS.map((item) => (
              <li key={item.kind} className="flex gap-3">
                <KindIcon kind={item.kind} />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <h3 className="text-base font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-6 border-t border-border pt-10">
          <h3 className="text-lg font-semibold">More than a clipboard</h3>
          <ul className="grid gap-x-12 gap-y-6 md:grid-cols-2">
            {EXTRAS.map((extra) => {
              const Icon = extra.icon;
              return (
                <li key={extra.title} className="flex gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-wash text-primary-ink">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <h4 className="text-base font-medium">{extra.title}</h4>
                    <p className="text-sm text-muted-foreground">{extra.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
