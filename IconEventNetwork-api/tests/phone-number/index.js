const request = require('supertest');

// user mock data
const mockUserData = {
    username: "phonenumbertester",
    email: "phonenumbertester@strapi.com",
    provider: "local",
    password: "1234abc",
    confirmed: true,
    blocked: null,
};

it("PhoneNumber: Should validate a valid new phone number and populate formatted values", async () => {
    const country = await strapi.query('api::country.country').findOne({
        where: {
            A2: 'US',
        }
    }, []);
    expect(country).toBeDefined();
    expect(country.id).toBeDefined();
    const phoneNumberTypeHome = await strapi.query('api::phone-number-type.phone-number-type').findOne({
        where: {
            Name: 'Home',
        }
    }, []);
    expect(phoneNumberTypeHome).toBeDefined();
    expect(phoneNumberTypeHome.id).toBeDefined();
    const validPhoneNumber = await strapi.query("api::phone-number.phone-number").create({
        data: {
            RawFormat: '8335402304',
            IsValidated: false,
            E164Format: '',
            InternationalFormat: '',
            NationalFormat: '',
            country: { disconnect: [], connect: [ { id: country.id} ] },
            phone_number_type: { disconnect: [], connect: [ { id: phoneNumberTypeHome.id} ] },
        },
    });             
    expect(validPhoneNumber).toBeDefined();
    expect(validPhoneNumber.id).toBeDefined();

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
    .get("/api/phone-numbers/" + validPhoneNumber.id)
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
        expect(data).toBeDefined();
        expect(data.body).toBeDefined();
        expect(data.body.data).toBeDefined();
        expect(data.body.data.attributes).toBeDefined();
        expect(data.body.data.attributes.IsValidated).toBe(true);
        expect(data.body.data.attributes.E164Format).toBe('+18335402304');
        expect(data.body.data.attributes.InternationalFormat).toBe('+1 833-540-2304');
        expect(data.body.data.attributes.NationalFormat).toBe('(833) 540-2304');
    });
});

it("PhoneNumber: Should validate an invalid new phone number and not populate formatted values", async () => {
  const country = await strapi.query('api::country.country').findOne({
      where: {
          A2: 'US',
      }
  }, []);
  expect(country).toBeDefined();
  expect(country.id).toBeDefined();
  const phoneNumberTypeHome = await strapi.query('api::phone-number-type.phone-number-type').findOne({
      where: {
          Name: 'Home',
      }
  }, []);
  expect(phoneNumberTypeHome).toBeDefined();
  expect(phoneNumberTypeHome.id).toBeDefined();
  const invalidPhoneNumber = await strapi.query("api::phone-number.phone-number").create({
      data: {
          RawFormat: 'bad data',
          IsValidated: false,
          E164Format: '',
          InternationalFormat: '',
          NationalFormat: '',
          country: { disconnect: [], connect: [ { id: country.id} ] },
          phone_number_type: { disconnect: [], connect: [ { id: phoneNumberTypeHome.id} ] },
      },
  });             
  expect(invalidPhoneNumber).toBeDefined();
  expect(invalidPhoneNumber.id).toBeDefined();

  /** Gets the default user role */
  const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

  const role = defaultRole ? defaultRole.id : null;

  /** Creates a new user an push to database */
  const user = await strapi.plugins['users-permissions'].services.user.add({
      ...mockUserData,
      username: 'phonenumbertester2',
      email: 'phonenumbertester2@strapi.com',
      role,
  });
 
  const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
      id: user.id,
    });    
    
  await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
  .get("/api/phone-numbers/" + invalidPhoneNumber.id)
  .set('accept', 'application/json')
  .set('Content-Type', 'application/json')
  .set('Authorization', 'Bearer ' + jwt)
  .expect("Content-Type", /json/)
  .expect(200)
  .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.attributes).toBeDefined();
      expect(data.body.data.attributes.IsValidated).toBe(false);
      expect(data.body.data.attributes.E164Format).toBe('');
      expect(data.body.data.attributes.InternationalFormat).toBe('');
      expect(data.body.data.attributes.NationalFormat).toBe('');
  });
});

it("PhoneNumber: Should validate a valid existing phone number with a valid new number and populate formatted values", async () => {
  const country = await strapi.query('api::country.country').findOne({
      where: {
          A2: 'US',
      }
  }, []);
  expect(country).toBeDefined();
  expect(country.id).toBeDefined();
  const phoneNumberTypeHome = await strapi.query('api::phone-number-type.phone-number-type').findOne({
      where: {
          Name: 'Home',
      }
  }, []);
  expect(phoneNumberTypeHome).toBeDefined();
  expect(phoneNumberTypeHome.id).toBeDefined();
  const validPhoneNumber = await strapi.query("api::phone-number.phone-number").create({
    data: {
        RawFormat: '8554708380',
        IsValidated: false,
        E164Format: '',
        InternationalFormat: '',
        NationalFormat: '',
        country: { disconnect: [], connect: [ { id: country.id} ] },
        phone_number_type: { disconnect: [], connect: [ { id: phoneNumberTypeHome.id} ] },
    },
  });             
  expect(validPhoneNumber).toBeDefined();
  expect(validPhoneNumber.id).toBeDefined();

  await strapi.query("api::phone-number.phone-number").update({
    where: { id: validPhoneNumber.id },
    data: {
        RawFormat: '8554708381',
        IsValidated: true, // Old value, should be updated in beforeUpdate lifecycle event
        E164Format: '+18554708380', // Old value, should be updated in beforeUpdate lifecycle event
        InternationalFormat: '+1 855-470-8380', // Old value, should be updated in beforeUpdate lifecycle event
        NationalFormat: '(855) 470-8380', // Old value, should be updated in beforeUpdate lifecycle event
        country: { disconnect: [], connect: [] },
        phone_number_type: { disconnect: [], connect: [] },
    },
  });
       

  /** Gets the default user role */
  const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

  const role = defaultRole ? defaultRole.id : null;

  /** Creates a new user an push to database */
  const user = await strapi.plugins['users-permissions'].services.user.add({
      ...mockUserData,
      username: 'phonenumbertester3',
      email: 'phonenumbertester3@strapi.com',
      role,
  });
 
  const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
      id: user.id,
    });    
    
  await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
  .get("/api/phone-numbers/" + validPhoneNumber.id)
  .set('accept', 'application/json')
  .set('Content-Type', 'application/json')
  .set('Authorization', 'Bearer ' + jwt)
  .expect("Content-Type", /json/)
  .expect(200)
  .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.attributes).toBeDefined();
      expect(data.body.data.attributes.IsValidated).toBe(true);
      expect(data.body.data.attributes.E164Format).toBe('+18554708381');
      expect(data.body.data.attributes.InternationalFormat).toBe('+1 855-470-8381');
      expect(data.body.data.attributes.NationalFormat).toBe('(855) 470-8381');
  });
});

it("PhoneNumber: Should validate a valid existing phone number with an invalid new number and de-populate formatted values", async () => {
  const country = await strapi.query('api::country.country').findOne({
      where: {
          A2: 'US',
      }
  }, []);
  expect(country).toBeDefined();
  expect(country.id).toBeDefined();
  const phoneNumberTypeHome = await strapi.query('api::phone-number-type.phone-number-type').findOne({
      where: {
          Name: 'Home',
      }
  }, []);
  expect(phoneNumberTypeHome).toBeDefined();
  expect(phoneNumberTypeHome.id).toBeDefined();
  const validPhoneNumber = await strapi.query("api::phone-number.phone-number").create({
    data: {
        RawFormat: '8554708382',
        IsValidated: false,
        E164Format: '',
        InternationalFormat: '',
        NationalFormat: '',
        country: { disconnect: [], connect: [ { id: country.id} ] },
        phone_number_type: { disconnect: [], connect: [ { id: phoneNumberTypeHome.id} ] },
    },
  });             
  expect(validPhoneNumber).toBeDefined();
  expect(validPhoneNumber.id).toBeDefined();

  await strapi.query("api::phone-number.phone-number").update({
    where: { id: validPhoneNumber.id },
    data: {
        RawFormat: 'bad data',
        IsValidated: true, // Old value, should be updated in beforeUpdate lifecycle event
        E164Format: '+18554708382', // Old value, should be updated in beforeUpdate lifecycle event
        InternationalFormat: '+1 855-470-8382', // Old value, should be updated in beforeUpdate lifecycle event
        NationalFormat: '(855) 470-8382', // Old value, should be updated in beforeUpdate lifecycle event
        country: { disconnect: [], connect: [] },
        phone_number_type: { disconnect: [], connect: [] },
    },
  });
       

  /** Gets the default user role */
  const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

  const role = defaultRole ? defaultRole.id : null;

  /** Creates a new user an push to database */
  const user = await strapi.plugins['users-permissions'].services.user.add({
      ...mockUserData,
      username: 'phonenumbertester4',
      email: 'phonenumbertester4@strapi.com',
      role,
  });
 
  const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
      id: user.id,
    });    
    
  await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
  .get("/api/phone-numbers/" + validPhoneNumber.id)
  .set('accept', 'application/json')
  .set('Content-Type', 'application/json')
  .set('Authorization', 'Bearer ' + jwt)
  .expect("Content-Type", /json/)
  .expect(200)
  .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.attributes).toBeDefined();
      expect(data.body.data.attributes.IsValidated).toBe(false);
      expect(data.body.data.attributes.E164Format).toBe('');
      expect(data.body.data.attributes.InternationalFormat).toBe('');
      expect(data.body.data.attributes.NationalFormat).toBe('');
  });
});

it("PhoneNumber: Should validate an invalid existing phone number with a valid new number and populate formatted values", async () => {
  const country = await strapi.query('api::country.country').findOne({
      where: {
          A2: 'US',
      }
  }, []);
  expect(country).toBeDefined();
  expect(country.id).toBeDefined();
  const phoneNumberTypeHome = await strapi.query('api::phone-number-type.phone-number-type').findOne({
      where: {
          Name: 'Home',
      }
  }, []);
  expect(phoneNumberTypeHome).toBeDefined();
  expect(phoneNumberTypeHome.id).toBeDefined();
  const invalidPhoneNumber = await strapi.query("api::phone-number.phone-number").create({
      data: {
          RawFormat: 'bad data',
          IsValidated: false,
          E164Format: '',
          InternationalFormat: '',
          NationalFormat: '',
          country: { disconnect: [], connect: [ { id: country.id} ] },
          phone_number_type: { disconnect: [], connect: [ { id: phoneNumberTypeHome.id} ] },
      },
  });             
  expect(invalidPhoneNumber).toBeDefined();
  expect(invalidPhoneNumber.id).toBeDefined();

  await strapi.query("api::phone-number.phone-number").update({
    where: { id: invalidPhoneNumber.id },
    data: {
        RawFormat: '18554708383',
        IsValidated: false, // Old value, should be updated in beforeUpdate lifecycle event
        E164Format: '', // Old value, should be updated in beforeUpdate lifecycle event
        InternationalFormat: '', // Old value, should be updated in beforeUpdate lifecycle event
        NationalFormat: '', // Old value, should be updated in beforeUpdate lifecycle event
        country: { disconnect: [], connect: [] },
        phone_number_type: { disconnect: [], connect: [] },
    },
  });

  /** Gets the default user role */
  const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

  const role = defaultRole ? defaultRole.id : null;

  /** Creates a new user an push to database */
  const user = await strapi.plugins['users-permissions'].services.user.add({
      ...mockUserData,
      username: 'phonenumbertester5',
      email: 'phonenumbertester5@strapi.com',
      role,
  });
 
  const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
      id: user.id,
    });    
    
  await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
  .get("/api/phone-numbers/" + invalidPhoneNumber.id)
  .set('accept', 'application/json')
  .set('Content-Type', 'application/json')
  .set('Authorization', 'Bearer ' + jwt)
  .expect("Content-Type", /json/)
  .expect(200)
  .then((data) => {
    expect(data).toBeDefined();
    expect(data.body).toBeDefined();
    expect(data.body.data).toBeDefined();
    expect(data.body.data.attributes).toBeDefined();
    expect(data.body.data.attributes.IsValidated).toBe(true);
    expect(data.body.data.attributes.E164Format).toBe('+18554708383');
    expect(data.body.data.attributes.InternationalFormat).toBe('+1 855-470-8383');
    expect(data.body.data.attributes.NationalFormat).toBe('(855) 470-8383'); 
  });
});