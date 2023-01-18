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

it("EXTERNALDEPENDENCY-- PhoneNumber: Should validate a valid new phone number and populate formatted values", async () => {
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
    expect(validPhoneNumber.id).toBeGreaterThan(0);
    expect(validPhoneNumber.IsValidated).toBeDefined();
    expect(validPhoneNumber.IsValidated).toBe(true);
    expect(validPhoneNumber.E164Format).toBeDefined();
    expect(validPhoneNumber.E164Format).toBe('+18335402304');
    expect(validPhoneNumber.InternationalFormat).toBeDefined();
    expect(validPhoneNumber.InternationalFormat).toBe('+1 833-540-2304');
    expect(validPhoneNumber.NationalFormat).toBeDefined();
    expect(validPhoneNumber.NationalFormat).toBe('(833) 540-2304');
});

it("EXTERNALDEPENDENCY-- PhoneNumber: Should validate an invalid new phone number and not populate formatted values", async () => {
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
  expect(invalidPhoneNumber.id).toBeGreaterThan(0);
  expect(invalidPhoneNumber.IsValidated).toBeDefined();
  expect(invalidPhoneNumber.IsValidated).toBe(false);
  expect(invalidPhoneNumber.E164Format).toBeDefined();
  expect(invalidPhoneNumber.E164Format).toBe('');
  expect(invalidPhoneNumber.InternationalFormat).toBeDefined();
  expect(invalidPhoneNumber.InternationalFormat).toBe('');
  expect(invalidPhoneNumber.NationalFormat).toBeDefined();
  expect(invalidPhoneNumber.NationalFormat).toBe('');
});

it("EXTERNALDEPENDENCY-- PhoneNumber: Should validate a valid existing phone number with a valid new number and populate formatted values", async () => {
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

  const updatedPhoneNumber = await strapi.query("api::phone-number.phone-number").update({
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
  expect(updatedPhoneNumber).toBeDefined();
  expect(updatedPhoneNumber.id).toBeDefined();
  expect(updatedPhoneNumber.id).toBe(validPhoneNumber.id);
  expect(updatedPhoneNumber.IsValidated).toBeDefined();
  expect(updatedPhoneNumber.IsValidated).toBe(true);
  expect(updatedPhoneNumber.E164Format).toBeDefined();
  expect(updatedPhoneNumber.E164Format).toBe('+18554708381');
  expect(updatedPhoneNumber.InternationalFormat).toBeDefined();
  expect(updatedPhoneNumber.InternationalFormat).toBe('+1 855-470-8381');
  expect(updatedPhoneNumber.NationalFormat).toBeDefined();
  expect(updatedPhoneNumber.NationalFormat).toBe('(855) 470-8381');
});

it("EXTERNALDEPENDENCY-- PhoneNumber: Should validate a valid existing phone number with an invalid new number and de-populate formatted values", async () => {
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

  const updatedPhoneNumber = await strapi.query("api::phone-number.phone-number").update({
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
  expect(updatedPhoneNumber).toBeDefined();
  expect(updatedPhoneNumber.id).toBeDefined();
  expect(updatedPhoneNumber.id).toBe(validPhoneNumber.id);
  expect(updatedPhoneNumber.IsValidated).toBeDefined();
  expect(updatedPhoneNumber.IsValidated).toBe(false);
  expect(updatedPhoneNumber.E164Format).toBeDefined();
  expect(updatedPhoneNumber.E164Format).toBe('');
  expect(updatedPhoneNumber.InternationalFormat).toBeDefined();
  expect(updatedPhoneNumber.InternationalFormat).toBe('');
  expect(updatedPhoneNumber.NationalFormat).toBeDefined();
  expect(updatedPhoneNumber.NationalFormat).toBe('');
});

it("EXTERNALDEPENDENCY-- PhoneNumber: Should validate an invalid existing phone number with a valid new number and populate formatted values", async () => {
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

  const updatedPhoneNumber = await strapi.query("api::phone-number.phone-number").update({
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
  expect(updatedPhoneNumber).toBeDefined();
  expect(updatedPhoneNumber.id).toBeDefined();
  expect(updatedPhoneNumber.id).toBe(invalidPhoneNumber.id);
  expect(updatedPhoneNumber.IsValidated).toBeDefined();
  expect(updatedPhoneNumber.IsValidated).toBe(true);
  expect(updatedPhoneNumber.E164Format).toBeDefined();
  expect(updatedPhoneNumber.E164Format).toBe('+18554708383');
  expect(updatedPhoneNumber.InternationalFormat).toBeDefined();
  expect(updatedPhoneNumber.InternationalFormat).toBe('+1 855-470-8383');
  expect(updatedPhoneNumber.NationalFormat).toBeDefined();
  expect(updatedPhoneNumber.NationalFormat).toBe('(855) 470-8383');
});

it("EXTERNALDEPENDENCY-- PhoneNumber: Should throw an exception when attempting to create a new PhoneNumber with no Country", async () => {
    expect.assertions(3); // required in case the exception is NOT thrown, not having the last assertion will fail the test
  
    const phoneNumberTypeHome = await strapi.query('api::phone-number-type.phone-number-type').findOne({
        where: {
            Name: 'Home',
        }
    }, []);
    expect(phoneNumberTypeHome).toBeDefined();
    expect(phoneNumberTypeHome.id).toBeDefined();
    try {
        await strapi.query("api::phone-number.phone-number").create({
            data: {
                RawFormat: '8335402304',
                IsValidated: false,
                E164Format: '',
                InternationalFormat: '',
                NationalFormat: '',
                country: { disconnect: [], connect: [] },
                phone_number_type: { disconnect: [], connect: [ { id: phoneNumberTypeHome.id} ] },
            },
        });   
    } catch (e) {
        expect(e).toBeDefined();
    }
          
});

it("EXTERNALDEPENDENCY-- PhoneNumber: Should throw an exception when attempting to create a new PhoneNumber with no PhoneNumberType", async () => {
    expect.assertions(3); // required in case the exception is NOT thrown, not having the last assertion will fail the test
    
    const country = await strapi.query('api::country.country').findOne({
        where: {
            A2: 'US',
        }
    }, []);
    expect(country).toBeDefined();
    expect(country.id).toBeDefined();

    try {
        await strapi.query("api::phone-number.phone-number").create({
            data: {
                RawFormat: '8335402304',
                IsValidated: false,
                E164Format: '',
                InternationalFormat: '',
                NationalFormat: '',
                country: { disconnect: [], connect: [ { id: country.id} ] },
                phone_number_type: { disconnect: [], connect: [] },
            },
        });   
    } catch (e) {
        expect(e).toBeDefined();
    }         
});