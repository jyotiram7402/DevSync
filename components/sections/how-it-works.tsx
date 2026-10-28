import { SectionHeading } from "@/components/sections/section-heading";
import { Container } from "@/components/shared/container";

const STEPS = [
  {
    title: "Sign in on both devices",
    body: "Open CopyAnywhere in the browser on your computer and on your phone, with the same account. That's the only setup.",
  },
  {
    title: "Paste or add anything",
    body: "Tap Add on your phone, or Quick add on a computer. Paste text, or pick a photo or a file.",
  },
  {
    title: "Copy it on the other one",
    body: "It's already there. Tap Copy, or Download for a file, and use it.",
  },
] as const;

/** How it works, in three steps. */
export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-20 border-b border-border">
      <Container className="flex flex-col gap-10 px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeading
          id="how-title"
          title="How it works"
          description="No cables, no apps to install, no folders to manage."
        />
        <ol className="grid gap-8 md:grid-cols-3 md:gap-10">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-2 border-t-2 border-border pt-4">
              <span aria-hidden="true" className="font-mono text-sm font-semibold text-primary-ink">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-base font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
