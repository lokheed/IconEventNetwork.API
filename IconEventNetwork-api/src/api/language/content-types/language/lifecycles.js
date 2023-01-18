module.exports = {
    
    async beforeCreate(event) {   
        event = await strapi.service('api::language.language').cleanupFields(event); 
     },
    
    async beforeUpdate(event) { 
        event = await strapi.service('api::language.language').cleanupFields(event); 
    },
  }