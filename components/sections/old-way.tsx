import { HEADING, LEAD } from "@/components/sections/landing-type";
import { Container } from "@/components/shared/container";

const WORKAROUNDS: readonly string[] = [
  "Email it to yourself",
  "Send yourself a message",
  "Take a photo of the screen",
  "Look for the USB stick",
  "Type it all out again",
];

/** The problem: the workarounds everyone already uses, struck out on ruled paper. */
export function OldWay() {
  return (
    <section aria-labelledby="old-way-title" className="sheet-top">
      <Container className="grid gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div className="flex flex-col gap-6">
          <h2 id="old-way-title" className={HEADING}>
            You already do this. The slow way.
          </h2>
          <p className={LEAD}>
            None of these were made for moving your own things between your own devices.
            CopyAnywhere is.
          </p>
        </div>

        <ul className="flex flex-col border-t border-border font-typed text-xl sm:text-2xl">
          {WORKAROUNDS.map((line) => (
            <li key={line} className="border-b border-border py-3 text-muted-foreground">
              <s className="decoration-stamp decoration-2">{line}</s>
            </li>
          ))}
          <li className="border-b border-border py-3 font-bold">
            Save it once. Copy it on the other device.
          </li>
        </ul>
      </Container>
    </section>
  );
}
