import { Lock, ShieldAlert, X } from "lucide-react";

import { Container } from "@/components/shared/container";
import { KindIcon } from "@/components/ui/kind-badge";

/**
 * The wedge: the work laptop that won't let you install anything. A "blocked"
 * dialog behind a browser window where CopyAnywhere simply works — then how it
 * works, in three plain steps.
 */
export function WorkLaptop({ host }: { host: string }) {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-20 border-b border-border">
      <Container className="grid gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <figure
          role="img"
          aria-label={`A "Software installation blocked" message from IT, and behind it a browser window with CopyAnywhere open at ${host}, signed in.`}
          className="relative order-last min-w-0 pb-2 lg:order-first"
        >
          {/* IT says no… */}
          <div className="w-[85%] max-w-sm rounded-lg border border-border bg-surface shadow-overlay">
            <div className="flex h-9 items-center justify-between border-b border-border px-3">
              <span className="text-xs font-medium text-muted-foreground">Software installation</span>
              <X className="size-3.5 text-muted-foreground" />
            </div>
            <div className="flex gap-3 p-4">
              <ShieldAlert className="size-6 shrink-0 text-warning" />
              <div className="flex min-w-0 flex-col gap-1">
                <p className="text-sm font-semibold">Installation blocked</p>
                <p className="text-sm text-muted-foreground">
                  Your organization doesn&apos;t allow this app. Contact your IT administrator.
                </p>
              </div>
            </div>
            <div className="flex justify-end border-t border-border px-4 py-2.5">
              <span className="rounded-md border border-border px-4 py-1 text-sm">OK</span>
            </div>
          </div>

          {/* …the browser says yes. */}
          <div className="relative -mt-6 ml-auto w-[88%] max-w-md overflow-hidden rounded-lg border border-border bg-surface shadow-overlay sm:-mt-10">
            <div className="flex h-10 items-center border-b border-border bg-surface-2 px-3">
              <span className="mx-auto flex h-6 min-w-0 max-w-[16rem] flex-1 items-center justify-center gap-1.5 rounded-md bg-background px-3 text-xs text-muted-foreground">
                <Lock className="size-3 shrink-0" />
                <span className="truncate">{host}</span>
              </span>
            </div>
            <div className="flex flex-col gap-2 p-3">
              <div className="flex items-center justify-between px-1 pb-1">
                <span className="text-sm font-semibold">Snippets</span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-success" />
                  Signed in
                </span>
              </div>
              <WindowRow kind="error" title="TypeError: Cannot read properties of undefined" meta="From your phone · just now" />
              <WindowRow kind="image" title="whiteboard.jpg" meta="From your phone · 3 min ago" />
            </div>
          </div>
        </figure>

        <div className="flex max-w-xl flex-col gap-8">
          <div className="flex flex-col gap-5">
            <h2 id="how-title" className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Works where you can&apos;t install anything.
            </h2>
            <p className="text-pretty text-lg text-muted-foreground">
              Work laptops block new apps, and often the chat and cloud apps you&apos;d use instead. CopyAnywhere is a
              website. Open it in the browser you already have, sign in, and you&apos;re done.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-base font-semibold">How it works</h3>
            <ol className="flex list-decimal flex-col gap-2 pl-5 text-base text-muted-foreground marker:font-medium marker:text-foreground">
              <li className="pl-1">Open CopyAnywhere in the browser on both devices and sign in.</li>
              <li className="pl-1">Paste text, or add a photo or a file, on one of them.</li>
              <li className="pl-1">It&apos;s already on the other one. Tap Copy, or Download for a file.</li>
            </ol>
          </div>
        </div>
      </Container>
    </section>
  );
}

function WindowRow({ kind, title, meta }: { kind: "error" | "image"; title: string; meta: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-md border border-border bg-card px-2.5 py-2">
      <KindIcon kind={kind} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{meta}</p>
      </div>
      <span className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs font-medium">
        {kind === "image" ? "Download" : "Copy"}
      </span>
    </div>
  );
}
