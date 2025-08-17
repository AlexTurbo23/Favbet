import { test } from '@playwright/test';
import { BASE_URL } from '../../utils/data/baseUrl';
import { CREDENTIALS } from '../../utils/data/credentials';
import { resetSession } from '../../utils/session/session';
import { BonusesSteps } from '../../utils/e2e/bonusesSteps';

test.describe('Test 1 - Bonuses API', () => {
  test('Bonuses: login -> get count -> validate', async ({ page }) => {
    await resetSession(page, BASE_URL);

    const steps = new BonusesSteps(page, BASE_URL);
    await steps.login(CREDENTIALS.email, CREDENTIALS.password);

    const bonusData = await steps.getBonusCount();
    await steps.validateBonusCount(bonusData);
  });
});
