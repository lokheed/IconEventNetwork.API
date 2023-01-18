'use strict';

/**
 * company controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::company.company', ({ strapi }) => ({
    // Extend the core update controller with additional security
    async update(ctx) {
        let canManageCompanyDetails = await strapi.service('api::company.company').canManageCompanyDetails(ctx);
        if (!canManageCompanyDetails) return ctx.forbidden('This user is forbidden to manage this company', {});

        const response = await super.update(ctx);
        return response;
    },
}));

