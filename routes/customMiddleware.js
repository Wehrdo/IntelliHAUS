/**
 * Created by David on 2/12/2016.
 */
var jwt = require('jsonwebtoken');
var models = require('../models');
var config = require("../" + (process.env.NODE_ENV || "dev") + "_config");

exports.authVerify = function(req, res, next) {
    var token = req.cookies.accessToken || req.body.accessToken || req.query.accessToken || req.headers['x-access-token'];
    if (!token) {
        res.status(403).json({
            success: false,
            message: 'No token given'
        });
        return;
    }
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

