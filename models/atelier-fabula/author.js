/*
 * Author Model
 */
const linkexternal = require("./linkexternal.js");


let model = {
        'author': {
            'id': 'http://www.knora.org/ontology/0108#Author',
            'properties': {
                'familyName': 'http://www.knora.org/ontology/0108#hasFamilyName',
                'givenName': 'http://www.knora.org/ontology/0108#hasGivenName',
                'biography': 'http://www.knora.org/ontology/0108#hasBiography',
                'email': 'http://www.knora.org/ontology/0108#hasMbox',
                'furtherInformation': 'http://www.knora.org/ontology/0108#hasFurtherInformation',
                'reference': 'http://www.knora.org/ontology/0108#authorHasReferences',
                'externalReference': ['http://www.knora.org/ontology/0108#hasLinkExternal', linkexternal.model.linkexternal]
            }
        }
        //,
        //'linkexternal': {
        //    'id': 'http://www.knora.org/ontology/0108#LinkExternal',
        //    'properties': {
        //        'url': 'http://www.knora.org/ontology/0108#hasUrl',
        //        'author': ['http://www.knora.org/ontology/0108#linkHasAuthor', author.model.author],
        //    }
        //}
};

// add further cyclic references
//model.author.properties.externalReference = [
//    'http://www.knora.org/ontology/0108#hasLinkExternal',
//    model.linkexternal
//];

linkexternal.model.linkexternal.properties.author = [
    'http://www.knora.org/ontology/0108#linkHasAuthor',
    model.author
];

module.exports.model = model;

