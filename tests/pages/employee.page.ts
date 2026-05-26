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
        employeeNameHeading: 'h1', // heading level 1 for employee name
        employeeJobTitle: 'div >> nth=1', // job title under the name block
        manageEmployeesUrl: /employee-hub\/manage-employees/,
        employeesNav: '#main-content >> role=link[name="Employees"]'

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
        console.log(`
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
        await this.page.keyboard.press('Escape');
    }

    async verifyEmployeesExist(employees) {
        log('Starting employee verification');

        // Navigate to Manage Employees
        await this.page.locator(this.selectors.employeesNav).click();
        await this.page.waitForURL(this.selectors.manageEmployeesUrl);

        for (const emp of employees) {
            const fullName = `${emp.firstName} ${emp.lastName}`;

            // Pick random search term
            const terms = [emp.firstName, emp.lastName, emp.jobTitle];
            const term = terms[Math.floor(Math.random() * terms.length)];

            log(`Searching for employee using term: ${term}`);

            // Search
            await this.page.locator(this.selectors.searchBox).fill(term);
            await this.page.waitForTimeout(500);

            // Get all employee name headings returned
            const nameHeadings = this.page.locator(this.selectors.employeeNameHeading);
            const count = await nameHeadings.count();

            if (count === 0) {
                log(`No employees returned for search term: ${term}`);
                throw new Error(`Employee not found: ${fullName}`);
            }

            log(`Found ${count} employee record(s). Checking for match`);

            let found = false;

            for (let i = 0; i < count; i++) {
                const name = await nameHeadings.nth(i).textContent();
                const jobTitle = await nameHeadings
                    .nth(i)
                    .locator('xpath=../div[2]')
                    .textContent();

                if (
                    name?.trim() === fullName &&
                    jobTitle?.trim() === emp.jobTitle.trim()
                ) {
                    log(`Employee verified: ${fullName} (${emp.jobTitle})`);
                    found = true;
                    break;
                }
            }

            if (!found) {
                log(`Employee NOT found: ${fullName}`);
                throw new Error(`Employee not found in list: ${fullName}`);
            }
        }

        log('All employees verified successfully');
    }


}
