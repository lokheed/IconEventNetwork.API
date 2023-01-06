module.exports = {
    
  async beforeCreate(event) {   
    await strapi.service('api::phone-number.phone-number').validateInputs(event.params);
    event = await strapi.service('api::phone-number.phone-number').setVerifiedInputs(event);
  },
  
  async beforeUpdate(event) { 
    await strapi.service('api::phone-number.phone-number').validateInputs(event.params);
    event = await strapi.service('api::phone-number.phone-number').setVerifiedInputs(event);
  },
}