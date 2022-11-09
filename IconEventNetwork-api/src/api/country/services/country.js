'use strict';

/**
 * country service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::country.country', ({ strapi }) =>  ({
    async getA2(countryId) {
        const country = await strapi.entityService.findOne('api::country.country', countryId, { fields: ['A2'] });      
        return country ? country.A2 : '';
    }
}));
