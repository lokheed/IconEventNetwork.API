const request = require('supertest');

// user mock data
const mockUserData = {
    username: "companystatustester",
    email: "companystatustester@strapi.com",
    provider: "local",
    password: "1234abc",
    confirmed: true,
    blocked: null,
  };

it("CompanyStatus: Should return company-statuses for authenticated user", async () => {
    // Intentionally create entries out of order
    strapi.query("api::company-status.company-status").create({
        data: {
            DisplayName: 'Inactive',
            IsActive: 1,
        },
    });  
    strapi.query("api::company-status.company-status").create({
        data: {
             DisplayName: 'Non-Renewal',
             IsActive: 1,
        },
    });   
    strapi.query("api::company-status.company-status").create({
        data: {
            DisplayName: 'Active',
            IsActive: 1,
         },
    });    
   strapi.query("api::company-status.company-status").create({
      data: {
            DisplayName: 'Probation',
            IsActive: 1,
      },
    });
    strapi.query("api::company-status.company-status").create({
        data: {
            DisplayName: 'Removed',
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
    .get("/api/company-statuses?sort=DisplayName")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.length).toBe(5);
        expect(data.body.data[0].attributes.DisplayName).toBe('Active');
        expect(data.body.data[1].attributes.DisplayName).toBe('Inactive');
        expect(data.body.data[2].attributes.DisplayName).toBe('Non-Renewal');
        expect(data.body.data[3].attributes.DisplayName).toBe('Probation');
        expect(data.body.data[4].attributes.DisplayName).toBe('Removed');
    });
});

it("CompanyStatus: Should not return company-statuses for anonymous user", async () => {
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/company-statuses?sort=DisplayName")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect("Content-Type", /json/)
    .expect(403);
});

it("CompanyStatus: Should return singular company-status for authenticated user", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'companystatustester2',
        email: 'companystatustester2@strapi.com',
        role,
    });
 
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });    
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/company-statuses/1")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.attributes.DisplayName).toBe('Inactive');
    });
});

it("CompanyStatus: Should not return singular company-status for anonymous user", async () => {
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/company-statuses/1")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect("Content-Type", /json/)
    .expect(403);
});