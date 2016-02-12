/**
 * Created by David on 2/11/2016.
 */
var express = require('express');

module.exports = function(app) {
// Homepage
    app.get('/', function (request, response) {
        response.send("<h1>This is the homepage.</h1><br /> Please move along...")
    });

    var signup = require('./public/signup_route');
    app.use('/signup', signup);
    var authenticate = require('./public/authenticate_route');
    app.use('/authenticate', authenticate);
};
