/**
 * Created by David on 2/11/2016.
 */

var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var password = require('password-hash-and-salt');
var models = require('../../models');
var config = require("../../" + (process.env.NODE_ENV || "development") + "_config");

/*
Looks for the user with username that was passed into the request
 */
var findUser = function(req, res, next) {
    models.User.findOne({
        where: {username: req.body.username.toLowerCase()}
    }).then(function(user) {
        if (user) {
            req.user = user;
            next();
        }
        else {
            res.status(403).json({
                success: false,
                error: "User not found"
            });
        }
    });
};

/*
Checks if the given password matches the password stored for this user
 */
var verifyPassword = function(req, res, next) {
    password(req.body.password)
        .verifyAgainst(req.user.pwHash, function(error, verified) {
            // I don't know how this happens
            if (error) {
                req.status(500).json({
                    success: false,
                    error: "Unable to hash given password"
                });
            }
            // Doesn't match stored password
            else if (!verified) {
                res.status(403).json({
                    success: false,
                    error: "Password doesn't match"
                });
            }
            // Good!
            else {
                next();
            }
        })
};

router.get('/logout', function(req, res) {
    res.clearCookie('accesstoken');
    res.redirect('/');
});

// Main authenticate route. Looks for user, then verifies password, then creates a token
router.post('/', [findUser, verifyPassword], function(req, res) {
    var token = jwt.sign({user: req.user.id}, config.jwt_secret);
    // Set a browser cookie with the accessToken
    res.cookie('accesstoken', token);
    res.json({
        success: true,
        token: token
    });
});

module.exports = router;