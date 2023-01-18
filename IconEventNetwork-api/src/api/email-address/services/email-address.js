'use strict';

/**
 * email-address service
 */

const fetch = require('node-fetch');
const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::email-address.email-address', ({ strapi }) =>  ({
    async verify(emailAddress) {
        const encodedEmailAddress = encodeURI(emailAddress);
        const response = await fetch(`https://api.bigdatacloud.net/data/email-verify?emailAddress=${encodedEmailAddress}&countryCode=$&key=${process.env.BIG_DATA_CLOUD_KEY}`);
        const verification = await response.json();
        return verification;
    }
}));