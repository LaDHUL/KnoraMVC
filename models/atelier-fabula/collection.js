/*
 * Collection Model
 */
 
const author = require("./author.js");
const notion = require("./notion.js");
const link = require("./link.js");

module.exports = {
    'model': {
        'collection': {
            'id': 'http://www.knora.org/ontology/0108#ArticleCollection',
            'properties': {
                'note': 'http://www.knora.org/ontology/0108#hasNote',
                'title': 'http://www.knora.org/ontology/0108#collectionHasTitle',
                'notion': ['http://www.knora.org/ontology/0108#collectionHasTopicNotion', notion.model.notion],
                'author': ['http://www.knora.org/ontology/0108#collectionHasAuthor', author.model.author],
                'firstpublication': 'http://www.knora.org/ontology/0108#collectionHasPublicationDateOriginal',
                'onlinepublication': 'http://www.knora.org/ontology/0108#collectionHasPublicationDateOnline',
                'link': ['http://www.knora.org/ontology/0108#collectionHasLink', link.model.link],
            }
        }
    }
};
