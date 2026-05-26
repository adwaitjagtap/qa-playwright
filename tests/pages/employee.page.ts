import { Page, expect } from '@playwright/test';
import {log} from "../utils/logger";

export class EmployeePage {
    constructor(private page: Page) {}

    // -----------------------------
    // SELECTORS
    // -----------------------------
    private selectors = {
        navEmployees: '[data-testid="sideBar"] >> role=link[name="Employees"]',
        addEmployeeBtn: 'role=button[name="Add employee"]',
        addAnotherBtn: 'role=button[name="Add another employee"]',
        saveEmployeeBtn: 'role=button[name="Save new employee"]',

        firstName: 'role=textbox[name="First name"]',
        lastName: 'role=textbox[name="Last name"]',
        email: 'role=textbox[name="Email address"]',
        phone: 'role=textbox[name="Phone number (optional)"]',
        jobTitle: 'role=textbox[name="Job title (optional)"]',

        datePicker: '.sc-jtRfpW',

        // searchBox: 'role=textbox[name*="Search"]',

        searchBox: 'input[placeholder="Name or job title..."]',
        employeeName: 'h1',
        employeeJobTitle: 'xpath=following-sibling::div[1]',
        closeModalBtn: 'button[aria-label="Close modal"]',
        employeesNav: '#main-content >> role=link[name="Employees"]',
        permissionsNav: '#main-content >> role=link[name="Permissions"]',
        manageEmployeesUrl: /employee-hub\/manage-employees/,
        permissionsUrl: /employee-hub\/permissions/

    };

    // -----------------------------
    // ACTIONS
    // -----------------------------
    async navigate() {
        await this.page.locator(this.selectors.navEmployees).click();
        await this.page.waitForURL(/employee-hub/);
    }

    async openAddEmployeeForm() {
        await this.page.locator(this.selectors.addEmployeeBtn).click();
    }

    async fillEmployeeForm(emp) {
        // -----------------------------
        // LOG EMPLOYEE DATA
        // -----------------------------
        log(`
==========================
  EMPLOYEE GENERATED
==========================
First Name : ${emp.firstName}
Last Name  : ${emp.lastName}
Email      : ${emp.email}
Mobile     : ${emp.mobile}
Job Title  : ${emp.jobTitle}
==========================
`);

        // -----------------------------
        // FILL FORM
        // -----------------------------
        await this.page.locator(this.selectors.firstName).fill(emp.firstName);
        await this.page.locator(this.selectors.lastName).fill(emp.lastName);
        await this.page.locator(this.selectors.email).fill(emp.email);
        await this.page.locator(this.selectors.phone).fill(emp.mobile);
        await this.page.locator(this.selectors.jobTitle).fill(emp.jobTitle);

        // Select today's date
        await this.page.locator(this.selectors.datePicker).click();
        const today = new Date().getDate().toString();
        await this.page.getByText(today, { exact: true }).click();
    }

    async saveEmployee() {
        await this.page.locator(this.selectors.saveEmployeeBtn).click();
    }

    async addAnotherEmployee() {
        await this.page.locator(this.selectors.addAnotherBtn).click();
    }

    async exitForm() {
        await this.page.locator(this.selectors.closeModalBtn).click();
        await this.page.waitForSelector('[role="dialog"]', { state: 'hidden' });
    }

    async verifyEmployeesExist(employees) {
        log('Starting employee verification');

        await this.navigateToManageEmployees();

        for (const emp of employees) {
            await this.verifyEmployeeExists(emp);
        }

        log('All employees verified successfully');
    }

    private async navigateToManageEmployees() {
        await this.page.locator(this.selectors.employeesNav).click();
        await this.page.waitForURL(this.selectors.manageEmployeesUrl);
        await this.page.waitForLoadState('networkidle');
        log('Now on Manage Employees tab on Hub page with url: ' + this.page.url());
    }

    private async navigateToPermissions() {
        await this.page.locator(this.selectors.permissionsNav).click();
        await this.page.waitForURL(this.selectors.permissionsUrl);
        await this.page.waitForLoadState('networkidle');
        log('Now on Permissions tab on Hub page with url: ' + this.page.url());
    }

    private pickRandomSearchTerm(emp): string {
        const terms = [emp.firstName, emp.lastName, emp.jobTitle];
        const pickedTerm = terms[Math.floor(Math.random() * terms.length)];
        log(`Picked random search term [options: firstName/lastName/jobTitle]: ${pickedTerm}`);
        return pickedTerm;
    }

    private async searchForEmployee(term: string) {
        //To-Do: Need to jump tabs as workaround to get latest list of Employees loaded, this logic needs to be updated
        await this.navigateToPermissions();
        await this.navigateToManageEmployees();

        await this.page.locator(this.selectors.searchBox).clear();
        await this.page.locator(this.selectors.searchBox).fill(term);
        await expect(this.page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 10_000 });

        // To-Do: Currently using hard wait but later logic can be changed to make it dependent on API response
        await this.page.waitForTimeout(3000);
    }

    private async findMatchInResults(fullName: string, jobTitle: string): Promise<boolean> {
        const names = this.page.getByRole('heading', { level: 1 });
        const count = await names.count();
        const employeeResultsHeading = this.page.getByRole('heading', { name: /^Employees \(\d+\)$/, level: 3 });

        if (count < 1) {
            return false;
        }

        log(`Found: ${await employeeResultsHeading.textContent()}. Checking for match..`);

        const employeeHeading = this.page.getByRole('heading', {
            name: fullName,
            level: 1,
            exact: true
        }).first();

        try {
            await expect(employeeHeading).toBeVisible({ timeout: 10_000 });
            await expect(employeeHeading).toHaveText(fullName);
            await expect(employeeHeading.locator(this.selectors.employeeJobTitle)).toHaveText(jobTitle, { timeout: 5_000 });
            return true;
        } catch {
            log('Employee match failed for full name / job title')
            return false;
        }
    }

    private async verifyEmployeeExists(emp) {
        const fullName = `${emp.firstName} ${emp.lastName}`;
        const term = this.pickRandomSearchTerm(emp);

        log(`Searching for employee using term: ${term}`);

        await this.searchForEmployee(term);

        const match = await this.findMatchInResults(fullName, emp.jobTitle);

        if (!match) {
            log(`Employee NOT found: ${fullName}`);
            throw new Error(`Employee not found in list: ${fullName}`);
        }

        log(`Employee verified: ${fullName} (${emp.jobTitle})`);
    }

    async waitForEmployeeModalClose() {
        await this.page.waitForSelector('text=Add employee', { state: 'visible' });
    }

}
