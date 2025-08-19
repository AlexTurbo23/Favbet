import { expect } from '@playwright/test';
import type { BonusCountResponse, BonusType } from '../types/types';

export class ApiValidators {
  static validateBonusResponse(data: BonusCountResponse) {
    if (!data || typeof data !== 'object') {
      throw new Error(`Invalid bonus API response: ${JSON.stringify(data)}`);
    }
    if (data.error === 'yes' || data.error_code) {
      throw new Error(`Bonus API returned error: ${JSON.stringify(data)}`);
    }

    expect(data).toMatchObject({
      error: 'no',
      error_code: '',
      response: {
        errorCode: 0,
        errorText: 'Success',
        response: expect.any(Object),
      },
    });

    const totals: Record<BonusType, number> & Record<string, number> = data.response.response;
    expect(typeof totals).toBe('object');
    (['All', 'RiskFree', 'RealMoney', 'FreeSpin'] as const).forEach((k) => {
      expect(totals).toHaveProperty(k);
      expect(typeof totals[k]).toBe('number');
    });

    return totals;
  }
}
