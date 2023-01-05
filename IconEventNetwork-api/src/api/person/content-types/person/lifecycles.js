const tr = require('transliteration');

module.exports = {
    
    async beforeCreate(event) {
        // Trim up text fields
        if (event.params.data.FirstName)  event.params.data.FirstName = event.params.data.FirstName.trim();
        if (event.params.data.MiddleName)  event.params.data.MiddleName = event.params.data.MiddleName.trim();
        if (event.params.data.LastName)  event.params.data.LastName = event.params.data.LastName.trim();
        if (event.params.data.DirectoryName)  event.params.data.DirectoryName = event.params.data.DirectoryName.trim();
        if (event.params.data.PreferredName)  event.params.data.PreferredName = event.params.data.PreferredName.trim();

        // Default DirectoryName to "FirstName LastName" if DirectoryName is blank
        if (!event.params.data.DirectoryName) event.params.data.DirectoryName = '';
        if (event.params.data.DirectoryName === '' && event.params.data.FirstName && event.params.data.LastName) {
            event.params.data.DirectoryName = event.params.data.FirstName + ' ' + event.params.data.LastName;
        }

        // Set SearchableName to transliterated DirectoryName converted ot lower case
        event.params.data.SearchableName = tr.transliterate(event.params.data.DirectoryName).toLowerCase();  
    }, 

     async beforeUpdate(event) {   
        // Trim up text fields
        if (event.params.data.FirstName)  event.params.data.FirstName = event.params.data.FirstName.trim();
        if (event.params.data.MiddleName)  event.params.data.MiddleName = event.params.data.MiddleName.trim();
        if (event.params.data.LastName)  event.params.data.LastName = event.params.data.LastName.trim();
        if (event.params.data.DirectoryName)  event.params.data.DirectoryName = event.params.data.DirectoryName.trim();
        if (event.params.data.PreferredName)  event.params.data.PreferredName = event.params.data.PreferredName.trim();

        // Default DirectoryName to "FirstName LastName" if DirectoryName is blank
        if (!event.params.data.DirectoryName) event.params.data.DirectoryName = '';
        if (event.params.data.DirectoryName === '' && event.params.data.FirstName && event.params.data.LastName) {
            event.params.data.DirectoryName = event.params.data.FirstName + ' ' + event.params.data.LastName;
        }

        // Set SearchableName to transliterated DirectoryName converted ot lower case
        event.params.data.SearchableName = tr.transliterate(event.params.data.DirectoryName).toLowerCase();   
    },
    
  }