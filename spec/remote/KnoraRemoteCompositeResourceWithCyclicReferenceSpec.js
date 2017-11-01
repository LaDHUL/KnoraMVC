'use strict';

const request = require('request');
const HttpStatus = require('http-status-codes');
const logdebug = require('debug')('cyclic-resource');

//var myConfig = new KapiConfig(utils.env.local, 'myproject');
const user = 'fabula-test@unil.ch';
const pwd = 'test';

let notion1 = {
    name: 'Uchronie',
    definition: '<text>réécriture de l’Histoire à partir de la modification d’un événement du passé</text>'
};
let notion2 = {
    name: 'Histoire alternative',
    definition: notion1.definition
};
let author = {
    givenName: 'Charles',
    familyName: 'Renouvier'
};

// prerequisite: start a knora server
// with fabula onto loaded
// and user `fabula-test@unil.ch` defined
describe("resource: composite resources with cycle references", function() {

    let header_cookies = {};
    it("logsIn", function (done) {
        const method = "logsIn";
        // initiates knora
        logdebug('test: %o, starts', method);
        request.post('http://localhost:3000/session/login').auth(user, pwd, true)
            .on('response', function (response) {
                logdebug('test: %o, received a response: %s', method, JSON.stringify(response));
                expect(response.statusCode).toEqual(HttpStatus.OK);
                header_cookies = response.headers['set-cookie'];
                logdebug('test: %o, cookies (%s) #%o# [%o %o]', method, typeof header_cookies, header_cookies, typeof header_cookies[0], header_cookies[0]);
                logdebug('test: %o, finished', method);
                done();
            });
    });

    /*
    --------------------------------------------------------------------------------------------------------------------
     */

    // just because we need one
    it("create an author", function(done) {
        const method = "create an author";
        // set header through options
        const options = {
            url: 'http://localhost:3000/resources/atelier-fabula/author',
            headers: {
                'Cookie': header_cookies
            },
            body: {
                resource: {
                    givenName: [ author.givenName ],
                    familyName: [ author.familyName ],
                },
                label: author.givenName + ' ' + author.familyName
            },
            json: true
        };

        request.post(options)
            .auth(user, pwd, true)
            .on('response', function(response) {
                expect(response.statusCode).toEqual(HttpStatus.OK);
            })
            .on('data', function(data) {
                let response;
                try {
                    response = JSON.parse(data);
                } catch (e) {
                    fail('returned object was not a json object: '+ data);
                }
                expect(response.status).toBeDefined();
                expect(response.status).toEqual(0);
                expect(response.id).toBeDefined();
                author.id = response.id;
                done();
            });
    });


    let createNotion = function (a, b, next) {
        logdebug("createNotion, a: %o", a);
        logdebug("createNotion, b: %o", b);
        let options = {
            url: 'http://localhost:3000/resources/atelier-fabula/notion',
            headers: {
                'Cookie': header_cookies
            },
            body: {
                resource: {
                    name: [ a.name ],
                    definition: [ a.definition ],
                    author: [ author.id ]
                },
                label: a.name
            },
            json: true
        };
        if (b) {
            logdebug("setting b: %s", b.id);
            options.body.resource.parentNotion = [ b.id ];
        }

        logdebug("options: %o", options);
        request.post(options)
            .auth(user, pwd, true)
            .on('response', function(response) {
                expect(response.statusCode).toEqual(HttpStatus.OK);
            })
            .on('data', function(data) {
                let response;
                try {
                    response = JSON.parse(data);
                } catch (e) {
                    fail('returned object was not a json object: '+ data);
                }
                logdebug('response: %o', response);
                expect(response.status).toBeDefined();
                expect(response.status).toEqual(0);
                expect(response.id).toBeDefined();
                logdebug("created id: %s", response.id);
                a.id = response.id;
                next();
            });
    };

    // create a first notion
    it("create a first notion", function(done) {
        logdebug("create a first notion");
        notion1.author = author.id;
        createNotion(notion1, null, done);
    });

    // create a second notion
    it("create a second notion linked to the first one", function(done) {
        logdebug("create a second notion");
        notion2.author = author.id;
        let res = createNotion(notion2, notion1, done);
    });

    it("access the second notion", function(done) {
        const method = "access a composite resource";
        // set header through options
        const options = {
            url: 'http://localhost:3000/resources/atelier-fabula/notion/' + notion2.id,
            headers: {
                'Cookie': header_cookies
            }
        };
        request.get(options)
            .auth(user, pwd, true)
            .on('response', function(response) {
                expect(response.statusCode).toEqual(HttpStatus.OK);
            })
            .on('data', function(data) {
                let response;
                try {
                    response = JSON.parse(data);
                } catch (e) {
                    fail('returned object was not a json object: '+ data);
                }
                expect(response.resource.id).toEqual(notion2.id);
                expect(response.resource.name.pop()).toEqual(notion2.name);
                let res_author = response.resource.author.pop();
                expect(res_author.id).toEqual(author.id);
                let link = response.resource.parentNotion.pop();
                expect(link.id).toEqual(notion1.id);
                done();
            });
    });

    // modify the first resource to link it to the second one and create a cycle
    it("modifies notion1 to link it to notion2", function(done) {
        // set header through options
        logdebug("setting notion2: %o", notion2);
        const options = {
            url: 'http://localhost:3000/resources/atelier-fabula/notion/' + notion1.id,
            headers: {
                'Cookie': header_cookies
            },
            body: { resource: { parentNotion: notion2.id } },
            json: true
        };
        request.post(options)
            .auth(user, pwd, true)
            .on('response', function(response) {
                expect(response.statusCode).toEqual(HttpStatus.OK);
            })
            .on('data', function(data) {
                let response;
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

    it("access notion1 to see the circle", function(done) {
        const method = "access a simple resource again";
        logdebug('test: %o, starts', method);
        // set header through options
        const options = {
            url: 'http://localhost:3000/resources/atelier-fabula/notion/' + notion1.id,
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
                expect(response.resource.id).toEqual(notion1.id);
                let link = response.resource.parentNotion.pop();
                expect(link.id).toEqual(notion2.id);
                let cyclic_link = link.parentNotion.pop();
                expect(cyclic_link.id).toEqual(notion1.id);
                done();
            });
    });



    /*
    --------------------------------------------------------------------------------------------------------------------
    */

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
