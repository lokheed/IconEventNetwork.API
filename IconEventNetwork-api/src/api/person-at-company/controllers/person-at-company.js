'use strict';

/**
 * person-at-company controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::person-at-company.person-at-company', ({ strapi }) => ({
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
