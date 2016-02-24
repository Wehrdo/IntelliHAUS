/**
 * Created by David on 2/11/2016.
 */
var express = require('express');
var path = require('path');
var jwt = require('jsonwebtoken');
var models = require('../models');
var config = require("../" + (process.env.NODE_ENV || "dev") + "_config");


module.exports = function(app) {
// Homepage
    var publicRoot = path.join(__dirname, '../public');

    // TODO: I really don't like this repeat of authentication code, but it seemed necessary
    app.get('/', function (req, res) {
        // Reusable function for sending non-logged-in homepage
        var homeNoUser = function() {
            res.clearCookie('accessToken');
            res.sendFile('/html/homepage_nouser.html',  {root: publicRoot});
        };

        // Check for accessToken in cookie, request body, query, and headers
        var token = (req.cookies.accessToken || req.body.accessToken || req.query.accessToken || req.headers['x-access-token']);
        if (!token) {
            homeNoUser();
        }
        else {
            // If token exists, verify it
            jwt.verify(token, config.jwt_secret, function(err, decoded) {
                if (err) {homeNoUser();} // Token doesnn't match
                else {
                    // Check for user in database
                    models.User.findById(decoded.user)
                        .then(function(user) {
                            if (!user) {homeNoUser();} // user not found
                            else {
                                res.sendFile('/html/homepage.html',  {root: publicRoot});
                            }
                        })
                }
            });
        }
    });

    var signup = require('./public/signup_route');
    app.use('/signup', signup);
    var authenticate = require('./public/authenticate_route');
    app.use('/authenticate', authenticate);
    var userQuery = require('./public/user_route');
    app.use('/user', userQuery);
};
