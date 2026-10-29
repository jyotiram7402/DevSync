import { Container } from "@/components/shared/container";
import { FileIcon } from "@/components/ui/file-icon";
import { KindIcon } from "@/components/ui/kind-badge";
import type { ItemKind } from "@/lib/item-kinds";

interface Example {
  kind: ItemKind;
  title: string;
  meta: string;
  action: "Copy" | "Download" | "Open";
  /** Shown in monospace under the title, whitespace kept. */
  code?: string;
  /** A file name: shows the file's own icon instead of the kind tile. */
  file?: boolean;
  note: string;
}

const EXAMPLES: ReadonlyArray<Example> = [
  {
    kind: "error",
    title: "TypeError: Cannot read properties of undefined (reading 'map')",
    meta: "Error · just now",
    action: "Copy",
    code: "    at OrderList (OrderList.tsx:42:17)\n    at renderWithHooks (react-dom.js:16305:18)",
    note: "The whole stack trace, not a photo of your screen.",
  },
  {
    kind: "code",
    title: "function retry(fn, times = 3) {",
    meta: "Code · TypeScript · 2 min ago",
    action: "Copy",
    code: "  for (let i = 0; i < times; i++) {\n    try { return fn(); } catch {}\n  }",
    note: "Every space and line break kept, so it still runs.",
  },
  {
    kind: "command",
    title: "docker compose up -d --build",
    meta: "Command · 5 min ago",
    action: "Copy",
    note: "Commands come out exactly as they went in.",
  },
  {
    kind: "link",
    title: "github.com",
    meta: "Link · 12 min ago",
    action: "Open",
    code: "https://github.com/acme/checkout/pull/128",
    note: "Opens on the other device in one tap.",
  },
  {
    kind: "image",
    title: "whiteboard.jpg",
    meta: "Photo · 3.1 MB · 1 h ago",
    action: "Download",
    file: true,
    note: "The original photo, not a squashed copy.",
  },
  {
    kind: "doc",
    title: "Q3 report.pdf",
    meta: "PDF · 2.4 MB · yesterday",
    action: "Download",
    file: true,
    note: "PDF, Word, Excel, PowerPoint and more, up to 10 MB.",
  },
];

/**
 * What you can send, shown as it looks in the app — a clipboard history with
 * notes in the margin, rather than a grid of feature icons.
 */
export function Kinds() {
  return (
    <section id="features" aria-labelledby="features-title" className="scroll-mt-20 border-b border-border">
      <Container className="flex flex-col gap-12 px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex max-w-2xl flex-col gap-5">
          <h2 id="features-title" className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Anything you&apos;d copy.
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">
            Text, code and errors arrive exactly as you copied them. Photos and files arrive as the real thing.
          </p>
        </div>

        <ul className="flex flex-col gap-4 lg:gap-3">
          {EXAMPLES.map((example) => (
            <li
              key={example.title}
              className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center lg:gap-10"
            >
              <div className="flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-card p-3 sm:p-4">
                <div className="flex min-w-0 items-center gap-3">
                  {example.file ? (
                    <FileIcon name={example.title} size="sm" />
                  ) : (
                    <KindIcon kind={example.kind} size="sm" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{example.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{example.meta}</p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="hidden shrink-0 rounded-md border border-border px-3 py-1.5 text-sm font-medium sm:inline-flex"
                  >
                    {example.action}
                  </span>
                </div>
                {example.code ? (
                  <pre className="overflow-hidden whitespace-pre-wrap rounded-md bg-muted px-3 py-2 font-mono text-xs leading-5 text-muted-foreground [overflow-wrap:anywhere]">
                    {example.code}
                  </pre>
                ) : null}
              </div>
              <p className="flex items-start gap-3 pl-1 text-sm text-muted-foreground lg:pl-0">
                <span aria-hidden="true" className="mt-2.5 hidden h-px w-6 shrink-0 bg-border lg:block" />
                {example.note}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
