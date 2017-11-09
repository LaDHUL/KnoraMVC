/*
 * Author Model
 */

module.exports = {
    'model': {
        'author': {
            'id': 'http://www.knora.org/ontology/0108#Author',
            'properties': {
                'familyName': 'http://www.knora.org/ontology/0108#hasFamilyName',
                'givenName': 'http://www.knora.org/ontology/0108#hasGivenName',
                'biography': 'http://www.knora.org/ontology/0108#hasBiography',
                'email': 'http://www.knora.org/ontology/0108#hasMbox',
                'furtherInformation': 'http://www.knora.org/ontology/0108#hasFurtherInformation',
                'reference': 'http://www.knora.org/ontology/0108#authorHasReferences',
            }
        }
    }
};
