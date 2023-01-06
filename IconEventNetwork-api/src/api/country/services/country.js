'use strict';
const tr = require('transliteration');

/**
 * country service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::country.country', ({ strapi }) =>  ({
    async getA2(countryId) {
        const country = await strapi.entityService.findOne('api::country.country', countryId, { fields: ['A2'] });      
        return country ? country.A2 : '';
    },

    async cleanupFields(event) {
        event.params.data.SearchableName = tr.transliterate(event.params.data.Name).toLowerCase();
        event.params.data.A2 = event.params.data.A2.toUpperCase();
        if (event.params.data.A2.length > 2) event.params.data.A2 = event.params.data.A2.substr(0,2);
        event.params.data.A3 = event.params.data.A3.toUpperCase();
        if (event.params.data.A3.length > 3) event.params.data.A3 = event.params.data.A3.substr(0,3);
        return event;
    },
}));
