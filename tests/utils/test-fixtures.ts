import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import * as path from 'path';
import * as fs from 'fs';

type Fixtures = {
    loginPage: LoginPage;
    networkOnFailure: void;
};

export const test = base.extend<Fixtures>({
    loginPage: async ({ page }, use) => {
        const login = new LoginPage(page);
        await use(login);
    },

    networkOnFailure: [async ({ page, browserName }, use, testInfo) => {
        // Start HAR recording
        const harPath = path.join(testInfo.outputDir, 'network.har');
        await page.routeFromHAR(harPath, { notFound: 'fallback', update: true }).catch(() => {});

        // Collect failed requests in memory for log output
        const failedRequests: string[] = [];
        page.on('requestfailed', request => {
            failedRequests.push(`[FAILED REQUEST] ${request.method()} ${request.url()} — ${request.failure()?.errorText ?? 'unknown error'}`);
        });

        await use();

        // On failure: attach HAR and failed request log
        if (testInfo.status !== testInfo.expectedStatus) {
            // Save HAR file
            if (fs.existsSync(harPath)) {
                await testInfo.attach('network.har', { path: harPath, contentType: 'application/json' });
            }

            // Attach failed requests summary
            if (failedRequests.length > 0) {
                await testInfo.attach('failed-network-requests.txt', {
                    body: failedRequests.join('\n'),
                    contentType: 'text/plain'
                });
            }
        }
    }, { auto: true }]
});

export { expect } from '@playwright/test';
