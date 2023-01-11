// user mock data
const mockUserData = {
    username: "companytester",
    email: "companytester@strapi.com",
    provider: "local",
    password: "1234abc",
    confirmed: true,
    blocked: null,
};

it("COMMON-- Company: Should populate InvoiceCompanyName with 'CompanyName' if InvoiceCompanyName is missing", async () => {
    var someTestCompany = await strapi.query("api::company.company").create({
        data: {
            Name: 'Some Test Company',
            InvoiceCompanyName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
     
    expect(someTestCompany.InvoiceCompanyName).toBe('Some Test Company');
});

it("COMMON-- Company: All text fields should be trimmed of white space", async () => {
    var someTestCompany = await strapi.query("api::company.company").create({
        data: {
            Name: '     Some Test Company',
            InvoiceCompanyName: 'Some Test Company             ',
            Tagline: '     This is a tagline           ',
            Description: ' I would describe Some Test Company as a company.',
            Website: 'https://SomeTestCompany.com ',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
    expect(someTestCompany.Name).toBe('Some Test Company');
    expect(someTestCompany.InvoiceCompanyName).toBe('Some Test Company');
    expect(someTestCompany.Tagline).toBe('This is a tagline')
    expect(someTestCompany.Description).toBe('I would describe Some Test Company as a company.');
    expect(someTestCompany.Website).toBe('https://SomeTestCompany.com');
});

it("COMMON-- Company: SearchableName should be Name transliterated and lower case", async () => {
    var someTestCompany = await strapi.query("api::company.company").create({
        data: {
            Name: 'Renée François Events',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
    expect(someTestCompany.SearchableName).toBe('renee francois events');
});