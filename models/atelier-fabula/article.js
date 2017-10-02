/*
 * Article Model
 */
const author = require("./author.js");
//var affiliation = require("./affiliation.js");
//var notion = require("./notion.js");
//var keyword = require("./keyword.js");
//var collection = require("./collection.js");
//var image = require("./image.js");
//var structuredreferences = require("./structuredreferences.js");
//var link = require("./link.js");

module.exports = {
	'model': {
		'article': {
			'id': 'http://www.knora.org/ontology/0108#Article',
			'properties': {
				'title': 'http://www.knora.org/ontology/0108#articleHasTitle',
				'subtitle': 'http://www.knora.org/ontology/0108#hasSubtitle',
				'author': ['http://www.knora.org/ontology/0108#articleHasAuthor', author.model.author],
//            'affiliation' : [ 'http://www.knora.org/ontology/0108#articleHasAffiliation', affiliation.model.affiliation ],
				'introduction': 'http://www.knora.org/ontology/0108#hasIntroduction',
//            'notions' : [ 'http://www.knora.org/ontology/0108#articleHasTopicNotion', notion.model.notion ],
//            'keywords' : [ 'http://www.knora.org/ontology/0108#hasTopicKeyword', keyword.model.keyword ],
				'firstpublication': 'http://www.knora.org/ontology/0108#articleHasPublicationDateOriginal',
				'onlinepublication': 'http://www.knora.org/ontology/0108#articleHasPublicationDateOnline',
//            'collection' : [ 'http://www.knora.org/ontology/0108#isInArticleCollection', collection.model.collection ],
//            'image' : [ 'http://www.knora.org/ontology/0108#articleHasImage', image.model.image ],
				'bodytext': 'http://www.knora.org/ontology/0108#hasBodyText',
				'references': 'http://www.knora.org/ontology/0108#articleHasReferences',
//            'structuredref' : [ 'http://www.knora.org/ontology/0108#articleHasStructuredReferences', structuredreferences.model.structuredreferences ],
//            'link' : [ 'http://www.knora.org/ontology/0108#articleHasLink', link.model.link ]
			}
		}
	}
};
