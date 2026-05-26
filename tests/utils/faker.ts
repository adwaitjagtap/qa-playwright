export async function getFaker() {
    const fakerModule = await import('@faker-js/faker/locale/en_GB');
    return fakerModule.faker;
}
