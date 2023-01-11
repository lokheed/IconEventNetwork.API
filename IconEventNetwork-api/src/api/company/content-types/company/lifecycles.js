const utils = require('@strapi/utils');

module.exports = {
    
    async beforeCreate(event) {
        event = await strapi.service('api::company.company').cleanupFields(event);
    }, 

     async beforeUpdate(event) {   
        event = await strapi.service('api::company.company').cleanupFields(event); 
    },
    
  }