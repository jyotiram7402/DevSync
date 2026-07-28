import { bootstrapAuth } from "@ext/background/auth-bootstrap";
import { initConnectionMonitor } from "@ext/background/connection-monitor";
import { initMessageRouter } from "@ext/background/message-router";
import { initSyncAlarms, scheduleAlarms } from "@ext/background/sync-trigger";
import { browser } from "@ext/utils/browser";

/**
 * Background service worker entry (MV3, ES module).
 *
 * Responsibilities: initialize message routing, auth bootstrap, the sync alarm,
 * and connection monitoring. Kept deliberately light — no persistent socket, no
 * idle listeners — so the worker can suspend and the browser can reclaim it.
 */
initMessageRouter();
initSyncAlarms();
initConnectionMonitor();

// Runs on each worker activation (cheap, idempotent).
void bootstrapAuth();
void scheduleAlarms();

browser.runtime.onInstalled.addListener(() => {
  void scheduleAlarms();
  void bootstrapAuth();
});

browser.runtime.onStartup.addListener(() => {
  void scheduleAlarms();
  void bootstrapAuth();
});
