import { test } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { AuthPage } from '../../pages/AuthPage';
import { LivePage } from '../../pages/LivePage';
import { BASE_URL } from '../../utils/data/baseUrl';
import { CREDENTIALS } from '../../utils/data/credentials';

test.describe('Test 1 - Favorites Management', () => {
  test('Should login, navigate to favorites, and add/remove items', async ({ page }) => {
    const home = new HomePage(page);
    const auth = new AuthPage(page);
    const live = new LivePage(page);

    await test.step('Open main page', async () => {
      await home.open(BASE_URL);
    });

    await test.step('Go to Log in form', async () => {
      await home.clickLoginBtn();
    });

    await test.step('Perform login', async () => {
      await auth.login(CREDENTIALS.email, CREDENTIALS.password);
    });

    await test.step('Close KYC banner if present', async () => {
      await home.closeKycBannerIfPresent();
    });

    await test.step('Go to Live section', async () => {
      await home.goToLive();
    });

    await test.step('Add event to favorites', async () => {
      await live.clickToAddFavorit();
    });

    await test.step('Go to Favorites section', async () => {
      await home.goToFavorites();
    });

    await test.step('Remove event from favorites', async () => {
      await live.clickToRemoveFromFavorit();
    });
  });
});
