'use strict';

/**
 * third-party-subsystem service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::third-party-subsystem.third-party-subsystem');
