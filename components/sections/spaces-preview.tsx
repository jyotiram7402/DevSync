import { EDGE, HEADING, LEAD } from "@/components/sections/landing-type";
import { Container } from "@/components/shared/container";
import { cn } from "@/utils/cn";

const NOTE = "Meeting moved to 3pm, room 4B";

const COPIES: ReadonlyArray<{ owner: string; sheet: string; offset: string }> = [
  { owner: "Priya's copy", sheet: "sheet-top", offset: "mr-10 sm:mr-24 -rotate-1" },
  { owner: "Alex's copy", sheet: "sheet-canary", offset: "mx-5 sm:mx-12 -mt-5" },
  { owner: "Your copy", sheet: "sheet-top", offset: "ml-10 sm:ml-24 -mt-5 rotate-1" },
];

/** Spaces: the same thing, a copy for everyone in the room. */
export function SpacesPreview() {
  return (
    <section id="spaces" aria-labelledby="spaces-title" className="sheet-pink scroll-mt-20">
      <Container className="grid gap-14 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div className="flex flex-col gap-6">
          <h2 id="spaces-title" className={HEADING}>
            Need more copies? Make a Space.
          </h2>
          <p className={LEAD}>
            A Space is a shared room for a project. Send the link, paste text, a photo or a file
            there, and everyone in the room sees it the moment it lands.
          </p>
        </div>

        <figure
          role="img"
          aria-label="The same note on three sheets: one each for Priya, Alex and you."
          className="flex min-w-0 flex-col"
        >
          {COPIES.map((copy) => (
            <div
              key={copy.owner}
              className={cn("flex flex-col rounded-[3px] shadow-sheet", copy.sheet, copy.offset)}
            >
              <p className="px-5 pb-6 pt-5 font-typed text-lg text-primary-ink sm:px-6 sm:text-xl">
                {NOTE}
              </p>
              <p className={cn(EDGE, "border-t border-dashed border-border px-5 py-2.5 sm:px-6")}>
                {copy.owner}
              </p>
            </div>
          ))}
        </figure>
      </Container>
    </section>
  );
}
