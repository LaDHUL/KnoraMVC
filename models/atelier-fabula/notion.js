const author = require("./author.js");

/*
 * Notion Model
 */

module.exports = {
    'model': {
        'notion': {
            'id': 'http://www.knora.org/ontology/0108#Notion',
            'properties': {
                'name': 'http://www.knora.org/ontology/0108#notionHasName',
                'definition': 'http://www.knora.org/ontology/0108#hasDefinition',
                'references': 'http://www.knora.org/ontology/0108#notionHasReferences',
                //'structuredReferences': [
                //    'http://www.knora.org/ontology/0108#notionHasStructuredReferences',
                //    structuredReferences.model.structuredReferences ],
                'author': ['http://www.knora.org/ontology/0108#notionHasAuthor', author.model.author],
                //'link': [
                //    'http://www.knora.org/ontology/0108#notionHasLink',
                //    link.model.link ],
                //'parentNotion': [
                //    'http://www.knora.org/ontology/0108#notionHasParentNotion',
                //    model.notion
                //]
            }
        }
    }
};
