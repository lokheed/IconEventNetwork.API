const fetch = require('node-fetch');

module.exports = {
    
    async beforeCreate(event) { 
        // This should be refactored to a common service that takes in country id and returns the A2 country code    
        const country = await strapi.entityService.findOne('api::country.country', event.params.data.country, { fields: ['A2'] });      
        const countryCode = country.A2;

        // This should be refactored into a common service that takes in the submitted phone number and country code, 
        // and returns the verification ojbect
        const rawFormat = event.params.data.RawFormat;
        const encodedPhoneNumber = encodeURI(rawFormat);
        const response = await fetch(`https://api.bigdatacloud.net/data/phone-number-validate?number=${encodedPhoneNumber}&countryCode=${countryCode}&key=${process.env.BIG_DATA_CLOUD_KEY}`);
        const verification = await response.json();

        if (verification.isValid) {
          event.params.data.IsValidated = true;
          event.params.data.E164Format = verification.e164Format;
          event.params.data.InternationalFormat = verification.internationalFormat;
          event.params.data.NationalFormat = verification.nationalFormat;
        }
    },
    
    async beforeUpdate(event) { 
        const country = await strapi.entityService.findOne('api::country.country', event.params.data.country, { fields: ['A2'] });      
        const countryCode = country.A2;
        
        const rawFormat = event.params.data.RawFormat;
        const encodedPhoneNumber = encodeURI(rawFormat);
        const response = await fetch(`https://api.bigdatacloud.net/data/phone-number-validate?number=${encodedPhoneNumber}&countryCode=${countryCode}&key=${process.env.BIG_DATA_CLOUD_KEY}`);
        const verification = await response.json();
        
        if (verification.isValid) {
          event.params.data.IsValidated = true;
          event.params.data.E164Format = verification.e164Format;
          event.params.data.InternationalFormat = verification.internationalFormat;
          event.params.data.NationalFormat = verification.nationalFormat;
        }
    },
  }