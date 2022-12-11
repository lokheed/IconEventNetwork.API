const request = require('supertest');

// user mock data
const mockUserData = {
    username: "emailaddresstester",
    email: "emailaddresstester@strapi.com",
    provider: "local",
    password: "1234abc",
    confirmed: true,
    blocked: null,
};

it("EmailAddress: Should validate a valid new email address and mark it as valid", async () => {
    const emailAddressTypePersonal = await strapi.query('api::email-address-type.email-address-type').findOne({
        where: {
            Name: 'Personal',
        }
    }, []);
    expect(emailAddressTypePersonal).toBeDefined();
    expect(emailAddressTypePersonal.id).toBeDefined();
    const validEmailAddress = await strapi.query("api::email-address.email-address").create({
        data: {
            EmailAddress: 'valid@theiconnetwork.com',
            IsValidated: false,
            email_address_type: { disconnect: [], connect: [ { id: emailAddressTypePersonal.id } ] },
        },
    });             
    expect(validEmailAddress).toBeDefined();
    expect(validEmailAddress.id).toBeDefined();

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
    .get("/api/email-addresses/" + validEmailAddress.id)
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
        expect(data.body.data.attributes.EmailAddress).toBe('valid@theiconnetwork.com');
    });
});

it("EmailAddress: Should validate an invalid new email address and mark it as invalid", async () => {
  const emailAddressTypePersonal = await strapi.query('api::email-address-type.email-address-type').findOne({
      where: {
          Name: 'Personal',
      }
  }, []);
  expect(emailAddressTypePersonal).toBeDefined();
  expect(emailAddressTypePersonal.id).toBeDefined();
  const invalidEmailAddress = await strapi.query("api::email-address.email-address").create({
      data: {
        EmailAddress: 'invalid@test.com', // The email validator does not see anything from test.com as valid
          IsValidated: false,
          email_address_type: { disconnect: [], connect: [ { id: emailAddressTypePersonal.id} ] },
      },
  });             
  expect(invalidEmailAddress).toBeDefined();
  expect(invalidEmailAddress.id).toBeDefined();

  /** Gets the default user role */
  const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

  const role = defaultRole ? defaultRole.id : null;

  /** Creates a new user an push to database */
  const user = await strapi.plugins['users-permissions'].services.user.add({
      ...mockUserData,
      username: 'emailaddresstester2',
      email: 'emailaddresstester2@strapi.com',
      role,
  });
 
  const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
      id: user.id,
    });    
    
  await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
  .get("/api/email-addresses/" + invalidEmailAddress.id)
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
  });
});

it("EmailAddress: Should validate a valid existing email address with a valid new email address and mark it as valid", async () => {
  const emailAddressTypePersonal = await strapi.query('api::email-address-type.email-address-type').findOne({
      where: {
          Name: 'Personal',
      }
  }, []);
  expect(emailAddressTypePersonal).toBeDefined();
  expect(emailAddressTypePersonal.id).toBeDefined();
  const validEmailAddress = await strapi.query("api::email-address.email-address").create({
    data: {
        EmailAddress: 'valid2@theiconnetwork.com',
        IsValidated: false,
        email_address_type: { disconnect: [], connect: [ { id: emailAddressTypePersonal.id} ] },
    },
  });             
  expect(validEmailAddress).toBeDefined();
  expect(validEmailAddress.id).toBeDefined();

  await strapi.query("api::email-address.email-address").update({
    where: { id: validEmailAddress.id },
    data: {
        EmailAddress: 'valid3@theiconnetwork.com',
        IsValidated: true, // Old value, should be updated in beforeUpdate lifecycle event
        email_address_type: { disconnect: [], connect: [] },
    },
  });
       

  /** Gets the default user role */
  const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

  const role = defaultRole ? defaultRole.id : null;

  /** Creates a new user an push to database */
  const user = await strapi.plugins['users-permissions'].services.user.add({
      ...mockUserData,
      username: 'emailaddresstester3',
      email: 'emailaddresstester3@strapi.com',
      role,
  });
 
  const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
      id: user.id,
    });    
    
  await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
  .get("/api/email-addresses/" + validEmailAddress.id)
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
  });
});

it("EmailAddress: Should validate a valid existing email address with an invalid new email address and mark it as invalid", async () => {
  const emailAddressTypePersonal = await strapi.query('api::email-address-type.email-address-type').findOne({
      where: {
          Name: 'Personal',
      }
  }, []);
  expect(emailAddressTypePersonal).toBeDefined();
  expect(emailAddressTypePersonal.id).toBeDefined();
  const validEmailAddress = await strapi.query("api::email-address.email-address").create({
    data: {
        EmailAddress: 'valid4@theiconnetwork.com',
        IsValidated: false,
        email_address_type: { disconnect: [], connect: [ { id: emailAddressTypePersonal.id} ] },
    },
  });             
  expect(validEmailAddress).toBeDefined();
  expect(validEmailAddress.id).toBeDefined();

  await strapi.query("api::email-address.email-address").update({
    where: { id: validEmailAddress.id },
    data: {
        EmailAddress: 'invalid2@test.com', // The email validator does not see any test.com address as valid
        IsValidated: true, // Old value, should be updated in beforeUpdate lifecycle event
        email_address_type: { disconnect: [], connect: [] },
    },
  });
       

  /** Gets the default user role */
  const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

  const role = defaultRole ? defaultRole.id : null;

  /** Creates a new user an push to database */
  const user = await strapi.plugins['users-permissions'].services.user.add({
      ...mockUserData,
      username: 'emailaddresstester4',
      email: 'emailaddresstester4@strapi.com',
      role,
  });
 
  const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
      id: user.id,
    });    
    
  await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
  .get("/api/email-addresses/" + validEmailAddress.id)
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
  });
});

it("EmailAddress: Should validate an invalid existing email address with a valid new email address and mark it as valid", async () => {
  const emailAddressTypePersonal = await strapi.query('api::email-address-type.email-address-type').findOne({
      where: {
          Name: 'Personal',
      }
  }, []);
  expect(emailAddressTypePersonal).toBeDefined();
  expect(emailAddressTypePersonal.id).toBeDefined();
  const invalidEmailAddress = await strapi.query("api::email-address.email-address").create({
      data: {
          EmailAddress: 'invalid3@test.com', // The email validator does not see any test.com address as valid
          IsValidated: false,
          email_address_type: { disconnect: [], connect: [ { id: emailAddressTypePersonal.id} ] },
      },
  });             
  expect(invalidEmailAddress).toBeDefined();
  expect(invalidEmailAddress.id).toBeDefined();

  await strapi.query("api::email-address.email-address").update({
    where: { id: invalidEmailAddress.id },
    data: {
        EmailAddress: 'valid5@theiconnetwork.com',
        IsValidated: false, // Old value, should be updated in beforeUpdate lifecycle event
        email_address_type: { disconnect: [], connect: [] },
    },
  });

  /** Gets the default user role */
  const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

  const role = defaultRole ? defaultRole.id : null;

  /** Creates a new user an push to database */
  const user = await strapi.plugins['users-permissions'].services.user.add({
      ...mockUserData,
      username: 'emailaddresstester5',
      email: 'emailaddresstester5@strapi.com',
      role,
  });
 
  const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
      id: user.id,
    });    
    
  await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
  .get("/api/email-addresses/" + invalidEmailAddress.id)
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
  });
});