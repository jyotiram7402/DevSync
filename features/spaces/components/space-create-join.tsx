"use client";

import { Loader2, Plus, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSpaceAction, joinSpaceAction } from "@/features/spaces/actions";

/** Landing controls: create a new project room, or join one by code. */
export function SpaceCreateJoin() {
  const router = useRouter();
  const params = useSearchParams();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<null | "create" | "join">(null);

  // Support shareable invite links: /dashboard/spaces?join=ABC123
  useEffect(() => {
    const j = params.get("join");
    if (j) setCode(j.toUpperCase());
  }, [params]);

  async function create() {
    setBusy("create");
    const res = await createSpaceAction({ name: name.trim() });
    setBusy(null);
    if (!res.ok) {
      toast.error(res.error.message);
      return;
    }
    router.push(`/dashboard/spaces/${res.data.id}`);
  }

  async function join() {
    const value = code.trim();
    if (value.length < 4) {
      toast.error("Enter the room code you were given.");
      return;
    }
    setBusy("join");
    const res = await joinSpaceAction({ code: value });
    setBusy(null);
    if (!res.ok) {
      toast.error(res.error.message);
      return;
    }
    router.push(`/dashboard/spaces/${res.data.id}`);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-3 rounded-xl border p-5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Plus className="size-4 text-brand" aria-hidden="true" />
          Create a project room
        </div>
        <p className="text-sm text-muted-foreground">
          One room per project. Share errors, code, docs and files there — and invite the people
          helping you.
        </p>
        <div className="flex items-center gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. GeoReminder Android"
            aria-label="Room name"
            maxLength={80}
            onKeyDown={(e) => {
              if (e.key === "Enter") void create();
            }}
          />
          <Button type="button" onClick={() => void create()} disabled={busy !== null}>
            {busy === "create" ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Create
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border p-5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Users className="size-4 text-brand" aria-hidden="true" />
          Join a room
        </div>
        <p className="text-sm text-muted-foreground">Enter the room code someone shared with you.</p>
        <div className="flex items-center gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. 4F9A2C"
            aria-label="Room code"
            maxLength={12}
            className="font-mono tracking-widest"
            onKeyDown={(e) => {
              if (e.key === "Enter") void join();
            }}
          />
          <Button type="button" variant="outline" onClick={() => void join()} disabled={busy !== null}>
            {busy === "join" ? <Loader2 className="size-4 animate-spin" /> : "Join"}
          </Button>
        </div>
      </div>
    </div>
  );
}
