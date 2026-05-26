import { Page, expect } from '@playwright/test';

export class DashboardPage {
    constructor(private page: Page) {}

    private dashboardUrl = /\/dashboard/;

    // All left-nav items have data-e2e attributes AND hrefs
    private navItems = this.page.locator('a[data-e2e][href^="/"]');

    async waitForDashboardLoad() {
        await this.page.waitForURL(this.dashboardUrl);

        await expect(
            this.page.getByRole('heading', { level: 3, name: /Hi/i })
        ).toBeVisible();
    }

    async getMenuItems(): Promise<string[]> {
        const items = await this.navItems.evaluateAll(els =>
            els.map(el => {
                // Find the visible label inside the <a>
                const spans = Array.from(el.querySelectorAll('span'));
                const visible = spans.find(s => {
                    const style = window.getComputedStyle(s);
                    return style.display !== 'none' && style.visibility !== 'hidden';
                });
                return visible?.textContent?.trim() || '';
            })
        );

        return items.filter(Boolean); // remove empty strings
    }

    async verifyMenuItems(expectedItems: string[]) {
        const actual = await this.getMenuItems();

        for (const item of expectedItems) {
            expect(actual).toContain(item);
        }
    }
}
