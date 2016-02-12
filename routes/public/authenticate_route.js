/**
 * Created by David on 2/11/2016.
 */

var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var password = require('password-hash-and-salt');
var bodyParser = require('body-parser');
var models = require('../../models');

// TODO: Make this secret for real
var SECRET = "hahaThisIsntSecret";

var findUser = function(req, res, next) {
    models.User.findOne({
        where: {username: req.body.username.toLowerCase()}
    }).then(function(user) {
        if (user) {
            req.user = user;
            next();
        }
        else {
            res.status(403).end();
        }
    });
};

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

router.post('/', [findUser, verifyPassword], function(req, res) {
    var token = jwt.sign(req.user.username, SECRET);
    res.cookie('accessToken', token);
    res.json({
        success: true,
        token: token
    });
});

module.exports = router;