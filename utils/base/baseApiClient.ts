import { Page } from '@playwright/test';
import { ApiResult } from '../api/types';

export type { ApiResult } from '../api/types';

const FAVBET_ORIGIN = 'https://www.favbet.ua';

export class BaseApiClient {
  protected readonly page: Page;
  protected readonly baseUrl: string;
  private _deviceIdCache?: string;

  // === Глобальная задержка между запросами (по умолчанию 1 сек) ===
  private readonly apiDelayMs: number = Number(process.env.API_DELAY_MS ?? '1000');
  private async delay(ms: number) {
    if (ms > 0) await this.page.waitForTimeout(ms);
  }

  constructor(page: Page, baseUrl?: string) {
    this.page = page;
    this.baseUrl = baseUrl ?? FAVBET_ORIGIN;
  }

  protected async ensureDeviceId(key = 'x-device-id'): Promise<string> {
    if (this._deviceIdCache) return this._deviceIdCache;
    await this.ensureOnOrigin();
    const id = await this.page.evaluate((k) => {
      try {
        let v = localStorage.getItem(k) || '';
        if (!v) {
          // simple UUID-ish fallback
          const rand = () => Math.random().toString(16).slice(2);
          v = `${rand()}-${rand()}-${rand()}-${rand()}`;
          localStorage.setItem(k, v);
        }
        return v;
      } catch {
        return '';
      }
    }, key);
    this._deviceIdCache = id || this._deviceIdCache;
    return id;
  }

  protected buildUrl(pathOrUrl: string): string {
    if (pathOrUrl.startsWith('http')) return pathOrUrl;
    const origin = this.getOrigin();
    const rel = pathOrUrl.replace(/^\//, '');
    return `${origin}/${rel}`;
  }

  private getOrigin(): string {
    try {
      const u = new URL(this.baseUrl);
      return `${u.protocol}//${u.host}`;
    } catch {
      return this.baseUrl;
    }
  }

  /** Ensure we are on the origin so that window.fetch has a proper Referer and cookies context. */
  protected async ensureOnOrigin(): Promise<void> {
    try {
      const want = this.getOrigin();
      let curOrigin = '';
      try {
        curOrigin = new URL(this.page.url()).origin;
      } catch {}
      if (curOrigin === want) return;
      await this.page.goto(want, { waitUntil: 'commit', timeout: 15000 });
    } catch {}
  }

  protected async waitForCookie(
    name: string,
    {
      timeoutMs = 15000,
      pollMs = 250,
      ensureOnOrigin = true,
      reloadEveryMs = 3000,
    }: {
      timeoutMs?: number;
      pollMs?: number;
      ensureOnOrigin?: boolean;
      reloadEveryMs?: number;
    } = {},
  ): Promise<string> {
    const origin = this.getOrigin();

    if (ensureOnOrigin && !this.page.url().startsWith(origin)) {
      await this.page.goto(origin, { waitUntil: 'domcontentloaded' });
    }

    const start = Date.now();
    let lastReload = 0;

    while (Date.now() - start < timeoutMs) {
      const all = await this.page.context().cookies();
      const val = all.find((c) => c.name === name)?.value;
      if (val) return val;

      if (Date.now() - lastReload > reloadEveryMs) {
        lastReload = Date.now();
        try {
          await this.page.reload({ waitUntil: 'domcontentloaded' });
        } catch {}
      }

      await this.page.waitForTimeout(pollMs);
    }

    throw new Error(`Cookie '${name}' not found within ${timeoutMs}ms`);
  }

  private toRelativeIfSameOrigin(url: string): string {
    const origin = this.getOrigin();
    try {
      const abs = new URL(url);
      const base = new URL(origin);
      if (abs.origin === base.origin) {
        return abs.pathname + abs.search + abs.hash;
      }
      return url;
    } catch {
      return url;
    }
  }

  private async post<T = any>(
    url: string,
    body: string,
    headers?: Record<string, string>,
  ): Promise<ApiResult<T>> {
    await this.delay(this.apiDelayMs);

    const origin = this.getOrigin();
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

  // Same-origin helpers: do not force referrer; use relative URL when possible so browser sets current page as Referer
  protected async postJsonSameOrigin<T = any>(
    pathOrUrl: string,
    data: any,
    extraHeaders?: Record<string, string>,
  ) {
    await this.delay(this.apiDelayMs);

    await this.ensureOnOrigin();
    const abs = this.buildUrl(pathOrUrl);
    const url = this.toRelativeIfSameOrigin(abs);
    return (await this.page.evaluate(
      async ({ url, body, headers }) => {
        const res = await fetch(url, {
          method: 'POST',
          credentials: 'include',
          headers: { accept: '*/*', 'content-type': 'application/json', dnt: '1', ...headers },
          body: JSON.stringify(body),
          redirect: 'follow',
        });
        const text = await res.text();
        try {
          return { status: res.status, ok: res.ok, data: JSON.parse(text) };
        } catch {
          return { status: res.status, ok: res.ok, data: text };
        }
      },
      { url, body: data, headers: extraHeaders ?? {} },
    )) as unknown as ApiResult<T>;
  }

  protected async postFormSameOrigin<T = any>(
    pathOrUrl: string,
    formBody: string,
    extraHeaders?: Record<string, string>,
  ) {
    await this.delay(this.apiDelayMs);

    await this.ensureOnOrigin();
    const abs = this.buildUrl(pathOrUrl);
    const url = this.toRelativeIfSameOrigin(abs);
    return (await this.page.evaluate(
      async ({ url, body, headers }) => {
        const res = await fetch(url, {
          method: 'POST',
          credentials: 'include',
          headers: {
            accept: '*/*',
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            dnt: '1',
            ...headers,
          },
          body,
          redirect: 'follow',
        });
        const text = await res.text();
        try {
          return { status: res.status, ok: res.ok, data: JSON.parse(text) };
        } catch {
          return { status: res.status, ok: res.ok, data: text };
        }
      },
      { url, body: formBody, headers: extraHeaders ?? {} },
    )) as unknown as ApiResult<T>;
  }
}
