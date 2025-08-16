import { test } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { AuthPage } from '../../pages/AuthPage';
import { BASE_URL } from '../../utils/data/baseUrl';
import { CREDENTIALS } from '../../utils/data/credentials';

test.describe('Test 2 - YouTube Social Network Integration', () => {
  test('Should login and interact with YouTube videos', async ({ page }) => {
    const home = new HomePage(page);
    const auth = new AuthPage(page);
    const videoName = 'FAVBET | Support Those Who Support Us: ENGLAND | 2022 FIFA World Cup';

    await test.step('Open main page', async () => {
      await home.open(BASE_URL);
    });

    await test.step('Go to Log in form', async () => {
      await home.clickLoginBtn();
    });

    await test.step('Perform login', async () => {
      await auth.login(CREDENTIALS.email, CREDENTIALS.password);
    });

    await test.step('Go to YouTube channel, search a video and check channel name/video name', async () => {
      await home.goToYouTubeChannel('Favbet UA', videoName);
    });
  });
});
