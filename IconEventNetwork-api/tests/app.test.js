const fs = require('fs');
const { setupStrapi, cleanupStrapi, grantPrivilege } = require("./helpers/strapi");
jest.setTimeout(150000);

beforeAll(async () => {
  await setupStrapi();
  await grantPrivilege(1, {
    "phone-number-type": ["create","update","find","findOne"],
    "country": ["create","update","find","findOne"],
    "phone-number": ["create","update","find","findOne"],
    "email-address-type": ["create","update","find","findOne"],
    "email-address": ["create","update","find","findOne"],
  });
});

afterAll(async () => {
  await cleanupStrapi();
});

it("Strapi: Strapi is defined", () => {
  expect(strapi).toBeDefined();
});

require('./user');
require('./phone-number-type');
require('./country');
require('./phone-number'); //NOTE: phone-number-type and country are dependencies of phone-number, their tests MUST be run first
require('./email-address-type');
require('./email-address'); //NOTE: email-address-type is a dependency of email-address, their tests MUST be run first