'use strict';

/**
 * third-party-subsystem router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::third-party-subsystem.third-party-subsystem');
