// user mock data
const mockUserData = {
    username: "personatcompanytester",
    email: "personatcompanytester@strapi.com",
    provider: "local",
    password: "1234abc",
    confirmed: true,
    blocked: null,
};

it("COMMON-- PersonAtCompany: All text fields should be trimmed of white space", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        role,
    });

    const person = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Existing',
            MiddleName: '',
            LastName: 'Person',
            DirectoryName: 'Existing Person',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: user.id } ] },
        },
    });

    const company = await strapi.query("api::company.company").create({
        data: {
            Name: 'Existing Company',
            InvoiceCompanyName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
    
    const personAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: person.id } ] },
            Company: { disconnect: [], connect: [ { id: company.id } ] },
            JobTitle: 'Head of Stuff             ',
            Tagline: '     This is a tagline           ',
            Description: ' I would describe this person as a person.',
            Website: 'https://SomeProfessionalWebsite.com ',
            IsActive: true,
            IsArchived: false,
            CanManageCompanyDetails: false,
            CanManageCompanyStaff: false,
        },
    });

    expect(personAtCompany.JobTitle).toBe('Head of Stuff');
    expect(personAtCompany.Tagline).toBe('This is a tagline');
    expect(personAtCompany.Description).toBe('I would describe this person as a person.');
    expect(personAtCompany.Website).toBe('https://SomeProfessionalWebsite.com');
});