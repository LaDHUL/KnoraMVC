/*
 * Link Model
 */
 
const author = require("./author.js");

module.exports = {
    'model': {
        'link': {
            'id': 'http://www.knora.org/ontology/0108/atelier-fabula#Link',
            'properties': {
                'url': 'http://www.knora.org/ontology/0108/atelier-fabula#hasUrl',
                'author': ['http://www.knora.org/ontology/0108/atelier-fabula#linkHasAuthor', author.model.author],
            }
        }
    }
};
