'use strict';

/**
 * person-at-company controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::person-at-company.person-at-company', ({ strapi }) => ({
    async canManagePersonAtCompany(ctx) {
        let canManageProfileFields = await strapi.service('api::person-at-company.person-at-company').canManageProfileFields(ctx);
        let canManageActiveArchiveFlags = await strapi.service('api::person-at-company.person-at-company').canManageActiveArchiveFlags(ctx);
        let canManageCompanyDetailsAndStaffFlags = await strapi.service('api::person-at-company.person-at-company').canManageCompanyDetailsAndStaffFlags(ctx);
        let canViewPersonAtCompany = await strapi.service('api::person-at-company.person-at-company').canViewPersonAtCompany(ctx);
        if (!canManageProfileFields && !canManageActiveArchiveFlags && !canManageCompanyDetailsAndStaffFlags && !canViewPersonAtCompany) {
            return ctx.forbidden('This user is forbidden to view or manage this person at this company', {});
        }

        ctx.body = {
            canManageProfileFields: canManageProfileFields, 
            canManageActiveArchiveFlags: canManageActiveArchiveFlags,
            canManageCompanyDetailsAndStaffFlags: canManageCompanyDetailsAndStaffFlags,
            canViewPersonAtCompany: canViewPersonAtCompany,
        }    
    },

    // Extend the core update controller with additional security
    async update(ctx) {
        let canManageProfileFields = await strapi.service('api::person-at-company.person-at-company').canManageProfileFields(ctx);
        if (!canManageProfileFields) ctx = await strapi.service('api::person-at-company.person-at-company').disallowProfileFieldChanges(ctx);
        let canManageActiveArchiveFlags = await strapi.service('api::person-at-company.person-at-company').canManageActiveArchiveFlags(ctx);
        if (!canManageActiveArchiveFlags) ctx = await strapi.service('api::person-at-company.person-at-company').disallowActiveArchiveFlags(ctx);
        let canManageCompanyDetailsAndStaffFlags = await strapi.service('api::person-at-company.person-at-company').canManageCompanyDetailsAndStaffFlags(ctx);
        if (!canManageCompanyDetailsAndStaffFlags) ctx = await strapi.service('api::person-at-company.person-at-company').disallowCompanyDetailsAndStaffFlags(ctx);

        const response = await super.update(ctx);
        return response;
    },
}));
