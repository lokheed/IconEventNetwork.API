const request = require('supertest');

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

it("COMMON-- Company: A user should be able to successfully update a company if their relevent PersonAtCompany record allows CanManageCompanyDetails", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'companytester2',
        email: 'companytester2@strapi.com',
        role,
    });
    expect(user.id).toBeDefined();
    expect(user.id).toBeGreaterThan(0);
 
    const person = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Company',
            MiddleName: '',
            LastName: 'Tester',
            DirectoryName: 'Company Tester',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: user.id } ] },
        },
    });
    expect(person.id).toBeDefined();
    expect(person.id).toBeGreaterThan(0);
 

    const company = await strapi.query("api::company.company").create({
        data: {
            Name: 'CanManageCompany Test Company',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
    expect(company.id).toBeDefined();
    expect(company.id).toBeGreaterThan(0);

    const personAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: person.id } ] },
            Company: { disconnect: [], connect: [ { id: company.id } ] },
            JobTitle: 'Admin',
            IsActive: true,
            IsArchived: false,
            CanManageCompanyDetails: true,
            CanManageCompanyStaff: false,
        },
    });
    expect(personAtCompany.id).toBeDefined();
    expect(personAtCompany.id).toBeGreaterThan(0);
   
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
    });
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .put("/api/companies/" + company.id)
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .send({
        "data": {
            "Name": "DidManageCompany Test Company",
        }
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.attributes.Name).toBe('DidManageCompany Test Company');
    });    
});

it("COMMON-- Company: A user should not be able to update a company if their relevent PersonAtCompany record does not CanManageCompanyDetails", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'companytester3',
        email: 'companytester3@strapi.com',
        role,
    });
    expect(user.id).toBeDefined();
    expect(user.id).toBeGreaterThan(0);
 
    const person = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Company',
            MiddleName: '',
            LastName: 'Tester',
            DirectoryName: 'Company Tester',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: user.id } ] },
        },
    });
    expect(person.id).toBeDefined();
    expect(person.id).toBeGreaterThan(0);
 

    const company = await strapi.query("api::company.company").create({
        data: {
            Name: 'CanManageCompany Test Company',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
    expect(company.id).toBeDefined();
    expect(company.id).toBeGreaterThan(0);

    const personAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: person.id } ] },
            Company: { disconnect: [], connect: [ { id: company.id } ] },
            JobTitle: 'Admin',
            IsActive: true,
            IsArchived: false,
            CanManageCompanyDetails: false,
            CanManageCompanyStaff: false,
        },
    });
    expect(personAtCompany.id).toBeDefined();
    expect(personAtCompany.id).toBeGreaterThan(0);
   
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
    });
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .put("/api/companies/" + company.id)
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .send({
        "data": {
            "Name": "DidManageCompany Test Company",
        }
    })
    .expect("Content-Type", /json/)
    .expect(403)  
});

it("COMMON-- Company: A user should not be able to update a company if they do not have a PersonAtCompany record for that company", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'companytester4',
        email: 'companytester4@strapi.com',
        role,
    });
    expect(user.id).toBeDefined();
    expect(user.id).toBeGreaterThan(0);
 
    const person = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Company',
            MiddleName: '',
            LastName: 'Tester',
            DirectoryName: 'Company Tester',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: user.id } ] },
        },
    });
    expect(person.id).toBeDefined();
    expect(person.id).toBeGreaterThan(0);
 

    const company = await strapi.query("api::company.company").create({
        data: {
            Name: 'CanManageCompany Test Company',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
    expect(company.id).toBeDefined();
    expect(company.id).toBeGreaterThan(0);
   
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
    });
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .put("/api/companies/" + company.id)
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .send({
        "data": {
            "Name": "DidManageCompany Test Company",
        }
    })
    .expect("Content-Type", /json/)
    .expect(403)  
});