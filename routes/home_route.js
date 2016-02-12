/**
 * Created by David on 2/11/2016.
 */

var express = require('express');
var router = express.Router();
var models = require('../models');

router.post('/', function(req, res) {
    var newHome = models.Home.build({
        name: req.body.name,
        UserId: req.user.id
    });

    newHome.save()
        .then(function() {
            res.status(201).json({
                success: true,
                id: newHome.id
            });
        })
        .catch(function (error) {
            res.status(400).json({
                success: false,
                error: error.toString()
            })
        }
    )
});

module.exports = router;