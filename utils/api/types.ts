export type ApiResult<T = unknown> = {
  status: number;
  ok: boolean;
  data: T | string | null;
};

export type BonusType = 'All' | 'RiskFree' | 'RealMoney' | 'FreeSpin';

export interface BonusCountResponse {
  error: 'no' | 'yes' | string;
  error_code: '' | string;
  response: {
    errorCode: number;
    errorText: string;
    response: Record<BonusType, number> & Record<string, number>;
  };
}
