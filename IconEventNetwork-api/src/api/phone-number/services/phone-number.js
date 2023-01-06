'use strict';
const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
/**
 * phone-number service
 */

const fetch = require('node-fetch');
const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::phone-number.phone-number', ({ strapi }) =>  ({
    async verify(rawPhoneNumber, countryCode) {
        const encodedPhoneNumber = encodeURI(rawPhoneNumber);
        const response = await fetch(`https://api.bigdatacloud.net/data/phone-number-validate?number=${encodedPhoneNumber}&countryCode=${countryCode}&key=${process.env.BIG_DATA_CLOUD_KEY}`);
        const verification = await response.json();
        return verification;
    },

    async validateInputs(params) {
        let countryId = params.data.country.connect[0] ? params.data.country.connect[0].id : 0;
        let phoneTypeId = params.data.phone_number_type.connect[0] ? params.data.phone_number_type.connect[0].id : 0;
        const phoneNumberId = params.where?.id ? params.where.id : 0;
        if ((countryId === 0 || phoneTypeId === 0) && phoneNumberId > 0) {
            const existingPhone = await strapi.service('api::phone-number.phone-number')
                .findOne(
                phoneNumberId, 
                {
                    fields: ['RawFormat'],
                    populate: { country: true, phone_number_type: true },
                });
            countryId = countryId > 0 ? countryId : existingPhone.country.id;
            phoneTypeId = phoneTypeId > 0 ? phoneTypeId : existingPhone.phone_number_type.id;
        }

        if (countryId === 0) throw new ApplicationError('Country is a required field.', {});        
        if (phoneTypeId === 0) throw new ApplicationError('PhoneNumberType is a required field.', {});
    },

    async setVerifiedInputs(event) {
        let countryId = event.params.data.country.connect[0] ? event.params.data.country.connect[0].id : 0;
        const phoneNumberId = event.params.where?.id ? event.params.where.id : 0;
        if (countryId === 0 && phoneNumberId > 0) {
          const existingPhone = await strapi.service('api::phone-number.phone-number')
            .findOne(
              phoneNumberId, 
              {
                fields: ['RawFormat'],
                populate: { country: true },
              });
          countryId = existingPhone.country.id;
        }
        if (countryId > 0) {
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
            return event;
        }
          
        // no valid country was passed in, reset verified inputs
        event.params.data.IsValidated = false;
        event.params.data.E164Format = '';
        event.params.data.InternationalFormat = '';
        event.params.data.NationalFormat = '';

        return event;
    },

}));
