/**
 * Created by David on 2/11/2016.
 */

var express = require('express');
var router = express.Router();
var models = require('../../models/index');

// The information about a user that is publicly visible
var publicUserInfo = ['firstName', 'username'];

// Create function for handling user query, given a response object
var afterQuery = function(res) {
    return function(user) {
        if (user) {
            res.json({
                success: true,
                user: user
            });
        }
        else {
            res.status(400).json({
                success: false,
                error: "Unable to find user"
            });
        }
    }
};

// Query by id
router.get('/:id(\\d+)', function(req, res) {
    models.User.findById(
        req.params.id, {
            attributes: publicUserInfo
        })
    .then(afterQuery(res));
});

// Query by username
router.get('/:username([a-zA-Z]+)', function(req, res) {
    models.User.findOne({
        attributes: publicUserInfo,
        where: {
            username: req.params.username.toLowerCase()
    }})
    .then(afterQuery(res));
});

module.exports = router;