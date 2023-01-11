'use strict';

/**
 * person controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::person.person', ({ strapi }) => ({
    async getByRequestingUser(ctx) {
        const userId = ctx.state.user.id;
        // Find any existing Person records for the requesting user
        const people = await strapi.entityService.findMany('api::person.person', {
            populate: ['Users'],
            filters: {
                Users: {
                    id: userId,
                }
            },
        });

        // If any are found, return the first one.
        // There should only ever be one, and there should be a check in the beforeCreate
        // lifecycle method to prevent dupes.
        if (people.length > 0) {
            let person = people[0];
            ctx.body = { data: person };
            return;
        }

        // No Person record has yet been created for the requesting user,
        // create one here.
        let person = await strapi.query("api::person.person").create({
            data: {
                FirstName: '',
                MiddleName: '',
                LastName: '',
                DirectoryName: '',
                SearchableName: '',
                PreferredName: '',
                IsActive: true,
                IsArchived: false,
                IsHidden: false,
                Users: { disconnect: [], connect: [ { id: userId } ] },
            },
        });
        ctx.body = { data: person };
    },

    // Extend the core update controller with additional security
    async update(ctx) {
        let canManagePerson = await strapi.service('api::person.person').canManagePerson(ctx);
        if (!canManagePerson) return ctx.forbidden('This user is forbidden to manage this person', {});

        const response = await super.update(ctx);
        return response;
    }
}));
