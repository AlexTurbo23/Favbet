import { Page } from '@playwright/test';

/**
 * Opens a popup window and waits for it to load.
 * @param page - The Playwright Page object.
 * @param trigger - A function that triggers the popup (e.g., clicking a link).
 * @param waitState - The load state to wait for (default is 'domcontentloaded').
 * @param timeout - The maximum time to wait for the popup (default is 15000 ms).
 * @returns The opened popup Page object.
 */
export async function openPopup(
  page: Page,
  trigger: () => Promise<unknown>,
  waitState: 'domcontentloaded' | 'load' | 'networkidle' = 'domcontentloaded',
  timeout = 15000,
): Promise<Page> {
  const [popup] = await Promise.all([page.waitForEvent('popup', { timeout }), trigger()]);

  await popup.waitForLoadState(waitState).catch(() => {});
  return popup;
}

export async function waitForUidCookie(
  page: Page,
  baseUrl: string,
  timeoutMs = 15000,
): Promise<string> {
  const origin = new URL(baseUrl).origin;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const cookies = await page.context().cookies(origin);
    const uid = cookies.find((c) => c.name === 'uid')?.value;
    if (uid) return uid;
    await page.waitForTimeout(600);
  }
  throw new Error("Cookie 'uid' not found within the specified timeout");
}

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
