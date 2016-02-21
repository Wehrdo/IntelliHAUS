/**
 * Created by David on 2/12/2016.
 */
var jwt = require('jsonwebtoken');
var models = require('../models');
var config = require("../" + (process.env.NODE_ENV || "dev") + "_config");

/*
Attempts to verify the token (possibly) given in request
Responds with HTTP 403 if failed
pre-conditions: None
post-conditions: req.parsedToken gets set to the token payload if successful
 */
exports.authVerify = function(req, res, next) {
    // Check for accessToken in cookie, request body, query, and headers
    var token = (req.cookies.accessToken || req.body.accessToken || req.query.accessToken || req.headers['x-access-token']);
    if (!token) {
        res.status(403).json({
            success: false,
            message: 'No token given'
        });
        return;
    }
    // Verify token was signed by this server and is valid (not expired)
    jwt.verify(token, config.jwt_secret, function(err, decoded) {
        if (err) {
            res.status(403).json({
                success: false,
                message: "Unable to validate token"
            });
        }
        else {
            req.parsedToken = decoded;
            next();
        }
    });
};

/*
Gets the user identified in the authentication token
Responds with HTTP 400 if user can't be found
pre-conditions: req.parsedToken is set
post-conditions: req.user is set if successful
 */
exports.getUser = function(req, res, next) {
    models.User.findById(req.parsedToken.user)
        .then(function(user) {
            if (user) {
                req.user = user;
                next();
            }
            else {
                res.status(400).json({
                    success: false,
                    error: "Could not find user with ID " + req.parsedToken.user
                });
            }
        })
};

/*
Gets the home passed in the request body associated with user
Pre-conditions: req.user has been set
Post-conditions: req.home is set
 */
exports.getHome = function(req, res, next) {
    // Search for home with given ID and matching user
    var homeId = (req.body.homeid || req.query.homeid || req.headers.homeid);
    models.Home.findOne({where: {
        id: homeId,
        UserId: req.user.id
    }}).then(function(home) {
        if (home) {
            req.home = home;
            next();
        } else {
            res.status(400).json({
                success: false,
                error: "Could not find home with ID " + homeId
            })
        }
    })
};

/*
Gets the datastream given an ID
Pre-conditions: req.user has been set
Post-conditions: req.datastream is set
 */
exports.getDatastream = function(req, res, next) {
    var dsId = (req.body.datastreamid || req.query.datastreamid || req.headers.datastreamid);

    models.Datastream.findOne({
            where: {
                id: dsId,
                UserId: req.user.id
            }
        })
        .then(function (datastream) {
            if (datastream) {
                req.datastream = datastream;
                next();
            } else {
                res.status(400).json({
                    success: false,
                    error: "Unable to get datastream " + dsId
                });
            }
        });
};