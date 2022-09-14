'use strict';

/**
 * prefix router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::prefix.prefix');
