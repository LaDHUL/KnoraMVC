/*
 * Article Model
 */
const author = require("./author.js");
var institution = require("./institution.js");
var notion = require("./notion.js");
//var keyword = require("./keyword.js");
var collection = require("./collection.js");
//var image = require("./image.js");
//var structuredreferences = require("./structuredreferences.js");
//var link = require("./link.js");

module.exports = {
	'model': {
		'article': {
			'id': 'http://www.knora.org/ontology/0108/atelier-fabula#Article',
			'properties': {
				'title': 'http://www.knora.org/ontology/0108/atelier-fabula#articleHasTitle',
				'subtitle': 'http://www.knora.org/ontology/0108/atelier-fabula#hasSubtitle',
                'introduction': 'http://www.knora.org/ontology/0108/atelier-fabula#hasIntroduction',
				'author': ['http://www.knora.org/ontology/0108/atelier-fabula#articleHasAuthor', author.model.author],
                'bodytext': 'http://www.knora.org/ontology/0108/atelier-fabula#hasBodyText',
                'references': 'http://www.knora.org/ontology/0108/atelier-fabula#articleHasReferences',
	            'affiliation' : [ 'http://www.knora.org/ontology/0108/atelier-fabula#articleHasAffiliation', institution.model.institution ],
                'notions' : [ 'http://www.knora.org/ontology/0108/atelier-fabula#articleHasTopicNotion', notion.model.notion ],
	            'keywords' : [ 'http://www.knora.org/ontology/0108/atelier-fabula#hasTopicKeyword', notion.model.notion ],
				'firstpublication': 'http://www.knora.org/ontology/0108/atelier-fabula#articleHasPublicationDateOriginal',
				'onlinepublication': 'http://www.knora.org/ontology/0108/atelier-fabula#articleHasPublicationDateOnline',
                'collection' : [ 'http://www.knora.org/ontology/0108/atelier-fabula#isInArticleCollection', collection.model.collection ],
                // lists
				'status' : 'http://www.knora.org/ontology/0108/atelier-fabula#articleHasStatus',
				'type' : 'http://rdfh.ch/lists/0108/atelier-fabula#articleHasType'
//            'image' : [ 'http://www.knora.org/ontology/0108/atelier-fabula/atelier-fabula#articleHasImage', image.model.image ],
//            'structuredref' : [ 'http://www.knora.org/ontology/0108/atelier-fabula/atelier-fabula#articleHasStructuredReferences', structuredreferences.model.structuredreferences ],
//            'link' : [ 'http://www.knora.org/ontology/0108/atelier-fabula/atelier-fabula#articleHasLink', link.model.link ]
			}
		}
	}
};
