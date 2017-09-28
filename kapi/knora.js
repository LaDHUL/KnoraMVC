'use strict';

const config = require('config');
const _ = require('lodash');
/**
 * implementation notes: we use 'request' rather than 'http'
 * because it handles chunked responses (Knora sends traffic in chunks)
 */
const request = require('request');
const Log = require('log'), log = new Log('info');
const logdebug = require('debug')('knora');
const logdebugReq = require('debug')('req');
const HttpStatus = require('http-status-codes');
const qs = require('querystring');


function Knora() {
	this.configKnora = config.get('knora');
	this.baseUrl =
		this.configKnora.server.protocol + '://' +
		this.configKnora.server.host + "/" +
		this.configKnora.server.version + "/";
}

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
Knora.prototype.getUrlIri = function (command, iri) {
	return this.baseUrl + command + "/" + qs.escape(iri);
};

Knora.prototype.getUrl = function (command, project, iri) {
	return this.baseUrl + command + "/" + qs.escape( "http://rdfh.ch/"+ project +"/" + iri);
};

/**
 * Helper method to set Authentication into cookies
 *
 * @param options
 * @param req
 */
Knora.prototype.fixCookies = function (options, req) {
	// if auth is requested fill it in the options
	// read `express` request header 'Authorization'
	logdebug("req: %o", req);
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
Knora.prototype.knora_request = function (options, model) {
	let knora = this;

	// make this a promise to be able to chain them
	return new Promise(function (fulfill, reject) {
		// for synchronizing the subrequests
		let subrequests = [];
		let anchors = [];

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
			try {
				let parsedBody = JSON.parse(body);
				// deal with a json object
				toReturn.status = parsedBody.status || knora.configKnora.statusCode.ok;
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
				}
				if (toReturn.status !== knora.configKnora.statusCode.ok) {
					toReturn.message = message;
					fulfill(toReturn);
					return;
				}
			} catch (e) {
				// the result is not a json object
				toReturn.status = knora.configKnora.statusCode.other;
				toReturn.message = body;
				fulfill(toReturn);
				return;
			}

			logdebug("props of model: %o", model);

			if (!model) {
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
			// iterate over the properties of the model
			_.forEach(model, function (value, key) {
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
					logdebug("  found %o", value);
					switch (toReturn.props[value].valuetype_id) {
						// values
						case "http://www.knora.org/ontology/knora-base#TextValue":
							_.forEach(toReturn.props[value].values, function (item) {
								if (toReturn.props[value].guielement === "text") {
									toReturn.resource[key].push(item.utf8str);
								} else if (toReturn.props[value].guielement === "richtext") {
									toReturn.resource[key].push(item.xml);
								}
							});
							break;

						//case "":
						//	...;
						//	break;

						// link
						case "http://www.knora.org/ontology/knora-base#LinkValue":
							let linkedOptions = _.clone(options);
							for (var i = 0; i < toReturn.props[value].values.length; i++) {
								linkedOptions.url = knora.getUrlIri("resources", toReturn.props[value].values[i]);
								logdebug("cooool %o", linkedOptions.url);

								// req and res are the entry point (original) request and result, we keep them
								subrequests.push(knora.knora_request(linkedOptions, linkedModel));
								anchors.push(key);
							}
					}
				} else {
					logdebug("  not found %o", value);
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
						for (var i = 0; i < results.length; i++) {
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

	this.fixCookies(options, req);

	logdebug('sending request');
	// send the request

	this.knora_request(options, model)
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
					status: knora.configKnora.statusCode.other,
					message: 'something wrong happened uphill, check config or knora'
				});
			}
		});
};

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
	let url = this.baseUrl + "session";
	let options = {
		method: 'POST',
		url: url
	};

	// forward the request to Knora
	this.api_request(options, req, res, undefined);
};

Knora.prototype.logout = function (req, res) {
	// fill in the url and method
	let url = this.baseUrl + "session";
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
	let url = this.baseUrl + "search/" + search_string;
	let options = {
		method: 'GET',
		url: url
	};

	// forward the request to Knora
	this.api_request(options, req, res, undefined);
};

module.exports = Knora;
