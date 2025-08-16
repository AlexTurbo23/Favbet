import { expect, Locator, Page } from '@playwright/test';

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
      emailInput: this.page.getByLabel(/email|e-mail|логін|login|пошта/i),
      passwordInput: this.page.getByLabel(/password|пароль/i),
      submitButton: this.page.getByRole('button', { name: /log in|sign in|увійти|войти/i }).first(),
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
