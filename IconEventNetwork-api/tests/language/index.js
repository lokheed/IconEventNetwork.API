const request = require('supertest');

// user mock data
const mockUserData = {
    username: "languagetester",
    email: "languagetester@strapi.com",
    provider: "local",
    password: "1234abc",
    confirmed: true,
    blocked: null,
  };

it("COMMON-- Language: Should return languages for authenticated user", async () => {
    strapi.query("api::language.language").create({
        data: {
            EnglishName: 'Arabic',
            NativeName: 'عربى',
            A2: 'ar',
            A3: 'ara',
            IsActive: 1,
            Rank: 2
        },
    });     
    strapi.query("api::language.language").create({
        data: {
            EnglishName: 'Afrikaans',
            NativeName: 'Afrikaans',
            A2: 'AF',
            A3: 'AFR',
            IsActive: 1,
            Rank: 0
        },
    });     
    strapi.query("api::language.language").create({
        data: {
            EnglishName: 'Albanian',
            NativeName: 'Shqipëri',
            A2: 'sqjunk',
            A3: 'albjunk',
            IsActive: 1,
            Rank: 1
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
    .get("/api/languages?sort=Rank")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.length).toBe(3);
        expect(data.body.data[0].attributes.EnglishName).toBe('Afrikaans');
        expect(data.body.data[1].attributes.EnglishName).toBe('Albanian');
        expect(data.body.data[2].attributes.EnglishName).toBe('Arabic');
    });
});

it("COMMON-- Language: Should not return languages for anonymous user", async () => {
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/countries?sort=SearchableName")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect("Content-Type", /json/)
    .expect(403);
});

it("COMMON-- Language: Should return singular country for authenticated user", async () => {
    /** Gets the default user role */
    const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

    const role = defaultRole ? defaultRole.id : null;

    /** Creates a new user an push to database */
    const user = await strapi.plugins['users-permissions'].services.user.add({
        ...mockUserData,
        username: 'languagetester2',
        email: 'languagetester2@strapi.com',
        role,
    });
 
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });    
      
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/languages/1")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.data.attributes.EnglishName).toBe('Arabic');
    });
});

it("COMMON-- Language: Should not return singular language for anonymous user", async () => {
    await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get("/api/languages/1")
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect("Content-Type", /json/)
    .expect(403);
});

it("COMMON-- Language: Should transilterate SearchableName for language", async () => {
    await strapi.query('api::language.language').findOne({
        where: {
            A2: 'af',
        }
    }, [])
    .then((data) => {
        expect(data.SearchableName).toBe('afrikaans');
    });
});

it("COMMON-- Language: Should enforce A2 and A3 to be lowercase", async () => {
    await strapi.query('api::language.language').findOne({
        where: {
            A2: 'af',
        }
    }, [])
    .then((data) => {
        expect(data.A2).toBe('af');
        expect(data.A3).toBe('afr');
    });
});

it("COMMON-- Language: Should enforce A2 and A3 to be two and three caracters respectively", async () => {
    await strapi.query('api::language.language').findOne({
        where: {
            A2: 'sq',
        }
    }, [])
    .then((data) => {
        expect(data.A2).toBe('sq');
        expect(data.A3).toBe('alb');
    });
});