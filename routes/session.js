'use strict';

const express = require('express');
const router = express.Router();
const Knora = require('./../kapi/knora');
const logdebug = require('debug')('session');

/*
 * Session route controller
 *
 */

const knora = new Knora();

/**
 * request login
 */
router.post('/login', function(req, res) {
	logdebug('received login request');
    knora.login(req, res);
});

/**
 * request login
 */
router.post('/logout', function(req, res) {
	logdebug('received logout request');
	knora.logout(req, res);
});

module.exports = router;
