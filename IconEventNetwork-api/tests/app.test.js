const fs = require('fs');
const { setupStrapi, cleanupStrapi, grantPrivilege } = require("./helpers/strapi");
jest.setTimeout(150000);

beforeAll(async () => {
  await setupStrapi();
  await grantPrivilege(1, {
    "address": ["create","update","find","findOne"],
    "address-type": ["create","update","find","findOne"],
    "company-status": ["create","update","find","findOne"],
    "company-type": ["create","update","find","findOne"],
    "country": ["create","update","find","findOne"],
    "countrysubdivision": ["create","update","find","findOne"],
    "email-address": ["create","update","find","findOne"],
    "email-address-type": ["create","update","find","findOne"],
    "phone-number": ["create","update","find","findOne"],
    "phone-number-type": ["create","update","find","findOne"],
  });
});

afterAll(async () => {
  await cleanupStrapi();
});

it("Strapi: Strapi is defined", () => {
  expect(strapi).toBeDefined();
});

require('./user');
require('./country');
require('./countrysubdivision');
require('./address-type');
require('./address'); // NOTE: country, countrysubdivision, and address-type are dependencies of address, their tests MUST be run first
require('./company-status');
require('./company-type');
require('./email-address-type');
require('./email-address'); //NOTE: email-address-type is a dependency of email-address, their tests MUST be run first
require('./phone-number-type');
require('./phone-number'); //NOTE: phone-number-type and country are dependencies of phone-number, their tests MUST be run first
