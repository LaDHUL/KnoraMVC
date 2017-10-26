'use strict';

const request = require('request');
const HttpStatus = require('http-status-codes');
const logdebug = require('debug')('simple-resource');

//var myConfig = new KapiConfig(utils.env.local, 'myproject');
const user = 'fabula-test@unil.ch';
const pwd = 'test';

let uuid;

// prerequisite: start a knora server
// with fabula onto loaded
// and user `fabula-test@unil.ch` defined
describe("resource: create and access", function() {

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

    it("create a simple resource", function(done) {
        const method = "create a simple resource";
        logdebug('test: %o, starts', method);
        // set header through options
        const options = {
            url: 'http://localhost:3000/resources/atelier-fabula/author',
            headers: {
                'Cookie': header_cookies
            },
            body: {
                resource: {
                    familyName: [ 'loic' ],
                    givenName: [ 'jaouen' ],
                },
                label: 'loic jaouen'
            },
            json: true
        };

        logdebug('test: %o, options: %o', method, options);
        request.post(options)
            .auth(user, pwd, true)
            .on('response', function(response) {
                logdebug('test: %o, received a response: %s', method, JSON.stringify(response));
                expect(response.statusCode).toEqual(HttpStatus.OK);
                logdebug('test: %o, finished', method);
            })
            .on('data', function(data) {
                let response;
                logdebug('test: %o, received a response body: %s', method, data);
                try {
                    response = JSON.parse(data);
                } catch (e) {
                    fail('returned object was not a json object: '+ data);
                }
                expect(response.status).toBeDefined();
                expect(response.status).toEqual(0);
                expect(response.res_id).toBeDefined();
                expect(response.res_id).toMatch('http://rdfh.ch/atelier-fabula/');
                uuid = response.res_id.substr(response.res_id.lastIndexOf('/') + 1);
                done();
            });
    });

    it("access a simple resource", function(done) {
        const method = "access a simple resource";
        logdebug('test: %o, starts', method);
        // set header through options
        const options = {
            url: 'http://localhost:3000/resources/atelier-fabula/author/' + uuid,
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
            })
            .on('data', function(data) {
                let response;
                logdebug('test: %o, received a response body: %s', method, data);
                try {
                    response = JSON.parse(data);
                } catch (e) {
                    fail('returned object was not a json object: '+ data);
                }
                expect(response.resource.id).toEqual(uuid);
                expect(response.resource.familyName.pop()).toEqual('loic');
                expect(response.resource.givenName.pop()).toEqual('jaouen');
                done();
            });
    });

    it("modifies a simple resource", function(done) {
        const method = "modifies a simple resource";
        logdebug('test: %o, starts', method);
        // set header through options
        const options = {
            url: 'http://localhost:3000/resources/atelier-fabula/author/' + uuid,
            headers: {
                'Cookie': header_cookies
            },
            body: { givenName: [ 'Loïc' ] },
            json: true
        };
        logdebug('test: %o, options: %o', method, options);
        request.put(options)
            .auth(user, pwd, true)
            .on('response', function(response) {
                logdebug('test: %o, received a response: %s', method, JSON.stringify(response));
                expect(response.statusCode).toEqual(HttpStatus.OK);
                logdebug('test: %o, finished', method);
            })
            .on('data', function(data) {
                let response;
                logdebug('test: %o, received a response body: %s', method, data);
                try {
                    response = JSON.parse(data);
                } catch (e) {
                    fail('returned object was not a json object: '+ data);
                }
                expect(response.status).toBeDefined();
                expect(response.status).toEqual(0);
                done();
            });
    });

    it("modifies a simple resource again", function(done) {
        const method = "modifies a simple resource";
        logdebug('test: %o, starts', method);
        // set header through options
        const options = {
            url: 'http://localhost:3000/resources/atelier-fabula/author/' + uuid,
            headers: {
                'Cookie': header_cookies
            },
            body: { familyName: [ 'Jaouen' ] },
            json: true
        };
        logdebug('test: %o, options: %o', method, options);
        request.put(options)
            .auth(user, pwd, true)
            .on('response', function(response) {
                logdebug('test: %o, received a response: %s', method, JSON.stringify(response));
                expect(response.statusCode).toEqual(HttpStatus.OK);
                logdebug('test: %o, finished', method);
            })
            .on('data', function(data) {
				let response;
				logdebug('test: %o, received a response body: %s', method, data);
				try {
					response = JSON.parse(data);
                } catch (e) {
                    fail('returned object was not a json object: '+ data);
                }
                expect(response.status).toBeDefined();
                expect(response.status).toEqual(0);
                done();
            });
    });

    it("access a simple resource again", function(done) {
        const method = "access a simple resource again";
        logdebug('test: %o, starts', method);
        // set header through options
        const options = {
            url: 'http://localhost:3000/resources/atelier-fabula/author/' + uuid,
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
            })
            .on('data', function(data) {
                let response;
                logdebug('test: %o, received a response body: %s', method, data);
                try {
                    response = JSON.parse(data);
                } catch (e) {
                    fail('returned object was not a json object: '+ data);
                }
                expect(response.resource.id).toEqual(uuid);
                expect(response.resource.familyName.pop()).toEqual('Jaouen');
                expect(response.resource.givenName.pop()).toEqual('Loïc');
                done();
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
