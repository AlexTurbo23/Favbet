import { BaseApiClient, ApiResult } from '../base/baseApiClient';
import { ENDPOINTS } from './endpoints';

export interface FavoritesSaveBody {
  casino_games: { id: string }[];
}

export class FavoritesApi extends BaseApiClient {
  private async ensureSessionReady(): Promise<void> {
    await this.ensureOnOrigin();
    const uid = await this.waitForCookie('uid', { timeoutMs: 50000 });
    if (!uid) {
      // Fallback: open a stable page to ensure cookies/session propagate, then retry briefly
      const url = new URL('/en/instant-games/', this.baseUrl).toString();
      await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const retry = await this.waitForCookie('uid', { timeoutMs: 50000 });
      if (!retry) throw new Error('uid cookie not found');
    }
  }

  // Only new endpoint: save favorites (instant/casino)
  async saveFavorites(gameIds: string[]): Promise<ApiResult<unknown>> {
    await this.ensureSessionReady();
    const deviceId = await this.ensureDeviceId();
    const body: FavoritesSaveBody = {
      casino_games: gameIds.map((id) => ({ id })),
    };
    return this.postJsonSameOrigin(ENDPOINTS.favorites.save, body, {
      'x-device-id': deviceId,
    });
  }

  // New endpoint: delete favorites
  async deleteFavorites(gameIds: string[]): Promise<ApiResult<unknown>> {
    await this.ensureSessionReady();
    const deviceId = await this.ensureDeviceId();
    const body: FavoritesSaveBody = {
      casino_games: gameIds.map((id) => ({ id })),
    };
    return this.postJsonSameOrigin(ENDPOINTS.favorites.delete, body, {
      'x-device-id': deviceId,
    });
  }

  // New endpoint: get entities (e.g., ["casino_games"]) from favorites
  async getEntities(entities: string[] = ['casino_games']): Promise<ApiResult<unknown>> {
    await this.ensureSessionReady();
    const deviceId = await this.ensureDeviceId();
    const body = { entities };
    return this.postJsonSameOrigin(ENDPOINTS.favorites.getEntities, body, {
      'x-device-id': deviceId,
    });
  }

  // Helper: parse favorite game ids from various backend shapes
  private extractFavoriteIds(raw: unknown): string[] {
    let data: any = raw;
    if (typeof raw === 'string') {
      try {
        data = JSON.parse(raw);
      } catch {
        return [];
      }
    }
    const candidates: any[] = [
      data?.entities?.casino_games,
      data?.response?.entities?.casino_games,
      data?.response?.casino_games,
      data?.data?.entities?.casino_games,
      data?.casino_games,
    ];
    let items: any[] | undefined = candidates.find((v) => Array.isArray(v));
    if (!items) {
      const maybe: any = Object.values(data || {}).find((v: any) =>
        Array.isArray((v as any)?.casino_games),
      );
      items = (maybe as any)?.casino_games as any[] | undefined;
    }
    if (!Array.isArray(items)) return [];
    const ids = items
      .map((x) => (typeof x === 'string' ? x : x?.id || x?.slug || ''))
      .filter((s): s is string => typeof s === 'string' && s.length > 0);
    return Array.from(new Set(ids));
  }

  // OOP helper: list current favorite game IDs
  async listFavoriteGameIds(): Promise<string[]> {
    const res = await this.getEntities(['casino_games']);
    if (!res.ok) throw new Error(`get_entities failed: ${JSON.stringify(res.data)}`);
    return this.extractFavoriteIds(res.data);
  }

  // OOP helper: clear all favorites
  async clearAllFavorites(): Promise<void> {
    const current = await this.listFavoriteGameIds();
    if (!current.length) return;
    const res = await this.deleteFavorites(current);
    if (!res.ok) throw new Error(`delete favorites failed: ${JSON.stringify(res.data)}`);
  }
}
