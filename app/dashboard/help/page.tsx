import {
  ClipboardPaste,
  Code2,
  Copy,
  FolderKanban,
  Laptop,
  Library,
  ListTodo,
  RefreshCw,
  Smartphone,
  Users,
} from "lucide-react";
import Link from "next/link";

import { InstallAppButton } from "@/components/pwa/install-button";
import { DashboardCard } from "@/components/shared/dashboard-card";
import { PageHeader } from "@/components/shared/page-header";
import { RETENTION_DAYS } from "@/lib/retention";

export const metadata = {
  title: "How to use",
};

const STEPS = [
  {
    icon: ClipboardPaste,
    title: "1. Save something",
    body: "Tap Add on your phone, or Quick add on a computer. Paste text, code or an error, or add a photo or a file.",
  },
  {
    icon: Smartphone,
    title: "2. Open it on your other device",
    body: "Sign in with the same account on your phone, a second computer or a locked-down office laptop. Nothing to install.",
  },
  {
    icon: Copy,
    title: "3. Copy it there",
    body: "It's already waiting in Snippets or the Library. Tap Copy and paste it wherever you need it.",
  },
];

const PLACES = [
  { icon: Code2, title: "Snippets", body: "Text, code, commands and errors you save." },
  { icon: Library, title: "Library", body: "Images, links, documents and files, sorted by type." },
  { icon: ListTodo, title: "Quick Notes", body: "Your own to-dos and reminders, on every device." },
  {
    icon: Users,
    title: "Spaces",
    body: "Shared rooms for a project. Invite people, and everyone in the room sees what's shared, live.",
  },
  { icon: FolderKanban, title: "Projects", body: "Group your snippets by what you're working on." },
];

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="How to use CopyAnywhere"
        description="Save something on one device, copy it on another. Here's how."
      />

      <section aria-labelledby="help-start" className="flex flex-col gap-4">
        <h2 id="help-start" className="text-base font-semibold">
          Get started in 3 steps
        </h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.title}>
              <DashboardCard className="h-full">
                <div className="flex flex-col gap-2">
                  <span className="flex size-9 items-center justify-center rounded-md bg-wash text-primary-ink">
                    <step.icon className="size-4" aria-hidden="true" />
                  </span>
                  <h3 className="text-sm font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.body}</p>
                </div>
              </DashboardCard>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="help-places" className="flex flex-col gap-4">
        <h2 id="help-places" className="text-base font-semibold">
          Where things go
        </h2>
        <DashboardCard>
          <ul className="flex flex-col gap-4">
            {PLACES.map((place) => (
              <li key={place.title} className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <place.icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium">{place.title}</h3>
                  <p className="text-sm text-muted-foreground">{place.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
            Snippets and Library items stay for {RETENTION_DAYS} days unless you pin or favorite them.
          </p>
        </DashboardCard>
      </section>

      <section aria-labelledby="help-sync" className="flex flex-col gap-4">
        <h2 id="help-sync" className="text-base font-semibold">
          How syncing works
        </h2>
        <DashboardCard>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-2">
                <Smartphone className="size-4" aria-hidden="true" /> Save on your phone
              </span>
              <RefreshCw className="size-4 text-muted-foreground" aria-hidden="true" />
              <span className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-2">
                Kept in your account
              </span>
              <RefreshCw className="size-4 text-muted-foreground" aria-hidden="true" />
              <span className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-2">
                <Laptop className="size-4" aria-hidden="true" /> Already on your laptop
              </span>
            </div>
            <p className="max-w-prose text-sm text-muted-foreground">
              What you save lives in your account, not on one device. The one rule: sign in with the same account
              everywhere. A different account is a different, separate clipboard.
            </p>
          </div>
        </DashboardCard>
      </section>

      <section aria-labelledby="help-install" className="flex flex-col gap-4">
        <h2 id="help-install" className="text-base font-semibold">
          Install it as an app
        </h2>
        <DashboardCard>
          <div className="flex flex-col gap-3">
            <p className="max-w-prose text-sm text-muted-foreground">
              Install CopyAnywhere so it opens full screen from your home screen or dock, without the browser bars.
            </p>
            <InstallAppButton />
          </div>
        </DashboardCard>
      </section>

      <p className="text-sm text-muted-foreground">
        Prefer light or dark? Choose a theme in{" "}
        <Link href="/dashboard/settings#appearance" className="font-medium text-primary-ink underline-offset-4 hover:underline">
          Settings
        </Link>
        .
      </p>
    </div>
  );
}
