const request = require('supertest');

// user mock data
const mockUserData = {
    username: "addresstester",
    email: "addresstester@strapi.com",
    provider: "local",
    password: "1234abc",
    confirmed: true,
    blocked: null,
};

it("COMMON-- Address: Should return addresses for authenticated user", async () => {
    const country = await strapi.query('api::country.country').findOne({
        where: {
            A2: 'US',
        }
    }, []);
    expect(country).toBeDefined();
    expect(country.id).toBeDefined();
    const countrySubdivision = await strapi.query('api::countrysubdivision.countrysubdivision').findOne({
        where: {
            Code: 'US-AL',
        }
    }, []);
    expect(countrySubdivision).toBeDefined();
    expect(countrySubdivision.id).toBeDefined();
    const addressTypeHome = await strapi.query('api::address-type.address-type').findOne({
        where: {
            Name: 'Home',
        }
    }, []);
    expect(addressTypeHome).toBeDefined();
    expect(addressTypeHome.id).toBeDefined();
    const addressTypeOffice = await strapi.query('api::address-type.address-type').findOne({
        where: {
            Name: 'Office',
        }
    }, []);
    expect(addressTypeOffice).toBeDefined();
    expect(addressTypeOffice.id).toBeDefined();
    strapi.query("api::address.address").create({
        data: {
            Line1: '123 Main St',
            Line2: '',
            City: 'Springfield',
            PostalCode: '21345',
            country: { disconnect: [], connect: [ { id: country.id} ] },
            country_subdivision: { disconnect: [], connect: [ { id: countrySubdivision.id} ] },
            address_type: { disconnect: [], connect: [ { id: addressTypeHome.id} ] },
        },
    });  
    strapi.query("api::address.address").create({
        data: {
            Line1: '456 Wall St',
            Line2: 'Suite 500',
            City: 'Summerfield',
            PostalCode: '12346',
            country: { disconnect: [], connect: [ { id: country.id} ] },
            country_subdivision: { disconnect: [], connect: [ { id: countrySubdivision.id} ] },
            address_type: { disconnect: [], connect: [ { id: addressTypeOffice.id} ] },
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
    .get("/api/addresses?sort=PostalCode")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.length).toBe(2);
        expect(data.body.data[0].attributes.City).toBe('Summerfield');
        expect(data.body.data[1].attributes.City).toBe('Springfield');
    });
});

it("COMMON-- Address: Should not return addresses for anonymous user", async () => {
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/addresses?sort=PostalCode")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect("Content-Type", /json/)
    .expect(403);
});

it("COMMON-- Address: Should return singular address for authenticated user", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'addresstester2',
        email: 'addresstester2@strapi.com',
        role,
    });
 
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });    
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/addresses/1")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.attributes.PostalCode).toBe('21345');
    });
});

it("COMMON-- Address: Should not return singular address for anonymous user", async () => {
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/addresses/1")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect("Content-Type", /json/)
    .expect(403);
});