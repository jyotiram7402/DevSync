import Link from "next/link";

import { PasteDemo } from "@/components/sections/paste-demo";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

/**
 * Hero. The headline is drawn as a text selection on a phone — highlighted,
 * with selection handles and the Cut / Copy / Paste menu over it — because
 * that's the gesture the product starts from. The words render immediately
 * (they're the largest paint); the selection art is decorative. Under it, the
 * try-it-yourself demo on a "desk".
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title">
      <Container className="px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:pb-20 lg:pt-20">
        <h1
          id="hero-title"
          className="pt-14 text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.025em] text-foreground sm:text-6xl lg:text-7xl"
        >
          <span className="relative">
            <EditMenu />
            <SelectionHandle edge="start" />
            <span className="rounded-[0.1em] bg-wash [-webkit-box-decoration-break:clone] [box-decoration-break:clone]">
              Copy on your work laptop.
            </span>
            <SelectionHandle edge="end" />
          </span>
          <br />
          Paste on your phone.
          <span
            aria-hidden="true"
            className="ml-[0.06em] inline-block h-[0.85em] w-[0.055em] translate-y-[0.12em] bg-primary align-baseline animate-caret motion-reduce:animate-none"
          />
        </h1>

        <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-[minmax(0,36rem)_auto] lg:items-end lg:justify-between">
          <p className="text-pretty text-lg text-muted-foreground sm:text-xl">
            CopyAnywhere is a clipboard that follows you from device to device. It&apos;s just a website, so it works
            even on a work computer where you can&apos;t install anything, and what you copy is on your other
            devices a second later.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/signup">Get started free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Free, and it runs in any up-to-date browser.</p>
          </div>
        </div>
      </Container>

      {/* The desk: try it right here. */}
      <div className="border-y border-border bg-surface-2/70">
        <Container className="flex flex-col gap-5 px-4 py-10 sm:px-6 lg:py-14">
          <h2 className="text-lg font-semibold">Try it. Paste anything.</h2>
          <PasteDemo />
        </Container>
      </div>
    </section>
  );
}

/** The phone's edit menu, as it pops up over selected text (decorative). */
function EditMenu() {
  return (
    <span
      aria-hidden="true"
      className="absolute -top-12 left-0 z-10 flex items-center gap-0.5 whitespace-nowrap rounded-lg bg-foreground p-1 text-sm font-medium leading-none tracking-normal text-background shadow-overlay dark:border dark:border-border dark:bg-surface-overlay dark:text-foreground sm:-top-14"
    >
      <span className="rounded-md px-2.5 py-1.5">Cut</span>
      <span className="rounded-md bg-background/20 px-2.5 py-1.5 dark:bg-primary/30">Copy</span>
      <span className="rounded-md px-2.5 py-1.5">Paste</span>
      <span className="absolute left-6 top-full size-2.5 -translate-y-1/2 rotate-45 bg-foreground dark:border-b dark:border-r dark:border-border dark:bg-surface-overlay" />
    </span>
  );
}

/** A selection handle: a thin bar with a round grip (on top at the start, at the bottom at the end). */
function SelectionHandle({ edge }: { edge: "start" | "end" }) {
  return (
    <span
      aria-hidden="true"
      className={
        edge === "start"
          ? "relative mr-[0.04em] inline-block h-[1.12em] w-[0.06em] translate-y-[0.24em] rounded-full bg-primary align-baseline"
          : "relative ml-[0.04em] inline-block h-[1.12em] w-[0.06em] translate-y-[0.24em] rounded-full bg-primary align-baseline"
      }
    >
      <span
        className={
          edge === "start"
            ? "absolute left-1/2 top-0 size-[0.2em] -translate-x-1/2 -translate-y-[80%] rounded-full bg-primary"
            : "absolute bottom-0 left-1/2 size-[0.2em] -translate-x-1/2 translate-y-[80%] rounded-full bg-primary"
        }
      />
    </span>
  );
}
