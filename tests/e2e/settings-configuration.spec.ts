import { test } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { AuthPage } from '../../pages/AuthPage';
import { BASE_URL } from '../../utils/data/baseUrl';
import { CREDENTIALS } from '../../utils/data/credentials';

test.describe('Test 3 - Settings Configuration', () => {
  test('Should login, open settings page, change language/color scheme and check changes', async ({
    page,
  }) => {
    const home = new HomePage(page);
    const auth = new AuthPage(page);

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

    await test.step('Open Settings page', async () => {
      await home.openUserMenuPageName('Settings');
    });

    await test.step('Choose language and check changes', async () => {
      await home.chooseLanguageAndCheck('Ukrainian', 'uk');
    });
    await test.step('Change color scheme and check changes', async () => {
      await home.chooseLightTheme('light');
    });
  });
});
