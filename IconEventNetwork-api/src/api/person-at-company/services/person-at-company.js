'use strict';

/**
 * person-at-company service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::person-at-company.person-at-company', ({ strapi }) =>  ({
    async cleanupFields(event) {
         // Trim up text fields
         if (event.params.data.JobTitle)  event.params.data.JobTitle = event.params.data.JobTitle.trim();
         if (event.params.data.Bio)  event.params.data.Bio = event.params.data.Bio.trim();

         return event;
     },

     async disallowPersonAndCompanyChanges(event) {
        if (event.params.data?.Person?.disconnect) event.params.data.Person.disconnect = [];
        if (event.params.data?.Person?.connect) event.params.data.Person.connect = [];
        if (event.params.data?.Company?.disconnect) event.params.data.Company.disconnect = [];
        if (event.params.data?.Company?.connect) event.params.data.Company.connect = [];
        return event;
     },

     async canManageProfileFields(ctx) {
        let canManage = false;
        const userId = ctx.state.user.id;
        const personAtCompanyId = ctx.request.params.id;
        const thisPersonAtCompany = await strapi.entityService.findOne('api::person-at-company.person-at-company', personAtCompanyId, {
            populate: { Person: true, Company: true },
        });

        if (!thisPersonAtCompany) return false;
     
        // Check 1: Is this user this PersonAtCompany?
        const person = await strapi.entityService.findOne('api::person.person', thisPersonAtCompany.Person.id, {
            populate: { Users: true },
        });

        if (!person) return false;

        person.Users.forEach(function(user) {
            if (user.id === userId) {
                canManage = true;
            }
        });


        // Check 2: Does this user have canManageCompanyStaff rights for this company?
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
            let adminPerson = people[0]; // A user should only ever have 1 Person record.
            let adminPersonsAtCompany = await strapi.entityService.findMany('api::person-at-company.person-at-company', {
                filters: {
                    Person: {
                        id: {
                            $eq: adminPerson.id,
                        }
                    },
                    Company: {
                        id: {
                            $eq: thisPersonAtCompany.Company.id,
                        }
                    },
                    IsActive: {
                        $eq: true,
                   },
                    CanManageCompanyStaff: {
                        $eq: true,
                   },
                }
            });
            if (adminPersonsAtCompany.length > 0) {
                canManage = true;
            }
        }
     
        // TODO: check if user is Icon admin

        // All checks completed, If none returned true by this point, fall through to false
        return canManage;
     },

     async disallowProfileFieldChanges(ctx) {
        const personAtCompanyId = ctx.request.params.id;
        const thisPersonAtCompany = await strapi.entityService.findOne('api::person-at-company.person-at-company', personAtCompanyId, {});
        if (ctx.request.body.data?.JobTitle) ctx.request.body.data.JobTitle = thisPersonAtCompany.JobTitle;
        if (ctx.request.body.data?.Bio) ctx.request.body.data.Bio = thisPersonAtCompany.Bio;
        if (ctx.request.body.data?.SocialMediaAccounts?.disconnect) ctx.request.body.data.SocialMediaAccounts.disconnect = [];
        if (ctx.request.body.data?.SocialMediaAccounts?.connect) ctx.request.body.data.SocialMediaAccounts.connect = [];
        if (ctx.request.body.data?.Addresses?.disconnect) ctx.request.body.data.Addresses.disconnect = [];
        if (ctx.request.body.data?.Addresses?.connect) ctx.request.body.data.Addresses.connect = [];
        if (ctx.request.body.data?.PhoneNumbers?.disconnect) ctx.request.body.data.PhoneNumbers.disconnect = [];
        if (ctx.request.body.data?.PhoneNumbers?.connect) ctx.request.body.data.PhoneNumbers.connect = [];
        if (ctx.request.body.data?.EmailAddresses?.disconnect) ctx.request.body.data.EmailAddresses.disconnect = [];
        if (ctx.request.body.data?.EmailAddresses?.connect) ctx.request.body.data.EmailAddresses.connect = [];
        return ctx;
     },

     async canManageActiveArchiveFlags(ctx) {
        let canManage = false;
        const userId = ctx.state.user.id;
        const personAtCompanyId = ctx.request.params.id;
        const thisPersonAtCompany = await strapi.entityService.findOne('api::person-at-company.person-at-company', personAtCompanyId, {
            populate: { Person: true, Company: true },
        });

        if (!thisPersonAtCompany) return false;

        // Check 1: Does this user have canManageCompanyStaff rights for this company?
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
            let adminPerson = people[0]; // A user should only ever have 1 Person record.
            let adminPersonsAtCompany = await strapi.entityService.findMany('api::person-at-company.person-at-company', {
                filters: {
                    id: {
                        $ne: personAtCompanyId, // A user cannot modify their own PersonAtCompany IsActive of IsArchived flags even if they are a staff admin
                    },
                    Person: {
                        id: {
                            $eq: adminPerson.id,
                        }
                    },
                    Company: {
                        id: {
                            $eq: thisPersonAtCompany.Company.id,
                        }
                    },
                    IsActive: {
                        $eq: true,
                   },
                    CanManageCompanyStaff: {
                        $eq: true,
                   },
                }
            });
            if (adminPersonsAtCompany.length > 0) {
                 canManage = true;
            }
        }
     
        // TODO: check if user is Icon admin

        // All checks completed, If none returned true by this point, fall through to false
        return canManage;
     },

     async disallowActiveArchiveFlags(ctx) {
        const personAtCompanyId = ctx.request.params.id;
        const thisPersonAtCompany = await strapi.entityService.findOne('api::person-at-company.person-at-company', personAtCompanyId, {
            fields: ['IsActive', 'IsArchived'],
        });
        if (ctx.request.body.data.IsActive !== undefined) ctx.request.body.data.IsActive = thisPersonAtCompany.IsActive;
        if (ctx.request.body.data.IsArchived !== undefined) ctx.request.body.data.IsArchived = thisPersonAtCompany.IsArchived;
        return ctx;
     },

     async canManageCompanyDetailsAndStaffFlags(ctx) {
        let canManage = false;
        const userId = ctx.state.user.id;
        const personAtCompanyId = ctx.request.params.id;
        const thisPersonAtCompany = await strapi.entityService.findOne('api::person-at-company.person-at-company', personAtCompanyId, {
            populate: { Person: true, Company: true },
        });

        if (!thisPersonAtCompany) return false;

        // Check 1: Does this user have canManageCompanyStaff rights for this company, and this record is not their own?
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
            const adminPerson = people[0]; // A user should only ever have 1 Person record.
            const adminPersonsAtCompany = await strapi.entityService.findMany('api::person-at-company.person-at-company', {
                filters: {
                    id: {
                        $ne: personAtCompanyId,
                    },
                    Person: {
                        id: {
                            $eq: adminPerson.id,
                        }
                    },
                    Company: {
                        id: {
                            $eq: thisPersonAtCompany.Company.id,
                        }
                    },
                    IsActive: {
                        $eq: true,
                   },
                    CanManageCompanyStaff: {
                        $eq: true,
                   },
                }
            });
            if (adminPersonsAtCompany.length > 0) {
                 canManage = true;
            }
        }

        // Check 2: Does this user have canManageCompanyStaff rights for this company, this record is their own, and there is at least one other active staff admin for this company?
        const thisPerson = await strapi.entityService.findOne('api::person.person', thisPersonAtCompany.Person.id, {
            populate: { Users: true },
        });
        let isThisUsersOwnPersonAtCompanyRecord = false;
        if (thisPerson && thisPerson.Users.length > 0) {
            thisPerson.Users.forEach(function(user) {
                if (user.id === userId) {
                    isThisUsersOwnPersonAtCompanyRecord = true;
                }
            });    
        }
        if (isThisUsersOwnPersonAtCompanyRecord) {
            const otherAdminPersonsAtCompany = await strapi.entityService.findMany('api::person-at-company.person-at-company', {
                filters: {
                    id: {
                        $ne: personAtCompanyId,
                    },
                    Company: {
                        id: {
                            $eq: thisPersonAtCompany.Company.id,
                        }
                    },
                    IsActive: {
                        $eq: true,
                   },
                    CanManageCompanyStaff: {
                        $eq: true,
                   },
                }
            });
            if (otherAdminPersonsAtCompany.length > 0) {
                 canManage = true;
            }
        }
     
        // TODO: check if user is Icon admin

        // All checks completed, If none returned true by this point, fall through to false
        return canManage;     
     },

     async disallowCompanyDetailsAndStaffFlags(ctx) {
        const personAtCompanyId = ctx.request.params.id;
        const thisPersonAtCompany = await strapi.entityService.findOne('api::person-at-company.person-at-company', personAtCompanyId, {
            fields: ['CanManageCompanyDetails', 'CanManageCompanyStaff'],
        });
        if (ctx.request.body.data.CanManageCompanyDetails !== undefined) ctx.request.body.data.CanManageCompanyDetails = thisPersonAtCompany.CanManageCompanyDetails;
        if (ctx.request.body.data.CanManageCompanyStaff !== undefined) ctx.request.body.data.CanManageCompanyStaff = thisPersonAtCompany.CanManageCompanyStaff;
        return ctx;
     },

     async deactivateAllPersonAtCompanyRecords(personId) {
        let personsAtCompanies = await strapi.entityService.findMany('api::person-at-company.person-at-company', {
            filters: {
                Person: {
                    id: {
                        $eq: personId,
                    }
                },
                 IsActive: {
                    $eq: true,
               },
            }
        });
        if (personsAtCompanies.length > 0) {
            for (let i = 0; i < personsAtCompanies.length; i++) {
                strapi.entityService.update('api::person-at-company.person-at-company', personsAtCompanies[i].id, {
                    data: {
                      IsActive: false,
                    },
                }); 
            }
        }
    },

    async canViewPersonAtCompany(ctx) {
        let canView = false;
        const userId = ctx.state.user.id;
        const personAtCompanyId = ctx.request.params.id;

        let viewingPerson;
        const people = await strapi.entityService.findMany('api::person.person', {
            filters: {
                Users: {
                    id: {
                       $eq: userId,
                    },
                }
           }    ,
        });
        if (people.length > 0) {
            viewingPerson = people[0]; // A user should only ever have 1 Person record.
        }
        if (!viewingPerson) return false; // The requesting user does not have a Person record

        const thisPersonAtCompany = await strapi.entityService.findOne('api::person-at-company.person-at-company', personAtCompanyId, {
           populate: { Person: true, Company: true },
        });
        if (!thisPersonAtCompany) return false; // The requested PersonAtCompany does not exist
        let companyId = thisPersonAtCompany.Company.id;
        let parentCompanyId = companyId; 
    
        // Check 1: Is this user this PersonAtCompany?
        if (thisPersonAtCompany.Person.id == viewingPerson.id) return true;

        // Check 2: Does this user have an active PersonAtCompany for this company?
         let viewingPersonsAtCompany = await strapi.entityService.findMany('api::person-at-company.person-at-company', {
            filters: {
                Person: {
                    id: {
                        $eq: viewingPerson.id,
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
        if (viewingPersonsAtCompany.length > 0) {
            return true;
        }

        // Check 3: Does this user have an active PersonAtCompany record at this company's parent?
        let company = await strapi.entityService.findOne('api::company.company', companyId, {
            fields: ['ParentCompanyId'],
        });
        if (company && company.id > 0 && company.ParentCompanyId && company.ParentCompanyId > 0) {
            parentCompanyId = company.ParentCompanyId;
            viewingPersonsAtCompany = await strapi.entityService.findMany('api::person-at-company.person-at-company', {
                filters: {
                    Person: {
                        id: {
                            $eq: viewingPerson.id,
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
            if (viewingPersonsAtCompany.length > 0) {
                return true;
            }    
        }

        // Check 4: Does this user  have an active PersonAtCompany record at any of the company's siblings?
        viewingPersonsAtCompany = await strapi.entityService.findMany('api::person-at-company.person-at-company', {
            filters: {
                Person: {
                    id: {
                        $eq: viewingPerson.id,
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
        if (viewingPersonsAtCompany.length > 0) {
            return true;
        }

       // TODO: check if user is Icon admin

       // All checks completed, If none returned true by this point, fall through to false
       return false;
    },
}));
