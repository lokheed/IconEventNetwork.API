const tr = require('transliteration');

module.exports = {
    
    async beforeCreate(event) {   
        event.params.data.SearchableName = tr.transliterate(event.params.data.Name).toLowerCase();
     },
    
    async beforeUpdate(event) { 
        event.params.data.SearchableName = tr.transliterate(event.params.data.Name).toLowerCase();
    },
  }