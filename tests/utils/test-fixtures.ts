import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

type Fixtures = {
    loginPage: LoginPage;
};

export const test = base.extend<Fixtures>({
    loginPage: async ({ page }, use) => {
        const login = new LoginPage(page);
        await use(login);
    }
});

export { expect } from '@playwright/test';
