/**
 * Created by David on 2/25/2016.
 */

var express = require('express');
var router = express.Router();
var path = require('path');
var jwt = require('jsonwebtoken');
var models = require('../../models');
var config = require("../../" + (process.env.NODE_ENV || "dev") + "_config");

// TODO: I really don't like this repeat of authentication code, but it seemed necessary
router.get('/', function (req, res) {
    var publicRoot = path.join(__dirname, '../../public');
    // Reusable function for sending non-logged-in homepage
    var homeNoUser = function() {
        res.clearCookie('accesstoken');
        res.sendFile('/html/homepage_nouser.html',  {root: publicRoot});
    };

    // Check for accessToken in cookie, request body, query, and headers
    var token = (req.cookies.accesstoken || req.body.accesstoken || req.query.accesstoken || req.headers['x-access-token']);
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


var signup = require('./signup_route');
router.use('/signup', signup);

var authenticate = require('./authenticate_route');
router.use('/authenticate', authenticate);

var userQuery = require('./user_route');
router.use('/user', userQuery);

module.exports = router;