import { Check, Lock, Mail, MessageCircle, Usb, type LucideIcon } from "lucide-react";

import { SectionHeading } from "@/components/sections/section-heading";
import { Container } from "@/components/shared/container";

const PAINS: ReadonlyArray<{ icon: LucideIcon; title: string; problem: string; fix: string }> = [
  {
    icon: Mail,
    title: "Emailing it to yourself",
    problem: "Your inbox fills up with notes to yourself, and you wait for each one to arrive.",
    fix: "Paste it once. It's on your other devices in about a second.",
  },
  {
    icon: MessageCircle,
    title: "Sending it to yourself in a chat app",
    problem: "Photos get squashed, code loses its spacing, and it's buried between real messages.",
    fix: "Photos keep their quality, and code keeps every space and line break.",
  },
  {
    icon: Usb,
    title: "USB sticks and cables",
    problem: "Easy to forget, often blocked on work computers, and slow for one small file.",
    fix: "Nothing to plug in. Files up to 10 MB go straight through the browser.",
  },
  {
    icon: Lock,
    title: "A locked-down work laptop",
    problem: "You can't install apps, and personal chat and cloud drives are often blocked.",
    fix: "CopyAnywhere is a website. Sign in from the browser, with nothing to install.",
  },
];

/** The workarounds people use today, and what CopyAnywhere does instead. */
export function Pains() {
  return (
    <section id="why" aria-labelledby="why-title" className="scroll-mt-20 border-b border-border">
      <Container className="flex flex-col gap-10 px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeading
          id="why-title"
          title="Stop sending things to yourself"
          description="Everyone has a workaround for getting something from one device to another. None of them were made for it."
        />
        <ul className="grid gap-x-12 gap-y-10 md:grid-cols-2">
          {PAINS.map((pain) => {
            const Icon = pain.icon;
            return (
              <li key={pain.title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="flex min-w-0 flex-col gap-2">
                  <h3 className="text-base font-semibold">{pain.title}</h3>
                  <p className="text-sm text-muted-foreground">{pain.problem}</p>
                  <p className="flex gap-2 text-sm text-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                    <span>
                      <span className="sr-only">With CopyAnywhere: </span>
                      {pain.fix}
                    </span>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
