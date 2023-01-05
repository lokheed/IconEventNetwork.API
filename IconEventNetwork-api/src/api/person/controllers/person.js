'use strict';

/**
 * person controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::person.person', ({ strapi }) => ({
    async getByRequestingUser(ctx) {
        var userId = ctx.state.user.id;
        const people = await strapi.entityService.findMany('api::person.person', {
            populate: ['Users'],
            filters: {
                Users: {
                    id: userId,
                }
            },
        });
        if (people.length > 0) {
            var person = people[0];
            ctx.body = { data: person };
            return;
        }
    },
}));
