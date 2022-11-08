const fetch = require('node-fetch');
'use strict';

module.exports = {
  register(/*{ strapi }*/) {},

  bootstrap({ strapi }) {
    strapi.db.lifecycles.subscribe({
      models: ['api::phone-number.phone-number'],

      // your lifecycle hooks
      async beforeCreate(event) {
        const rawFormat = event.params.data.RawFormat;
        const encodedPhoneNumber = encodeURI(rawFormat);
        const response = await fetch(`https://api.bigdatacloud.net/data/phone-number-validate?number=${encodedPhoneNumber}&countryCode=us&key=bdc_f919ac7f1d7945b897dc1637b9668f1e`);
        const verification = await response.json();
        if (verification.isValid) {
          event.params.data.IsValidated = true;
          event.params.data.E164Format = verification.e164Format;
          event.params.data.InternationalFormat = verification.internationalFormat;
          event.params.data.NationalFormat = verification.nationalFormat;
        }
        console.log(event);
      },
    })
  },
}
