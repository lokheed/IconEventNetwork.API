const request = require('supertest');

// user mock data
const mockUserData = {
    username: "addresstypetester",
    email: "addresstypetester@strapi.com",
    provider: "local",
    password: "1234abc",
    confirmed: true,
    blocked: null,
  };

it("COMMON-- AddressType: Should return address-types for authenticated user", async () => {
    // Intentionally create entries out of rank order
     strapi.query("api::address-type.address-type").create({
        data: {
            Name: 'Home',
            IsActive: 1,
            Rank: 1,
            AppliesToPerson: 1,
            AppliesToPersonCompany: 0,
            AppliesToCompany: 0
        },
    });    
     strapi.query("api::address-type.address-type").create({
        data: {
            Name: 'Billing',
            IsActive: 1,
            Rank: 0,
            AppliesToPerson: 1,
            AppliesToPersonCompany: 1,
            AppliesToCompany: 1
        },
    });
    strapi.query("api::address-type.address-type").create({
       data: {
           Name: 'Office',
           IsActive: 1,
           Rank: 2,
           AppliesToPerson: 1,
           AppliesToPersonCompany: 1,
           AppliesToCompany: 1
       },
   });
   strapi.query("api::address-type.address-type").create({
      data: {
          Name: 'Shipping',
          IsActive: 1,
          Rank: 3,
          AppliesToPerson: 1,
          AppliesToPersonCompany: 1,
          AppliesToCompany: 1
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
    .get("/api/address-types?sort=Rank")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.length).toBe(4);
        expect(data.body.data[0].attributes.Name).toBe('Billing');
        expect(data.body.data[1].attributes.Name).toBe('Home');
        expect(data.body.data[2].attributes.Name).toBe('Office');
        expect(data.body.data[3].attributes.Name).toBe('Shipping');
    });
});

it("COMMON-- AddressType: Should not return address-types for anonymous user", async () => {
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/address-types?sort=Rank")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect("Content-Type", /json/)
    .expect(403);
});

it("COMMON-- AddressType: Should return singular email-address-type for authenticated user", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'addresstypetester2',
        email: 'addresstypetester2@strapi.com',
        role,
    });
 
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });    
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/address-types/1")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.attributes.Name).toBe('Home');
    });
});

it("COMMON-- AddressType: Should not return singular email-address-type for anonymous user", async () => {
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/address-types/1")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect("Content-Type", /json/)
    .expect(403);
});