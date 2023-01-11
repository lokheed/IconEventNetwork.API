const request = require('supertest');
const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

// user mock data
const mockUserData = {
    username: "persontester",
    email: "persontester@strapi.com",
    provider: "local",
    password: "1234abc",
    confirmed: true,
    blocked: null,
};

it("Person: Should not return person for anonymous user", async () => {
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/people/me")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect("Content-Type", /json/)
    .expect(403);
});

it("Person: Should return the correct Person record for a requesting user with an existing Person record", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        role,
    });

    strapi.query("api::person.person").create({
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

    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
    });    
        
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/people/me")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data).toBeDefined();
        expect(data.body).toBeDefined();
        expect(data.body.data).toBeDefined();
        expect(data.body.data.DirectoryName).toBeDefined();
        expect(data.body.data.DirectoryName).toBe('Existing Person');
    });
});

it("Person: Should populate DirectoryName with 'FirstName LastName' if DirectoryName is missing", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'persontester2',
        email: 'persontester2@strapi.com',
        role,
    });
 
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
    });    
 

    strapi.query("api::person.person").create({
        data: {
            FirstName: 'Empty',
            MiddleName: '',
            LastName: 'DirectoryName',
            DirectoryName: '',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: user.id } ] },
        },
    });
     
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/people/me")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data).toBeDefined();
        expect(data.body).toBeDefined();
        expect(data.body.data).toBeDefined();
        expect(data.body.data.DirectoryName).toBeDefined();
        expect(data.body.data.DirectoryName).toBe('Empty DirectoryName');
    });
});

it("Person: All text fields should be trimmed of white space", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'persontester3',
        email: 'persontester3@strapi.com',
        role,
    });
 
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
    });    
 

    strapi.query("api::person.person").create({
        data: {
            FirstName: ' First ',
            MiddleName: '  Middle  ',
            LastName: ' Last',
            DirectoryName: 'Directory ',
            PreferredName: '                              Preferred                 ',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: user.id } ] },
        },
    });
     
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/people/me")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data).toBeDefined();
        expect(data.body).toBeDefined();
        expect(data.body.data).toBeDefined();
        expect(data.body.data.FirstName).toBeDefined();
        expect(data.body.data.FirstName).toBe('First');
        expect(data.body.data.MiddleName).toBeDefined();
        expect(data.body.data.MiddleName).toBe('Middle');
        expect(data.body.data.LastName).toBeDefined();
        expect(data.body.data.LastName).toBe('Last');
        expect(data.body.data.DirectoryName).toBeDefined();
        expect(data.body.data.DirectoryName).toBe('Directory');
        expect(data.body.data.PreferredName).toBeDefined();
        expect(data.body.data.PreferredName).toBe('Preferred');
    });
});

it("Person: SearchableName should be DirectoryName transliterated and lower case", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'persontester4',
        email: 'persontester4@strapi.com',
        role,
    });
 
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
    });    
 
    strapi.query("api::person.person").create({
        data: {
            FirstName: 'Renée',
            MiddleName: '',
            LastName: 'François',
            DirectoryName: '',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: user.id } ] },
        },
    });
     
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/people/me")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data).toBeDefined();
        expect(data.body).toBeDefined();
        expect(data.body.data).toBeDefined();
        expect(data.body.data.SearchableName).toBeDefined();
        expect(data.body.data.SearchableName).toBe('renee francois');
    });
});

it("Person: Should return the a new empty Person record for a requesting user with no existing Person record", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'persontester5',
        email: 'persontester5@strapi.com',
        role,
    });
 
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
    });
     
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/people/me")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data).toBeDefined();
        expect(data.body).toBeDefined();
        expect(data.body.data).toBeDefined();
        expect(data.body.data.id).toBeDefined();
        expect(data.body.data.id).toBeGreaterThan(0);
        expect(data.body.data.FirstName).toBeDefined();
        expect(data.body.data.FirstName).toBe('');
        expect(data.body.data.MiddleName).toBeDefined();
        expect(data.body.data.MiddleName).toBe('');
        expect(data.body.data.LastName).toBeDefined();
        expect(data.body.data.LastName).toBe('');
        expect(data.body.data.DirectoryName).toBeDefined();
        expect(data.body.data.DirectoryName).toBe('');
        expect(data.body.data.PreferredName).toBeDefined();
        expect(data.body.data.PreferredName).toBe('');
    });
});

it("Person: Should throw an exception when attempting to create a Person record for a User that already has one.", async () => {
    expect.assertions(1); // required in case the exception is NOT thrown, having 0 assertions will fail the test

    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'persontester6',
        email: 'persontester6@strapi.com',
        role,
    });
 
    await strapi.query("api::person.person").create({
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

    try {
        await strapi.query("api::person.person").create({
            data: {
                FirstName: 'Duplicate',
                MiddleName: '',
                LastName: 'Person',
                DirectoryName: 'Duplicate Person',
                SearchableName: '',
                IsActive: true,
                IsArchived: false,
                IsHidden: false,
                Users: { disconnect: [], connect: [ { id: user.id } ] },
            },
        });
    } catch (e) {
        expect(e.toString()).toBe(new ApplicationError('A Person object already exists for this User', {}).toString());
    }
});

it("Person: A person should be able to successfully update their own Person record", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'persontester7',
        email: 'persontester7@strapi.com',
        role,
    });
 
    const successfulPerson = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Successful',
            MiddleName: '',
            LastName: 'Person',
            DirectoryName: 'Successful Person',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: user.id } ] },
        },
    });
    
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });    
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .put("/api/people/" + successfulPerson.id)
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .send({
        "data": {
            "MiddleName": "Allowed",
        }
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.attributes.MiddleName).toBe('Allowed');
    });
});

it("Person: A person should not be able to update someone else's Person record", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const goodUser = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'persontester8',
        email: 'persontester8@strapi.com',
        role,
    });
 
    const goodPerson = await strapi.query("api::person.person").create({
        data: {
            FirstName: 'Good',
            MiddleName: '',
            LastName: 'Person',
            DirectoryName: 'Good Person',
            SearchableName: '',
            IsActive: true,
            IsArchived: false,
            IsHidden: false,
            Users: { disconnect: [], connect: [ { id: goodUser.id } ] },
        },
    });
    
    const evilUser = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'persontester9',
        email: 'persontester9@strapi.com',
        role,
    });

    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: evilUser.id,
      });    
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .put("/api/people/" + goodPerson.id)
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .send({
        "data": {
            "FirstName": "Evil",
        }
    })
    .expect("Content-Type", /json/)
    .expect(403);
});