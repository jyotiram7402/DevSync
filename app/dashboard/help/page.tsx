import {
  Copy,
  Download,
  Laptop,
  Monitor,
  Moon,
  Plus,
  RefreshCw,
  Rocket,
  Smartphone,
  Sparkles,
  Sun,
} from "lucide-react";

import { InstallAppButton } from "@/components/pwa/install-button";
import { DashboardCard } from "@/components/shared/dashboard-card";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = {
  title: "How to use",
};

const STEPS = [
  {
    icon: Plus,
    title: "1. Add a snippet",
    body: "Go to Snippets → New snippet. Paste any error, log, command, or code you want to keep, give it a title, and Save.",
  },
  {
    icon: Smartphone,
    title: "2. Log in on another device",
    body: "Open DevSync on your phone or a second browser and log in with the SAME account. That is the only thing that links your devices.",
  },
  {
    icon: Copy,
    title: "3. Use it anywhere",
    body: "Your snippet is already waiting under Snippets on every logged-in device. Click it to copy, then paste wherever you need it.",
  },
];

const THEMES = [
  {
    icon: Monitor,
    title: "System",
    body: "Matches your device automatically — dark if your OS is in dark mode, light if it is in light mode.",
  },
  { icon: Sun, title: "Light", body: "Always use the light theme, regardless of your device setting." },
  { icon: Moon, title: "Dark", body: "Always use the dark theme, regardless of your device setting." },
];

const UPCOMING = [
  "Real-time device tracking — see exactly which phones and browsers are signed in, and sign them out remotely.",
  "Browser extension — capture a snippet with one click, without opening the site.",
  "Full-text search across every snippet, project, and collection.",
  "Syntax highlighting for 100+ programming languages.",
  "Shared team workspaces and collaborative collections.",
  "Offline mode — read your snippets even without a connection.",
  "End-to-end encryption for private snippets.",
];

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="How to use DevSync"
        description="Sync your errors, logs, and snippets across every device you code on."
      />

      {/* What is DevSync */}
      <DashboardCard>
        <div className="flex flex-col gap-2">
          <span className="flex size-9 items-center justify-center rounded-md bg-secondary text-foreground">
            <Rocket className="size-4" aria-hidden="true" />
          </span>
          <h3 className="text-sm font-semibold">What is DevSync?</h3>
          <p className="text-sm text-muted-foreground">
            DevSync is a cloud clipboard for developers. Anything you save is stored on
            your account and instantly available on every device you log in on. Copy an
            error on your work laptop, open DevSync on your phone or home desktop, and it
            is already there — no more emailing yourself stack traces.
          </p>
        </div>
      </DashboardCard>

      {/* Getting started */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Get started in 3 steps</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step) => (
            <DashboardCard key={step.title}>
              <div className="flex flex-col gap-2">
                <span className="flex size-9 items-center justify-center rounded-md bg-secondary text-foreground">
                  <step.icon className="size-4" aria-hidden="true" />
                </span>
                <h3 className="text-sm font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.body}</p>
              </div>
            </DashboardCard>
          ))}
        </div>
      </section>

      {/* How syncing works */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">How syncing works</h2>
        <DashboardCard>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-2">
                <Smartphone className="size-4" aria-hidden="true" /> Phone: paste &amp; save a snippet
              </span>
              <RefreshCw className="size-4 text-muted-foreground" aria-hidden="true" />
              <span className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-2">
                Saved to your account (cloud)
              </span>
              <RefreshCw className="size-4 text-muted-foreground" aria-hidden="true" />
              <span className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-2">
                <Laptop className="size-4" aria-hidden="true" /> Laptop: it is already there
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your snippets live in the cloud, tied to your account — not on any single
              device. The one rule: <strong>log in with the same account</strong> on every
              device. A different account means a different, separate clipboard.
            </p>
          </div>
        </DashboardCard>
      </section>

      {/* Install as app */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Install DevSync as an app</h2>
        <DashboardCard>
          <div className="flex flex-col gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-secondary text-foreground">
              <Download className="size-4" aria-hidden="true" />
            </span>
            <h3 className="text-sm font-semibold">Use it like a native app</h3>
            <p className="text-sm text-muted-foreground">
              Install DevSync to your home screen so it opens fullscreen, without the browser
              bars, and you never have to type the URL again.
            </p>
            <InstallAppButton />
          </div>
        </DashboardCard>
      </section>

      {/* Theme options */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Theme options</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {THEMES.map((theme) => (
            <DashboardCard key={theme.title}>
              <div className="flex flex-col gap-2">
                <span className="flex size-9 items-center justify-center rounded-md bg-secondary text-foreground">
                  <theme.icon className="size-4" aria-hidden="true" />
                </span>
                <h3 className="text-sm font-semibold">{theme.title}</h3>
                <p className="text-sm text-muted-foreground">{theme.body}</p>
              </div>
            </DashboardCard>
          ))}
        </div>
      </section>

      {/* Upcoming features */}
      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Sparkles className="size-4" aria-hidden="true" /> Upcoming features
        </h2>
        <DashboardCard>
          <ul className="flex flex-col gap-3">
            {UPCOMING.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </DashboardCard>
      </section>
    </div>
  );
}
