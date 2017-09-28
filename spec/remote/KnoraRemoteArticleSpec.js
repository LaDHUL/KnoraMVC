'use strict';

const request = require('request');
const HttpStatus = require('http-status-codes');
const logdebug = require('debug')('session-remote-article');

//var myConfig = new KapiConfig(utils.env.local, 'myproject');
const user = 'user02.user@example.com';
const pwd = 'test';

// prerequisite: start a knora server
describe("article access", function() {

    let header_cookies = {};
    it("logsIn", function(done) {
        const method = "logsIn";
        // initiates knora
        logdebug('test: %o, starts', method);
        request.post('http://localhost:3000/session/login').auth(user, pwd, true)
            .on('response', function(response) {
                logdebug('test: %o, received a response: %s', method, JSON.stringify(response));
                expect(response.statusCode).toEqual(HttpStatus.OK);
                header_cookies = response.headers['set-cookie'];
                logdebug('test: %o, cookies (%s) #%o# [%o %o]', method, typeof header_cookies, header_cookies, typeof header_cookies[0], header_cookies[0]);
                logdebug('test: %o, finished', method);
                done();
            });
    });

    it("access an article", function(done) {
        const method = "access an article";
        logdebug('test: %o, starts', method);
        // set header through options
        const options = {
            url: 'http://localhost:3000/resources/atelier-fabula/article/3hIi3CxjQpat-8UdRjkGuw',
            headers: {
                'Cookie': header_cookies
            }
        };
        logdebug('test: %o, options: %o', method, options);
        request.get(options)
            .auth(user, pwd, true)
            .on('response', function(response) {
                logdebug('test: %o, received a response: %s', method, JSON.stringify(response));
                expect(response.statusCode).toEqual(HttpStatus.OK);
                logdebug('test: %o, finished', method);
                done();
            })
            .on('data', function(data) {
				let response;
				logdebug('test: %o, received a response body: %s', method, data);
				try {
					response = JSON.parse(data);
                } catch (e) {
                    fail('returned object was not a json object: '+ data);
                }
                expect(response.resource.title.pop()).toEqual('Le travail de la narration dramatique');
                expect(response.resource.subtitle.pop()).toEqual('Quelle narration?');
            });
    });

    it("logs out", function(done) {
        const method = "logs out";
        logdebug('test: %o, starts', method);
        // set header through options
        const options = {
            url: 'http://localhost:3000/session/logout',
            headers: {
                'Cookie': header_cookies
            }
        };
        logdebug('test: %o, options: %o', method, options);
        request.post(options)
            .auth(user, pwd, true)
            .on('response', function(response) {
                logdebug('test: %o, received a response: %s', method, JSON.stringify(response));
                expect(response.statusCode).toEqual(HttpStatus.OK);
                logdebug('test: %o, finished', method);
                done();
            });
    });
});
