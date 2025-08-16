import { test, expect } from '@playwright/test';
import { BASE_URL } from '../../utils/data/baseUrl';
import { CREDENTIALS } from '../../utils/data/credentials';
import { resetSession } from '../../utils/session/session';
import { FavoritesSteps } from '../../utils/e2e/favoritesSteps';

test.describe('Test 2 - Instant Games Favorites API', () => {
  test('login -> deleteFavorites -> saveFavorites -> getEntities -> strict verify', async ({
    page,
  }) => {
    await test.step('Reset session', async () => {
      await resetSession(page, BASE_URL);
    });

    const steps = new FavoritesSteps(page, BASE_URL);

    await test.step('Login with credentials', async () => {
      await steps.login(CREDENTIALS.email, CREDENTIALS.password);
    });

    const expected = ['spaceman', 'mines-favbet'];
    await test.step(`Delete favorites: ${expected.join(', ')}`, async () => {
      await steps.deleteFavorites(expected);
    });

    await test.step(`Save favorites: ${expected.join(', ')}`, async () => {
      await steps.saveFavorites(expected);
    });

    const actual = await test.step('Get favorites list with retry', async () => {
      return steps.listFavoriteIdsWithRetry();
    });

    await test.step('Verify favorites strictly match expected list', async () => {
      const a = Array.from(new Set(actual)).sort();
      const e = Array.from(new Set(expected)).sort();
      expect(a, `favorites mismatch. actual=${JSON.stringify(a)}`).toEqual(e);
    });
  });
});
