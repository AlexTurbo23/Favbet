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
