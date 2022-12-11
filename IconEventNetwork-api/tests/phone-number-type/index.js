const request = require('supertest');

// user mock data
const mockUserData = {
    username: "phonenumbertypetester",
    email: "phonenumbertypetester@strapi.com",
    provider: "local",
    password: "1234abc",
    confirmed: true,
    blocked: null,
  };

it("PhoneNumberType: Should return phone-number-types for authenticated user", async () => {
    // Intentionally create entries out of rank order
     strapi.query("api::phone-number-type.phone-number-type").create({
        data: {
            Name: 'Office',
            IsActive: 1,
            Rank: 2,
            AppliesToPerson: 1,
            AppliesToPersonCompany: 1,
            AppliesToCompany: 1
        },
    });    
     strapi.query("api::phone-number-type.phone-number-type").create({
        data: {
            Name: 'Home',
            IsActive: 1,
            Rank: 0,
            AppliesToPerson: 1,
            AppliesToPersonCompany: 0,
            AppliesToCompany: 0
        },
    });
    strapi.query("api::phone-number-type.phone-number-type").create({
        data: {
            Name: 'Mobile',
            IsActive: 1,
            Rank: 1,
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
    .get("/api/phone-number-types?sort=Rank")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.length).toBe(3);
        expect(data.body.data[0].attributes.Name).toBe('Home');
        expect(data.body.data[1].attributes.Name).toBe('Mobile');
        expect(data.body.data[2].attributes.Name).toBe('Office');
    });
});

it("PhoneNumberType: Should not return phone-number-types for anonymous user", async () => {
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/phone-number-types?sort=Rank")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect("Content-Type", /json/)
    .expect(403);
});

it("PhoneNumberType: Should return singular phone-number-type for authenticated user", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'phonenumbertypetester2',
        email: 'phonenumbertypetester2@strapi.com',
        role,
    });
 
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });    
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/phone-number-types/1")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.attributes.Name).toBe('Office');
    });
});

it("PhoneNumberType: Should not return singular phone-number-type for anonymous user", async () => {
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/phone-number-types/1")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect("Content-Type", /json/)
    .expect(403);
});