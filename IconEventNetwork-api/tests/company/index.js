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

it("COMMON-- Company: A user should be able to successfully update a company if their relevent PersonAtCompany record is active and allows CanManageCompanyDetails", async () => {
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

it("COMMON-- Company: A user should be able to view and manage a company if their relevent PersonAtCompany record is active and allows CanManageCompanyDetails", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'companytester5',
        email: 'companytester5@strapi.com',
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
    .get("/api/companies/security/" + company.id)
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.canManageCompanyDetails).toBeDefined();
        expect(data.body.canManageCompanyDetails).toBe(true);
        expect(data.body.canViewCompanyDetails).toBeDefined();
        expect(data.body.canViewCompanyDetails).toBe(true);
    });    
});

it("COMMON-- Company: A user should not be able to view but not manage a company if their relevent PersonAtCompany record does not CanManageCompanyDetails", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'companytester6',
        email: 'companytester6@strapi.com',
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
    .get("/api/companies/security/" + company.id)
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.canManageCompanyDetails).toBeDefined();
        expect(data.body.canManageCompanyDetails).toBe(false);
        expect(data.body.canViewCompanyDetails).toBeDefined();
        expect(data.body.canViewCompanyDetails).toBe(true);
    });    
});

it("COMMON-- Company: A user should not be able to view or manage a company if they do not have a PersonAtCompany record for that company", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'companytester7',
        email: 'companytester7@strapi.com',
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
    .get("/api/companies/security/" + company.id)
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(403);  
});

it("COMMON-- Company: A user should be able to view but not manage a company if they have a PersonAtCompany record for that company's parent", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'companytester9',
        email: 'companytester9@strapi.com',
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
 
    const parentCompany = await strapi.query("api::company.company").create({
        data: {
            Name: 'Test Parent Company',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
    expect(parentCompany.id).toBeDefined();
    expect(parentCompany.id).toBeGreaterThan(0);

    const personAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: person.id } ] },
            Company: { disconnect: [], connect: [ { id: parentCompany.id } ] },
            JobTitle: 'Admin',
            IsActive: true,
            IsArchived: false,
            CanManageCompanyDetails: true,
            CanManageCompanyStaff: false,
        },
    });
    expect(personAtCompany.id).toBeDefined();
    expect(personAtCompany.id).toBeGreaterThan(0);
 
    const childCompany = await strapi.query("api::company.company").create({
        data: {
            Name: 'Test Child Company',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            ParentCompanyId: parentCompany.id,
        },
    });
    expect(childCompany.id).toBeDefined();
    expect(childCompany.id).toBeGreaterThan(0);
   
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
    });
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/companies/security/" + childCompany.id)
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.canManageCompanyDetails).toBeDefined();
        expect(data.body.canManageCompanyDetails).toBe(false);
        expect(data.body.canViewCompanyDetails).toBeDefined();
        expect(data.body.canViewCompanyDetails).toBe(true);
    });    
});

it("COMMON-- Company: A user should be able to view but not manage a company if they have a PersonAtCompany record for that company's child", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'companytester10',
        email: 'companytester10@strapi.com',
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
 
    const parentCompany = await strapi.query("api::company.company").create({
        data: {
            Name: 'Test Parent Company',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
    expect(parentCompany.id).toBeDefined();
    expect(parentCompany.id).toBeGreaterThan(0);
 
    const childCompany = await strapi.query("api::company.company").create({
        data: {
            Name: 'Test Child Company',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            ParentCompanyId: parentCompany.id
        },
    });
    expect(childCompany.id).toBeDefined();
    expect(childCompany.id).toBeGreaterThan(0);

    const personAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: person.id } ] },
            Company: { disconnect: [], connect: [ { id: childCompany.id } ] },
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
    .get("/api/companies/security/" + parentCompany.id)
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.canManageCompanyDetails).toBeDefined();
        expect(data.body.canManageCompanyDetails).toBe(false);
        expect(data.body.canViewCompanyDetails).toBeDefined();
        expect(data.body.canViewCompanyDetails).toBe(true);
    });    
});

it("COMMON-- Company: A user should be able to view but not manage a company if they have a PersonAtCompany record for that company's sibling", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'companytester11',
        email: 'companytester11@strapi.com',
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
 
    const parentCompany = await strapi.query("api::company.company").create({
        data: {
            Name: 'Test Parent Company',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
    expect(parentCompany.id).toBeDefined();
    expect(parentCompany.id).toBeGreaterThan(0);
 
    const childCompany = await strapi.query("api::company.company").create({
        data: {
            Name: 'Test Child Company',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            ParentCompanyId: parentCompany.id
        },
    });
    expect(childCompany.id).toBeDefined();
    expect(childCompany.id).toBeGreaterThan(0);
 
    const siblingCompany = await strapi.query("api::company.company").create({
        data: {
            Name: 'Test Child Company',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            ParentCompanyId: parentCompany.id
        },
    });
    expect(siblingCompany.id).toBeDefined();
    expect(siblingCompany.id).toBeGreaterThan(0);

    const personAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: person.id } ] },
            Company: { disconnect: [], connect: [ { id: siblingCompany.id } ] },
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
    .get("/api/companies/security/" + childCompany.id)
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.canManageCompanyDetails).toBeDefined();
        expect(data.body.canManageCompanyDetails).toBe(false);
        expect(data.body.canViewCompanyDetails).toBeDefined();
        expect(data.body.canViewCompanyDetails).toBe(true);
    });    
});