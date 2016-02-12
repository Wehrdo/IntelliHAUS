/**
 * Created by David on 2/11/2016.
 */

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var password = require('password-hash-and-salt');
var models = require('../../models/index');

var urlParser = bodyParser.urlencoded({extended: true});

/*
 Ensures username is only letters
 */
var verifyUsername = function(req, res, next) {
    if (req.body.username.length >= 1 &&
        /^[a-zA-Z\d]+$/.test(req.body.username)) {
        next()
    }
    else {
        res.status(400).json({
            success: false,
            error: "Invalid username"
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
                res.status(409).json({
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
                req.body.pwHash = hash;
                next();
            }
        });
};

// Signup
router.use(urlParser).route('/')
    .get(function (req, res) {
        res.send("<h1>This is the signup page</h1>");
    })
    .post(
        [verifyUsername, checkUsernameOpen, hashPassword], // Set of preconditions/validations
        function (req, res) {
            // Create new user
            var newUser = models.User.build({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                username: req.body.username,
                pwHash: req.body.pwHash
            });

            // Save into database
            newUser.save()
                .then(function() {
                    // Good, return success and newly created id
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