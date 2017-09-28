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
	// read resource description

	var url = knora.getUrl("resources", req.params.project, req.params.iri);
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

module.exports = router;
