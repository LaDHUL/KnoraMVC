'use strict';

const request = require('request');
const HttpStatus = require('http-status-codes');
const logdebug = require('debug')('session-remote');

const user = 'user02.user@example.com';
const pwd = 'test';

// prerequisite: start a knora server
describe("Knora API", function() {

	//jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

    const unknownRequest = "unknown request";
    it(unknownRequest, function(done) {
        // initiates knora
        request.post('http://localhost:3000/unknown')
            .auth(user, pwd, true)
            .on('response', function(response) {
                logdebug('test: %o, received a response: %s', unknownRequest, JSON.stringify(response));
                expect(response.statusCode).toEqual(HttpStatus.BAD_REQUEST);
                logdebug('test: %o, finished', unknownRequest);
                done();
            });
        logdebug('test: %o, sent request', unknownRequest);
    });

    // Prerequisite: stop knora or start a Fabula API server pointing to a non existing Knora
    const knoraIsDown = "knora is down";
    it(knoraIsDown, function(done) {
        // initiates knora
        request.post('http://localhost:3502/session/login')
            .auth(user, pwd, true)
            .on('response', function(response) {
                logdebug('test: %o, received a response: %s', knoraIsDown, JSON.stringify(response));
                expect(response.statusCode).toEqual(HttpStatus.BAD_GATEWAY);
                logdebug('test: %o, finished', knoraIsDown);
                done();
            })
			// if the server is not up
            .on('error', function(error) {
				logdebug('test %o, error: %o', knoraIsDown, error);
                expect((error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET')).toBeTruthy();
                done();
            });
    });
    
    let header_cookies;
    const logsIn = "logs in";
    it(logsIn, function(done) {
        // initiates knora
        logdebug('test: %o, starts', logsIn);
        request.post('http://localhost:3000/session/login')
            .auth(user, pwd, true)
            .on('response', function(response) {
                logdebug('test: %o, received a response: %s', logsIn, JSON.stringify(response));
                expect(response.statusCode).toEqual(HttpStatus.OK);
                //auth_token = response.headers['set-cookie'];
                //expect(auth_token).toBeDefined();
                header_cookies = response.headers['set-cookie'];
                
                logdebug('test: %o, cookies (%s) #%o# [%o %o]', logsIn, typeof header_cookies, header_cookies, typeof header_cookies[0], header_cookies[0]);
                logdebug('test: %o, finished', logsIn);
                done();
            });
    });
    
    const logsOut = "logs out";
    it(logsOut, function(done) {
        logdebug('test: %o, starts', logsOut);
        // set header through options
        const options = {
            url: 'http://localhost:3000/session/logout',
            headers: {
                'Cookie': header_cookies
            } 
        };
        logdebug('test: %o, options: %o', logsOut, options);
        request.post(options)
            .auth(user, pwd, true)
            .on('response', function(response) {
                logdebug('test: %o, received a response: %s', logsOut, JSON.stringify(response));
                expect(response.statusCode).toEqual(HttpStatus.OK);
                logdebug('test: %o, finished', logsOut);
                done();
            });
    });
});
