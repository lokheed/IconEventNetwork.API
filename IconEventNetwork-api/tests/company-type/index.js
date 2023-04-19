const request = require('supertest');

// user mock data
const mockUserData = {
    username: "companytypetester",
    email: "companytypetester@strapi.com",
    provider: "local",
    password: "1234abc",
    confirmed: true,
    blocked: null,
  };

it("COMMON-- CompanyType: Should return company-types for authenticated user", async () => {
    // Intentionally create entries out of order
    strapi.query("api::company-type.company-type").create({
        data: {
            Name: 'Staff',
            Description: 'Icon Network Staff',
            IsActive: 1,
        },
    });  
    strapi.query("api::company-type.company-type").create({
        data: {
             Name: 'Planner',
             Description: 'Event Planners',
             IsActive: 1,
        },
    });   
    strapi.query("api::company-type.company-type").create({
        data: {
            Name: 'Partner',
            Description: 'Providers of goods, services, and venues',
            IsActive: 1,
         },
    });    
   strapi.query("api::company-type.company-type").create({
      data: {
            Name: 'Tourism Board',
            Description: 'Tourism Boards',
            IsActive: 1,
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
    .get("/api/company-types?sort=Name")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.length).toBe(4);
        expect(data.body.data[0].attributes.Name).toBe('Partner');
        expect(data.body.data[1].attributes.Name).toBe('Planner');
        expect(data.body.data[2].attributes.Name).toBe('Staff');
        expect(data.body.data[3].attributes.Name).toBe('Tourism Board');
    });
});

it("COMMON-- CompanyType: Should not return company-types for anonymous user", async () => {
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/company-types?sort=Name")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect("Content-Type", /json/)
    .expect(403);
});

it("COMMON-- CompanyType: Should return singular company-type for authenticated user", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'companytypetester2',
        email: 'companytypetester2@strapi.com',
        role,
    });
 
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });    
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/company-types/1")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.attributes.Name).toBe('Staff');
    });
});

it("COMMON-- CompanyType: Should not return singular company-type for anonymous user", async () => {
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/company-types/1")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect("Content-Type", /json/)
    .expect(403);
});