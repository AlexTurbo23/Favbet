import { expect, Locator, Page } from '@playwright/test';
import { YouTubePage } from './YouTubePage';
import { openPopup } from '../utils/helpers/e2eHelpers';

export type HomeElements = {
  loginLink: Locator;
  liveNavLink: Locator;
  favoritesLink: Locator;
  notificationsImg: Locator;
  depositLink: Locator;
  youTubeLink: Locator;
  userLogoHeader: Locator;
  languageSelect: Locator;
  colorSchemeSwitcherLight: Locator;
  colorSchemeSwitcherDark: Locator;
};

export class HomePage {
  private readonly page: Page;
  private readonly els: HomeElements;

  constructor(page: Page) {
    this.page = page;
    this.els = this.createElements();
    this.page.setDefaultTimeout(5000);
  }

  get elements(): HomeElements {
    return this.els;
  }

  private createElements(): HomeElements {
    return {
      loginLink: this.page.locator("[data-role='header-login-button']"),
      liveNavLink: this.page.locator("[data-role='nav-item /live/all/']"),
      favoritesLink: this.page.locator("[data-role='sports-favorites-link-text']"),
      notificationsImg: this.page.locator('#notifications').getByRole('img').first(),
      depositLink: this.page.locator("[data-role='header-deposit-depositButton']"),
      youTubeLink: this.page.getByRole('link', { name: 'Youtube' }),
      userLogoHeader: this.page.locator('[data-role="user-logo-header"]'),
      languageSelect: this.page.locator('[data-role="settings-language-select-trigger"]'),
      colorSchemeSwitcherLight: this.page.locator(
        '[data-role="settings-color-scheme-switcher-light"]',
      ),
      colorSchemeSwitcherDark: this.page.locator(
        '[data-role="settings-color-scheme-switcher-dark"]',
      ),
    };
  }

  async open(url: string) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async clickLoginBtn(elements: HomeElements = this.els) {
    await elements.loginLink.click();
  }

  async goToLive(elements: HomeElements = this.els) {
    await elements.liveNavLink.click();
  }

  async goToFavorites(elements: HomeElements = this.els) {
    await elements.favoritesLink.click();
  }

  async goToYouTubeChannel(channelName: string, query: string, elements: HomeElements = this.els) {
    const popup = await openPopup(this.page, () => elements.youTubeLink.click());
    const ytPage = new YouTubePage(popup);
    await ytPage.waitReady();
    await ytPage.acceptCookiesIfPresent();
    await ytPage.checkChannelName(channelName);
    await ytPage.searchAndCheckVideo(query);
  }

  async closeKycBannerIfPresent(elements: HomeElements = this.els) {
    await elements.notificationsImg.click();
    await expect(elements.depositLink).toBeVisible();
  }

  async openUserMenuPageName(pageName: string | RegExp, elements: HomeElements = this.els) {
    await elements.userLogoHeader.click();
    await this.page.getByRole('link', { name: pageName }).first().click();
  }

  async chooseLanguageAndCheck(
    language: string,
    shortValue: string,
    elements: HomeElements = this.els,
  ) {
    await elements.languageSelect.click();
    await this.page.getByText(language).click();
    await expect(this.page.locator('html')).toHaveAttribute('lang', shortValue);
  }

  async chooseLightTheme(expectedScheme: 'light' | 'dark', elements: HomeElements = this.els) {
    await elements.colorSchemeSwitcherLight.click();
    const html = this.page.locator('html');
    await expect(html).toHaveAttribute(
      'style',
      new RegExp(`(^|;)\\s*color-scheme:\\s*${expectedScheme}\\s*;`),
    );
  }
}
