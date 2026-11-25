import { HEADING, LEAD } from "@/components/sections/landing-type";
import { Container } from "@/components/shared/container";

const STEPS: readonly string[] = [
  "Open CopyAnywhere in the browser on both devices and sign in.",
  "Paste text, or add a photo or a file, on one of them.",
  "It's already on the other one. Press Copy, or Download for a file.",
];

/**
 * How it works, and why it works on a locked-down computer: it's a website.
 * Set on the carbon sheet, the dark page between the copies.
 */
export function NoInstall() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="sheet-carbon scroll-mt-20"
    >
      <Container className="flex flex-col gap-14 px-4 py-20 sm:px-6 sm:py-28">
        <div className="flex flex-col gap-6">
          <h2 id="how-it-works-title" className={HEADING}>
            Nothing to install.
            <br />
            It&apos;s a website.
          </h2>
          <p className={LEAD}>
            Work laptops block new apps, and often the chat and cloud apps you&apos;d use instead.
            CopyAnywhere opens in the browser you already have.
          </p>
        </div>

        <ol className="grid gap-8 md:grid-cols-3 md:gap-10">
          {STEPS.map((step, index) => (
            <li key={step} className="flex gap-4 border-t border-border pt-5 md:flex-col md:gap-3">
              <span
                aria-hidden="true"
                className="font-typed text-4xl font-bold leading-none text-primary-ink md:text-5xl"
              >
                {index + 1}
              </span>
              <p className="text-lg">{step}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
