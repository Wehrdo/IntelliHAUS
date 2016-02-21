/**
 * Created by David on 2/11/2016.
 */
var express = require('express');
var path = require('path');


module.exports = function(app) {
// Homepage
    app.get('/', function (request, response) {
        response.sendFile('/html/homepage.html',  { root : path.join(__dirname, '../public')});
    });

    var signup = require('./public/signup_route');
    app.use('/signup', signup);
    var authenticate = require('./public/authenticate_route');
    app.use('/authenticate', authenticate);
    var userQuery = require('./public/user_route');
    app.use('/user', userQuery);
};
