import { Page } from '@playwright/test';
import { ApiResult } from '../api/types';

const FAVBET_ORIGIN = 'https://www.favbet.ua';

export class BaseApiClient {
  protected readonly page: Page;
  protected readonly baseUrl: string;

  constructor(page: Page, baseUrl?: string) {
    this.page = page;
    this.baseUrl = baseUrl ?? FAVBET_ORIGIN;
  }

  protected buildUrl(pathOrUrl: string): string {
    if (pathOrUrl.startsWith('http')) return pathOrUrl;
    const origin = this.getOrigin();
    return `${origin}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
  }

  private getOrigin(): string {
    try {
      const u = new URL(this.baseUrl);
      return `${u.protocol}//${u.host}`;
    } catch {
      return this.baseUrl;
    }
  }

  /**
   * Ensure we are on the origin so that window.fetch has a proper Referer and cookies context.
   */
  protected async ensureOnOrigin(): Promise<void> {
    try {
      const origin = this.getOrigin();
      await this.page.goto(origin, { waitUntil: 'commit', timeout: 15000 });
    } catch {}
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
    const origin = this.getOrigin();
    // Prefer relative fetch URL for same-origin to produce natural Referer
    let fetchUrl = url;
    try {
      const abs = new URL(url);
      const base = new URL(origin);
      if (abs.origin === base.origin) {
        fetchUrl = abs.pathname + abs.search + abs.hash;
      }
    } catch {}

    return (await this.page.evaluate(
      async ({ fetchUrl, body, headers, referrer }) => {
        const res = await fetch(fetchUrl, {
          method: 'POST',
          headers: { 'x-requested-with': 'XMLHttpRequest', ...headers },
          credentials: 'include',
          mode: 'same-origin',
          referrer,
          body,
        });
        const text = await res.text();
        try {
          return { status: res.status, ok: res.ok, data: JSON.parse(text) };
        } catch {
          return { status: res.status, ok: res.ok, data: text };
        }
      },
      { fetchUrl, body, headers, referrer: origin },
    )) as unknown as ApiResult<T>;
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
