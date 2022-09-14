'use strict';

/**
 * prefix service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::prefix.prefix');
