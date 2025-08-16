import { Page } from '@playwright/test';

// ---------- Types ----------
export type ApiResult<T = any> = {
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

const FAVBET_ORIGIN = 'https://www.favbet.ua';
const DEFAULT_BONUS_TYPES: BonusType[] = ['All', 'RiskFree', 'RealMoney', 'FreeSpin'];

// ---------- Base client ----------
export class BaseApiClient {
  protected readonly page: Page;
  protected readonly baseUrl: string;

  constructor(page: Page, baseUrl?: string) {
    this.page = page;
    this.baseUrl = baseUrl ?? FAVBET_ORIGIN;
  }

  protected buildUrl(pathOrUrl: string): string {
    if (pathOrUrl.startsWith('http')) return pathOrUrl;
    return `${this.baseUrl.replace(/\/$/, '')}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
  }

  protected async waitForCookie(name: string, timeoutMs = 7000): Promise<string | undefined> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const cookies = await this.page.context().cookies();
      const cookie = cookies.find((c) => c.name === name)?.value;
      if (cookie) return cookie;
      await this.page.waitForTimeout(200);
    }
    return undefined;
  }

  private async post<T = any>(
    url: string,
    body: string,
    headers?: Record<string, string>,
  ): Promise<ApiResult<T>> {
    const result = await this.page.evaluate(
      async ({ url, body, headers }) => {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'x-requested-with': 'XMLHttpRequest', ...headers },
          credentials: 'include',
          body,
        });
        const text = await res.text();
        try {
          return { status: res.status, ok: res.ok, data: JSON.parse(text) };
        } catch {
          return { status: res.status, ok: res.ok, data: text };
        }
      },
      { url, body, headers },
    );
    return result as ApiResult<T>;
  }

  protected async postJson<T = any>(
    pathOrUrl: string,
    data: any,
    extraHeaders?: Record<string, string>,
  ) {
    const url = this.buildUrl(pathOrUrl);
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...extraHeaders,
    };
    return this.post<T>(url, JSON.stringify(data), headers);
  }

  protected async postForm<T = any>(
    pathOrUrl: string,
    formBody: string,
    extraHeaders?: Record<string, string>,
  ) {
    const url = this.buildUrl(pathOrUrl);
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      ...extraHeaders,
    };
    return this.post<T>(url, formBody, headers);
  }
}

// ---------- Auth API ----------
export class AuthApi extends BaseApiClient {
  async signIn(email: string, password: string): Promise<ApiResult> {
    return this.postJson('/accounting/sign_in', { type: 'email', key: email, password });
  }
}

// ---------- Bonuses API ----------
export class BonusesApi extends BaseApiClient {
  private async getUid(): Promise<string> {
    return (await this.waitForCookie('uid')) ?? '';
  }

  async getAnyBonusCount(
    types: BonusType[] = DEFAULT_BONUS_TYPES,
  ): Promise<ApiResult<BonusCountResponse>> {
    const uid = await this.getUid();
    if (!uid) throw new Error('uid cookie not found');

    const params = new URLSearchParams();
    params.set('user_id', uid);
    types.forEach((t) => params.append('type[]', t));

    const res = await this.postForm<BonusCountResponse>(
      '/accounting/api/crm_roxy/getanybonuscount',
      params.toString(),
    );

    // Retry once if backend returned error
    if (!res.ok || (res.data as any)?.error !== 'no') {
      await this.page.waitForTimeout(500);
      return this.postForm('/accounting/api/crm_roxy/getanybonuscount', params.toString());
    }

    return res;
  }
}
