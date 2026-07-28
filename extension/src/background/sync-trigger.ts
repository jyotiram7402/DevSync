import { ALARMS, SYNC_INTERVAL_MINUTES } from "@ext/shared/constants";
import { triggerSync } from "@ext/services/sync-service";
import { getSettings } from "@ext/storage/settings";
import { browser } from "@ext/utils/browser";

/**
 * Periodic sync via chrome.alarms — flushes the offline queue on a schedule
 * without keeping the service worker alive. Rescheduled whenever settings
 * change (autoSync toggle).
 */
export async function scheduleAlarms(): Promise<void> {
  await browser.alarms.clear(ALARMS.sync);
  const settings = await getSettings();
  if (settings.autoSync) {
    await browser.alarms.create(ALARMS.sync, { periodInMinutes: SYNC_INTERVAL_MINUTES });
  }
}

export function initSyncAlarms(): void {
  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARMS.sync) {
      void triggerSync();
    }
  });
}
