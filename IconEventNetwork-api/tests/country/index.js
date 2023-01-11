const request = require('supertest');

// user mock data
const mockUserData = {
    username: "countrytester",
    email: "countrytester@strapi.com",
    provider: "local",
    password: "1234abc",
    confirmed: true,
    blocked: null,
  };

it("COMMON-- Country: Should return countries for authenticated user", async () => {
    strapi.query("api::country.country").create({
        data: {
            Name: 'United States of America (the)',
            A2: 'us',
            A3: 'usa',
            IsActive: 1,
            Number: 840
        },
    });     
    strapi.query("api::country.country").create({
        data: {
            Name: 'Canada',
            A2: 'CAjunk',
            A3: 'CANjunk',
            IsActive: 1,
            Number: 124
        },
    });   
    strapi.query("api::country.country").create({
        data: {
            Name: 'Åland Islands',
            A2: 'AX',
            A3: 'ALA',
            IsActive: 1,
            Number: 248
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
    .get("/api/countries?sort=SearchableName")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.length).toBe(3);
        expect(data.body.data[0].attributes.Name).toBe('Åland Islands');
        expect(data.body.data[1].attributes.Name).toBe('Canada');
        expect(data.body.data[2].attributes.Name).toBe('United States of America (the)');
    });
});

it("COMMON-- Country: Should not return countries for anonymous user", async () => {
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/countries?sort=SearchableName")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect("Content-Type", /json/)
    .expect(403);
});

it("COMMON-- Country: Should return singular country for authenticated user", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'countrytester2',
        email: 'countrytester2@strapi.com',
        role,
    });
 
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });    
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/countries/1")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.attributes.Name).toBe('United States of America (the)');
    });
});

it("COMMON-- Country: Should not return singular country for anonymous user", async () => {
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/countries/1")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect("Content-Type", /json/)
    .expect(403);
});

it("COMMON-- Country: Should transilterate SearchableName for country with accented characters", async () => {
    await strapi.query('api::country.country').findOne({
        where: {
            A2: 'AX',
        }
    }, [])
    .then((data) => {
        expect(data.SearchableName).toBe('aland islands');
    });
});

it("COMMON-- Country: Should enforce A2 and A3 to be uppercase", async () => {
    await strapi.query('api::country.country').findOne({
        where: {
            A2: 'US',
        }
    }, [])
    .then((data) => {
        expect(data.A2).toBe('US');
        expect(data.A3).toBe('USA');
    });
});

it("COMMON-- Country: Should enforce A2 and A3 to be two and three caracters respectively", async () => {
    await strapi.query('api::country.country').findOne({
        where: {
            A2: 'CA',
        }
    }, [])
    .then((data) => {
        expect(data.A2).toBe('CA');
        expect(data.A3).toBe('CAN');
    });
});