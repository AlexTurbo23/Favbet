import { test, expect } from '@playwright/test';
import { BASE_URL } from '../../utils/data/baseUrl';
import { CREDENTIALS } from '../../utils/data/credentials';
import { resetSession } from '../../utils/session/session';
import { FavoritesSteps } from '../../utils/e2e/favoritesSteps';

const norm = (arr: string[]) => Array.from(new Set(arr)).sort();

test.describe('Test 2 - Instant Games Favorites API', () => {
  test('login -> delete -> save -> list -> strict verify', async ({ page }) => {
    await resetSession(page, BASE_URL);

    const steps = new FavoritesSteps(page, BASE_URL);
    await steps.login(CREDENTIALS.email, CREDENTIALS.password);

    const expected = ['spaceman', 'mines-favbet'];

    await steps.deleteFavorites(expected);
    await steps.saveFavorites(expected);

    const actual = await steps.listFavoriteIdsWithRetry();

    expect(norm(actual), `favorites mismatch. actual=${JSON.stringify(norm(actual))}`).toEqual(
      norm(expected),
    );
  });
});
