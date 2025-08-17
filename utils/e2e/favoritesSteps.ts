import { Page, expect } from '@playwright/test';
import { AuthApi } from '../api/authApi';
import { FavoritesApi } from '../api/favoritesApi';

export class FavoritesSteps {
  constructor(
    private page: Page,
    private baseUrl: string,
  ) {}

  auth() {
    return new AuthApi(this.page, this.baseUrl);
  }

  api() {
    return new FavoritesApi(this.page, this.baseUrl);
  }

  async login(email: string, password: string) {
    const res = await this.auth().signIn(email, password);
    expect(res.ok, `login failed: ${JSON.stringify(res.data)}`).toBeTruthy();
    expect(res.status).toBe(200);
  }

  async deleteFavorites(ids: string[]) {
    const res = await this.api().deleteFavorites(ids);
    expect(res.ok, `deleteFavorites failed: ${JSON.stringify(res.data)}`).toBeTruthy();
  }

  async saveFavorites(ids: string[]) {
    const res = await this.api().saveFavorites(ids);
    expect(res.ok, `saveFavorites failed: ${JSON.stringify(res.data)}`).toBeTruthy();
  }

  async listFavoriteIdsWithRetry(retries = 4, delayMs = 600): Promise<string[]> {
    let last: string[] = [];
    for (let i = 0; i < retries; i++) {
      last = await this.api().listFavoriteGameIds();
      await this.page.waitForTimeout(delayMs);
    }
    return last;
  }
}
