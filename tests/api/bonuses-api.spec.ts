import { test, expect } from '@playwright/test';
import { AuthApi } from '../../utils/api/authApi';
import { BonusesApi } from '../../utils/api/bonusesApi';
import { ApiValidators } from '../../utils/helpers/validators';
import { resetSession } from '../../utils/session/session';
import { BASE_URL } from '../../utils/data/baseUrl';
import { CREDENTIALS } from '../../utils/data/credentials';

test.describe('Favbet API - Auth + Bonuses', () => {
  test('Sign in -> get bonus count -> validate', async ({ page }) => {
    // Clean start
    await resetSession(page, BASE_URL);

    const auth = new AuthApi(page, BASE_URL);
    const bonuses = new BonusesApi(page, BASE_URL);

    const signIn = await auth.signIn(CREDENTIALS.email, CREDENTIALS.password);
    expect(signIn.ok, `Auth failed: ${JSON.stringify(signIn.data)}`).toBe(true);
    console.log('Sign in successful:', signIn.data);

    // Ensure uid cookie is present via public helper
    const uid = await bonuses.waitForUid();
    expect(uid).toBeTruthy();

    const bonusResponse = await bonuses.getAnyBonusCount();
    expect(bonusResponse.ok, `Bonus API failed: ${JSON.stringify(bonusResponse.data)}`).toBe(true);

    // Validate structure/content
    ApiValidators.validateBonusResponse(bonusResponse.data);
    console.log('Bonus counts:', bonusResponse.data);
  });
});
