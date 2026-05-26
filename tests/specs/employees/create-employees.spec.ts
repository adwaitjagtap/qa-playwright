import { test } from '../../utils/test-fixtures';
import { EmployeePage } from '../../pages/employee.page';
import { generateEmployees } from '../../data/employees';

test('User create employees dynamically', async ({ page, loginPage }) => {
    test.setTimeout(2 * 60 * 1000); // 2 minutes for more than 8 employees; this can be adjusted as per test need. Default 30 sec.

    await loginPage.login(
        process.env.BRIGHTHR_USERNAME!,
        process.env.BRIGHTHR_PASSWORD!
    );

    const employeePage = new EmployeePage(page);

    const employees = await generateEmployees(2); // or any number

    await employeePage.navigate();

    // First employee
    console.log(`Creating employee: ${employees[0].firstName} ${employees[0].lastName}`);
    await employeePage.openAddEmployeeForm();
    await employeePage.fillEmployeeForm(employees[0]);
    await employeePage.saveEmployee();

    // Additional employees
    for (let i = 1; i < employees.length; i++) {
        console.log(`Creating employee: ${employees[i].firstName} ${employees[i].lastName}`);
        await employeePage.addAnotherEmployee();
        await employeePage.fillEmployeeForm(employees[i]);
        await employeePage.saveEmployee();
    }

    // Exit form
    await employeePage.exitForm();

    await employeePage.verifyEmployeesExist(employees);

    console.log('All employees created successfully');
});
