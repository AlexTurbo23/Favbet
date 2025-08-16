import { BaseApiClient } from '../base/baseApiClient';
import { ApiResult } from './types';

export class AuthApi extends BaseApiClient {
  async signIn(email: string, password: string): Promise<ApiResult> {
    await this.ensureOnOrigin();

    const payload = { type: 'email', key: email, password };

    // 1) JSON, no trailing slash
    let res = await this.postJsonSameOrigin('/accounting/sign_in', payload);
    if (res.ok) return res;

    // 2) JSON, with trailing slash (nginx sometimes requires it)
    await this.page.waitForTimeout(200);
    res = await this.postJsonSameOrigin('/accounting/sign_in/', payload);
    if (res.ok) return res;

    // 3) Form-encoded, no trailing slash
    const form = new URLSearchParams();
    form.set('type', 'email');
    form.set('key', email);
    form.set('password', password);
    await this.page.waitForTimeout(200);
    res = await this.postFormSameOrigin('/accounting/sign_in', form.toString());
    if (res.ok) return res;

    // 4) Form-encoded, with trailing slash
    await this.page.waitForTimeout(200);
    return this.postFormSameOrigin('/accounting/sign_in/', form.toString());
  }
}
