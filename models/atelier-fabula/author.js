/*
 * Author Model
 */
const linkexternal = require("./linkexternal.js");


let model = {
        'author': {
            'id': 'http://www.knora.org/ontology/0108/atelier-fabula#Author',
            'properties': {
                'familyName': 'http://www.knora.org/ontology/0108/atelier-fabula#hasFamilyName',
                'givenName': 'http://www.knora.org/ontology/0108/atelier-fabula#hasGivenName',
                'biography': 'http://www.knora.org/ontology/0108/atelier-fabula#hasBiography',
                'email': 'http://www.knora.org/ontology/0108/atelier-fabula#hasMbox',
                'furtherInformation': 'http://www.knora.org/ontology/0108/atelier-fabula#hasFurtherInformation',
                'reference': 'http://www.knora.org/ontology/0108/atelier-fabula#authorHasReferences',
                'externalReference': ['http://www.knora.org/ontology/0108/atelier-fabula#hasLinkExternal', linkexternal.model.linkexternal]
            }
        }
};

// add indirect cyclic references
// `linkexternal` requires `author`, `author` requires `linkexternal`
linkexternal.model.linkexternal.properties.author = [
    'http://www.knora.org/ontology/0108/atelier-fabula#linkHasAuthor',
    model.author
];

module.exports.model = model;
