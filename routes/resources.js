'use strict';
const express = require('express');
const router = express.Router();
const Knora = require('./../kapi/knora');
const logdebug = require('debug')('resources');

/*
 * Article route controller
 *
 */

var knora = new Knora();

/**
 *
 */
router.use('/', function timelog(req, res, next) {
	logdebug('received resource request at %s, params: %o', Date.now(), req.params);
	next();
});

router.get('/:project/:model/:iri', function (req, res, next) {
	var url = knora.util.getUrl("resources", req.params.project, req.params.iri);
	var options = {
		method: 'GET',
		url: url,
	};

	let model = require('./../models/'+ req.params.project +'/'+ req.params.model);
	logdebug('sending resource request with options %o', options);
	logdebug('models: %o', model);
	logdebug('model: %o', model.model[req.params.model]);

	knora.api_request(options, req, res, model.model[req.params.model], next);
});

router.post('/:project/:model', function(req, res, next) {
    var url = knora.util.baseUrl +'resources';
    // TODO: set the project
    var options = {
        method: 'POST',
        url: url,
    };

    logdebug('post data: %o', req.body);
    let model = require('./../models/'+ req.params.project +'/'+ req.params.model);
    logdebug('sending resource request with options %o', options);
    logdebug('models: %o', model);
    logdebug('model: %o', model.model[req.params.model]);

    knora.api_request(options, req, res, model.model[req.params.model], next);
});

router.post('/:project/:model/:iri', function(req, res, next) {
    var url = knora.util.baseUrl +'values';
    // TODO: set the project
    var options = {
        method: 'POST',
        url: url,
    };

    logdebug('post data: %o', req.body);
    let model = require('./../models/'+ req.params.project +'/'+ req.params.model);
    logdebug('sending resource request with options %o', options);
    logdebug('models: %o', model);
    logdebug('model: %o', model.model[req.params.model]);

    knora.api_request(options, req, res, model.model[req.params.model], next);
});

router.put('/:project/:model/:iri', function(req, res, next) {
    var url = knora.util.getUrl("resources", req.params.project, req.params.iri);
	// TODO: set the project
	var options = {
		method: 'PUT',
		url: url,
	};

	logdebug('put data: %o', req.body);
	let model = require('./../models/'+ req.params.project +'/'+ req.params.model);
	logdebug('sending resource request with options %o', options);
	logdebug('models: %o', model);
	logdebug('model: %o', model.model[req.params.model]);

	knora.api_request(options, req, res, model.model[req.params.model], next);
});

router.delete('/:project/:model/:iri', function(req, res, next) {
    var url = knora.util.getUrl("resources", req.params.project, req.params.iri);
    // TODO: set the project
    var options = {
        method: 'DELETE',
        url: url,
    };

    logdebug('delete data: %o', req.body);
    let model = require('./../models/'+ req.params.project +'/'+ req.params.model);
    logdebug('sending resource request with options %o', options);
    logdebug('models: %o', model);
    logdebug('model: %o', model.model[req.params.model]);

    knora.api_request(options, req, res, model.model[req.params.model], next);
});

module.exports = router;
