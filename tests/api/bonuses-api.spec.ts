import { test } from '@playwright/test';
import { resetSession } from '../../utils/session/session';
import { BASE_URL } from '../../utils/data/baseUrl';
import { CREDENTIALS } from '../../utils/data/credentials';
import { BonusesSteps } from '../../utils/e2e/bonusesSteps';

test.describe('Favbet API - Auth + Bonuses', () => {
  test('Sign in -> get bonus count -> validate', async ({ page }) => {
    await test.step('Reset session', async () => {
      await resetSession(page, BASE_URL);
    });

    const steps = new BonusesSteps(page, BASE_URL);

    await test.step('Login with credentials', async () => {
      await steps.login(CREDENTIALS.email, CREDENTIALS.password);
    });

    await test.step('Ensure UID cookie exists', async () => {
      await steps.ensureUid();
    });

    const bonusData = await test.step('Get bonus count from API', async () => {
      return steps.getBonusCount();
    });

    await test.step('Validate bonus count response', async () => {
      if (bonusData && typeof bonusData === 'object') {
        steps.validateBonusCount(bonusData);
      } else {
        throw new Error('Invalid bonusData received from API');
      }
    });
  });
});
