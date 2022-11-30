'use strict';

/**
 * company-status service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::company-status.company-status');
