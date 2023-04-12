'use strict';
const tr = require('transliteration');

/**
 * company service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::company.company', ({ strapi }) =>  ({
    async cleanupFields(event) {
         // Trim up text fields
         if (event.params.data.Name)  event.params.data.Name = event.params.data.Name.trim();
         if (event.params.data.InvoiceCompanyName)  event.params.data.InvoiceCompanyName = event.params.data.InvoiceCompanyName.trim();
         if (event.params.data.Tagline)  event.params.data.Tagline = event.params.data.Tagline.trim();
         if (event.params.data.Description)  event.params.data.Description = event.params.data.Description.trim();
         if (event.params.data.Website)  event.params.data.Website = event.params.data.Website.trim();
 
         // Default InvoiceCompanyName to "CompanyName" if InvoiceCompanyName is blank
         if (!event.params.data.InvoiceCompanyName) event.params.data.InvoiceCompanyName = '';
         if ((event.params.data.InvoiceCompanyName??'') === '' && event.params.data.Name) {
             event.params.data.InvoiceCompanyName = event.params.data.Name;
         }
 
         // Set SearchableName to transliterated Name converted ot lower case
         if (event.params.data.Name)  event.params.data.SearchableName = tr.transliterate(event.params.data.Name).toLowerCase();  

         return event;
     },

    async canManageCompanyDetails(ctx) {
        const userId = ctx.state.user.id;
        const companyId = ctx.request.params.id;

        // Check 1: Does this user have a PersonAtCompany record with CanManageCompanyDetails set to true?
        const people = await strapi.entityService.findMany('api::person.person', {
            filters: {
                user: {
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
                    IsActive: {
                        $eq: true,
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
    },

    async canViewCompanyDetails(ctx) {
        const userId = ctx.state.user.id;
        const companyId = ctx.request.params.id;
        let personsAtCompany;
        let person;
        let parentCompanyId = companyId; // default to company id, this gets reset on Check 2 if this company has a parent
        const people = await strapi.entityService.findMany('api::person.person', {
            filters: {
                user: {
                    id: {
                        $eq: userId,
                    },
                }
            },
        });
        if (people.length > 0) {
            person = people[0]; // A user should only ever have 1 Person record.

        }

        if (!person) return false; // No Person record found, return false.

        // Check 1: Does this user have an active PersonAtCompany record for this company?
        personsAtCompany = await strapi.entityService.findMany('api::person-at-company.person-at-company', {
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
                IsActive: {
                    $eq: true,
                },
            }
        });
        if (personsAtCompany.length > 0) return true;

        // Check 2: Does this company have a parent, and if so does this user have a PersonAtCompany record for that parent?
        let company = await strapi.entityService.findOne('api::company.company', companyId, {
            fields: ['ParentCompanyId'],
        });
        if (company && company.ParentCompanyId > 0) {
            parentCompanyId = company.ParentCompanyId;
            personsAtCompany = await strapi.entityService.findMany('api::person-at-company.person-at-company', {
                filters: {
                    Person: {
                        id: {
                            $eq: person.id,
                        }
                    },
                    Company: {
                        id: {
                            $eq: parentCompanyId,
                        }
                    },
                    IsActive: {
                        $eq: true,
                    },
                }
            });
            if (personsAtCompany.length > 0) return true;            
        }

        // Check 3: Does this user have an active PersonAtCompany record at any of this company's siblings or children?
        personsAtCompany = await strapi.entityService.findMany('api::person-at-company.person-at-company', {
            filters: {
                Person: {
                    id: {
                        $eq: person.id,
                    }
                },
                Company: {
                    ParentCompanyId: {
                        $eq: parentCompanyId,
                    }
                },
                IsActive: {
                    $eq: true,
                },
            }
        });
        if (personsAtCompany.length > 0) return true;            

        // TODO: check if user is Icon admin

        // All checks completed, If none returned true by this point, fall through to false
        return false;
    }
}));
