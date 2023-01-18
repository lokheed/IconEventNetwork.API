module.exports = {
    
    async beforeCreate(event) {   
        event = await strapi.service('api::country.country').cleanupFields(event); 
     },
    
    async beforeUpdate(event) { 
        event = await strapi.service('api::country.country').cleanupFields(event); 
    },
  }