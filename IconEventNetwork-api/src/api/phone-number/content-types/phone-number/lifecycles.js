const fetch = require('node-fetch');

module.exports = {
    
  async beforeCreate(event) {     
    var countryId = event.params.data.country.connect[0] ? event.params.data.country.connect[0].id : 0;
    if (countryId > 0) {
      const countryCode = await strapi.service('api::country.country').getA2(countryId);
      const verification = await strapi.service('api::phone-number.phone-number').verify(event.params.data.RawFormat, countryCode);

      if (verification.isValid) {
        event.params.data.IsValidated = true;
        event.params.data.E164Format = verification.e164Format;
        event.params.data.InternationalFormat = verification.internationalFormat;
        event.params.data.NationalFormat = verification.nationalFormat;
      }  
    } else {
      event.params.data.IsValidated = false;
      event.params.data.E164Format = '';
      event.params.data.InternationalFormat = '';
      event.params.data.NationalFormat = '';
    }
  },
  
  async beforeUpdate(event) { 
    var countryId = event.params.data.country.connect[0] ? event.params.data.country.connect[0].id : 0;
    if (countryId < 1) {
      var phoneNumberId = event.params.where.id;
      var existingPhone = await strapi.service('api::phone-number.phone-number')
        .findOne(
          phoneNumberId, 
          {
            fields: ['RawFormat'],
            populate: { country: true },
          });
      countryId = existingPhone.country.id;
    }
    const countryCode = await strapi.service('api::country.country').getA2(countryId);
    const verification = await strapi.service('api::phone-number.phone-number').verify(event.params.data.RawFormat, countryCode);
      
    if (verification.isValid) {
      event.params.data.IsValidated = true;
      event.params.data.E164Format = verification.e164Format;
      event.params.data.InternationalFormat = verification.internationalFormat;
      event.params.data.NationalFormat = verification.nationalFormat;
    } else {
      event.params.data.IsValidated = false;
      event.params.data.E164Format = '';
      event.params.data.InternationalFormat = '';
      event.params.data.NationalFormat = '';
    }
  },
}