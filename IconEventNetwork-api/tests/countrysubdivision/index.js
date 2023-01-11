const request = require('supertest');

// user mock data
const mockUserData = {
    username: "countrysubdivisiontester",
    email: "countrysubdivisiontester@strapi.com",
    provider: "local",
    password: "1234abc",
    confirmed: true,
    blocked: null,
  };

it("COMMON-- CountrySubdivision: Should return country subdivisions by country for authenticated user", async () => {
    strapi.query("api::countrysubdivision.countrysubdivision").create({
        data: {
            Name: 'Alaska',
            Code: 'US-AK',
            IsActive: 1,
            SearchableName: ''
        },
    });
    strapi.query("api::countrysubdivision.countrysubdivision").create({
        data: {
            Name: 'Alabama',
            Code: 'US-AL',
            IsActive: 1,
            SearchableName: ''
        },
    });
    strapi.query("api::countrysubdivision.countrysubdivision").create({
        data: {
            Name: 'American Samoa',
            Code: 'US-AS',
            IsActive: 1,
            SearchableName: ''
        },
    }); 
    strapi.query("api::countrysubdivision.countrysubdivision").create({
        data: {
            Name: 'British Colombia',
            Code: 'CA-BC',
            IsActive: 1,
            SearchableName: ''
        },
    });                                      
    strapi.query("api::countrysubdivision.countrysubdivision").create({
        data: {
            Name: 'Alberta',
            Code: 'CA-AB',
            IsActive: 1,
            SearchableName: ''
        },
    });                                    
    strapi.query("api::countrysubdivision.countrysubdivision").create({
        data: {
            Name: 'Åland Fake Subdivision',
            Code: 'AX-AF',
            IsActive: 1,
            SearchableName: ''
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
    .get("/api/countrysubdivisions?filters[Code][$startsWith]=US&sort=SearchableName")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.length).toBe(3);
        expect(data.body.data[0].attributes.Name).toBe('Alabama');
        expect(data.body.data[1].attributes.Name).toBe('Alaska');
        expect(data.body.data[2].attributes.Name).toBe('American Samoa');
    });
});

it("COMMON-- CountrySubdivision: Should not return country subdivisions for anonymous user", async () => {
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/countrysubdivisions?sort=SearchableName")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect("Content-Type", /json/)
    .expect(403);
});

it("COMMON-- CountrySubdivision: Should return singular country subdivision for authenticated user", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'countrysubdivisiontester2',
        email: 'countrysubdivisiontester2@strapi.com',
        role,
    });
 
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });    
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/countrysubdivisions/1")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.attributes.Name).toBe('Alaska');
    });
});

it("COMMON-- CountrySubdivision: Should not return singular country for anonymous user", async () => {
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/countrysubdivisions/1")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect("Content-Type", /json/)
    .expect(403);
});

it("COMMON-- CountrySubdivision: Should transilterate SearchableName for country subdivision with accented characters", async () => {
    await strapi.query('api::countrysubdivision.countrysubdivision').findOne({
        where: {
            CODE: 'AX-AF',
        }
    }, [])
    .then((data) => {
        expect(data.SearchableName).toBe('aland fake subdivision');
    });
});