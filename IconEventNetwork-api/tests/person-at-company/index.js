const request = require('supertest');

// user mock data
const mockUserData = {
    username: "personatcompanytester",
    email: "personatcompanytester@strapi.com",
    provider: "local",
    password: "1234abc",
    confirmed: true,
    blocked: null,
};

it("COMMON-- PersonAtCompany: All text fields should be trimmed of white space.", async () => {
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
    expect(person.id).toBeDefined();
    expect(person.id).toBeGreaterThan(0);

    const company = await strapi.query("api::company.company").create({
        data: {
            Name: 'Existing Company',
            InvoiceCompanyName: '',
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
            JobTitle: 'Head of Stuff             ',
            Bio: ' I would describe this person as a person.',
            IsActive: true,
            IsArchived: false,
            CanManageCompanyDetails: false,
            CanManageCompanyStaff: false,
        },
    });

    expect(personAtCompany.id).toBeDefined();
    expect(personAtCompany.id).toBeGreaterThan(0);
    expect(personAtCompany.JobTitle).toBe('Head of Stuff');
    expect(personAtCompany.Bio).toBe('I would describe this person as a person.');
});

it("COMMON-- PersonAtCompany: A user should never be able to change Person once the record is created.", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester2',
        email: 'personatcompanytester2@strapi.com',
        role,
    });
    expect(user.id).toBeDefined();
    expect(user.id).toBeGreaterThan(0);

    const otherUser = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester3',
        email: 'personatcompanytester3@strapi.com',
        role,
    });
    expect(otherUser.id).toBeDefined();
    expect(otherUser.id).toBeGreaterThan(0);

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
    expect(person.id).toBeDefined();
    expect(person.id).toBeGreaterThan(0);

    const otherPerson = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Other',
            MiddleName: '',
            LastName: 'Person',
            DirectoryName: 'Other Person',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: otherUser.id } ] },
        },
    });
    expect(otherPerson.id).toBeDefined();
    expect(otherPerson.id).toBeGreaterThan(0);

    const company = await strapi.query("api::company.company").create({
        data: {
            Name: 'Existing Company',
            InvoiceCompanyName: '',
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
            JobTitle: 'Head of Stuff             ',
            Bio: ' I would describe this person as a person.',
            IsActive: true,
            IsArchived: false,
            CanManageCompanyDetails: false,
            CanManageCompanyStaff: false,
        },
    });
    expect(personAtCompany.id).toBeDefined();
    expect(personAtCompany.id).toBeGreaterThan(0);

    const updatedPersonAtCompany = await strapi.entityService.update('api::person-at-company.person-at-company', personAtCompany.id, {
        data: {
            Person: { disconnect: [ { id: person.id } ], connect: [ { id: otherPerson.id } ] },
         },
    });
    const postUpdatePersonAtCompany = await strapi.entityService.findOne('api::person-at-company.person-at-company', personAtCompany.id, {
        populate: { Person: true },
    });

    expect(postUpdatePersonAtCompany.Person).toBeDefined();
    expect(postUpdatePersonAtCompany.Person.id).toBeDefined();
    expect(postUpdatePersonAtCompany.Person.id).toBe(person.id);
});

it("COMMON-- PersonAtCompany: A user should never be able to change Company once the record is created.", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester4',
        email: 'personatcompanytester4@strapi.com',
        role,
    });
    expect(user.id).toBeDefined();
    expect(user.id).toBeGreaterThan(0);

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
    expect(person.id).toBeDefined();
    expect(person.id).toBeGreaterThan(0);

    const company = await strapi.query("api::company.company").create({
        data: {
            Name: 'Existing Company',
            InvoiceCompanyName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
    expect(company.id).toBeDefined();
    expect(company.id).toBeGreaterThan(0);
 
    const otherCompany = await strapi.query("api::company.company").create({
        data: {
            Name: 'Other Company',
            InvoiceCompanyName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
    expect(otherCompany.id).toBeDefined();
    expect(otherCompany.id).toBeGreaterThan(0);
  
    const personAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: person.id } ] },
            Company: { disconnect: [], connect: [ { id: company.id } ] },
            JobTitle: 'Head of Stuff             ',
            Bio: ' I would describe this person as a person.',
            IsActive: true,
            IsArchived: false,
            CanManageCompanyDetails: false,
            CanManageCompanyStaff: false,
        },
    });
    expect(personAtCompany.id).toBeDefined();
    expect(personAtCompany.id).toBeGreaterThan(0);

    const updatedPersonAtCompany = await strapi.entityService.update('api::person-at-company.person-at-company', personAtCompany.id, {
        data: {
             Company: { disconnect: [ { id: company.id } ], connect: [ { id: otherCompany.id } ] },
        },
    });
    const postUpdatePersonAtCompany = await strapi.entityService.findOne('api::person-at-company.person-at-company', personAtCompany.id, {
        populate: { Company: true },
    });

    expect(postUpdatePersonAtCompany.Company).toBeDefined();
    expect(postUpdatePersonAtCompany.Company.id).toBeDefined();
    expect(postUpdatePersonAtCompany.Company.id).toBe(company.id);
});

it("COMMON-- PersonAtCompany: A user should be able to modify the profile fields on their own PersonAtCompany record if that record is not active.", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester5',
        email: 'personatcompanytester5@strapi.com',
        role,
    });
    expect(user.id).toBeDefined();
    expect(user.id).toBeGreaterThan(0);

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
    expect(person.id).toBeDefined();
    expect(person.id).toBeGreaterThan(0);

    const company = await strapi.query("api::company.company").create({
        data: {
            Name: 'Existing Company',
            InvoiceCompanyName: '',
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
            JobTitle: 'Head of Stuff',
            Bio: 'I would describe this person as a person.',
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
    .put("/api/people-at-companies/" + personAtCompany.id)
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .send({
        "data": {
            "JobTitle": "Head of Other Stuff",
            "Bio": "I would describe this person as a different person.",
        }
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.attributes.JobTitle).toBe('Head of Other Stuff');
        expect(data.body.data.attributes.Bio).toBe('I would describe this person as a different person.');
    });    
});

it("COMMON-- PersonAtCompany: An active PersonAtCompany staff admin should not be able to modify the profile fields on another company's PersonAtCompany records.", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    const company = await strapi.query("api::company.company").create({
        data: {
            Name: 'Existing Company',
            InvoiceCompanyName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
    expect(company.id).toBeDefined();
    expect(company.id).toBeGreaterThan(0);

    /** Creates a new user an push to database */
    const staffAdminUser = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester15',
        email: 'personatcompanytester15@strapi.com',
        role,
    });
    expect(staffAdminUser.id).toBeDefined();
    expect(staffAdminUser.id).toBeGreaterThan(0);

    const staffAdminPerson = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Staff',
            MiddleName: 'Admin',
            LastName: 'Person',
            DirectoryName: 'Staff Admin Person',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: staffAdminUser.id } ] },
        },
    });
    expect(staffAdminPerson.id).toBeDefined();
    expect(staffAdminPerson.id).toBeGreaterThan(0);

    const staffAdminPersonAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: staffAdminPerson.id } ] },
            Company: { disconnect: [], connect: [ { id: company.id } ] },
            JobTitle: 'Staff Admin',
             IsActive: true,
            IsArchived: false,
            CanManageCompanyDetails: false,
            CanManageCompanyStaff: true,
        },
    });
    expect(staffAdminPersonAtCompany.id).toBeDefined();
    expect(staffAdminPersonAtCompany.id).toBeGreaterThan(0);

    const otherCompany = await strapi.query("api::company.company").create({
        data: {
            Name: 'Other Company',
            InvoiceCompanyName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
    expect(otherCompany.id).toBeDefined();
    expect(otherCompany.id).toBeGreaterThan(0);

    const otherCompanyStaffUser = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester16',
        email: 'personatcompanytester16@strapi.com',
        role,
    });
    expect(otherCompanyStaffUser.id).toBeDefined();
    expect(otherCompanyStaffUser.id).toBeGreaterThan(0);

    const otherCompanyStaffPerson = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Staff',
            MiddleName: '',
            LastName: 'Person',
            DirectoryName: 'Staff Person',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: otherCompanyStaffUser.id } ] },
        },
    });
    expect(otherCompanyStaffPerson.id).toBeDefined();
    expect(otherCompanyStaffPerson.id).toBeGreaterThan(0);
 
    const otherCompanyStaffPersonAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: otherCompanyStaffPerson.id } ] },
            Company: { disconnect: [], connect: [ { id: otherCompany.id } ] },
            JobTitle: 'Staff',
            IsActive: true,
            IsArchived: false,
            CanManageCompanyDetails: false,
            CanManageCompanyStaff: false,
        },
    });
    expect(otherCompanyStaffPersonAtCompany.id).toBeDefined();
    expect(otherCompanyStaffPersonAtCompany.id).toBeGreaterThan(0);
  
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: staffAdminUser.id,
    });
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .put("/api/people-at-companies/" + otherCompanyStaffPersonAtCompany.id)
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .send({
        "data": {
            "JobTitle": "Other Staff",
        }
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.attributes.JobTitle).toBe('Staff');
    });    
});

it("COMMON-- PersonAtCompany: An active PersonAtCompany staff admin should be able to modify the profile fields on their staff's PersonAtCompany record.", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    const company = await strapi.query("api::company.company").create({
        data: {
            Name: 'Existing Company',
            InvoiceCompanyName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
    expect(company.id).toBeDefined();
    expect(company.id).toBeGreaterThan(0);

    /** Creates a new user an push to database */
    const staffAdminUser = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester6',
        email: 'personatcompanytester6@strapi.com',
        role,
    });
    expect(staffAdminUser.id).toBeDefined();
    expect(staffAdminUser.id).toBeGreaterThan(0);

    const staffAdminPerson = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Staff',
            MiddleName: 'Admin',
            LastName: 'Person',
            DirectoryName: 'Staff Admin Person',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: staffAdminUser.id } ] },
        },
    });
    expect(staffAdminPerson.id).toBeDefined();
    expect(staffAdminPerson.id).toBeGreaterThan(0);

    const staffAdminPersonAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: staffAdminPerson.id } ] },
            Company: { disconnect: [], connect: [ { id: company.id } ] },
            JobTitle: 'Staff Admin',
             IsActive: true,
            IsArchived: false,
            CanManageCompanyDetails: false,
            CanManageCompanyStaff: true,
        },
    });
    expect(staffAdminPersonAtCompany.id).toBeDefined();
    expect(staffAdminPersonAtCompany.id).toBeGreaterThan(0);

    const staffUser = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester7',
        email: 'personatcompanytester7@strapi.com',
        role,
    });
    expect(staffUser.id).toBeDefined();
    expect(staffUser.id).toBeGreaterThan(0);

    const staffPerson = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Staff',
            MiddleName: '',
            LastName: 'Person',
            DirectoryName: 'Staff Person',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: staffUser.id } ] },
        },
    });
    expect(staffPerson.id).toBeDefined();
    expect(staffPerson.id).toBeGreaterThan(0);
 
    const staffPersonAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: staffPerson.id } ] },
            Company: { disconnect: [], connect: [ { id: company.id } ] },
            JobTitle: 'Staff',
            IsActive: true,
            IsArchived: false,
            CanManageCompanyDetails: false,
            CanManageCompanyStaff: false,
        },
    });
    expect(staffPersonAtCompany.id).toBeDefined();
    expect(staffPersonAtCompany.id).toBeGreaterThan(0);
  
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: staffAdminUser.id,
    });
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .put("/api/people-at-companies/" + staffPersonAtCompany.id)
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .send({
        "data": {
            "JobTitle": "Other Staff",
        }
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.attributes.JobTitle).toBe('Other Staff');
    });    
});

it("COMMON-- PersonAtCompany: An inactive PersonAtCompany staff admin should not be able to modify the profile fields on their staff's PersonAtCompany record.", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    const company = await strapi.query("api::company.company").create({
        data: {
            Name: 'Existing Company',
            InvoiceCompanyName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
    expect(company.id).toBeDefined();
    expect(company.id).toBeGreaterThan(0);

    /** Creates a new user an push to database */
    const staffAdminUser = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester20',
        email: 'personatcompanytester20@strapi.com',
        role,
    });
    expect(staffAdminUser.id).toBeDefined();
    expect(staffAdminUser.id).toBeGreaterThan(0);

    const staffAdminPerson = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Staff',
            MiddleName: 'Admin',
            LastName: 'Person',
            DirectoryName: 'Staff Admin Person',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: staffAdminUser.id } ] },
        },
    });
    expect(staffAdminPerson.id).toBeDefined();
    expect(staffAdminPerson.id).toBeGreaterThan(0);

    const staffAdminPersonAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: staffAdminPerson.id } ] },
            Company: { disconnect: [], connect: [ { id: company.id } ] },
            JobTitle: 'Staff Admin',
            IsActive: false,
            IsArchived: false,
            CanManageCompanyDetails: false,
            CanManageCompanyStaff: true,
        },
    });
    expect(staffAdminPersonAtCompany.id).toBeDefined();
    expect(staffAdminPersonAtCompany.id).toBeGreaterThan(0);

    const staffUser = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester21',
        email: 'personatcompanytester21@strapi.com',
        role,
    });
    expect(staffUser.id).toBeDefined();
    expect(staffUser.id).toBeGreaterThan(0);

    const staffPerson = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Staff',
            MiddleName: '',
            LastName: 'Person',
            DirectoryName: 'Staff Person',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: staffUser.id } ] },
        },
    });
    expect(staffPerson.id).toBeDefined();
    expect(staffPerson.id).toBeGreaterThan(0);
 
    const staffPersonAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: staffPerson.id } ] },
            Company: { disconnect: [], connect: [ { id: company.id } ] },
            JobTitle: 'Staff',
            IsActive: true,
            IsArchived: false,
            CanManageCompanyDetails: false,
            CanManageCompanyStaff: false,
        },
    });
    expect(staffPersonAtCompany.id).toBeDefined();
    expect(staffPersonAtCompany.id).toBeGreaterThan(0);
  
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: staffAdminUser.id,
    });
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .put("/api/people-at-companies/" + staffPersonAtCompany.id)
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .send({
        "data": {
            "JobTitle": "Other Staff",
        }
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.attributes.JobTitle).toBe('Staff');
    });    
});

it("COMMON-- PersonAtCompany: A user should not be able to modify the profile fields on a PersonAtCompany record if they are neither that person nor a staff admin for that company.", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester8',
        email: 'personatcompanytester8@strapi.com',
        role,
    });
    expect(user.id).toBeDefined();
    expect(user.id).toBeGreaterThan(0);

    const evilUser = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester9',
        email: 'personatcompanytester9@strapi.com',
        role,
    });
    expect(evilUser.id).toBeDefined();
    expect(evilUser.id).toBeGreaterThan(0);

    const staffPerson = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Staff',
            MiddleName: '',
            LastName: 'Person',
            DirectoryName: 'Staff Person',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: user.id } ] },
        },
    });
    expect(staffPerson.id).toBeDefined();
    expect(staffPerson.id).toBeGreaterThan(0);

    const company = await strapi.query("api::company.company").create({
        data: {
            Name: 'Existing Company',
            InvoiceCompanyName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
    expect(company.id).toBeDefined();
    expect(company.id).toBeGreaterThan(0);

    const staffPersonAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: staffPerson.id } ] },
            Company: { disconnect: [], connect: [ { id: company.id } ] },
            JobTitle: 'Staff',
            Bio: 'I would describe this person as a person.',
            IsActive: true,
            IsArchived: false,
            CanManageCompanyDetails: false,
            CanManageCompanyStaff: false,
        },
    });
    expect(staffPersonAtCompany.id).toBeDefined();
    expect(staffPersonAtCompany.id).toBeGreaterThan(0);
  
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: evilUser.id,
    });
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .put("/api/people-at-companies/" + staffPersonAtCompany.id)
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .send({
        "data": {
            "JobTitle": "Other Staff",
            "Bio": "I would describe this person as a different person.",
        }
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.attributes.JobTitle).toBe('Staff');
        expect(data.body.data.attributes.Bio).toBe('I would describe this person as a person.');
    });    
});

it("COMMON-- PersonAtCompany: A user should not be able to modify the IsActive or IsArchived flags on their own PersonAtCompany record.", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester10',
        email: 'personatcompanytester10@strapi.com',
        role,
    });
    expect(user.id).toBeDefined();
    expect(user.id).toBeGreaterThan(0);

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
    expect(person.id).toBeDefined();
    expect(person.id).toBeGreaterThan(0);

    const company = await strapi.query("api::company.company").create({
        data: {
            Name: 'Existing Company',
            InvoiceCompanyName: '',
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
            JobTitle: 'Head of Stuff',
            Bio: 'I would describe this person as a person.',
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
    .put("/api/people-at-companies/" + personAtCompany.id)
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .send({
        "data": {
            "IsActive": false,
            "IsArchived": true,
        }
    })
    .expect("Content-Type", /json/)
    .expect(200)

    // These fields are private and not returned in the public API call. Verify the submitted changes were not persisted.
    const thisPersonAtCompany = await strapi.entityService.findOne('api::person-at-company.person-at-company', personAtCompany.id, {});
    expect(thisPersonAtCompany.IsActive).toBe(true);
    expect(thisPersonAtCompany.IsArchived).toBe(false);
 });

it("COMMON-- PersonAtCompany: An active PersonAtCompany staff admin should be able to modify the IsActive or IsArchived flags on their staff's PersonAtCompany record.", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    const company = await strapi.query("api::company.company").create({
        data: {
            Name: 'Existing Company',
            InvoiceCompanyName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
    expect(company.id).toBeDefined();
    expect(company.id).toBeGreaterThan(0);

    /** Creates a new user an push to database */
    const staffAdminUser = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester11',
        email: 'personatcompanytester11@strapi.com',
        role,
    });
    expect(staffAdminUser.id).toBeDefined();
    expect(staffAdminUser.id).toBeGreaterThan(0);

    const staffAdminPerson = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Staff',
            MiddleName: 'Admin',
            LastName: 'Person',
            DirectoryName: 'Staff Admin Person',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: staffAdminUser.id } ] },
        },
    });
    expect(staffAdminPerson.id).toBeDefined();
    expect(staffAdminPerson.id).toBeGreaterThan(0);

    const staffAdminPersonAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: staffAdminPerson.id } ] },
            Company: { disconnect: [], connect: [ { id: company.id } ] },
            JobTitle: 'Staff Admin',
            IsActive: true,
            IsArchived: false,
            CanManageCompanyDetails: false,
            CanManageCompanyStaff: true,
        },
    });
    expect(staffAdminPersonAtCompany.id).toBeDefined();
    expect(staffAdminPersonAtCompany.id).toBeGreaterThan(0);

    const staffUser = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester12',
        email: 'personatcompanytester12@strapi.com',
        role,
    });
    expect(staffUser.id).toBeDefined();
    expect(staffUser.id).toBeGreaterThan(0);

    const staffPerson = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Staff',
            MiddleName: '',
            LastName: 'Person',
            DirectoryName: 'Staff Person',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: staffUser.id } ] },
        },
    });
    expect(staffPerson.id).toBeDefined();
    expect(staffPerson.id).toBeGreaterThan(0);
 
    const staffPersonAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: staffPerson.id } ] },
            Company: { disconnect: [], connect: [ { id: company.id } ] },
            JobTitle: 'Staff',
            IsActive: true,
            IsArchived: false,
            CanManageCompanyDetails: false,
            CanManageCompanyStaff: false,
        },
    });
    expect(staffPersonAtCompany.id).toBeDefined();
    expect(staffPersonAtCompany.id).toBeGreaterThan(0);
  
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: staffAdminUser.id,
    });
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .put("/api/people-at-companies/" + staffPersonAtCompany.id)
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .send({
        "data": {
            "IsActive": false,
            "IsArchived": true,
        }
    })
    .expect("Content-Type", /json/)
    .expect(200)
 
    // These fields are private and not returned in the public API call. Verify the submitted changes were not persisted.
    const thisPersonAtCompany = await strapi.entityService.findOne('api::person-at-company.person-at-company', staffPersonAtCompany.id, {});
    expect(thisPersonAtCompany.IsActive).toBe(false);
    expect(thisPersonAtCompany.IsArchived).toBe(true);
});

it("COMMON-- PersonAtCompany: An inactive PersonAtCompany staff admin should not be able to modify the IsActive or IsArchived flags on their staff's PersonAtCompany record.", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    const company = await strapi.query("api::company.company").create({
        data: {
            Name: 'Existing Company',
            InvoiceCompanyName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
    expect(company.id).toBeDefined();
    expect(company.id).toBeGreaterThan(0);

    /** Creates a new user an push to database */
    const staffAdminUser = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester17',
        email: 'personatcompanytester17@strapi.com',
        role,
    });
    expect(staffAdminUser.id).toBeDefined();
    expect(staffAdminUser.id).toBeGreaterThan(0);

    const staffAdminPerson = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Staff',
            MiddleName: 'Admin',
            LastName: 'Person',
            DirectoryName: 'Staff Admin Person',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: staffAdminUser.id } ] },
        },
    });
    expect(staffAdminPerson.id).toBeDefined();
    expect(staffAdminPerson.id).toBeGreaterThan(0);

    const staffAdminPersonAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: staffAdminPerson.id } ] },
            Company: { disconnect: [], connect: [ { id: company.id } ] },
            JobTitle: 'Staff Admin',
            IsActive: false,
            IsArchived: false,
            CanManageCompanyDetails: false,
            CanManageCompanyStaff: true,
        },
    });
    expect(staffAdminPersonAtCompany.id).toBeDefined();
    expect(staffAdminPersonAtCompany.id).toBeGreaterThan(0);

    const staffUser = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester18',
        email: 'personatcompanytester18@strapi.com',
        role,
    });
    expect(staffUser.id).toBeDefined();
    expect(staffUser.id).toBeGreaterThan(0);

    const staffPerson = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Staff',
            MiddleName: '',
            LastName: 'Person',
            DirectoryName: 'Staff Person',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: staffUser.id } ] },
        },
    });
    expect(staffPerson.id).toBeDefined();
    expect(staffPerson.id).toBeGreaterThan(0);
 
    const staffPersonAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: staffPerson.id } ] },
            Company: { disconnect: [], connect: [ { id: company.id } ] },
            JobTitle: 'Staff',
            IsActive: true,
            IsArchived: false,
            CanManageCompanyDetails: false,
            CanManageCompanyStaff: false,
        },
    });
    expect(staffPersonAtCompany.id).toBeDefined();
    expect(staffPersonAtCompany.id).toBeGreaterThan(0);
  
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: staffAdminUser.id,
    });
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .put("/api/people-at-companies/" + staffPersonAtCompany.id)
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .send({
        "data": {
            "IsActive": false,
            "IsArchived": true,
        }
    })
    .expect("Content-Type", /json/)
    .expect(200)
 
    // These fields are private and not returned in the public API call. Verify the submitted changes were not persisted.
    const thisPersonAtCompany = await strapi.entityService.findOne('api::person-at-company.person-at-company', staffPersonAtCompany.id, {});
    expect(thisPersonAtCompany.IsActive).toBe(true);
    expect(thisPersonAtCompany.IsArchived).toBe(false);
});

it("COMMON-- PersonAtCompany: A user should not be able to modify the IsActive and IsArchived flags on a PersonAtCompany record if they are not a staff admin for that company.", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester13',
        email: 'personatcompanytester13@strapi.com',
        role,
    });
    expect(user.id).toBeDefined();
    expect(user.id).toBeGreaterThan(0);

    const evilUser = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester14',
        email: 'personatcompanytester14@strapi.com',
        role,
    });
    expect(evilUser.id).toBeDefined();
    expect(evilUser.id).toBeGreaterThan(0);

    const staffPerson = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Staff',
            MiddleName: '',
            LastName: 'Person',
            DirectoryName: 'Staff Person',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: user.id } ] },
        },
    });
    expect(staffPerson.id).toBeDefined();
    expect(staffPerson.id).toBeGreaterThan(0);

    const company = await strapi.query("api::company.company").create({
        data: {
            Name: 'Existing Company',
            InvoiceCompanyName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
    expect(company.id).toBeDefined();
    expect(company.id).toBeGreaterThan(0);

    const staffPersonAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: staffPerson.id } ] },
            Company: { disconnect: [], connect: [ { id: company.id } ] },
            JobTitle: 'Staff',
            Bio: 'I would describe this person as a person.',
            IsActive: true,
            IsArchived: false,
            CanManageCompanyDetails: false,
            CanManageCompanyStaff: false,
        },
    });
    expect(staffPersonAtCompany.id).toBeDefined();
    expect(staffPersonAtCompany.id).toBeGreaterThan(0);
  
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: evilUser.id,
    });
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .put("/api/people-at-companies/" + staffPersonAtCompany.id)
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .send({
        "data": {
            "IsActive": false,
            "IsArchived": true,
       }
    })
    .expect("Content-Type", /json/)
    .expect(200)

    // These fields are private and not returned in the public API call. Verify the submitted changes were not persisted.
    const thisPersonAtCompany = await strapi.entityService.findOne('api::person-at-company.person-at-company', staffPersonAtCompany.id, {});
    expect(thisPersonAtCompany.IsActive).toBe(true);
    expect(thisPersonAtCompany.IsArchived).toBe(false);
});

it("COMMON-- PersonAtCompany: A user should not be able to modify the CanManageCompany or CanManageCompanyStaff flags on a PersonAtCompany record if they are not an active PersonAtCompany staff admin for that company.", async () => {
   /** Gets the default user role */
   const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

   const role = defaultRole ? defaultRole.id : null;

   /** Creates a new user an push to database */
   const user = await strapi.plugins['users-permissions'].services.user.add({
       ...mockUserData,
       username: 'personatcompanytester23',
       email: 'personatcompanytester23@strapi.com',
       role,
   });
   expect(user.id).toBeDefined();
   expect(user.id).toBeGreaterThan(0);

   const evilUser = await strapi.plugins['users-permissions'].services.user.add({
       ...mockUserData,
       username: 'personatcompanytester24',
       email: 'personatcompanytester24@strapi.com',
       role,
   });
   expect(evilUser.id).toBeDefined();
   expect(evilUser.id).toBeGreaterThan(0);

   const staffPerson = await strapi.query("api::person.person").create({
       data: {
           FirstName: 'Staff',
           MiddleName: '',
           LastName: 'Person',
           DirectoryName: 'Staff Person',
           SearchableName: '',
           IsActive: true,
           IsArchived: false,
           IsHidden: false,
           Users: { disconnect: [], connect: [ { id: user.id } ] },
       },
   });
   expect(staffPerson.id).toBeDefined();
   expect(staffPerson.id).toBeGreaterThan(0);

   const company = await strapi.query("api::company.company").create({
       data: {
           Name: 'Existing Company',
           InvoiceCompanyName: '',
           IsActive: true,
           IsArchived: false,
           IsHidden: false,
       },
   });
   expect(company.id).toBeDefined();
   expect(company.id).toBeGreaterThan(0);

   const staffPersonAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
       data: {
           Person: { disconnect: [], connect: [ { id: staffPerson.id } ] },
           Company: { disconnect: [], connect: [ { id: company.id } ] },
           JobTitle: 'Staff',
           Bio: 'I would describe this person as a person.',
           IsActive: true,
           IsArchived: false,
           CanManageCompanyDetails: false,
           CanManageCompanyStaff: false,
       },
   });
   expect(staffPersonAtCompany.id).toBeDefined();
   expect(staffPersonAtCompany.id).toBeGreaterThan(0);
 
   const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
       id: evilUser.id,
   });
     
   await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
   .put("/api/people-at-companies/" + staffPersonAtCompany.id)
   .set('accept', 'application/json')
   .set('Content-Type', 'application/json')
   .set('Authorization', 'Bearer ' + jwt)
   .send({
       "data": {
           "CanManageCompanyDetails": true,
           "CanManageCompanyStaff": true,
       }
   })
   .expect("Content-Type", /json/)
   .expect(200)  

    // These fields are private and not returned in the public API call. Verify the submitted changes were not persisted.
    const thisPersonAtCompany = await strapi.entityService.findOne('api::person-at-company.person-at-company', staffPersonAtCompany.id, {});
    expect(thisPersonAtCompany.CanManageCompanyDetails).toBe(false);
    expect(thisPersonAtCompany.CanManageCompanyStaff).toBe(false);
});

it("COMMON-- PersonAtCompany: An active PersonAtCompany staff admin should be able to modify the CanManageCompany and CanManageCompanyStaff flags on their staff's PersonAtCompany record that is not their own.", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    const company = await strapi.query("api::company.company").create({
        data: {
            Name: 'Existing Company',
            InvoiceCompanyName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
    expect(company.id).toBeDefined();
    expect(company.id).toBeGreaterThan(0);

    /** Creates a new user an push to database */
    const staffAdminUser = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester25',
        email: 'personatcompanytester25@strapi.com',
        role,
    });
    expect(staffAdminUser.id).toBeDefined();
    expect(staffAdminUser.id).toBeGreaterThan(0);

    const staffAdminPerson = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Staff',
            MiddleName: 'Admin',
            LastName: 'Person',
            DirectoryName: 'Staff Admin Person',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: staffAdminUser.id } ] },
        },
    });
    expect(staffAdminPerson.id).toBeDefined();
    expect(staffAdminPerson.id).toBeGreaterThan(0);

    const staffAdminPersonAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: staffAdminPerson.id } ] },
            Company: { disconnect: [], connect: [ { id: company.id } ] },
            JobTitle: 'Staff Admin',
            IsActive: true,
            IsArchived: false,
            CanManageCompanyDetails: false,
            CanManageCompanyStaff: true,
        },
    });
    expect(staffAdminPersonAtCompany.id).toBeDefined();
    expect(staffAdminPersonAtCompany.id).toBeGreaterThan(0);

    const staffUser = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester26',
        email: 'personatcompanytester26@strapi.com',
        role,
    });
    expect(staffUser.id).toBeDefined();
    expect(staffUser.id).toBeGreaterThan(0);

    const staffPerson = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Staff',
            MiddleName: '',
            LastName: 'Person',
            DirectoryName: 'Staff Person',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: staffUser.id } ] },
        },
    });
    expect(staffPerson.id).toBeDefined();
    expect(staffPerson.id).toBeGreaterThan(0);
 
    const staffPersonAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: staffPerson.id } ] },
            Company: { disconnect: [], connect: [ { id: company.id } ] },
            JobTitle: 'Staff',
            IsActive: true,
            IsArchived: false,
            CanManageCompanyDetails: false,
            CanManageCompanyStaff: false,
        },
    });
    expect(staffPersonAtCompany.id).toBeDefined();
    expect(staffPersonAtCompany.id).toBeGreaterThan(0);
  
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: staffAdminUser.id,
    });
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .put("/api/people-at-companies/" + staffPersonAtCompany.id)
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .send({
        "data": {
            "CanManageCompanyDetails": true,
            "CanManageCompanyStaff": true,
        }
    })
    .expect("Content-Type", /json/)
    .expect(200)
 
    // These fields are private and not returned in the public API call. Verify the submitted changes were not persisted.
    const thisPersonAtCompany = await strapi.entityService.findOne('api::person-at-company.person-at-company', staffPersonAtCompany.id, {});
    expect(thisPersonAtCompany.CanManageCompanyDetails).toBe(true);
    expect(thisPersonAtCompany.CanManageCompanyStaff).toBe(true);
});

it("COMMON-- PersonAtCompany: An active PersonAtCompany staff admin should be able to modify their own CanManageCompany and CanManageCompanyStaff flags if there is at least one other active PersonAtCompany staff admin for that company.", async () => {
   /** Gets the default user role */
   const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

   const role = defaultRole ? defaultRole.id : null;

   const company = await strapi.query("api::company.company").create({
       data: {
           Name: 'Existing Company',
           InvoiceCompanyName: '',
           IsActive: true,
           IsArchived: false,
           IsHidden: false,
       },
   });
   expect(company.id).toBeDefined();
   expect(company.id).toBeGreaterThan(0);

   /** Creates a new user an push to database */
   const staffAdminUser = await strapi.plugins['users-permissions'].services.user.add({
       ...mockUserData,
       username: 'personatcompanytester27',
       email: 'personatcompanytester27@strapi.com',
       role,
   });
   expect(staffAdminUser.id).toBeDefined();
   expect(staffAdminUser.id).toBeGreaterThan(0);

   const staffAdminPerson = await strapi.query("api::person.person").create({
       data: {
           FirstName: 'Staff',
           MiddleName: 'Admin',
           LastName: 'Person',
           DirectoryName: 'Staff Admin Person',
           SearchableName: '',
           IsActive: true,
           IsArchived: false,
           IsHidden: false,
           Users: { disconnect: [], connect: [ { id: staffAdminUser.id } ] },
       },
   });
   expect(staffAdminPerson.id).toBeDefined();
   expect(staffAdminPerson.id).toBeGreaterThan(0);

   const staffAdminPersonAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
       data: {
           Person: { disconnect: [], connect: [ { id: staffAdminPerson.id } ] },
           Company: { disconnect: [], connect: [ { id: company.id } ] },
           JobTitle: 'Staff Admin',
           IsActive: true,
           IsArchived: false,
           CanManageCompanyDetails: false,
           CanManageCompanyStaff: true,
       },
   });
   expect(staffAdminPersonAtCompany.id).toBeDefined();
   expect(staffAdminPersonAtCompany.id).toBeGreaterThan(0);

   const otherStaffAdminUser = await strapi.plugins['users-permissions'].services.user.add({
       ...mockUserData,
       username: 'personatcompanytester28',
       email: 'personatcompanytester28@strapi.com',
       role,
   });
   expect(otherStaffAdminUser.id).toBeDefined();
   expect(otherStaffAdminUser.id).toBeGreaterThan(0);

   const otherStaffAdminPerson = await strapi.query("api::person.person").create({
       data: {
           FirstName: 'Staff',
           MiddleName: '',
           LastName: 'Person',
           DirectoryName: 'Staff Person',
           SearchableName: '',
           IsActive: true,
           IsArchived: false,
           IsHidden: false,
           Users: { disconnect: [], connect: [ { id: otherStaffAdminUser.id } ] },
       },
   });
   expect(otherStaffAdminPerson.id).toBeDefined();
   expect(otherStaffAdminPerson.id).toBeGreaterThan(0);

   const otherStaffAdminAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
       data: {
           Person: { disconnect: [], connect: [ { id: otherStaffAdminPerson.id } ] },
           Company: { disconnect: [], connect: [ { id: company.id } ] },
           JobTitle: 'Staff',
           IsActive: true,
           IsArchived: false,
           CanManageCompanyDetails: false,
           CanManageCompanyStaff: true,
       },
   });
   expect(otherStaffAdminAtCompany.id).toBeDefined();
   expect(otherStaffAdminAtCompany.id).toBeGreaterThan(0);
 
   const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
       id: staffAdminUser.id,
   });
     
   await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
   .put("/api/people-at-companies/" + staffAdminPersonAtCompany.id)
   .set('accept', 'application/json')
   .set('Content-Type', 'application/json')
   .set('Authorization', 'Bearer ' + jwt)
   .send({
       "data": {
           "CanManageCompanyDetails": false,
           "CanManageCompanyStaff": false,
       }
   })
   .expect("Content-Type", /json/)
   .expect(200)

   // These fields are private and not returned in the public API call. Verify the submitted changes were not persisted.
   const thisPersonAtCompany = await strapi.entityService.findOne('api::person-at-company.person-at-company', staffAdminPersonAtCompany.id, {});
   expect(thisPersonAtCompany.CanManageCompanyDetails).toBe(false);
   expect(thisPersonAtCompany.CanManageCompanyStaff).toBe(false);
});

it("COMMON-- PersonAtCompany: An active PersonAtCompany staff admin should not be able to modify their own CanManageCompany and CanManageCompanyStaff flats if there are no other active PersonAtCompany staff admins for that company.", async () => {
   /** Gets the default user role */
   const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

   const role = defaultRole ? defaultRole.id : null;

   const company = await strapi.query("api::company.company").create({
       data: {
           Name: 'Existing Company',
           InvoiceCompanyName: '',
           IsActive: true,
           IsArchived: false,
           IsHidden: false,
       },
   });
   expect(company.id).toBeDefined();
   expect(company.id).toBeGreaterThan(0);

   /** Creates a new user an push to database */
   const staffAdminUser = await strapi.plugins['users-permissions'].services.user.add({
       ...mockUserData,
       username: 'personatcompanytester29',
       email: 'personatcompanytester29@strapi.com',
       role,
   });
   expect(staffAdminUser.id).toBeDefined();
   expect(staffAdminUser.id).toBeGreaterThan(0);

   const staffAdminPerson = await strapi.query("api::person.person").create({
       data: {
           FirstName: 'Staff',
           MiddleName: 'Admin',
           LastName: 'Person',
           DirectoryName: 'Staff Admin Person',
           SearchableName: '',
           IsActive: true,
           IsArchived: false,
           IsHidden: false,
           Users: { disconnect: [], connect: [ { id: staffAdminUser.id } ] },
       },
   });
   expect(staffAdminPerson.id).toBeDefined();
   expect(staffAdminPerson.id).toBeGreaterThan(0);

   const staffAdminPersonAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
       data: {
           Person: { disconnect: [], connect: [ { id: staffAdminPerson.id } ] },
           Company: { disconnect: [], connect: [ { id: company.id } ] },
           JobTitle: 'Staff Admin',
           IsActive: true,
           IsArchived: false,
           CanManageCompanyDetails: true,
           CanManageCompanyStaff: true,
       },
   });
   expect(staffAdminPersonAtCompany.id).toBeDefined();
   expect(staffAdminPersonAtCompany.id).toBeGreaterThan(0);
9 
   const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
       id: staffAdminUser.id,
   });
     
   await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
   .put("/api/people-at-companies/" + staffAdminPersonAtCompany.id)
   .set('accept', 'application/json')
   .set('Content-Type', 'application/json')
   .set('Authorization', 'Bearer ' + jwt)
   .send({
       "data": {
           "CanManageCompanyDetails": false,
           "CanManageCompanyStaff": false,
       }
   })
   .expect("Content-Type", /json/)
   .expect(200)

   // These fields are private and not returned in the public API call. Verify the submitted changes were not persisted.
   const thisPersonAtCompany = await strapi.entityService.findOne('api::person-at-company.person-at-company', staffAdminPersonAtCompany.id, {});
   expect(thisPersonAtCompany.CanManageCompanyDetails).toBe(true);
   expect(thisPersonAtCompany.CanManageCompanyStaff).toBe(true);
});

it("COMMON-- PersonAtCompany: When a Person record is inactivated, all related PersonAtCompany records should automatically be inactivated.", async () => {
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;
 
    const company = await strapi.query("api::company.company").create({
        data: {
            Name: 'Existing Company',
            InvoiceCompanyName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
    expect(company.id).toBeDefined();
    expect(company.id).toBeGreaterThan(0);
 
    /** Creates a new user an push to database */
    const staffAdminUser = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester30',
        email: 'personatcompanytester30@strapi.com',
        role,
    });
    expect(staffAdminUser.id).toBeDefined();
    expect(staffAdminUser.id).toBeGreaterThan(0);
 
    const staffAdminPerson = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Staff',
            MiddleName: 'Admin',
            LastName: 'Person',
            DirectoryName: 'Staff Admin Person',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: staffAdminUser.id } ] },
        },
    });
    expect(staffAdminPerson.id).toBeDefined();
    expect(staffAdminPerson.id).toBeGreaterThan(0);
 
    const staffAdminPersonAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: staffAdminPerson.id } ] },
            Company: { disconnect: [], connect: [ { id: company.id } ] },
            JobTitle: 'Staff Admin',
            IsActive: true,
            IsArchived: false,
            CanManageCompanyDetails: true,
            CanManageCompanyStaff: true,
        },
    });
    expect(staffAdminPersonAtCompany.id).toBeDefined();
    expect(staffAdminPersonAtCompany.id).toBeGreaterThan(0);

    const staffUser = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester31',
        email: 'personatcompanytester31@strapi.com',
        role,
    });
    expect(staffUser.id).toBeDefined();
    expect(staffUser.id).toBeGreaterThan(0);
 
    const staffPerson = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Staff',
            MiddleName: '',
            LastName: 'Person',
            DirectoryName: 'Staff Person',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: staffUser.id } ] },
        },
    });
    expect(staffPerson.id).toBeDefined();
    expect(staffPerson.id).toBeGreaterThan(0);
 
    const staffPersonAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: staffPerson.id } ] },
            Company: { disconnect: [], connect: [ { id: company.id } ] },
            JobTitle: 'Staff',
            IsActive: true,
            IsArchived: false,
            CanManageCompanyDetails: false,
            CanManageCompanyStaff: false,
        },
    });
    expect(staffPersonAtCompany.id).toBeDefined();
    expect(staffPersonAtCompany.id).toBeGreaterThan(0);

    const otherCompany = await strapi.query("api::company.company").create({
        data: {
            Name: 'Existing Other Company',
            InvoiceCompanyName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
    expect(otherCompany.id).toBeDefined();
    expect(otherCompany.id).toBeGreaterThan(0);

    const staffPersonAtOtherCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: staffPerson.id } ] },
            Company: { disconnect: [], connect: [ { id: otherCompany.id } ] },
            JobTitle: 'Staff',
            IsActive: true,
            IsArchived: false,
            CanManageCompanyDetails: false,
            CanManageCompanyStaff: false,
        },
    });
    expect(staffPersonAtOtherCompany.id).toBeDefined();
    expect(staffPersonAtOtherCompany.id).toBeGreaterThan(0);

    const updatedStaffPerson = await strapi.entityService.update('api::person.person', staffPerson.id, {
        data: {
            IsActive: false,
        },
    });
    expect(updatedStaffPerson).toBeDefined();
    expect(updatedStaffPerson.IsActive).toBeDefined();
    expect(updatedStaffPerson.IsActive).toBe(false);
    await new Promise((r) => setTimeout(r, 500));
    const postUpdateStaffPersonAtCompany = await strapi.entityService.findOne('api::person-at-company.person-at-company', staffPersonAtCompany.id, {});
    expect(postUpdateStaffPersonAtCompany).toBeDefined();
    expect(postUpdateStaffPersonAtCompany.IsActive).toBeDefined();
    expect(postUpdateStaffPersonAtCompany.IsActive).toBe(false);

    const postUpdateStaffPersonAtOtherCompany = await strapi.entityService.findOne('api::person-at-company.person-at-company', staffPersonAtOtherCompany.id, {});
    expect(postUpdateStaffPersonAtOtherCompany).toBeDefined();
    expect(postUpdateStaffPersonAtOtherCompany.IsActive).toBeDefined();
    expect(postUpdateStaffPersonAtOtherCompany.IsActive).toBe(false);
});

it("COMMON-- PersonAtCompany: A Person should be able to view their own PersonAtCompany", async () => {
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;
 
    const company = await strapi.query("api::company.company").create({
        data: {
            Name: 'Existing Company',
            InvoiceCompanyName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
    expect(company.id).toBeDefined();
    expect(company.id).toBeGreaterThan(0);

    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester32',
        email: 'personatcompanytester32@strapi.com',
        role,
    });
    expect(user.id).toBeDefined();
    expect(user.id).toBeGreaterThan(0);
 
    const person = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Staff',
            MiddleName: '',
            LastName: 'Person',
            DirectoryName: 'Staff Person',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: user.id } ] },
        },
    });
    expect(person.id).toBeDefined();
    expect(person.id).toBeGreaterThan(0);
 
    const personAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: person.id } ] },
            Company: { disconnect: [], connect: [ { id: company.id } ] },
            JobTitle: 'Staff',
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
    .get("/api/people-at-companies/security/" + personAtCompany.id)
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)    
});

it("COMMON-- PersonAtCompany: A Person should not be able to view someone else's PersonAtCompany", async () => {
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;
 
    const company = await strapi.query("api::company.company").create({
        data: {
            Name: 'Existing Company',
            InvoiceCompanyName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
        },
    });
    expect(company.id).toBeDefined();
    expect(company.id).toBeGreaterThan(0);

    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester33',
        email: 'personatcompanytester33@strapi.com',
        role,
    });
    expect(user.id).toBeDefined();
    expect(user.id).toBeGreaterThan(0);
 
    const person = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Staff',
            MiddleName: '',
            LastName: 'Person',
            DirectoryName: 'Staff Person',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: user.id } ] },
        },
    });
    expect(person.id).toBeDefined();
    expect(person.id).toBeGreaterThan(0);
 
    const personAtCompany = await strapi.query("api::person-at-company.person-at-company").create({
        data: {
            Person: { disconnect: [], connect: [ { id: person.id } ] },
            Company: { disconnect: [], connect: [ { id: company.id } ] },
            JobTitle: 'Staff',
            IsActive: true,
            IsArchived: false,
            CanManageCompanyDetails: false,
            CanManageCompanyStaff: false,
        },
    });
    expect(personAtCompany.id).toBeDefined();
    expect(personAtCompany.id).toBeGreaterThan(0);
 
    const evilUser = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'personatcompanytester34',
        email: 'personatcompanytester34@strapi.com',
        role,
    });
    expect(evilUser.id).toBeDefined();
    expect(evilUser.id).toBeGreaterThan(0);
  
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: evilUser.id,
    });
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/people-at-companies/security/" + personAtCompany.id)
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(403)    
});