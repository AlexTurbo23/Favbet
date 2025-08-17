import { Locator, Page } from '@playwright/test';

type AuthElements = {
  emailInput: Locator;
  passwordInput: Locator;
  submitButton: Locator;
};

export class AuthPage {
  private readonly page: Page;
  private readonly els: AuthElements;

  constructor(page: Page) {
    this.page = page;
    this.els = this.createElements();
    this.page.setDefaultTimeout(5000);
  }

  get elements(): AuthElements {
    return this.els;
  }

  private createElements(): AuthElements {
    return {
      emailInput: this.page.locator("[data-role='login-page-login-input']"),
      passwordInput: this.page.locator("[data-role='login-page-password-input']"),
      submitButton: this.page.locator("[data-role='login-page-submit-btn']"),
    };
  }

  async fillCredentials(email: string, password: string): Promise<void> {
    await this.elements.emailInput.fill(email);
    await this.elements.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.elements.submitButton.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillCredentials(email, password);
    await this.submit();
  }
}
