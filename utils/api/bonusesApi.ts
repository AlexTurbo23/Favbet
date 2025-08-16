import { BaseApiClient } from '../base/baseApiClient';
import { ApiResult, BonusCountResponse, BonusType } from './types';

const DEFAULT_BONUS_TYPES: BonusType[] = ['All', 'RiskFree', 'RealMoney', 'FreeSpin'];

export class BonusesApi extends BaseApiClient {
  // Public helper to await uid cookie for callers that need explicit control
  async waitForUid(timeoutMs = 7000): Promise<string> {
    await this.ensureOnOrigin();
    const uid = (await this.waitForCookie('uid', timeoutMs)) ?? '';
    if (!uid) throw new Error('uid cookie not found');
    return uid;
  }

  async getAnyBonusCount(
    types: BonusType[] = DEFAULT_BONUS_TYPES,
  ): Promise<ApiResult<BonusCountResponse>> {
    const uid = await this.waitForUid();

    const params = new URLSearchParams();
    params.set('user_id', uid);
    types.forEach((t) => params.append('type[]', t));

    let res = await this.postForm<BonusCountResponse>(
      '/accounting/api/crm_roxy/getanybonuscount',
      params.toString(),
    );

    if (!res.ok || (res.data as any)?.error !== 'no') {
      await this.page.waitForTimeout(500);
      res = await this.postForm('/accounting/api/crm_roxy/getanybonuscount', params.toString());
    }

    return res;
  }
}
