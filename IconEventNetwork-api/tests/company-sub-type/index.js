const request = require('supertest');

// user mock data
const mockUserData = {
    username: "companysubtypetester",
    email: "companysubtypetester@strapi.com",
    provider: "local",
    password: "1234abc",
    confirmed: true,
    blocked: null,
  };

it("COMMON-- CompanySubType: Should return all company-sub-types for authenticated user", async () => {
    const companyTypePlanner = await strapi.query('api::company-type.company-type').findOne({
        where: {
            DisplayName: 'Planner',
        }
    }, []);
    expect(companyTypePlanner).toBeDefined();
    expect(companyTypePlanner.id).toBeDefined();    
    strapi.query("api::company-sub-type.company-sub-type").create({
        data: {
            DisplayName: 'Party',
            IsActive: 1,
            company_type: { disconnect: [], connect: [ { id: companyTypePlanner.id} ] },
        },
    });  
    strapi.query("api::company-sub-type.company-sub-type").create({
        data: {
             DisplayName: 'Corporate',
             IsActive: 1,
             company_type: { disconnect: [], connect: [ { id: companyTypePlanner.id} ] },
        },
    });  
    const companyTypePartner = await strapi.query('api::company-type.company-type').findOne({
        where: {
            DisplayName: 'Partner',
        }
    }, []);
    expect(companyTypePartner).toBeDefined();
    expect(companyTypePartner.id).toBeDefined();     
    strapi.query("api::company-sub-type.company-sub-type").create({
        data: {
            DisplayName: 'Florist',
            IsActive: 1,
            company_type: { disconnect: [], connect: [ { id: companyTypePartner.id} ] },
         },
    });    
    strapi.query("api::company-sub-type.company-sub-type").create({
      data: {
            DisplayName: 'Photographer',
            IsActive: 1,
            company_type: { disconnect: [], connect: [ { id: companyTypePartner.id} ] },
      },
    });  
    strapi.query("api::company-sub-type.company-sub-type").create({
      data: {
            DisplayName: 'Caterer',
            IsActive: 1,
            company_type: { disconnect: [], connect: [ { id: companyTypePartner.id} ] },
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
    .get("/api/company-sub-types?sort=DisplayName")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.length).toBe(5);
        expect(data.body.data[0].attributes.DisplayName).toBe('Caterer');
        expect(data.body.data[1].attributes.DisplayName).toBe('Corporate');
        expect(data.body.data[2].attributes.DisplayName).toBe('Florist');
        expect(data.body.data[3].attributes.DisplayName).toBe('Party');
        expect(data.body.data[4].attributes.DisplayName).toBe('Photographer');
    });
});

it("COMMON-- CompanySubType: Should return correct company-sub-types by company-type for authenticated user", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'companysubtypetester2',
        email: 'companysubtypetester2@strapi.com',
        role,
    });

    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
    });    
    
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/company-sub-types?populate=*&filters\[company_type\][DisplayName][$eq]=Planner&sort=DisplayName")
    //.get("/api/company-sub-types?populate=company-type&filters[company-type][DisplayName][$eq]=Planner&sort=DisplayName")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.length).toBe(2);
        expect(data.body.data[0].attributes.DisplayName).toBe('Corporate');
        expect(data.body.data[1].attributes.DisplayName).toBe('Party');
    });    
});

it("COMMON-- CompanySubType: Should not return company-sub-types for anonymous user", async () => {
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/company-sub-types?sort=DisplayName")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect("Content-Type", /json/)
    .expect(500);
});

it("COMMON-- CompanySubType: Should return singular company-sub-type for authenticated user", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'companysubtypetester3',
        email: 'companysubtypetester3@strapi.com',
        role,
    });
 
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });    
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/company-sub-types/1")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.attributes.DisplayName).toBe('Party');
    });
});

it("COMMON-- CompanySubType: Should not return singular company-sub-type for anonymous user", async () => {
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/company-sub-types/1")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect("Content-Type", /json/)
    .expect(500);
});