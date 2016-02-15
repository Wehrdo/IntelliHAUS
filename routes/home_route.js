/**
 * Created by David on 2/11/2016.
 */

var express = require('express');
var router = express.Router();
var models = require('../models');
var middleware = require('./customMiddleware');

/*
Get all homes for authenticated user
 */
router.get('/', function(req, res) {
    models.Home.findAll({where: {
        UserId: req.user.id
    }}).then(function(homes) {
        res.json({
            success: true,
            homes: homes
        })
    });
});

/*
Get home by ID
 */
router.get('/:id(\\d+)', function (req, res, next) {
        // Set homeId for getHome middleware
        req.body.homeid = req.params.id;
        next();
    },
    middleware.getHome,
    function (req, res) {
        res.json({
            success: true,
            home: req.home
        })
    });

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