'use strict';

/**
 * answer-option service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::answer-option.answer-option');
