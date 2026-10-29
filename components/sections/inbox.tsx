import { Paperclip } from "lucide-react";

import { Container } from "@/components/shared/container";
import { cn } from "@/utils/cn";

const MAILS: ReadonlyArray<{ subject: string; preview: string; time: string; unread?: boolean; attachment?: boolean }> =
  [
    { subject: "(no subject)", preview: "https://github.com/acme/checkout/pull/128", time: "9:12", unread: true },
    {
      subject: "fwd: that error",
      preview: "TypeError: Cannot read properties of undefined (reading 'map')",
      time: "8:47",
      unread: true,
    },
    { subject: "test", preview: "test", time: "Mon" },
    { subject: "IMG_2041.jpg", preview: "1 attachment", time: "Mon", attachment: true },
    { subject: "address", preview: "221B Baker Street, London NW1 6XE", time: "Sun" },
    { subject: "aaaa", preview: "the wifi password is on the fridge", time: "Sun" },
  ];

/**
 * The problem, shown instead of told: an inbox where every email is from you,
 * to you. Then what CopyAnywhere does instead.
 */
export function Inbox() {
  return (
    <section id="why" aria-labelledby="why-title" className="scroll-mt-20 border-b border-border">
      <Container className="grid gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1fr)_27rem] lg:items-center lg:gap-16">
        <div className="flex max-w-xl flex-col gap-5">
          <h2 id="why-title" className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Be honest. Your inbox looks like this.
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">
            Emailing yourself works, slowly. So does a chat with yourself, a USB stick or a photo of your screen. None
            of them were made for moving your own things between your own devices.
          </p>
          <p className="text-pretty text-lg text-foreground">
            CopyAnywhere is. Paste on one device, copy on the other. No inbox, no cable, no squashed photos.
          </p>
        </div>

        <figure
          role="img"
          aria-label="An inbox where every email is from you, to you: no subject, fwd: that error, test, a photo, an address, aaaa."
          className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface"
        >
          <div className="flex h-11 items-center justify-between border-b border-border px-4">
            <span className="text-sm font-semibold">Inbox</span>
            <span className="text-xs text-muted-foreground">from me, to me</span>
          </div>
          <ul className="divide-y divide-border">
            {MAILS.map((mail) => (
              <li key={mail.subject} className="grid grid-cols-[0.5rem_minmax(0,1fr)_auto] gap-x-3 px-4 py-3">
                <span
                  className={cn("mt-1.5 size-2 rounded-full", mail.unread ? "bg-primary" : "bg-transparent")}
                />
                <div className="min-w-0">
                  <p className={cn("truncate text-sm", mail.unread ? "font-semibold" : "font-medium")}>
                    Me
                    <span className="font-normal text-muted-foreground"> — {mail.subject}</span>
                  </p>
                  <p className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
                    {mail.attachment ? <Paperclip className="size-3.5 shrink-0" /> : null}
                    <span className="truncate">{mail.preview}</span>
                  </p>
                </div>
                <span className={cn("text-xs", mail.unread ? "font-semibold text-foreground" : "text-muted-foreground")}>
                  {mail.time}
                </span>
              </li>
            ))}
          </ul>
        </figure>
      </Container>
    </section>
  );
}
