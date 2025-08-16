import { Page } from '@playwright/test';

/**
 * Reset browser session for the origin: clear cookies, storages, caches.
 * Ensures tests start with a clean session state.
 */
export async function resetSession(page: Page, baseUrl: string): Promise<void> {
  await page.context().clearCookies();
  let startUrl = baseUrl;
  try {
    await page.goto(startUrl, { waitUntil: 'commit', timeout: 15000 });
  } catch {}
  await page.evaluate(async () => {
    try {
      localStorage.clear();
    } catch {}
    try {
      sessionStorage.clear();
    } catch {}
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {}
  });
  try {
    await new Promise((r) => setTimeout(r, 300));
    await page.goto(startUrl, { waitUntil: 'commit', timeout: 15000 });
  } catch {}
}
