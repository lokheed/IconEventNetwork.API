'use strict';

/**
 * person-at-company service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::person-at-company.person-at-company', ({ strapi }) =>  ({
    async cleanupFields(event) {
         // Trim up text fields
         if (event.params.data.JobTitle)  event.params.data.JobTitle = event.params.data.JobTitle.trim();
         if (event.params.data.Tagline)  event.params.data.Tagline = event.params.data.Tagline.trim();
         if (event.params.data.Description)  event.params.data.Description = event.params.data.Description.trim();
         if (event.params.data.Website)  event.params.data.Website = event.params.data.Website.trim();

         return event;
     },
}));
