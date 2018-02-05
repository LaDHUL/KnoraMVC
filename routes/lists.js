'use strict';
const express = require('express');
const router = express.Router();
const Knora = require('./../kapi/knora');
const logdebug = require('debug')('lists');
const HttpStatus = require('http-status-codes');
const _ = require('lodash');

/*
 * Article route controller
 *
 */

var knora = new Knora();

/**
 *
 */
router.use('/', function timelog(req, res, next) {
	logdebug('received list request at %s, params: %o', Date.now(), req.params);
	next();
});

router.get('/:project/:name', function (req, res, next) {
	var url = knora.util.getUrl("hlists", req.params.project, req.params.name);
	var options = {
		method: 'GET',
		url: url,
	};

	let model = require('./../models/'+ req.params.project +'/lists');
	logdebug('sending resource request with options %o', options);
	logdebug('models: %o', model);
	logdebug('model: %o', model.model[req.params.name]);

    //knora.knora_request(options, req, res, model.model[req.params.name]);
	knora.knora_lists(model.model[req.params.name])
		.then(function(result) {

            // send result
            // format the list for the client
            res.status(HttpStatus.OK);
            //res.json(_.keys(result));
			let answer = [];
			_.forEach(result, function (element, key) {
				answer.push(key);
            });
			res.json(answer);
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
                    status:knora.util.configKnora.statusCode.other,
                    message: 'something wrong happened uphill, check config or knora'
                });
            }
        });
});

module.exports = router;
