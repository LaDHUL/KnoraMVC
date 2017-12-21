'use strict';

const config = require('config');
const qs = require('querystring');
const logdebug = require('debug')('util');

function Util() {
    let util = this;
    this.configKnora = config.get('knora');
    this.baseUrl =
        this.configKnora.server.protocol + '://' +
        this.configKnora.server.host + "/" +
        this.configKnora.server.version + "/";
}

/* ------------------------------------------------------------------------- */

/**
 * Knora formatter selector
 *
 * @param propertyType
 * @returns {*}
 */
Util.prototype.knora_get_formatter = function (propertyType, valueTypeId) {
    // add closure here because we pass a function back
    // and that function will be later called outside of this scope
    let here = this;
    switch (propertyType) {
        case 'text':
            if (valueTypeId.endsWith("UriValue")) {
                return function (value, project, base) {
                    base["uri_value"] = value;
                    return base;
                };
            } else {
                return function (value, project, base) {
                    base["richtext_value"] = {"utf8str": value};
                    return base;
                };
            }
        case 'link':
            return function(value, project, base) {
                base["link_value"] = here.longIri(project, value);
                return base;
            };
        case 'richtext':
            return function(value, project, base) {
                let xmlified = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + value;
                base["richtext_value"] = {
                    "xml": xmlified,
                    "mapping_id": "http://rdfh.ch/standoff/mappings/StandardMapping"
                };
                return base;
            };
        case 'date':
            return function (value, project, base) {
                base["date_value"] = value;
                return base;
            };

    }
};

Util.prototype.knora_get_comparator = function (propertyType, valueTypeId) {
    // add closure here because we pass a function back
    // and that function will be later called outside of this scope
    let here = this;
    switch (propertyType) {
        case 'text':
            if (valueTypeId.endsWith("UriValue")) {
                return function (a, b) {
                    return a && a.uri_value && a.uri_value === b.uri_value;
                };
            } else {
                return function (a, b) {
                    base["richtext_value"] = {"utf8str": value};
                    return a && a.richtext_value && a.richtext_value.utf8str && a.richtext_value.utf8str === b.richtext_value.utf8str;
                };
            }
        case 'link':
        	return function(a, b) {
                base["link_value"] = here.longIri(project, value);
                return a && a.link_value && a.link_value === b.link_value;
            };
		case 'richtext':
            return function(a, b) {
                if (!(a && a.richtext_value && b && b.richtext_value))
                    return false;

                return a.richtext_value.xml === b.richtext_value.xml && a.richtext_value.mapping_id === b.richtext_value.mapping_id;
            };
        case 'date':
            return function (a, b) {
                return a && a.date_value && a.date_value === b.date_value;
            };

    }
};

/* ------------------------------------------------------------------------- */

/**
 * Helper method to workout URLs
 *
 * command : "resource"
 * iri : resource IRI
 *
 * @param command
 * @param iri
 * @returns {string}
 */
Util.prototype.getUrlIri = function (command, iri) {
	return this.baseUrl + command + "/" + qs.escape(iri);
};

Util.prototype.getUrl = function (command, project, iri) {
	return this.baseUrl + command + "/" + qs.escape(this.longIri(project, iri));
};

Util.prototype.shortIriEscaped = function (url) {
    return Util.prototype.shortIri(qs.unescape(url));
};

Util.prototype.shortIri = function (url) {
    let index = url.lastIndexOf('/');
    return url.substr(url.lastIndexOf('/') + 1);
};

Util.prototype.longIri = function (project, iri) {
    return "http://rdfh.ch/"+ this.projectCode(project) + "/" + project + "/" + iri;
};

Util.prototype.longValueIri = function (project, iri, value_iri) {
    return this.longIri(project, iri) + "/values/" + value_iri;
};

/**
 *
 * @param projectShortName
 * @returns {*}
 */
Util.prototype.projectCode = function (projectShortName) {
    return this.configKnora.project[projectShortName];
};

Util.prototype.projectCodeUrl = function (projectShortName) {
    return this.configKnora.project.prefix + this.projectCode(projectShortName);
};

module.exports = Util;
