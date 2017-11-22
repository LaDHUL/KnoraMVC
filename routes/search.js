'use strict';
const express = require('express');
const router = express.Router();
const Knora = require('./../kapi/knora');
const logdebug = require('debug')('search');

/*
 * Article route controller
 *
 */

var knora = new Knora();

/**
 *
 */
router.use('/', function timelog(req, res, next) {
	logdebug('received search request at %s, params: %o', Date.now(), req.params);
	next();
});

router.get('/:project/:model', function(req, res) {
    logdebug("project: %o, model: %o", req.params.project , req.params.model);
	let model = require('./../models/'+ req.params.project +'/'+ req.params.model);
	knora.api_search_by_type(req.params.project, model.model[req.params.model], req, res);
});

module.exports = router;
