import { EDGE, HEADING, LEAD } from "@/components/sections/landing-type";
import { Container } from "@/components/shared/container";

const LINES: ReadonlyArray<{ sample: string; kind: string; arrives: string }> = [
  {
    sample: "221B Baker Street, London NW1 6XE",
    kind: "Text",
    arrives: "Exactly as you wrote it. Nothing is trimmed or reformatted.",
  },
  {
    sample: "https://www.openstreetmap.org/#map=17/51.5237/-0.1585",
    kind: "Link",
    arrives: "Opens on the other device in one tap.",
  },
  {
    sample: "whiteboard.jpg · 3.1 MB",
    kind: "Photo",
    arrives: "The original photo, not a squashed copy.",
  },
  {
    sample: "Q3 report.pdf · 2.4 MB",
    kind: "File",
    arrives: "PDF, Word, Excel, PowerPoint and more, up to 10 MB.",
  },
  {
    sample:
      "TypeError: Cannot read properties of undefined (reading 'map')\n    at OrderList (OrderList.tsx:42:17)",
    kind: "Error or code",
    arrives: "Every space and line break kept, so code still runs.",
  },
  {
    sample: "docker compose up -d --build",
    kind: "Command",
    arrives: "Comes out exactly as it went in.",
  },
];

/** What you can send, set as the line items of a form: what you copy, and how it arrives. */
export function Kinds() {
  return (
    <section id="features" aria-labelledby="features-title" className="sheet-canary scroll-mt-20">
      <Container className="flex flex-col gap-12 px-4 py-20 sm:px-6 sm:py-28">
        <div className="flex flex-col gap-6">
          <h2 id="features-title" className={HEADING}>
            Anything you&apos;d copy.
          </h2>
          <p className={LEAD}>
            Text arrives exactly as you copied it. Photos and files arrive as the real thing.
          </p>
        </div>

        <div>
          <div
            aria-hidden="true"
            className="hidden gap-10 border-b-2 border-foreground pb-2 md:grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
          >
            <p className={EDGE}>What you copy</p>
            <p className={EDGE}>How it arrives</p>
          </div>
          <dl className="border-t-2 border-foreground md:border-t-0">
            {LINES.map((line) => (
              <div
                key={line.kind}
                className="grid gap-2 border-b border-border py-5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-baseline md:gap-10"
              >
                <dt className="min-w-0 whitespace-pre-wrap font-typed text-lg leading-7 text-primary-ink [overflow-wrap:anywhere]">
                  {line.sample}
                </dt>
                <dd className="text-base">
                  <span className="font-bold">{line.kind}.</span> {line.arrives}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
