import { Page, expect } from '@playwright/test';
import { AuthApi } from '../api/authApi';
import { BonusesApi } from '../api/bonusesApi';
import type { BonusCountResponse } from '../types/types';
import { ApiValidators } from '../helpers/validators';

const FIXED_UID = process.env.FAVBET_UID; // optional; when set, we validate exact match

export class BonusesSteps {
  constructor(
    private page: Page,
    private baseUrl: string,
  ) {}

  private auth() {
    return new AuthApi(this.page, this.baseUrl);
  }

  private api() {
    return new BonusesApi(this.page, this.baseUrl, FIXED_UID);
  }

  async login(email: string, password: string) {
    const res = await this.auth().signIn(email, password);
    expect(res.status).toBe(200);
    expect(res.ok, `Auth failed: ${JSON.stringify(res.data)}`).toBe(true);
    return res.data;
  }

  async ensureUid() {
    const uid = await this.api().waitForUid(10_000);
    expect(uid, 'uid is absent after login').toBeTruthy();
    if (FIXED_UID) {
      expect(uid, 'uid does not match expected fixed value from FAVBET_UID').toBe(FIXED_UID);
    }
    return uid;
  }

  async getBonusCount() {
    const res = await this.api().getAnyBonusCount();
    expect(res.status).toBe(200);
    expect(res.ok, `Bonus API failed: ${JSON.stringify(res.data)}`).toBe(true);
    console.warn('Bonus count JSON:', JSON.stringify(res.data));
    return res.data;
  }

  validateBonusCount(data: BonusCountResponse) {
    ApiValidators.validateBonusResponse(data);
  }
}
