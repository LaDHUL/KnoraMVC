'use strict';

const request = require('request');
const HttpStatus = require('http-status-codes');
const logdebug = require('debug')('composite-resource');

//var myConfig = new KapiConfig(utils.env.local, 'myproject');
const user = 'fabula-test@unil.ch';
const pwd = 'test';

let target1_id;
let source_id;
let target2_id;

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
                    givenName: [ 'Titus' ],
                    familyName: [ 'Livius' ],
                },
                label: 'Titus Livius'
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
                expect(response.id).toBeDefined();
                target1_id = response.id;
                done();
            });
    });

    let notionName = 'Uchronie';
    let notionDefinition = '<text>réécriture de l’Histoire à partir de la modification d’un événement du passé</text>';
    it("create a composite resource", function(done) {
        const method = "create a composite resource";
        logdebug('test: %o, starts', method);
        // set header through options
        const options = {
            url: 'http://localhost:3000/resources/atelier-fabula/notion',
            headers: {
                'Cookie': header_cookies
            },
            body: {
                resource: {
                    name: [ notionName ],
                    definition: [ notionDefinition ],
                    author: [ target1_id ]
                },
                label: 'Uchronie - histoire alternative'
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
                expect(response.id).toBeDefined();
                source_id = response.id;
                done();
            });
    });

    it("access a composite resource", function(done) {
        const method = "access a composite resource";
        logdebug('test: %o, starts', method);
        // set header through options
        const options = {
            url: 'http://localhost:3000/resources/atelier-fabula/notion/' + source_id,
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
                expect(response.resource.id).toEqual(source_id);
                expect(response.resource.name.pop()).toEqual(notionName);
                expect(response.resource.definition.pop()).toEqual(notionDefinition);
                let author = response.resource.author.pop();
                expect(author.id).toEqual(target1_id);
                expect(author.givenName.pop()).toEqual('Titus');
                expect(author.familyName.pop()).toEqual('Livius');
                done();
            });
    });

    it("create another simple resource", function(done) {
        const method = "create another simple resource";
        logdebug('test: %o, starts', method);
        // set header through options
        const options = {
            url: 'http://localhost:3000/resources/atelier-fabula/author',
            headers: {
                'Cookie': header_cookies
            },
            body: {
                resource: {
                    givenName: [ 'Charles' ],
                    familyName: [ 'Renouvier' ],
                },
                label: 'Charles Renouvier'
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
                expect(response.id).toBeDefined();
                target2_id = response.id;
                done();
            });
    });


    it("modifies a composite resource", function(done) {
        const method = "modifies a composite resource";
        logdebug('test: %o, starts', method);
        // set header through options
        const options = {
            url: 'http://localhost:3000/resources/atelier-fabula/notion/' + source_id,
            headers: {
                'Cookie': header_cookies
            },
            body: { author: [ target2_id ] },
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

    it("access a composite resource again", function(done) {
        const method = "access a simple resource again";
        logdebug('test: %o, starts', method);
        // set header through options
        const options = {
            url: 'http://localhost:3000/resources/atelier-fabula/notion/' + source_id,
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
                let author = response.resource.author.pop();
                expect(author.givenName.pop()).toEqual('Charles');
                expect(author.familyName.pop()).toEqual('Renouvier');
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
