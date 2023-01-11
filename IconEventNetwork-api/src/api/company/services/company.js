'use strict';
const tr = require('transliteration');

/**
 * company service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::company.company', ({ strapi }) =>  ({
    async cleanupFields(event) {
         // Trim up text fields
         if (!event.params.data.Name) event.params.data.Name = '';
         if (event.params.data.Name)  event.params.data.Name = event.params.data.Name.trim();
         if (event.params.data.InvoiceCompanyName)  event.params.data.InvoiceCompanyName = event.params.data.InvoiceCompanyName.trim();
         if (event.params.data.Tagline)  event.params.data.Tagline = event.params.data.Tagline.trim();
         if (event.params.data.Description)  event.params.data.Description = event.params.data.Description.trim();
         if (event.params.data.Website)  event.params.data.Website = event.params.data.Website.trim();
 
         // Default InvoiceCompanyName to "CompanyName" if InvoiceCompanyName is blank
         if (!event.params.data.InvoiceCompanyName) event.params.data.InvoiceCompanyName = '';
         if (event.params.data.InvoiceCompanyName === '' && event.params.data.Name) {
             event.params.data.InvoiceCompanyName = event.params.data.Name;
         }
 
         // Set SearchableName to transliterated Name converted ot lower case
         event.params.data.SearchableName = tr.transliterate(event.params.data.Name).toLowerCase();  

         return event;
     },
}));
