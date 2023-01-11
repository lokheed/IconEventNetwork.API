module.exports = {
    
    async beforeCreate(event) {
        event = await strapi.service('api::person-at-company.person-at-company').cleanupFields(event);
    }, 

     async beforeUpdate(event) {   
        event = await strapi.service('api::person-at-company.person-at-company').cleanupFields(event); 
    },
    
  }