import { Page } from '@playwright/test';
import {log} from "../utils/logger";

export class LoginPage {
    constructor(private page: Page) {}

    // Selectors
    private usernameInput = '#username';
    private passwordInput = '#password';
    private loginButton = '[data-testid="login-button"]';

    async goto() {
        await this.page.goto('https://sandbox-app.brighthr.com/lite');
    }

    async login(email: string, password: string) {
        // Step 1: Go to app
        await this.goto();
        log('Navigated to login page');

        // Step 2: Click login (redirects to identity provider)
        await this.page.getByRole('link', { name: 'Log in' }).click();


        // Step 3: Wait for redirect to identity provider
        await this.page.waitForURL(/sandbox-login\.brighthr\.com\/login/);

        // Step 4: Fill credentials
        await this.page.fill(this.usernameInput, email);
        await this.page.fill(this.passwordInput, password);

        // Step 5: Submit
        await this.page.click(this.loginButton);

        // Step 6: Wait for redirect back to the app
        await this.page.waitForURL(/sandbox-app\.brighthr\.com/);
        log('login successful');
    }
}
