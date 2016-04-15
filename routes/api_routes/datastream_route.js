/**
 * Created by David on 2/16/2016.
 */

var express = require('express');
var router = express.Router();
var models = require('../../models/index');
var middleware = require('./../customMiddleware');

/*
Get datapoints of a datastream
 */
router.get('/:id(\\d+)/data',
    function(req, res, next) {
        req.query.datastreamid = req.params.id;
        next();
    },
    middleware.getDatastream,
    function(req, res, next) {
        models.Datapoint.count({
            where: {
                DatastreamId: req.datastream.id
            }
        }).then(function(cnt) {
            req.totalCount = cnt;
            next();
        });
    },
    function(req, res) {
    // If "number" passed as query parameter, return that many points
    // Otherwise, get 50 points
    // Never get more than 300 points, even if requested
    var qLimit = Math.min((req.query.number || 50), 300);

    models.Datapoint.findAll({
        attributes: ['time', 'continuousData', 'discreteData', 'binaryData'],
        order: [['time', 'DESC']],
        limit: qLimit,
        where: {
            DatastreamId: req.datastream.id
        }
    })
        .then(function(datapoints) {
            if (datapoints) {
                res.json({
                    success: true,
                    datapoints: datapoints
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    error: "Error on datapoints query"
                })
            }
        })
});

/*
Get info about a specific datastream
 */
router.get('/:id(\\d+)/info', function(req, res, next) {
    req.body.datastreamid = req.params.id;
    next()
    },
    middleware.getDatastream,
    function(req, res) {
        res.json({
            success: true,
            datastream: req.datastream
        })
});

/*
Get all the datastreams for a user
 */
router.get('/', function (req, res) {
    // Find all datastreams for a user.
    // Also return the node ID and name that it is associated with
    models.Datastream.findAll({
            where: {
                UserId: req.user.id
            },
            include: [{
                model: models.Node,
                attributes: ['id', 'name']
            }]
        })
        .then(function (datastreams) {
            if (datastreams) {
                res.json({
                    success: true,
                    datastreams: datastreams
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: "Unable to get datastreams"
                });
            }
        });
});

/*
Create a new datastream
 */
router.post('/', function (req, res) {
    var datatype = req.body.datatype;
    var name = (req.body.name || "Your Datastream");
    var isPublic = (req.body.public || false);

    var newDatastream = models.Datastream.build({
        UserId: req.user.id,
        name: name,
        datatype: datatype,
        public: isPublic
    });

    newDatastream.save()
        .then(function () {
            res.status(201).json({
                success: true,
                id: newDatastream.id
            })
        })
        .catch(function (error) {
            res.status(400).json({
                success: false,
                error: error.toString()
            })
        });
});

// Update datastream
router.put('/',
    middleware.getDatastream,
    function(req, res) {
        req.datastream.update(
            req.body,
        {fields: ['name', 'public']}
        )
            .then(function() {
                res.status(200).json({
                    success: true
                })
            })
            .catch(function(error) {
                res.status(500).json({
                    success: false,
                    error: error
                })
            });
});

// Delete datastream
router.delete('/:id(\\d+)',
    function(req, res, next) {
        req.body.datastreamid = req.params.id;
        next();
    },
    middleware.getDatastream,
    function(req, res) {
        req.datastream.getNodes().then(function(nodes) {
            if (nodes && nodes.length != 0) {
                res.status(400).json({
                    success: false,
                    error: "Unable to delete datastream with associated nodes"
                });
            } else {
                req.datastream.getRules().then(function(rules) {
                    if (rules && rules.length != 0) {
                        res.status(400).json({
                            success: false,
                            error: "Unable to delete datastream with associated rules"
                        });
                    } else {
                        // No nodes or datastreams
                        req.datastream.destroy().then(function() {
                            res.status(200).json({
                                success: true
                            });
                        }).catch(function(error) {
                            res.status(400).json({
                                success: false,
                                error: error
                            });
                        })
                    }
                });
            }
        });
    }
);

module.exports = router;