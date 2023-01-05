const request = require('supertest');

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
            Users: { disconnect: [], connect: [ { id: user.id} ] },
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
            Users: { disconnect: [], connect: [ { id: user.id} ] },
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
            Users: { disconnect: [], connect: [ { id: user.id} ] },
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
            Users: { disconnect: [], connect: [ { id: user.id} ] },
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