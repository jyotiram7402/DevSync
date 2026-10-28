"use client";

import { RefreshCw, Share2 } from "lucide-react";
import { useEffect, useId, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { ConfirmDialog, ResponsiveDialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { inviteMemberAction, rotateCodeAction } from "@/features/spaces/actions";
import { joinPath } from "@/features/spaces/display";
import type { Space } from "@/features/spaces/types";

/**
 * Invite sheet with the three ways in: a link (copy, or the phone's share
 * sheet), the room code (big and copyable, for reading out or typing), and
 * adding someone by email. The owner can make a new code, which stops the old
 * code and links from working.
 */
export function SpaceInviteSheet({
  open,
  onClose,
  space,
  isOwner,
}: {
  open: boolean;
  onClose: () => void;
  space: Space;
  isOwner: boolean;
}) {
  const emailId = useId();
  const emailHintId = useId();
  const [origin, setOrigin] = useState("");
  const [canShare, setCanShare] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [rotating, setRotating] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    setCanShare("share" in navigator);
  }, []);

  const link = `${origin}${joinPath(space.code)}`;

  async function share() {
    try {
      await navigator.share({
        title: `Join ${space.name} on CopyAnywhere`,
        text: `Join my room "${space.name}" on CopyAnywhere. Room code: ${space.code}`,
        url: link,
      });
    } catch {
      // Closed without sharing, or the share target refused: nothing to do.
    }
  }

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    if (value.length === 0) {
      setEmailError("Enter their email address.");
      return;
    }
    setInviting(true);
    const result = await inviteMemberAction(space.id, { email: value });
    setInviting(false);
    if (!result.ok) {
      setEmailError(result.error.message);
      return;
    }
    setEmail("");
    setEmailError(null);
    // Same message either way, so this can't reveal who has an account.
    toast.success(`If ${value} has a CopyAnywhere account, they're in the room now. If not, send them the link.`);
  }

  async function rotate() {
    setRotating(true);
    const result = await rotateCodeAction(space.id);
    setRotating(false);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    setConfirmRotate(false);
    toast.success("New code ready. The old code and links no longer work.");
  }

  return (
    <>
      <ResponsiveDialog
        open={open}
        onClose={onClose}
        title="Invite people"
        description={`Anyone with the link or the code can join ${space.name}.`}
      >
        <section aria-label="Invite link" className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Send a link</h3>
          <Input
            readOnly
            value={link}
            aria-label="Invite link"
            onFocus={(event) => event.currentTarget.select()}
            className="font-mono"
          />
          <div className="flex flex-wrap gap-2">
            <CopyButton value={link} label="Copy link" copiedLabel="Link copied" variant="default" size="default" />
            {canShare ? (
              <Button type="button" variant="outline" onClick={() => void share()}>
                <Share2 aria-hidden="true" />
                Share…
              </Button>
            ) : null}
          </div>
        </section>

        <section aria-label="Room code" className="flex flex-col gap-2 border-t border-border pt-4">
          <h3 className="text-sm font-medium">Or give them the code</h3>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 px-4 py-3">
            <span className="font-mono text-xl font-semibold tracking-[0.15em] [overflow-wrap:anywhere] sm:text-2xl">
              {space.code}
            </span>
            <CopyButton value={space.code} srContext="room code" />
          </div>
          <p className="text-xs text-muted-foreground">They enter it under Spaces → Join with a code.</p>
          {isOwner ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmRotate(true)}
              className="-ml-3 w-fit"
            >
              <RefreshCw aria-hidden="true" />
              Make a new code
            </Button>
          ) : null}
        </section>

        <section aria-label="Add by email" className="flex flex-col gap-2 border-t border-border pt-4">
          <h3 className="text-sm font-medium">
            <label htmlFor={emailId}>Add by email</label>
          </h3>
          <form onSubmit={(event) => void invite(event)} noValidate className="flex flex-col gap-1.5">
            <div className="flex gap-2">
              <Input
                id={emailId}
                type="email"
                inputMode="email"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="send"
                placeholder="teammate@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (emailError) setEmailError(null);
                }}
                aria-invalid={emailError ? true : undefined}
                aria-describedby={emailHintId}
              />
              <Button type="submit" loading={inviting} className="shrink-0">
                Add
              </Button>
            </div>
            <p id={emailHintId} className={emailError ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
              {emailError ?? "For people who already have a CopyAnywhere account. Everyone else can use the link."}
            </p>
          </form>
        </section>
      </ResponsiveDialog>

      <ConfirmDialog
        open={confirmRotate}
        onClose={() => setConfirmRotate(false)}
        onConfirm={() => void rotate()}
        pending={rotating}
        title="Make a new code?"
        description="The current code and invite links stop working. Everyone already in the room stays in."
        confirmLabel="Make new code"
      />
    </>
  );
}
