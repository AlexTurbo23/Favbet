import { expect } from '@playwright/test';

export class ApiValidators {
  static validateBonusResponse(data: any) {
    if (!data || typeof data !== 'object') {
      throw new Error(`Invalid bonus API response: ${JSON.stringify(data)}`);
    }
    if (data.error === 'yes' || data.error_code) {
      throw new Error(`Bonus API returned error: ${JSON.stringify(data)}`);
    }

    expect(data).toHaveProperty('error', 'no');
    expect(data).toHaveProperty('error_code', '');
    expect(data).toHaveProperty('response');

    const top = data.response;
    expect(top).toHaveProperty('errorCode', 0);
    expect(top).toHaveProperty('errorText', 'Success');
    expect(top).toHaveProperty('response');

    const totals = top.response;
    expect(typeof totals).toBe('object');
    ['All', 'RiskFree', 'RealMoney', 'FreeSpin'].forEach((k) => {
      expect(totals).toHaveProperty(k);
      expect(typeof totals[k]).toBe('number');
    });

    return totals;
  }
}
