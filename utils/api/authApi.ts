import { BaseApiClient } from '../base/baseApiClient';
import { ApiResult } from '../types/types';
import { ENDPOINTS } from '../data/endpoints';
import { tryInOrder } from '../helpers/tryInOrder';

type SignInPayload = { type: 'email'; key: string; password: string };

export class AuthApi extends BaseApiClient {
  async signIn(email: string, password: string): Promise<ApiResult> {
    await this.ensureOnOrigin();

    const payload: SignInPayload = { type: 'email', key: email, password };
    const form = new URLSearchParams({ type: 'email', key: email, password });

    const base = ENDPOINTS.auth.signIn;
    const withSlash = base.endsWith('/') ? base : `${base}/`;
    const noSlash = base.endsWith('/') ? base.slice(0, -1) : base;

    const attempts: Array<() => Promise<ApiResult>> = [
      () => this.postJsonSameOrigin(noSlash, payload),
      () => this.postJsonSameOrigin(withSlash, payload),
      () => this.postFormSameOrigin(noSlash, form.toString()),
      () => this.postFormSameOrigin(withSlash, form.toString()),
    ];

    return tryInOrder(attempts, { pauseMs: 200 }, (ms) => this.page.waitForTimeout(ms));
  }
}
