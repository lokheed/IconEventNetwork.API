const fetch = require('node-fetch');

module.exports = {
    
    async beforeCreate(event) {   
      const countryCode = await strapi.service('api::country.country').getA2(event.params.data.country);
      const verification = await strapi.service('api::phone-number.phone-number').verify(event.params.data.RawFormat, countryCode);

      if (verification.isValid) {
        event.params.data.IsValidated = true;
        event.params.data.E164Format = verification.e164Format;
        event.params.data.InternationalFormat = verification.internationalFormat;
        event.params.data.NationalFormat = verification.nationalFormat;
      }
    },
    
    async beforeUpdate(event) { 
      const countryCode = await strapi.service('api::country.country').getA2(event.params.data.country);
      const verification = await strapi.service('api::phone-number.phone-number').verify(event.params.data.RawFormat, countryCode);
        
      if (verification.isValid) {
        event.params.data.IsValidated = true;
        event.params.data.E164Format = verification.e164Format;
        event.params.data.InternationalFormat = verification.internationalFormat;
        event.params.data.NationalFormat = verification.nationalFormat;
      }
    },
  }