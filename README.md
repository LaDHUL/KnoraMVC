# KnoraMVC
MVC style of API on top of Knora



## Description

When planning for a web or mobile app, the front-end standards are based on MVC/Rest API.

To ease the development of such interfaces for data that are hosted in Knora, KnoraMVC takes a model and makes the necessary calls to Knora in order to populate it.

This API server explores the data graph according to the data model, sends the subrequests to Knora, coordinates the results and sends back a comprehensive answer. 

## Install

- requirements: [node](https://nodejs.org/) and [npm](http://npmjs.com/)
- clone from here `https://github.com/LaDHUL/KnoraMVC`
- install the node packages: `node install`

## Config

- main config, as described in the node package [config](https://www.npmjs.com/package/config), you can have a look at `config/default.jason` and overwrite whatever value in seperate config file
- to hook on a real server, cert files should be changed (see folder `/certs` that just hold self signed certs to be able to run the API as is)
- the main work is to set the model ('M' in MVC)

## Run

- requirements: this is an interface on top of [Knora](http://www.knora.org/), so you need a Knora instance

- run:

  ```bash
  npm start
  ```

  or in development mode, in the project directory:

  ```bash
  ./node_modules/.bin/nodemon ./bin/www
  ```

  You might want to enable debug log on some of the code parts:

  ```bash
  DEBUG=app,resources,knora ./node_modules/.bin/nodemon ./bin/www
  ```

## Test

There is a test set-up using [jasmine](https://jasmine.github.io/), but it is for now dependant on test data stored in knora.
It will be generalised.