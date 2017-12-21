/*
 * Link Model
 */
 
//const author = require("./author.js");

module.exports = {
    'model': {
        'linkexternal': {
            'id': 'http://www.knora.org/ontology/0108/atelier-fabula#LinkExternal',
            'properties': {
                'url': 'http://www.knora.org/ontology/0108/atelier-fabula#hasUrl',
                // Note: implementation: linkexternal's author is added alonside with author to avoid circular requires
                //       see: https://nodejs.org/api/modules.html#modules_cycles
                //'author': ['http://www.knora.org/ontology/0108/atelier-fabula#linkHasAuthor', author.model.author],
            }
        }
    }
};
