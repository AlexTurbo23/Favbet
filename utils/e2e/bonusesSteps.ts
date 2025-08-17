import { expect, type Page, test } from '@playwright/test';
import { AuthApi } from '../api/authApi';
import { BonusesApi } from '../api/bonusesApi';
import type { BonusCountResponse } from '../types/types';

const FIXED_UID = process.env.FAVBET_UID ?? '103331947';

export class BonusesSteps {
  private readonly auth: AuthApi;
  private readonly bonuses: BonusesApi;

  constructor(page: Page, baseUrl: string) {
    this.auth = new AuthApi(page, baseUrl);
    this.bonuses = new BonusesApi(page, baseUrl, FIXED_UID);
  }

  async login(email: string, password: string) {
    await test.step('Auth: sign in', async () => {
      const res = await this.auth.signIn(email, password);
      expect(res.ok, `Auth failed: ${JSON.stringify(res.data)}`).toBeTruthy();
      expect(res.status).toBe(200);
    });
  }

  async getBonusCount(): Promise<BonusCountResponse> {
    return await test.step('Bonuses: get any bonus count', async () => {
      const res = await this.bonuses.getAnyBonusCount();
      expect(res.ok, `Bonus API failed: ${JSON.stringify(res.data)}`).toBeTruthy();
      return res.data as BonusCountResponse;
    });
  }

  validateBonusCount(data: BonusCountResponse) {
    return test.step('Bonuses: validate response', async () => {
      expect(data).toBeTruthy();
      console.warn('Bonus API response:', data); // ✅ заменили log → warn
      if (typeof data === 'object' && data && 'error' in data) {
        expect((data as BonusCountResponse).error).toBe('no');
      }
    });
  }
}
