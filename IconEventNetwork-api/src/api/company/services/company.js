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

    async canManageCompanyDetails(ctx) {
        const userId = ctx.state.user.id;
        const companyId = ctx.request.params.id;

        // Check 1: Does this user have a PersonAtCompany record with CanManageCompanyDetails set to true?
        const people = await strapi.entityService.findMany('api::person.person', {
            filters: {
                Users: {
                    id: {
                        $eq: userId,
                    },
                }
            },
        });
        if (people.length > 0) {
            let person = people[0]; // A user should only ever have 1 Person record.
            let personsAtCompany = await strapi.entityService.findMany('api::person-at-company.person-at-company', {
                filters: {
                    Person: {
                        id: {
                            $eq: person.id,
                        }
                    },
                    Company: {
                        id: {
                            $eq: companyId,
                        }
                    },
                    CanManageCompanyDetails: {
                        $eq: true,
                    },
                }
            });
            if (personsAtCompany.length > 0) return true;
        }

 
        // TODO: check if user is Icon admin

        // All checks completed, If none returned true by this point, fall through to false
        return false;
    }
}));
