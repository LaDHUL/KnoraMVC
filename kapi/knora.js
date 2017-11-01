'use strict';

const _ = require('lodash');
/**
 * implementation notes: we use 'request' rather than 'http'
 * because it handles chunked responses (Knora sends traffic in chunks)
 */
const request = require('request');
const Log = require('log'), log = new Log('info');
const logdebug = require('debug')('knora');
const logdebugReq = require('debug')('req');
const logdebugDepth = require('debug')('depth');
const HttpStatus = require('http-status-codes');
const qs = require('querystring');
const Util = require('./util');

function Knora() {
	this.resource_types = {};
	this.util = new Util();
}

/**
 * Helper method to set Authentication into cookies
 *
 * @param options
 * @param req
 */
Knora.prototype.fixCookies = function (options, req) {
	// if auth is requested fill it in the options
	// read `express` request header 'Authorization'
	logdebugReq("req: %o", req);
	let auth = req.get('Authorization');
	if (auth) {
		_.set(options, 'headers.authorization', auth);
		//if (! _.has(options, 'headers')) {
		//	_.set(options, 'headers',  {});
		//}
		//options.headers.authorization = auth;
		logdebug('request adding auth %o', auth);
	}

	// forward cookies
	let cookies = req.get('Cookie');
	if (cookies) {
		_.set(options, 'headers.cookie', cookies);
	}
	return cookies;
};

/**
 * get the resource informations
 *
 * input: model
 * @param model
 */
Knora.prototype.knora_restypes = function (model) {
	let options = {method: 'GET'};
	let knora = this;

	if (!model) {
		return Promise.resolve(model);
	}

	return new Promise(function (fullfill, reject) {
		// check the cache : if we know the resource, return
		logdebug('restype for model: %o', model);
		if (knora.resource_types[model.id]) {
			fullfill(knora.resource_types[model.id]);
			return;
		}

		// else request the information
		options.url = knora.util.baseUrl + 'resourcetypes/' + qs.escape(model.id);
		// get the resource type
		logdebug('restype: %o', options);
		// TODO : split the callback function of the request per operations,
		//        namely; get, create, search
		request(options, function (error, response, body) {
			if (error) {
				// what kind of error is that?
				logdebug('error: %o', error);
				// TODO: rework the error description
				reject(error);
				return;
			}

			logdebug('response: %o', response.statusCode);
			if (response.statusCode !== HttpStatus.OK) {
				reject(Error(body));
				return;
			}

			// map
			let parsedBody = JSON.parse(body);
			if (!parsedBody.restype_info || !parsedBody.restype_info.properties) {
				// we did not find what we are looking for
				reject(new Error("missing resource type info"));
				return;
			}

			// walk through the returned values to store the properties' types
			/* {
				 "http://www.knora.org/ontology/0108#hasFamilyName" : {
					"name": "http://www.knora.org/ontology/0108#hasFamilyName",
					"guiorder": 1,
					"description": "Nom.",
					"valuetype_id": "http://www.knora.org/ontology/knora-base#TextValue",
					"label": "Nom",
					"vocabulary": "http://www.knora.org/ontology/0108",
					"attributes": "maxlength=255;size=80",
					"occurrence": "1",
					"id": "http://www.knora.org/ontology/0108#hasFamilyName",
					"gui_name": "text"
				 },
				 "http://www.knora.org/ontology/0108#hasGivenName" : { ... },
				 ...
			  }
			*/
			let restype = {};
			logdebug('restype properties: %o', parsedBody.restype_info.properties);
			_.forEach(parsedBody.restype_info.properties, function (element) {
				logdebug('restype mapping: %o, %o', element.id, element);
				restype[element.id] = element;
			});

			// fill in the top type
			knora.resource_types[model.id] = restype;

			// walk through the model to check what property is a link
			// that should be unfolded
			let requests = [];
			_.forEach(model.properties, function (value, key) {
				if (_.isArray(value)) {
					let subrequest = knora.knora_restypes(value[1]);
					requests.push(subrequest);
				}
			});

			if (requests.length === 0) {
				fullfill(restype);
				return;
			}

			// else: requests is not empty
			Promise.all(requests)
				.then(function (results) {
					_.forEach(results, function (result) {
						logdebug("request for: ", result);
					});
					fullfill(knora.resource_types);
				})
				.catch(reject);
		});
	});
};

/**
 * send a request to Knora
 *
 * send should have at least:
 * { status : request status
 *   message : message
 *   resource: resource
 * }
 *
 * build the response according to the model
 * recursively call knora on linked resources
 *
 * options : options to pass over to request
 * model : model description of the object in output
 */
Knora.prototype.knora_request = function (args) {
	let knora = this;

	let { options, model, data, previousResult, id, depth} = args;
    logdebugDepth("depth: %s", depth);
	logdebugDepth("args: %o", args);
	if (depth < 0) {
		// if no recursion, provide only the IRI

		return Promise.resolve({resource: {id: knora.util.shortIriEscaped(options.url) }});
	}

	// make this a promise to be able to chain them
	return new Promise(function (fulfill, reject) {
		// for synchronizing the subrequests
		let subrequests = [];
		let anchors = [];

		// for POST, populate data
		if (options.method === 'POST') {
			options.body = {};
			if (model) {
				options.body.restype_id = model.id;
			}

			if (id) {
                // if we add properties to an existing id
				options.body.res_id = knora.util.longIri("atelier-fabula", id);
			} else {
                // if we create a whole new resource
                // TODO: add a label field
                options.body.label = data.label;
                options.body.properties = {};
			}

			/* exemple :
			input data:
			{
			    "status": 0,
			    "resource": {
			    	"familyName": [ "Jaouen" ],
			    	"givenName": [ "Loïc" ]
			    }
			}

			output data:
			options.body = {
				"restype_id": "http://www.knora.org/ontology/0108#Author",
				"properties": {
					"http://www.knora.org/ontology/0108#hasFamilyName":
						[{"richtext_value": {"utf8str": "Jaouen"}}],
					"http://www.knora.org/ontology/0108#hasGivenName":
						[{"richtext_value": {"utf8str": "Loïc"}}]
				},
				"project_id": "http://data.knora.org/projects/0108",
				"label": "loic jaouen"
			};
			*/

			logdebug("data: %o", data);
			_.forEach(data.resource, function (values, resourceKey) {
				if (values.length === 0) {
					return;
				}

				// resourceKey : "familyName", match with model
				// propertyName : "http://www.knora.org/ontology/0108#hasFamilyName"
				let propertyName = model.properties[resourceKey];

                logdebug("model.id: %o, resourceKey: %o, propertyName: %o", model.id, resourceKey, propertyName);
                //logdebug("resource_types: %o", knora.resource_types);
                //logdebug("resource_type model: %o", knora.resource_types[model.id]);
                logdebug("resource_type model prop: %o", knora.resource_types[model.id][propertyName]);

                // find the data type : "text"

				let propertyType;
                if (propertyName.constructor === Array) {
					/*
                	this is a link to another resource

					[ 'http://www.knora.org/ontology/0108#notionHasAuthor',
					  { id: 'http://www.knora.org/ontology/0108#Author',
					    properties: { familyName: 'http://www.knora.org/ontology/0108#hasFamilyName',
					                  givenName: 'http://www.knora.org/ontology/0108#hasGivenName',
					                  biography: 'http://www.knora.org/ontology/0108#hasBiography',
					                  email: 'http://www.knora.org/ontology/0108#hasMbox',
					                  reference: 'http://www.knora.org/ontology/0108#authorHasReferences'
					                }
					   }
					 ]

					 for links, it is not possible to guess if it is a new value, an edited value, an existing value
					 we have to let the client do that work
					 so we expect an id here
					 */
					propertyName = propertyName[0];
					propertyType = "link";
				} else {
                    propertyType = knora.resource_types[model.id][propertyName].gui_name;
				}

				let formatter = knora.util.knora_get_formatter(propertyType);

                if (id) {
                	// values is a single value
					formatter(values, "atelier-fabula", options.body);
                    options.body.prop = propertyName;
				} else {
                    let outValues = [];
                    _.forEach(values, function (value) {
                        logdebug("value: %o", value);
                        outValues.push(formatter(value, "atelier-fabula", {}));
                    });
                    options.body.properties[propertyName] = outValues;
				}
			});


			// TODO: on login, cache the project id with the auth token
			options.body.project_id = "http://data.knora.org/projects/0108";

			options.json = true;
		}


		// for PUT, populate data
		if (options.method === 'PUT') {
			options.body = {};
			options.body.properties = {};
			if (model) {
				options.body.restype_id = model.id;
			}

			/* exemple :
			input data:
			{ "familyName": [ "loic" ] }

			reworked url:
			/v1/values/${IRI}/values/${VALUE}
			/v1/values/http%3A%2F%2Frdfh.ch%2Fatelier-fabula%2FfFpLBN-bQUWqOsaaspg0SA%2Fvalues%2Fe691-kFkTISeGkz5OsCS2
			output data:
			options.body = {
				"richtext_value": {"utf8str":"lo\xefc"},
				"project_id":"http://data.knora.org/projects/0108"}
			};
			*/

			logdebug("data: %o", data);
			_.forEach(data, function (values, resourceKey) {
				if (values.length === 0) {
					return;
				}

				// resourceKey : "familyName", match with model
				// propertyName : "http://www.knora.org/ontology/0108#hasFamilyName"
				let propertyName = model.properties[resourceKey];
				if (!propertyName) {
                    reject({
                        "status": 999,
                        "message": "could not find property for: " + resourceKey
                    });
				}
				let propertyType;
                if (propertyName.constructor === Array) {
                    // link data
                    propertyName = propertyName[0];
                    propertyType = "link";

                    // check for unique value
					if (data.length > 1) {
                        // the result is not a json object
                        logdebug("filling on error (PUT link with more than 1 value): %o", data);
                        toReturn.status =knora.util.configKnora.statusCode.atomic_operation;
                        toReturn.message = "PUT request on link property is an atomic operation"+ JSON.stringify(data);
                        fulfill(toReturn);
                        return;
					}
                } else {
                    propertyType = knora.resource_types[model.id][propertyName].gui_name;
				}

				// find the value's UUID
				logdebug("looking for value UUID in %o", previousResult.props);
				let property = previousResult.props[propertyName];
                logdebug("found value %o", property);
                // TODO: if we didn't find it?
				/*
				{ regular_property: 1,
				  value_restype: [ null ],
				  guiorder: 1,
				  value_firstprops: [ null ],
				  is_annotation: '0',
				  valuetype_id: 'http://www.knora.org/ontology/knora-base#TextValue',
				  label: 'Nom',
				  value_iconsrcs: [ null ],
				  guielement: 'text',
				  attributes: 'size=80;maxlength=255',
				  occurrence: '1',
				  value_ids: [ 'http://rdfh.ch/atelier-fabula/U_PysjdURDWa70sQS7TmoQ/values/r5c4tnn3QJ6TDaz4Nc9JNQ' ],
				  value_rights: [ 8 ],
				  pid: 'http://www.knora.org/ontology/0108#hasFamilyName',
				  values: [ { utf8str: 'loic' } ],
				  comments: [ null ]
				}
			    */

                if (property["value_ids"]) {
                    // we have a value to modify

                    // working out the url
                    options.url = knora.util.getUrlIri("values", property["value_ids"][0]);
                    // TODO: in case of several values

                } else {
                    // there is no value yet
                    options.url = knora.util.getUrlIri("values", knora.util.shortIri(options.url));
				}

                    // translating the value
                    // { "familyName": [ "loic" ] } -> "richtext_value": {"utf8str":"lo\xefc"},

                    // find the data type : "text"
                    logdebug("resource_type model prop: %o", knora.resource_types[model.id][propertyName]);
                    let outValues = {};
                    //logdebug("resource_type proptype: %o", propertyType);
                    switch (propertyType) {
                        case 'text':
                            _.forEach(values, function (value) {
                                outValues.richtext_value = {"utf8str": value};
                            });
                            break;

                        case 'link':
                            _.forEach(values, function (value) {
                                outValues.link_value = knora.util.longIri("atelier-fabula", value);
                            });
                            break;

                        case 'richtext':
                            _.forEach(values, function (value) {
                                // xml-ify the value
                                let xmlified = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + value;
                                let request = {
                                    "xml": xmlified,
                                    "mapping_id": "http://data.knora.org/projects/standoff/mappings/StandardMapping"
                                };
                                logdebug("richtext xmlified: %o", request);
                                outValues.richtext_value = request;

                            });
                            break;

                    }
                    logdebug("filled out values: %o", outValues);
                    options.body = outValues;
			});

			// TODO: on login, cache the project id with the auth token
			options.body.project_id = "http://data.knora.org/projects/0108";

			options.json = true;
		}

		logdebug('request options: %o', options);
		request(options, function (error, response, body) {
			let responseCookies;

			// handling errors
			//**********************************************************************

			if (error) {
				// what kind of error is that?
				logdebug('error: %o', error);
				reject(error);
			}

			let toReturn = {};

			// no error
			//**********************************************************************

			if (response.statusCode !== HttpStatus.OK) {
				reject({
					"status": 999,
					"message": body
				});
			}

			// read `request` response headers for cookies
			// pass them over to the `express` response
			responseCookies = response.headers['set-cookie'];
			if (responseCookies) {
				toReturn.setCookies = responseCookies;
			}


			// is the response a json object?
			let parsedBody = body;
			try {
				if (typeof body === 'string' || body instanceof String) {
					logdebug("typeof body: %o", typeof body);
					parsedBody = JSON.parse(body);
				}
				logdebug("json returned: %j", parsedBody);

				// deal with a json object
				toReturn.status = parsedBody.status ||knora.util.configKnora.statusCode.ok;
				let message = parsedBody.message || parsedBody.error || undefined;
				if (parsedBody.userProfile) {
					toReturn.user = parsedBody.userProfile.userData;
				}
				if (parsedBody.resinfo) {
					toReturn.resinfo = parsedBody.resinfo;
				}
				if (parsedBody.resdata) {
					toReturn.resdata = parsedBody.resdata;
				}
				if (parsedBody.props) {
					toReturn.props = parsedBody.props;
					//} else {
					//	if (parsedBody.results) {
					//		toReturn.props = parsedBody.results;
					//	}
				}
				if (toReturn.status !==knora.util.configKnora.statusCode.ok) {
					logdebug("filling on status: %o", toReturn.status);
					toReturn.message = message;
					fulfill(toReturn);
					return;
				}
				// result of a post
				if (parsedBody.res_id) {
					logdebug("filling on res_id: %o", parsedBody.res_id);
					toReturn.id =knora.util.shortIri(parsedBody.res_id);
					fulfill(toReturn);
					return;
				}
				// result of a put
				if (parsedBody.id) {
					logdebug("filling on (value) id: %o", parsedBody.id);
					toReturn.id = parsedBody.id;
					fulfill(toReturn);
					return;
				}
			}
			catch (e) {
				// the result is not a json object
				logdebug("filling on exception (no json): %o, %o", e, body);
				toReturn.status =knora.util.configKnora.statusCode.other;
				toReturn.message = body;
				fulfill(toReturn);
				return;
			}

			// search
			if (parsedBody.subjects) {
				/*
				{
			"subjects": [{
				"iconlabel": "Article Fabula",
				"valuetype_id": ["http://www.w3.org/2000/01/rdf-schema#label"],
				"preview_nx": 32,
				"icontitle": "Article Fabula",
				"preview_ny": 32,
				"obj_id": "http://rdfh.ch/atelier-fabula/1m0DgvydTUWJLKFk435PHg",
				"iconsrc": null,
				"preview_path": null,
				"rights": 8,
				"value": ["sdf"],
				"valuelabel": ["Label"]
			}, {
				"iconlabel": "Article Fabula",
				"valuetype_id": ["http://www.w3.org/2000/01/rdf-schema#label"],
				"preview_nx": 32,
				"icontitle": "Article Fabula",
				"preview_ny": 32,
				"obj_id": "http://rdfh.ch/atelier-fabula/3hIi3CxjQpat-8UdRjkGuw",
				"iconsrc": null,
				"preview_path": null,
				"rights": 8,
				"value": ["Le travail de la narration dramatique, par Danielle Chaperon"],
				"valuelabel": ["Label"]
			}, {
				*/

				// walk through the results
				toReturn.found = [];
				_.forEach(parsedBody.subjects, function(element) {
					toReturn.found.push({
						id : knora.shortIri(element.obj_id),
						label : element.value.pop()
					})
				});

				fulfill(toReturn);
				return;
			}

			logdebug("props of model: %o", model);

			if (!model) {
				logdebug("filling on no model");
				fulfill(toReturn);
				return;
			}

			// model is of the kind:
			// { model:
			// { article: {
			//     title: 'http://www.knora.org/ontology/0108#articleHasTitle',
			//     subtitle: 'http://www.knora.org/ontology/0108#hasSubtitle',
			//     author: undefined } } }
			logdebugReq("resinfo: %o", toReturn.resinfo);
			logdebugReq("resdata: %o", toReturn.resdata);
			logdebugReq("props: %o", toReturn.props);

			toReturn.resource = {};
            toReturn.resource.id = knora.util.shortIri(toReturn.resdata.res_id);

			// iterate over the properties of the model
			_.forEach(model.properties, function (value, key) {
				// key   : title
				// value : http://www.knora.org/ontology/0108#articleHasTitle'
				// ---------- or
				// key   : author
				// value : [ 'http://www.knora.org/ontology/0108#articleHasAuthor', author.model.author ]

				logdebug("key value %s => %o", key, value);

				toReturn.resource[key] = [];

				let linkedModel = {};

				// case of a resource link
				if (_.isArray(value)) {
					linkedModel = value[1];
					value = value[0];
				}

				// search for the model's property in the knora response
				if (toReturn.props[value]) {
                    if (toReturn.props[value].values) {

                        logdebug("  found %o", value);
                        switch (toReturn.props[value].valuetype_id) {
                            // values
                            case "http://www.knora.org/ontology/knora-base#TextValue":
                                _.forEach(toReturn.props[value].values, function (item) {
                                    if (toReturn.props[value].guielement === "text") {
                                        toReturn.resource[key].push(item.utf8str);
                                    } else if (toReturn.props[value].guielement === "richtext") {
                                        toReturn.resource[key].push(item.xml.substr(item.xml.indexOf('>') + 2));
                                    }
                                });
                                break;

                            //case "":
                            //	...;
                            //	break;

                            // link
                            case "http://www.knora.org/ontology/knora-base#LinkValue":
                                let linkedOptions = _.clone(options);
                                for (let i = 0; i < toReturn.props[value].values.length; i++) {
                                    linkedOptions.url = knora.util.getUrlIri("resources", toReturn.props[value].values[i]);
                                    logdebug("cooool %o", linkedOptions.url);

                                    // req and res are the entry point (original) request and result, we keep them
                                    subrequests.push(knora.knora_request({options: linkedOptions, model: linkedModel, depth: (depth-1)}));
                                    anchors.push(key);
                                }
                        }
                    } /* else: the value is empty, do nothing */
				} else {
					logdebug("  not found %o in %o", value, toReturn.props);
					// TODO: error in the model? in the data? think of test cases
				}
			});

			logdebug("subrequests: %s", subrequests.length);
			if (subrequests.length > 0) {
				logdebug("wainting for subrequests...");
				Promise.all(subrequests)
					.then(function (results) {
						logdebug("all subrequests have returned %s", results.length);
						// merge the answers
						for (let i = 0; i < results.length; i++) {
							// TODO: merge states and messages
							logdebug("subreq result %n: %o => %o", 1, anchors[i], results[i].resource);
							toReturn.resource[anchors[i]].push(results[i].resource);
						}
						fulfill(toReturn);
					})
					.catch(reject);
			} else {
				fulfill(toReturn);
			}
		});
	});
};

/**
 * Get a request
 *
 * forward to knora request
 * handles the response for the client
 *
 * options : options to be passed over to request
 * req : express request
 * res : express response
 * model : model of the object to be returned
 *
 * @param options
 * @param req
 * @param res
 * @param model
 */
Knora.prototype.api_request = function (options, req, res, model) {

	logdebug('entering request');

	// make this available in request call
	let knora = this;

	// make sure that we know the model's type
	this.knora_restypes(model)
		// fix the cookies
	// then proceed with the request
		.then(function (result) {
            logdebug("types known: %o", result);

            return Promise.resolve(knora.fixCookies(options, req));
        })
		// if this is a put request, query the resource to modify first
		.then(function(result) {
            logdebug('fixed cookies: %o', result);

            // if this is not a PUT request, just move on
            if (options.method !== 'PUT') {
                logdebug('flow, no put, going on with: %s', options.method);
                return Promise.resolve(result);
            }

            // else we have an update request, we have to query the resource again first
            options.method = 'GET';
            options.next = 'PUT';

            logdebug('flow, put request, going on first with: %s', options.method);
            return knora.knora_request({options: options, model: model, data: req.body, depth: 1});
        })
		.then(function(result) {
			if (options.next) {
                options.method = options.next;
                delete options.next;
                logdebug('flow, after GET, now proceed with the put request: %s', options.method);
			} else {
                logdebug('sending request, body: %o', req.body);
			}

			return knora.knora_request({options: options, model: model, data: req.body, previousResult: result, id: req.params.iri, depth: 1});
		})
		// then return the result
		.then(function (result) {
			logdebug("success!!! %o", result);

			/* clean up result from internal states */
			delete result.resinfo;
			delete result.resdata;
			delete result.props;

			if (result.setCookies) {
				res.set('set-cookie', result.setCookies);
				delete result.setCookies;
			}

			// send result
			res.status(HttpStatus.OK);
			res.json(result);
		})
		// or complain about error
		.catch(function (error) {
			logdebug("catching an error :(", error);
			if (error.status) {
				// this is an error that we already parsed
				res.status(HttpStatus.OK);
				res.json(error);
			} else {
				// this an error that we don't know
				res.status(HttpStatus.BAD_GATEWAY);
				res.json({
					status:knora.util.configKnora.statusCode.other,
					message: 'something wrong happened uphill, check config or knora'
				});
			}
		});
}
;

/**
 * Login
 *
 * Specific login request
 *
 * @param req
 * @param res
 */
Knora.prototype.login = function (req, res) {
	log.info("login");
	// fill in the url and method
	let url = this.util.baseUrl + "session";
	let options = {
		method: 'POST',
		url: url
	};

	// forward the request to Knora
	this.api_request(options, req, res, undefined);
};

Knora.prototype.logout = function (req, res) {
	// fill in the url and method
	let url = this.util.baseUrl + "session";
	let options = {
		method: 'DELETE',
		url: url
	};

	// forward the request to Knora
	this.api_request(options, req, res, undefined);
};

Knora.prototype.search = function (search, req, res) {
	// fill in the url and method
	let search_string = "?searchtype=extended&show_nrows=25&start_at=0&filter_by_project=http://data.knora.org/projects/0108";
	//let url = this.baseUrl + "search/" + qs.escape(iri);
	let url = this.util.baseUrl + "search/" + search_string;
	let options = {
		method: 'GET',
		url: url
	};

	// forward the request to Knora
	this.api_request(options, req, res, undefined);
};

Knora.prototype.api_search_by_type = function (project, model, req, res) {
	// http://localhost:3333/v1/search/?searchtype=extended&show_nrows=25&start_at=0&filter_by_restype=http://www.knora.org/ontology/0108#Article&filter_by_project=http://data.knora.org/projects/0108
	let options = {
		method: 'GET',
	};
	options.url = this.util.baseUrl + "search/?searchtype=extended&show_nrows=5&start_at=0";
	if (model) {
		options.url += "&filter_by_restype=" + qs.escape(model.id);
	}
	if (project) {
		options.url += "&filter_by_project=" + qs.escape(project);
	}

	this.api_request(options, req, res, model);
};

module.exports = Knora;
