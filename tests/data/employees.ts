import { getFaker } from '../utils/faker';

export const generateEmployees = async (count: number) => {
    const faker = await getFaker();
    const employees = [];

    for (let i = 0; i < count; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();

        employees.push({
            firstName,
            lastName,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@mailinator.com`,
            mobile: `07${faker.string.numeric(9)}`,
            jobTitle: faker.person.jobTitle()
        });
    }

    return employees;
};
