import { expect, Locator, Page } from '@playwright/test';

export type LiveElements = {
  favoritIconInactive: Locator;
  favoritIconActive: Locator;
};

export class LivePage {
  private readonly page: Page;
  private readonly els: LiveElements;

  constructor(page: Page) {
    this.page = page;
    this.els = this.createElements();
    this.page.setDefaultTimeout(5000);
  }

  get elements(): LiveElements {
    return this.els;
  }

  private createElements(): LiveElements {
    return {
      favoritIconInactive: this.page.locator('.Z1840[data-role="event-favorite-star-icon"]'),
      favoritIconActive: this.page.locator(
        '.Z1840[data-role="event-favorite-star-icon"][fill="#F2C94C"]',
      ),
    };
  }

  async clickToAddFavorit(count: number = 2): Promise<void> {
    const favoritIcons = this.elements.favoritIconInactive;
    const totalIcons = await favoritIcons.count();
    const target = Math.min(count, totalIcons);
    for (let i = 0; i < target; i++) {
      const favoritIcon = favoritIcons.nth(i);
      await favoritIcon.click();
      await expect(this.elements.favoritIconActive.nth(i)).toBeVisible({ timeout: 10000 });
    }
  }

  async clickToRemoveFromFavorit(count: number = 2): Promise<void> {
    const removeFavorit = this.elements.favoritIconActive;
    const totalIcons = await removeFavorit.count();
    const target = Math.min(count, totalIcons);
    for (let i = 0; i < target; i++) {
      const favoritIcon = removeFavorit.nth(i);
      await favoritIcon.click();
      await expect(this.elements.favoritIconInactive.nth(i)).toBeVisible({ timeout: 10000 });
    }
    await expect(this.page.getByText("You don't have any favorite events yet.")).toBeVisible();
  }
}
