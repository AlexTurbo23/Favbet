import type { Page } from '@playwright/test';
import { BaseApiClient } from '../base/baseApiClient';
import { ENDPOINTS } from '../data/endpoints';
import type { ApiResult, BonusCountResponse, BonusType } from '../types/types';

const DEFAULT_BONUS_TYPES: BonusType[] = ['All', 'RiskFree', 'RealMoney', 'FreeSpin'];

export class BonusesApi extends BaseApiClient {
  constructor(
    page: Page,
    baseUrl: string,
    private readonly uid: string,
  ) {
    super(page, baseUrl);
  }

  /** Сборка тела запроса */
  private buildParams(types: BonusType[]): string {
    const params = new URLSearchParams();
    params.set('user_id', this.uid);
    types.forEach((t) => params.append('type[]', t));
    return params.toString();
  }

  /** Публичный метод API */
  async getAnyBonusCount(
    types: BonusType[] = DEFAULT_BONUS_TYPES,
  ): Promise<ApiResult<BonusCountResponse>> {
    const body = this.buildParams(types);
    return this.postForm<BonusCountResponse>(ENDPOINTS.bonuses.getAnyBonusCount, body);
  }
}
