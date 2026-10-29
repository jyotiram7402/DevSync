/**
 * The browser's install offer (`beforeinstallprompt`: Chrome, Edge, Android)
 * captured as soon as the app starts, so any install button can use it later.
 * The event fires once, early, and is easy to miss if only the page with the
 * button listens for it. Safari and Firefox never fire it; the install UI shows
 * the manual steps there instead.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export interface InstallState {
  /** Present while the browser is offering to install the app. */
  canPrompt: boolean;
  /** Installed during this visit (a standalone launch is detected separately). */
  installed: boolean;
}

const SERVER_STATE: InstallState = { canPrompt: false, installed: false };

let deferred: BeforeInstallPromptEvent | null = null;
let state: InstallState = SERVER_STATE;
let started = false;
const listeners = new Set<() => void>();

function update(next: InstallState) {
  state = next;
  for (const listener of listeners) listener();
}

/** Start listening (once per page load). Call from a component mounted at the root. */
export function startInstallCapture(): void {
  if (started || typeof window === "undefined") return;
  started = true;
  window.addEventListener("beforeinstallprompt", (event) => {
    // Keep the offer for our own Install button instead of the browser's banner.
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    update({ ...state, canPrompt: true });
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    update({ canPrompt: false, installed: true });
  });
}

export function subscribeInstall(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getInstallState(): InstallState {
  return state;
}

export function getServerInstallState(): InstallState {
  return SERVER_STATE;
}

/** Show the browser's install dialog (inside a tap). Resolves to whether it was accepted. */
export async function promptInstall(): Promise<boolean> {
  const event = deferred;
  if (!event) return false;
  // The offer can only be used once.
  deferred = null;
  update({ ...state, canPrompt: false });
  await event.prompt();
  const choice = await event.userChoice;
  return choice.outcome === "accepted";
}
