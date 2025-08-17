import { BaseApiClient } from '../base/baseApiClient';
import type { Page } from '@playwright/test';
import { ApiResult, BonusCountResponse, BonusType } from '../types/types';

const DEFAULT_BONUS_TYPES: BonusType[] = ['All', 'RiskFree', 'RealMoney', 'FreeSpin'];

export class BonusesApi extends BaseApiClient {
  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
  }

  async getAnyBonusCount(
    types: BonusType[] = DEFAULT_BONUS_TYPES,
  ): Promise<ApiResult<BonusCountResponse>> {
    const params = new URLSearchParams();
    params.set('user_id', '103331947');
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
