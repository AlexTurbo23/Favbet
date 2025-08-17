import { BaseApiClient } from '../base/baseApiClient';
import { ApiResult } from '../types/types';
import { ENDPOINTS } from '../data/endpoints';

type SignInPayload = { type: 'email'; key: string; password: string };

export class AuthApi extends BaseApiClient {
  async signIn(email: string, password: string): Promise<ApiResult> {
    await this.ensureOnOrigin();

    const payload: SignInPayload = { type: 'email', key: email, password };
    const form = new URLSearchParams({ type: 'email', key: email, password });

    // Пути: со слешем и без — на случай особенностей nginx/роутера
    const base = ENDPOINTS.auth.signIn;
    const withSlash = base.endsWith('/') ? base : `${base}/`;
    const noSlash = base.endsWith('/') ? base.slice(0, -1) : base;

    // Четыре надёжных варианта: JSON/FORM × со слешем/без
    const attempts = [
      () => this.postJsonSameOrigin(noSlash, payload),
      () => this.postJsonSameOrigin(withSlash, payload),
      () => this.postFormSameOrigin(noSlash, form.toString()),
      () => this.postFormSameOrigin(withSlash, form.toString()),
    ] as Array<() => Promise<ApiResult>>;

    return this.tryInOrder(attempts, { pauseMs: 200 });
  }

  /** Универсальный хелпер: идём по вариантам, возвращаем первый успешный (ok) */
  private async tryInOrder<T = unknown>(
    fns: Array<() => Promise<ApiResult<T>>>,
    { pauseMs = 0 }: { pauseMs?: number } = {},
  ): Promise<ApiResult<T>> {
    let last: ApiResult<T> | undefined;

    for (const fn of fns) {
      const res = await fn();
      if (res.ok) return res;
      last = res;
      if (pauseMs) {
        await this.page.waitForTimeout(pauseMs);
      }
    }

    if (!last) {
      throw new Error('All attempts failed and no ApiResult captured');
    }

    return last;
  }
}
