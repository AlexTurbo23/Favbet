import { Page, expect } from '@playwright/test';
import { AuthApi } from '../api/authApi';
import { BonusesApi } from '../api/bonusesApi';
import { ApiValidators } from '../helpers/validators';

export class BonusesSteps {
  constructor(private page: Page, private baseUrl: string) {}

  private auth() {
    return new AuthApi(this.page, this.baseUrl);
  }

  private api() {
    return new BonusesApi(this.page, this.baseUrl);
  }

  async login(email: string, password: string) {
    const res = await this.auth().signIn(email, password);
    expect(res.status).toBe(200);
    expect(res.ok, `Auth failed: ${JSON.stringify(res.data)}`).toBe(true);
    return res.data;
  }

  async ensureUid() {
    const uid = await this.api().waitForUid();
    expect(uid, 'uid cookie отсутствует после логина').toBeTruthy();
    return uid;
  }

  async getBonusCount() {
    const res = await this.api().getAnyBonusCount();
    expect(res.status).toBe(200);
    expect(res.ok, `Bonus API failed: ${JSON.stringify(res.data)}`).toBe(true);
    console.log('Bonus count JSON:', JSON.stringify(res.data));
    return res.data;
  }

  validateBonusCount(data: any) {
    ApiValidators.validateBonusResponse(data);
  }
}
