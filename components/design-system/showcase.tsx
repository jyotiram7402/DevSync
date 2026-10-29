"use client";

import { FolderInput, Inbox, Pencil, Plus, Share2, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CodeBlock } from "@/components/ui/code-block";
import { CopyButton } from "@/components/ui/copy-button";
import { ConfirmDialog, DialogFooter, ResponsiveDialog } from "@/components/ui/dialog";
import { FileIcon } from "@/components/ui/file-icon";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { KindBadge, KindIcon } from "@/components/ui/kind-badge";
import { Label } from "@/components/ui/label";
import { Menu } from "@/components/ui/menu";
import { Progress } from "@/components/ui/progress";
import { RelativeTime } from "@/components/ui/relative-time";
import { ScrollableTabs } from "@/components/ui/scrollable-tabs";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip } from "@/components/ui/tooltip";
import { useMounted } from "@/hooks/use-mounted";
import { ITEM_KINDS, type ItemKind } from "@/lib/item-kinds";

/**
 * Design-system preview: every primitive in every state, for review
 * screenshots at phone and desktop widths in both themes. Sample data only.
 */

const COLOR_SWATCHES = [
  { name: "background", className: "bg-background" },
  { name: "surface", className: "bg-surface" },
  { name: "surface-2", className: "bg-surface-2" },
  { name: "surface-overlay", className: "bg-surface-overlay" },
  { name: "border", className: "bg-border" },
  { name: "input", className: "bg-input" },
  { name: "muted-foreground", className: "bg-muted-foreground" },
  { name: "foreground", className: "bg-foreground" },
  { name: "primary", className: "bg-primary" },
  { name: "primary-ink", className: "bg-primary-ink" },
  { name: "wash", className: "bg-wash" },
  { name: "destructive", className: "bg-destructive" },
  { name: "success", className: "bg-success" },
  { name: "warning", className: "bg-warning" },
  { name: "favorite", className: "bg-favorite" },
] as const;

const KIND_SWATCHES = [
  { name: "kind-neutral", className: "bg-kind-neutral" },
  { name: "kind-code", className: "bg-kind-code" },
  { name: "kind-command", className: "bg-kind-command" },
  { name: "kind-error", className: "bg-kind-error" },
  { name: "kind-link", className: "bg-kind-link" },
  { name: "kind-image", className: "bg-kind-image" },
  { name: "kind-doc", className: "bg-kind-doc" },
  { name: "kind-note", className: "bg-kind-note" },
] as const;

const TYPE_SCALE = [
  { className: "text-xs", size: "12 / 16" },
  { className: "text-sm", size: "14 / 20" },
  { className: "text-base", size: "16 / 24" },
  { className: "text-lg", size: "18 / 26" },
  { className: "text-xl", size: "20 / 28" },
  { className: "text-2xl", size: "24 / 32" },
  { className: "text-3xl", size: "30 / 36" },
  { className: "text-4xl", size: "36 / 40" },
] as const;

const BUTTON_VARIANTS = [
  { variant: "default", label: "Save" },
  { variant: "secondary", label: "Secondary" },
  { variant: "outline", label: "Outline" },
  { variant: "ghost", label: "Ghost" },
  { variant: "destructive", label: "Delete" },
  { variant: "link", label: "Link" },
] as const;

const SAMPLE_ERROR = `TypeError: Cannot read properties of undefined (reading 'map')
    at RecentList (webpack-internal:///./components/recent-list.tsx:24:31)
    at renderWithHooks (react-dom.development.js:16305:18)
    at mountIndeterminateComponent (react-dom.development.js:20074:13)
    at beginWork (react-dom.development.js:21587:16)
    at HTMLUnknownElement.callCallback (react-dom.development.js:4164:14)
    at Object.invokeGuardedCallbackDev (react-dom.development.js:4213:16)
    at invokeGuardedCallback (react-dom.development.js:4277:31)
    at beginWork$1 (react-dom.development.js:27451:7)
    at performUnitOfWork (react-dom.development.js:26557:12)
    at workLoopSync (react-dom.development.js:26466:5)
    at renderRootSync (react-dom.development.js:26434:7)
    at recoverFromConcurrentError (react-dom.development.js:25850:20)
    at performSyncWorkOnRoot (react-dom.development.js:26096:20)`;

const SAMPLE_COMMAND = "git push --set-upstream origin ui-overhaul && npm run build -- --profile";

const SAMPLE_FILES = [
  { name: "invoice-2026-10.pdf", mimeType: "application/pdf" },
  { name: "q3-numbers.xlsx", mimeType: null },
  { name: "kickoff.pptx", mimeType: null },
  { name: "screenshot.png", mimeType: "image/png" },
  { name: "logs-export.zip", mimeType: "application/zip" },
  { name: "standup.m4a", mimeType: "audio/mp4" },
  { name: "repro.mov", mimeType: "video/quicktime" },
  { name: "use-auth.ts", mimeType: null },
  { name: "notes", mimeType: null },
] as const;

const ALL_KINDS = Object.keys(ITEM_KINDS) as ItemKind[];

const PEOPLE = [
  { id: "1", name: "Asha Patel" },
  { id: "2", name: "Leo Martins" },
  { id: "3", name: "Mei Chen" },
  { id: "4", name: "Sam Okafor" },
  { id: "5", name: "Ravi Kumar" },
  { id: "6", name: "Nora Lind" },
];

type FilterId = "all" | "error" | "code" | "doc" | "file";

const FILTERS: ReadonlyArray<{ id: FilterId; label: string; count: number }> = [
  { id: "all", label: "All", count: 12 },
  { id: "error", label: "Errors", count: 4 },
  { id: "code", label: "Code", count: 6 },
  { id: "doc", label: "Docs", count: 1 },
  { id: "file", label: "Files", count: 1 },
];

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-border py-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? <p className="max-w-prose text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span aria-hidden="true" className={`size-10 shrink-0 rounded-md border border-border ${className}`} />
      <span className="truncate font-mono text-xs text-muted-foreground">{name}</span>
    </div>
  );
}

export function DesignSystemShowcase() {
  const mounted = useMounted();
  const [checked, setChecked] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [kind, setKind] = useState<"error" | "code" | "command">("error");
  const [filter, setFilter] = useState<FilterId>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [arrivals, setArrivals] = useState<Array<{ id: number; text: string }>>([
    { id: 1, text: "npm ERR! code ERESOLVE — unable to resolve dependency tree" },
  ]);

  function pretend(setPending: (pending: boolean) => void, done?: () => void) {
    setPending(true);
    window.setTimeout(() => {
      setPending(false);
      done?.();
    }, 1500);
  }

  function simulateArrival() {
    setArrivals((current) => [
      { id: Date.now(), text: `Pasted on your phone · item ${current.length + 1}` },
      ...current,
    ]);
  }

  return (
    <main id="main" className="container flex max-w-5xl flex-col pb-safe pt-8">
      <header className="flex flex-wrap items-center justify-between gap-4 pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Design system</h1>
          <p className="text-sm text-muted-foreground">
            Every primitive in every state. Preview builds only; hidden in production.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <Section title="Color" description="Semantic tokens. The accent marks only what is selected, live or actionable.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COLOR_SWATCHES.map((swatch) => (
            <Swatch key={swatch.name} name={swatch.name} className={swatch.className} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {KIND_SWATCHES.map((swatch) => (
            <Swatch key={swatch.name} name={swatch.name} className={swatch.className} />
          ))}
        </div>
      </Section>

      <Section title="Type" description="IBM Plex Sans for the interface; JetBrains Mono only for code, commands, logs and codes.">
        <div className="flex flex-col gap-3">
          {TYPE_SCALE.map((step) => (
            <div key={step.className} className="flex min-w-0 items-baseline gap-4">
              <span className="w-16 shrink-0 text-xs text-muted-foreground">{step.size}</span>
              <span className={`${step.className} min-w-0 truncate`}>Copy once. Access anywhere.</span>
            </div>
          ))}
          <div className="flex min-w-0 items-baseline gap-4">
            <span className="w-16 shrink-0 text-xs text-muted-foreground">Mono</span>
            <span className="min-w-0 font-mono text-sm [overflow-wrap:anywhere]">0O 1lI · invite 4F9A2C · {SAMPLE_COMMAND}</span>
          </div>
        </div>
      </Section>

      <Section title="Buttons" description="44px on touch screens, compact for the mouse. Every button has a pressed state.">
        <div className="flex flex-wrap items-center gap-3">
          {BUTTON_VARIANTS.map(({ variant, label }) => (
            <Button key={variant} variant={variant}>
              {label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button loading={saving} onClick={() => pretend(setSaving)}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button disabled>Disabled</Button>
          <Button variant="outline">
            <Plus aria-hidden="true" />
            New snippet
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <IconButton label="Edit" icon={Pencil} />
          <IconButton label="Edit" icon={Pencil} variant="outline" />
          <IconButton label="Delete" icon={Trash2} size="sm" />
          <IconButton label="Add" icon={Plus} variant="default" />
          <Tooltip content="Share to a Space">
            <IconButton label="Share to a Space" icon={Share2} variant="outline" />
          </Tooltip>
        </div>
      </Section>

      <Section title="Form controls" description="16px text on phones so iOS never zooms; errors are linked to their field.">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ds-name">Space name</Label>
            <Input id="ds-name" placeholder="GeoReminder Android" autoComplete="off" enterKeyHint="done" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ds-email">Email</Label>
            <Input
              id="ds-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              defaultValue="asha@"
              aria-invalid="true"
              aria-describedby="ds-email-error"
            />
            <p id="ds-email-error" className="text-sm text-destructive">
              Enter a full email address, like name@company.com.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ds-disabled">Invite code</Label>
            <Input id="ds-disabled" disabled defaultValue="4F9A2C" className="font-mono" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ds-select">Language</Label>
            <Select id="ds-select" defaultValue="typescript">
              <option value="plaintext">Plain text</option>
              <option value="typescript">TypeScript</option>
              <option value="kotlin">Kotlin</option>
              <option value="shell">Shell</option>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <Label htmlFor="ds-textarea">Paste an error or some code</Label>
            <Textarea id="ds-textarea" rows={4} placeholder="It will show up on your other devices in about a second." />
          </div>
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-3 text-sm">
              <Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} />
              Keep this item (it won&apos;t expire)
            </label>
            <label className="flex items-center gap-3 text-sm">
              <Checkbox disabled />
              Disabled option
            </label>
          </div>
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-3 text-sm">
              <Switch checked={enabled} onCheckedChange={setEnabled} />
              Paste-to-save with Ctrl+V
            </label>
            <SegmentedControl
              aria-label="Kind"
              value={kind}
              onValueChange={setKind}
              options={[
                { value: "error", label: "Error" },
                { value: "code", label: "Code" },
                { value: "command", label: "Command" },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section title="Filter tabs" description="One scrolling row, never wrapped; the active chip stays in view.">
        <ScrollableTabs
          aria-label="Filter items"
          items={FILTERS}
          activeId={filter}
          onSelect={(id) => {
            const next = FILTERS.find((item) => item.id === id);
            if (next) setFilter(next.id);
          }}
        />
      </Section>

      <Section title="Overlays" description="Centered dialog from tablet up, bottom sheet on phones. Menus become action sheets on phones.">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            Open dialog
          </Button>
          <Button variant="outline" onClick={() => setConfirmOpen(true)}>
            Delete…
          </Button>
          <Menu
            label="Snippet actions"
            items={[
              { label: "Edit", icon: Pencil },
              { label: "Move to project", icon: FolderInput },
              { label: "Share to a Space", icon: Share2 },
              "separator",
              { label: "Delete", icon: Trash2, destructive: true, onSelect: () => setConfirmOpen(true) },
            ]}
          />
          <Button variant="outline" onClick={() => toast.success("Saved")}>
            Success toast
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.error("Couldn't save. Check your connection and try again.")}
          >
            Error toast
          </Button>
        </div>

        <ResponsiveDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Rename project"
          description="Projects group your snippets by what you're working on."
          footer={
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setDialogOpen(false)}>Save</Button>
            </DialogFooter>
          }
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ds-project">Name</Label>
            <Input id="ds-project" defaultValue="GeoReminder" data-autofocus="" />
          </div>
        </ResponsiveDialog>

        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => pretend(setDeleting, () => setConfirmOpen(false))}
          pending={deleting}
          destructive
          title="Delete this snippet?"
          description="It will be removed from all your devices. This can't be undone."
          confirmLabel="Delete snippet"
        />
      </Section>

      <Section title="Loading and status">
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-md" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <LoadingSpinner size="sm" />
          <LoadingSpinner />
          <div className="w-48">
            <Progress value={40} label="Uploading screenshot.png" />
          </div>
          <div className="w-48">
            <Progress value={null} label="Uploading" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Default</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="muted">Muted</Badge>
          <Badge variant="primary">Kept</Badge>
          <Badge variant="success">Synced</Badge>
          <Badge variant="warning">Reconnecting</Badge>
          <Badge variant="destructive">Overdue</Badge>
        </div>
      </Section>

      <Section title="Empty and error states">
        <div className="grid gap-4 md:grid-cols-2">
          <EmptyState
            icon={Inbox}
            title="Nothing here yet"
            description="Paste an error, a command or some code. It shows up on your other devices in about a second."
            action={
              <Button>
                <Plus aria-hidden="true" />
                New snippet
              </Button>
            }
          />
          <ErrorState
            title="Couldn't load your snippets"
            description="The connection dropped. Check you're online, then try again."
            onRetry={() => pretend(setRetrying)}
            pending={retrying}
          />
        </div>
      </Section>

      <Section title="People">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name="Asha Patel" size="xs" />
          <Avatar name="Asha Patel" size="sm" />
          <Avatar name="Asha Patel" size="md" />
          <Avatar name="Asha Patel" size="lg" />
          <AvatarStack people={PEOPLE} />
        </div>
      </Section>

      <Section
        title="Clipboard"
        description="Copy copies the raw text exactly. The wash marks something just copied or just arrived from another device."
      >
        <div className="flex flex-wrap items-center gap-3">
          <CopyButton value={SAMPLE_COMMAND} srContext="command" />
          <CopyButton value={SAMPLE_COMMAND} iconOnly srContext="command" />
          <CopyButton
            value={() => new Promise<string>((resolve) => window.setTimeout(() => resolve(SAMPLE_COMMAND), 300))}
            label="Copy link"
            srContext="(fetched first)"
          />
        </div>
        <CodeBlock value={SAMPLE_COMMAND} label="Command" />
        <CodeBlock value={SAMPLE_ERROR} label="Error log" />
        <div className="flex flex-col gap-2">
          <Button variant="outline" className="self-start" onClick={simulateArrival}>
            Simulate an item arriving
          </Button>
          <ul className="flex flex-col gap-2">
            {arrivals.map((item, index) => (
              <li
                key={item.id}
                className={`rounded-lg border border-border bg-card px-4 py-3 text-sm ${index === 0 && arrivals.length > 1 ? "animate-arrive animate-wash" : ""}`}
              >
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section title="Kinds and files" description="Always an icon and a label; the color is a quiet tint, never the only signal.">
        <div className="flex flex-wrap gap-2">
          {ALL_KINDS.map((itemKind) => (
            <KindBadge key={itemKind} kind={itemKind} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_KINDS.map((itemKind) => (
            <KindIcon key={itemKind} kind={itemKind} size="sm" />
          ))}
        </div>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_FILES.map((file) => (
            <li key={file.name} className="flex min-w-0 items-center gap-3 rounded-lg border border-border bg-card p-3">
              <FileIcon name={file.name} mimeType={file.mimeType} />
              <span className="min-w-0 truncate text-sm font-medium">{file.name}</span>
            </li>
          ))}
        </ul>
        {mounted ? (
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <RelativeTime value={new Date(Date.now() - 20_000).toISOString()} />
            <RelativeTime value={new Date(Date.now() - 5 * 60_000).toISOString()} />
            <RelativeTime value={new Date(Date.now() - 3 * 3_600_000).toISOString()} toggleable />
            <RelativeTime value={new Date(Date.now() - 2 * 86_400_000).toISOString()} toggleable />
          </div>
        ) : null}
      </Section>
    </main>
  );
}
