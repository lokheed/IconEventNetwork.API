'use strict';

/**
 * company controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::company.company', ({ strapi }) => ({
    async canManageCompany(ctx) {
        let canManageCompanyDetails = await strapi.service('api::company.company').canManageCompanyDetails(ctx);
        let canViewCompanyDetails = await strapi.service('api::company.company').canViewCompanyDetails(ctx);
        if (!canManageCompanyDetails && !canViewCompanyDetails) {
            return ctx.forbidden('This user is forbidden to view or manage this company', {});
        }

        ctx.body = {
            canManageCompanyDetails: canManageCompanyDetails, 
            canViewCompanyDetails: canViewCompanyDetails,
        }    
    },

    // Extend the core update controller with additional security
    async update(ctx) {
        let canManageCompanyDetails = await strapi.service('api::company.company').canManageCompanyDetails(ctx);
        if (!canManageCompanyDetails) return ctx.forbidden('This user is forbidden to manage this company', {});

        const response = await super.update(ctx);
        return response;
    },
}));

