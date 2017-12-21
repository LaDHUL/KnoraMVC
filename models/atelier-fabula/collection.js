/*
 * Collection Model
 */
 
const author = require("./author.js");
const notion = require("./notion.js");
const link = require("./link.js");

module.exports = {
    'model': {
        'collection': {
            'id': 'http://www.knora.org/ontology/0108/atelier-fabula#ArticleCollection',
            'properties': {
                'note': 'http://www.knora.org/ontology/0108/atelier-fabula#hasNote',
                'title': 'http://www.knora.org/ontology/0108/atelier-fabula#collectionHasTitle',
                'notion': ['http://www.knora.org/ontology/0108/atelier-fabula#collectionHasTopicNotion', notion.model.notion],
                'author': ['http://www.knora.org/ontology/0108/atelier-fabula#collectionHasAuthor', author.model.author],
                'firstpublication': 'http://www.knora.org/ontology/0108/atelier-fabula#collectionHasPublicationDateOriginal',
                'onlinepublication': 'http://www.knora.org/ontology/0108/atelier-fabula#collectionHasPublicationDateOnline',
                'link': ['http://www.knora.org/ontology/0108/atelier-fabula#collectionHasLink', link.model.link],
            }
        }
    }
};
