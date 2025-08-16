import { expect, Locator, Page } from '@playwright/test';

export type YouTubeElements = {
  acceptAllBtn: Locator;
  channelName: Locator;
  channelHeadingByName: (name: string) => Locator;
  searchButton: Locator;
  searchInput: Locator;
  resultsSection: Locator;
  videoLinkByLabel: (label: string | RegExp) => Locator;
};

export class YouTubePage {
  private readonly page: Page;
  private readonly els: YouTubeElements;

  constructor(page: Page) {
    this.page = page;
    this.els = this.createElements();
    this.page.setDefaultTimeout(5000);
  }

  get elements(): YouTubeElements {
    return this.els;
  }

  private createElements(): YouTubeElements {
    return {
      acceptAllBtn: this.page.getByRole('button', { name: /Accept all/i }),
      channelName: this.page.locator('yt-dynamic-text-view-model'),
      channelHeadingByName: (name: string) =>
        this.page.getByRole('heading', { name }).locator('span'),
      searchButton: this.page.locator('#icon-button').getByRole('button', { name: /Search/i }),
      searchInput: this.page.getByRole('textbox', { name: /Search/i }),
      resultsSection: this.page.locator('ytd-section-list-renderer'),
      videoLinkByLabel: (label: string | RegExp) =>
        this.page.getByRole('link', { name: label }).first(),
    };
  }

  async waitReady() {
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page).toHaveURL(/youtube\.com/i, { timeout: 15000 });
  }

  async acceptCookiesIfPresent() {
    const btn = this.page.getByRole('button', { name: /accept all/i });
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await this.page.waitForLoadState('domcontentloaded').catch(() => {});
    }
  }

  async checkChannelName(name: string) {
    await expect(this.elements.channelName).toContainText(name, { timeout: 15000 });
    await expect(this.elements.channelHeadingByName(name)).toBeVisible({ timeout: 15000 });
  }

  async searchAndCheckVideo(query: string): Promise<void> {
    await this.elements.searchButton.click();
    await this.elements.searchInput.fill(query);
    await this.elements.searchInput.press('Enter');
    await expect(this.elements.resultsSection).toContainText(query);
    await expect(this.elements.videoLinkByLabel(query)).toBeVisible();
  }
}
