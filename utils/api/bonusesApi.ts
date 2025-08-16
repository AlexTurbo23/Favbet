import { BaseApiClient } from '../base/baseApiClient';
import { ApiResult, BonusCountResponse, BonusType } from './types';

const DEFAULT_BONUS_TYPES: BonusType[] = ['All', 'RiskFree', 'RealMoney', 'FreeSpin'];

export class BonusesApi extends BaseApiClient {
  // Static UID as requested
  private static readonly FIXED_UID = '103331947';
  async waitForUid(timeoutMs = 5000): Promise<string> {
    return BonusesApi.FIXED_UID;
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
