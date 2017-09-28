const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logdebug = require('debug')('app');
const HttpStatus = require('http-status-codes');

/*******************************************************************************
 * include the routes here
 ******************************************************************************/
const resources = require('./routes/resources');
const session = require('./routes/session');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*******************************************************************************
 * declare the routes here
 ******************************************************************************/
app.use('/resources', resources);
app.use('/session', session);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    /**
     * do specific 404 error handling code
     */
    let err = new Error('Not Found');
    logdebug('catching error for 404: %o', res);
    /* for an API server, "Not Found 404" is a "Bad Request 400"
    err.status = HttpStatus.NOT_FOUND;
    err.message = {
        error: HttpStatus.NOT_FOUND,
        text: "unknown request"
    }
    */
    err.status = HttpStatus.BAD_REQUEST;
    err.message = {
        error: HttpStatus.BAD_REQUEST,
        text: "unknown request"
    }

    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    logdebug('catching error for 400: %o, %o', err.status, err.message);
    logdebug('catching error for 400: %o', res);

    let api_error = {
        error: HttpStatus.BAD_REQUEST,
        text: "unknown request"
    }
    if (err.status) {
        logdebug('setting status to err.status: %s', err.status);
        res.status(err.status);
        api_error.error = err.status;
    } else {
        logdebug('setting status to BAD_REQUEST, %s', HttpStatus.BAD_REQUEST);
        res.status(HttpStatus.BAD_REQUEST);
    }
    if (err.message) {
        logdebug('setting err.message, %s', JSON.stringify(err.message));
        logdebug('sending: %s %o', res.status, JSON.stringify(err.message));
        res.send(JSON.stringify(err.message));
    } else {
        res.send(api_error);
    }
});

module.exports = app;
