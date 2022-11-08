'use strict';

/**
 * phone-number service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::phone-number.phone-number');
