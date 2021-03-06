const author = require("./author.js");

/*
 * Notion Model
 */


let model = {
        'notion': {
            'id': 'http://www.knora.org/ontology/0108/atelier-fabula#Notion',
            'properties': {
                'name': 'http://www.knora.org/ontology/0108/atelier-fabula#notionHasName',
                'definition': 'http://www.knora.org/ontology/0108/atelier-fabula#hasDefinition',
                'references': 'http://www.knora.org/ontology/0108/atelier-fabula#notionHasReferences',
                //'structuredReferences': [
                //    'http://www.knora.org/ontology/0108/atelier-fabula#notionHasStructuredReferences',
                //    structuredReferences.model.structuredReferences ],
                'author': ['http://www.knora.org/ontology/0108/atelier-fabula#notionHasAuthor', author.model.author],
                //'link': [
                //    'http://www.knora.org/ontology/0108/atelier-fabula#notionHasLink',
                //    link.model.link ],

                // Note: declare cyclic reference outside
                //'parentNotion': [
                //    'http://www.knora.org/ontology/0108/atelier-fabula#notionHasParentNotion',
                //    notion.model.notion
                //]
            }
        }
};

// Note: add to `module.exports` instead of replacing it like `module.exports = { 'model': ...`
module.exports.model = model;

// add furher cyclic references
module.exports.model.notion.properties.parentNotion = [
    'http://www.knora.org/ontology/0108/atelier-fabula#hasParentNotion',
    model.notion
];

/*

log of failure with the declaration:

module.exports = {
    'model': {
        'notion': {
            'id': 'http://www.knora.org/ontology/0108/atelier-fabula#Notion',
            'properties': {
                'name': 'http://www.knora.org/ontology/0108/atelier-fabula#notionHasName',
                'definition': 'http://www.knora.org/ontology/0108/atelier-fabula#hasDefinition',
                'references': 'http://www.knora.org/ontology/0108/atelier-fabula#notionHasReferences',
                //'structuredReferences': [
                //    'http://www.knora.org/ontology/0108/atelier-fabula#notionHasStructuredReferences',
                //    structuredReferences.model.structuredReferences ],
                'author': ['http://www.knora.org/ontology/0108/atelier-fabula#notionHasAuthor', author.model.author],
                //'link': [
                //    'http://www.knora.org/ontology/0108/atelier-fabula#notionHasLink',
                //    link.model.link ],
                //'parentNotion': [
                //    'http://www.knora.org/ontology/0108/atelier-fabula#notionHasParentNotion',
                //    model.notion
                //]
            }
        }
    }
};

// error: Cannot read property 'model' of undefined
// "undefined" is "this.exports" in "this.exports.model.notion"
module.exports.model.notion.parentNotion = [
    'http://www.knora.org/ontology/0108/atelier-fabula#notionHasParentNotion',
    this.exports.model.notion
];



// error: Cannot read property 'model' of undefined
// "undefined" is "exports" in "exports.model.notion"
module.exports.model.notion.parentNotion = [
    'http://www.knora.org/ontology/0108/atelier-fabula#notionHasParentNotion',
    exports.model.notion
];



// error: Cannot read property 'model' of undefined
// "undefined" is "model" in "model.notion"
module.exports.model.notion.parentNotion = [
    'http://www.knora.org/ontology/0108/atelier-fabula#notionHasParentNotion',
    model.notion
];



// error: when used in the software, notion.model.notion.parentNotion is undefined
module.exports.model.notion.parentNotion = [
    'http://www.knora.org/ontology/0108/atelier-fabula#notionHasParentNotion',
    module.exports.model.notion
];
*/
