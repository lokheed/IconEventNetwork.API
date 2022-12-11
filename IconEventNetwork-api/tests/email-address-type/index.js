const request = require('supertest');

// user mock data
const mockUserData = {
    username: "emailaddresstypetester",
    email: "emailaddresstypetester@strapi.com",
    provider: "local",
    password: "1234abc",
    confirmed: true,
    blocked: null,
  };

it("EmailAddressType: Should return email-address-types for authenticated user", async () => {
    // Intentionally create entries out of rank order
     strapi.query("api::email-address-type.email-address-type").create({
        data: {
            Name: 'Work',
            IsActive: 1,
            Rank: 1,
            AppliesToPerson: 1,
            AppliesToPersonCompany: 1,
            AppliesToCompany: 1
        },
    });    
     strapi.query("api::email-address-type.email-address-type").create({
        data: {
            Name: 'Personal',
            IsActive: 1,
            Rank: 0,
            AppliesToPerson: 1,
            AppliesToPersonCompany: 0,
            AppliesToCompany: 0
        },
    });
 
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        role,
    });
   
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });    
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/email-address-types?sort=Rank")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.length).toBe(2);
        expect(data.body.data[0].attributes.Name).toBe('Personal');
        expect(data.body.data[1].attributes.Name).toBe('Work');
    });
});

it("EmailAddressType: Should not return email-address-types for anonymous user", async () => {
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/email-address-types?sort=Rank")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect("Content-Type", /json/)
    .expect(403);
});

it("EmailAddressType: Should return singular email-address-type for authenticated user", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'emailaddresstypetester2',
        email: 'emailaddresstypetester2@strapi.com',
        role,
    });
 
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });    
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/email-address-types/1")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.attributes.Name).toBe('Work');
    });
});

it("EmailAddressType: Should not return singular email-address-type for anonymous user", async () => {
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/email-address-types/1")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect("Content-Type", /json/)
    .expect(403);
});