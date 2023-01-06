module.exports = {
    
    async beforeCreate(event) {   
        const verification = await strapi.service('api::email-address.email-address').verify(event.params.data.EmailAddress);
        event.params.data.IsValidated = verification.isValid;

    },
    
    async beforeUpdate(event) { 
        const verification = await strapi.service('api::email-address.email-address').verify(event.params.data.EmailAddress);
        event.params.data.IsValidated = verification.isValid;
    },
  }