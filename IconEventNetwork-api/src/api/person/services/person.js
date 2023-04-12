'use strict';
const tr = require('transliteration');
/**
 * person service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::person.person', ({ strapi }) =>  ({
    async cleanupFields(event) {
         // Trim up text fields
         if (event.params.data.FirstName)  event.params.data.FirstName = event.params.data.FirstName.trim();
         if (event.params.data.MiddleName)  event.params.data.MiddleName = event.params.data.MiddleName.trim();
         if (event.params.data.LastName)  event.params.data.LastName = event.params.data.LastName.trim();
         if (event.params.data.DirectoryName)  event.params.data.DirectoryName = event.params.data.DirectoryName.trim();
         if (event.params.data.PreferredName)  event.params.data.PreferredName = event.params.data.PreferredName.trim();
 
         // Default DirectoryName to "FirstName LastName" if DirectoryName is blank
         const personId = event.params.where?.id ? event.params.where.id : 0;
         if (personId === 0 && (!event.params.data.DirectoryName || event.params.data.DirectoryName.trim() === '')) {
            const firstName = event.params.data.FirstName.trim()??'';
            const lastName = event.params.data.LastName.trim()??'';
            const directoryName = firstName + ' ' + lastName;
            event.params.data.DirectoryName = directoryName.trim();
         }
         if (event.params.data.DirectoryName) {
            // Set SearchableName to transliterated DirectoryName converted ot lower case
            event.params.data.SearchableName = tr.transliterate(event.params.data.DirectoryName).toLowerCase();  
         }

         return event;
     },

     async canManagePerson(ctx) {
        const userId = ctx.state.user.id;
        const personId = ctx.request.params.id;
        const existingPerson = await strapi.entityService.findOne('api::person.person', personId, { populate: ['user'] } );

        // Check 1: Is this user this person?
        const isThisPerson = existingPerson.user.id == userId;
        if (isThisPerson) return true;

        // TODO: check if user is Icon admin

        // All checks completed, If none returned true by this point, fall through to false
        return false;
    }
}));