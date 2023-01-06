const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

module.exports = {
    
    async beforeCreate(event) {
        let userIds = event.params.data.Users.connect.map(u => u.id);
        let hasExistingPersonRecord = await strapi.service('api::person.person').doesPersonExistForUser(userIds);
        if (hasExistingPersonRecord) {
            throw new ApplicationError('A Person object already exists for this User', {});
        }
        event = await strapi.service('api::person.person').cleanupFields(event);
    }, 

     async beforeUpdate(event) {   
        event = await strapi.service('api::person.person').cleanupFields(event); 
    },
    
  }