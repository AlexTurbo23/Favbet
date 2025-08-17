import { BaseApiClient } from '../base/baseApiClient';
import type { Page } from '@playwright/test';
import { ApiResult, BonusCountResponse, BonusType } from './types';

const DEFAULT_BONUS_TYPES: BonusType[] = ['All', 'RiskFree', 'RealMoney', 'FreeSpin'];

export class BonusesApi extends BaseApiClient {
  constructor(
    page: Page,
    baseUrl: string,
    private readonly fixedUid?: string,
  ) {
    super(page, baseUrl);
  }

  private async resolveUid(timeoutMs = 15000): Promise<string> {
    if (this.fixedUid) return this.fixedUid;

    await this.ensureOnOrigin();

    const start = Date.now();
    let lastReload = 0;

    while (Date.now() - start < timeoutMs) {
      const all = await this.page.context().cookies();
      const raw = all.find((c) => c.name === 'uid' || c.name === 'user_id')?.value ?? '';
      const uid = (raw.match(/\d+/)?.[0] ?? '').trim();
      if (uid) return uid;

      if (Date.now() - lastReload > 3000) {
        lastReload = Date.now();
        try {
          await this.page.reload({ waitUntil: 'domcontentloaded' });
        } catch {
          // ignore reload error while waiting for uid cookie
        }
      }

      await this.page.waitForTimeout(250);
    }

    throw new Error('uid cookie not found');
  }

  async waitForUid(timeoutMs = 15000): Promise<string> {
    return this.resolveUid(timeoutMs);
  }

  async getAnyBonusCount(
    types: BonusType[] = DEFAULT_BONUS_TYPES,
  ): Promise<ApiResult<BonusCountResponse>> {
    const uid = await this.resolveUid();

    const params = new URLSearchParams();
    params.set('user_id', uid);
    types.forEach((t) => params.append('type[]', t));

    let res = await this.postForm<BonusCountResponse>(
      '/accounting/api/crm_roxy/getanybonuscount',
      params.toString(),
    );

    if (
      !res.ok ||
      (res.data && typeof res.data === 'object' && 'error' in res.data && res.data.error !== 'no')
    ) {
      await this.page.waitForTimeout(500);
      res = await this.postForm<BonusCountResponse>(
        '/accounting/api/crm_roxy/getanybonuscount',
        params.toString(),
      );
    }

    return res;
  }
}
