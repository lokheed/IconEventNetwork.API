'use strict';

/**
 * phone-number service
 */

const fetch = require('node-fetch');
const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::phone-number.phone-number', ({ strapi }) =>  ({
    async verify(rawPhoneNumber, countryCode) {
        const encodedPhoneNumber = encodeURI(rawPhoneNumber);
        const response = await fetch(`https://api.bigdatacloud.net/data/phone-number-validate?number=${encodedPhoneNumber}&countryCode=${countryCode}&key=${process.env.BIG_DATA_CLOUD_KEY}`);
        const verification = await response.json();
        return verification;
    }
}));
