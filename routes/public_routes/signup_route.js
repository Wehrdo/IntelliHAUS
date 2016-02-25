/**
 * Created by David on 2/11/2016.
 */

var express = require('express');
var router = express.Router();
var password = require('password-hash-and-salt');
var models = require('../../models/index');
var config = require("../../" + (process.env.NODE_ENV || "dev") + "_config");
var jwt = require('jsonwebtoken');

/*
 Ensures username is only letters
 */
var verifyUsername = function(req, res, next) {
    if (req.body.username.length >= 1 &&
        /^[a-zA-Z\d]+$/.test(req.body.username) &&
        req.body.password.length >= 1) {
        next()
    }
    else {
        res.status(400).json({
            success: false,
            error: "Invalid username/password text"
        });
    }
};

/*
 Queries database to check if username is already in use
 */
var checkUsernameOpen = function(req, res, next) {
    models.User.findOne({
            where: {username: req.body.username.toLowerCase()}})
        // Check if user with username already exists
        .then(function(user) {
            if (user) {
                res.status(400).json({
                    success: false,
                    error: "User already exists"});
            }
            else {
                next();
            }
        });
};

/*
 Hash password with salt, attaching result to req.body.pwHash
 */
var hashPassword = function(req, res, next) {
    password(req.body.password)
        .hash(function(error, hash) {
            if (error) {
                // Unable to hash?
                req.status(400).json({
                    success: false,
                    error: "Bad password"
                });
            }
            else {
                req.body.pwhash = hash;
                next();
            }
        });
};

// Signup
router.post('/',
    [verifyUsername, checkUsernameOpen, hashPassword], // Set of preconditions/validations
    function (req, res) {
        // Create new user
        var newUser = models.User.build({
            email: req.body.email,
            firstName: req.body.firstname,
            lastName: req.body.lastname,
            username: req.body.username.toLowerCase(),
            pwHash: req.body.pwhash
        });

        // Save into database
        newUser.save()
            .then(function() {
                // Good, create token for future use
                var token = jwt.sign({user: newUser.id}, config.jwt_secret);
                res.cookie('accessToken', token);
                // return success and newly created id
                res.status(201).json({
                    success: true,
                    id: newUser.id
                });
            })
            .catch(function(error) {
                // Failed to save
                res.status(400).json({
                    success: false,
                    error: error.toString()
                });
            });
    });

module.exports = router;