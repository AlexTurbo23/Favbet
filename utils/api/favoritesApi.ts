import { BaseApiClient, ApiResult } from '../base/baseApiClient';
import { ENDPOINTS } from '../data/endpoints';
import { extractFavoriteIds } from '../helpers/favoritesParser';

export class FavoritesApi extends BaseApiClient {
  async saveFavorites(gameIds: string[]): Promise<ApiResult<unknown>> {
    const deviceId = await this.ensureDeviceId();
    const body = { casino_games: gameIds.map((id) => ({ id })) };
    return this.postJsonSameOrigin(ENDPOINTS.favorites.save, body, { 'x-device-id': deviceId });
  }

  async deleteFavorites(gameIds: string[]): Promise<ApiResult<unknown>> {
    const deviceId = await this.ensureDeviceId();
    const body = { casino_games: gameIds.map((id) => ({ id })) };
    return this.postJsonSameOrigin(ENDPOINTS.favorites.delete, body, { 'x-device-id': deviceId });
  }

  async getEntities(): Promise<ApiResult<unknown>> {
    const deviceId = await this.ensureDeviceId();
    const body = { entities: ['casino_games'] };
    return this.postJsonSameOrigin(ENDPOINTS.favorites.getEntities, body, {
      'x-device-id': deviceId,
    });
  }

  async listFavoriteGameIds(): Promise<string[]> {
    const res = await this.getEntities();
    if (!res.ok) throw new Error(`get_entities failed: ${JSON.stringify(res.data)}`);
    return extractFavoriteIds(res.data, 'casino_games');
  }

  async clearAllFavorites(): Promise<void> {
    const current = await this.listFavoriteGameIds();
    if (!current.length) return;
    const res = await this.deleteFavorites(current);
    if (!res.ok) throw new Error(`delete favorites failed: ${JSON.stringify(res.data)}`);
  }
}
