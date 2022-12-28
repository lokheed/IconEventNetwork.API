const tr = require('transliteration');

module.exports = {
    
    async beforeCreate(event) {   
        event.params.data.SearchableName = tr.transliterate(event.params.data.Name).toLowerCase();
        event.params.data.A2 = event.params.data.A2.toUpperCase();
        if (event.params.data.A2.length > 2) event.params.data.A2 = event.params.data.A2.substr(0,2);
        event.params.data.A3 = event.params.data.A3.toUpperCase();
        if (event.params.data.A3.length > 3) event.params.data.A3 = event.params.data.A3.substr(0,3);
     },
    
    async beforeUpdate(event) { 
        event.params.data.SearchableName = tr.transliterate(event.params.data.Name).toLowerCase();
        event.params.data.A2 = event.params.data.A2.toUpperCase();
        if (event.params.data.A2.length > 2) event.params.data.A2 = event.params.data.A2.substr(0,2);
        event.params.data.A3 = event.params.data.A3.toUpperCase();
        if (event.params.data.A3.length > 3) event.params.data.A3 = event.params.data.A3.substr(0,3);
    },
  }