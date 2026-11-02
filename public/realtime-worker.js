/*
 * Heartbeat worker for live updates.
 *
 * Browsers slow down a background tab's timers, which can let the live-update
 * connection go quiet and drop. A Web Worker's timer keeps its pace, so the
 * heartbeat still goes out on time while you're in another tab.
 *
 * Protocol expected by @supabase/realtime-js (its `worker` option):
 *   in:  { event: "start", interval }
 *   out: { event: "keepAlive" }   every `interval` milliseconds
 * Served from this site so nothing is loaded from a third party.
 */
let timer = null;

addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.event !== "start") return;
  if (timer !== null) clearInterval(timer);
  timer = setInterval(() => postMessage({ event: "keepAlive" }), data.interval);
});
