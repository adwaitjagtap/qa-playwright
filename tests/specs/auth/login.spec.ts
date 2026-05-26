import { test, expect } from '../../utils/test-fixtures';
import * as dotenv from 'dotenv';
import { LoginPage } from '../../pages/login.page';
import { DashboardPage } from '../../pages/dashboard.page';
import {expectedBasicUserMenuItems} from '../../data/dashboardItems';

dotenv.config();

test('User can login successfully', async ({ page }) => {
    const login = new LoginPage(page);

    await login.login(
        process.env.BRIGHTHR_USERNAME!,
        process.env.BRIGHTHR_PASSWORD!
    );

    // Assert we landed in the app
    await expect(page).toHaveURL(/sandbox-app\.brighthr\.com/);

    // Optional: check for a visible element on dashboard
    await expect(page.getByRole('heading')).toBeVisible();

    const dashboard = new DashboardPage(page);

    await dashboard.waitForDashboardLoad();

    await dashboard.verifyMenuItems(expectedBasicUserMenuItems);

});
