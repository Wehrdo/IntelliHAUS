/**
 * Created by David on 2/10/2016.
 */

var express = require('express');
var router = express.Router();
var models = require('../../models/index');
var middleware = require('./../customMiddleware');

router.get('/', [middleware.getHome], function(req, res) {
    models.Node.findAll({where: {
        HomeId: req.home.id
    }}).then(function(nodes) {
        res.json({
            success: true,
            nodes: nodes
        })
    });
});

var genNames = function(n) {
    var arr = [];
    for (var i = 0; i < n; ++i) {
        arr.push("Input " + i.toString());
    }
    return arr;
};

router.post('/', middleware.getHome, function(req, res, next) {
    // If datastreamid was passed, get datastream
    if (req.body.datastreamid) {
        middleware.getDatastream(req, res, next);
    }
    else {
        next();
    }
}, function(req, res) {
    // If a datastream was passed, verify that types match
    if (req.datastream && (req.datastream.datatype != req.body.outputtype)) {
        res.status(400).json({
            success: false,
            error: "Output datatype and datastream types don't match"
        });
    }
    else {
        // Set some defaults if not given
        var name = (req.body.name || "Your Node");
        var inputTypes = (req.body.inputtypes || []);
        var inputNames = (req.body.inputnames || genNames(inputTypes.length));
        var outputType = (req.body.outputtype || "");
        var outputName = (req.body.outputname || "Output");

        models.Node.create({
            name: name,
            inputTypes: inputTypes,
            inputNames: inputNames,
            outputType: outputType,
            outputName: outputName,
            DatastreamId: req.body.datastreamid,
            HomeId: req.home.id,
            UserId: req.user.id
        })
        .then(function (newNode) {
            res.status(201).json({
                success: true,
                id: newNode.id
            })
        })
        .catch(function (error) {
            res.status(400).json({
                success: false,
                error: error.toString()
            })
        });
    }
});

router.put('/',
    middleware.getNode,
    function(req, res) {
        req.node.update(
            req.body,
            {fields: ['name', 'inputNames', 'outputName', 'DatastreamId']}
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
module.exports = router;