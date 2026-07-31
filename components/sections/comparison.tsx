import { Check, Minus, X } from "lucide-react";

import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { cn } from "@/utils/cn";

type Cell = "yes" | "no" | "partial";

const COLUMNS = ["CopyAnywhere", "Email", "WhatsApp", "Drive / Dropbox"] as const;

const ROWS: { label: string; values: [Cell, Cell, Cell, Cell] }[] = [
  { label: "Instant, no send step", values: ["yes", "no", "partial", "no"] },
  { label: "Keeps original quality", values: ["yes", "partial", "no", "yes"] },
  { label: "Nothing to install", values: ["yes", "yes", "no", "partial"] },
  { label: "Works on locked-down work machines", values: ["yes", "partial", "no", "no"] },
  { label: "Built-in search across everything", values: ["yes", "partial", "no", "partial"] },
  { label: "Auto-expires so nothing piles up", values: ["yes", "no", "no", "no"] },
  { label: "Made for code and snippets", values: ["yes", "no", "no", "no"] },
];

function CellIcon({ value }: { value: Cell }) {
  if (value === "yes") {
    return (
      <span className="mx-auto flex size-6 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-500">
        <Check className="size-3.5" aria-label="Yes" />
      </span>
    );
  }
  if (value === "partial") {
    return (
      <span className="mx-auto flex size-6 items-center justify-center rounded-full bg-amber-500/12 text-amber-500">
        <Minus className="size-3.5" aria-label="Partial" />
      </span>
    );
  }
  return (
    <span className="mx-auto flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <X className="size-3.5" aria-label="No" />
    </span>
  );
}

export function Comparison() {
  return (
    <section id="why" className="py-24">
      <Container className="flex flex-col gap-12">
        <SectionHeader
          eyebrow="Why CopyAnywhere"
          title="You already have five bad ways to do this"
          description="Emailing yourself. Messaging yourself. Uploading to a folder you will never open again. Here is how they actually compare."
        />

        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <caption className="sr-only">
              Feature comparison between CopyAnywhere and common alternatives
            </caption>
            <thead>
              <tr className="border-b bg-muted/40">
                <th scope="col" className="p-4 text-left font-medium text-muted-foreground">
                  Capability
                </th>
                {COLUMNS.map((column, index) => (
                  <th
                    key={column}
                    scope="col"
                    className={cn(
                      "p-4 text-center font-semibold",
                      index === 0 && "bg-brand/5 text-brand",
                    )}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-b last:border-b-0">
                  <th scope="row" className="p-4 text-left font-normal">
                    {row.label}
                  </th>
                  {row.values.map((value, index) => (
                    <td
                      key={`${row.label}-${index}`}
                      className={cn("p-4 text-center", index === 0 && "bg-brand/5")}
                    >
                      <CellIcon value={value} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}
