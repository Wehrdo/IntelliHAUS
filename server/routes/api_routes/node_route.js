/**
 * Created by David on 2/10/2016.
 */

var express = require('express');
var router = express.Router();
var models = require('../../models/index');
var longPolling = require('../../rule_evaluation/long_polling');
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

router.get('/:id(\\d+)',
    function(req, res, next) {
        req.body.nodeid = req.params.id;
        next();
    },
    middleware.getNode,
    function(req, res) {
            res.json({
                success: true,
                node: req.node
            });
        }
);

var genNames = function(n) {
    var arr = [];
    for (var i = 1; i <= n; ++i) {
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
        var outputName = null;
        if (req.body.outputtype) {
            outputName = (req.body.outputname || "Output");
        }

        models.Node.create({
            name: name,
            inputTypes: inputTypes,
            inputNames: inputNames,
            outputType: req.body.outputtype,
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

// Save updates about a node
router.put('/',
    middleware.getNode,
    function(req, res) {
        if (req.body.inputNames.length != req.node.inputTypes.length) {
            res.status(400).json({
                success: false,
                error: "Invalid number of input names"
            });
            return;
        }
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

// Handle a POST to /send for a Node. This is for sending data to an actuator node
router.post('/send', middleware.getNode, function(req, res) {
    var convertedData = req.body.data.map(function(str_val) {return Number(str_val)});
    if (convertedData.filter(isNaN).length !== 0) {
        res.status(400).json({
            success: false,
            error: "NaN in data, or could not convert data propertly"
        });
    }
    else if (req.body.data.length === req.node.inputTypes.length) {
        longPolling.sendUpdate(req.node.HomeId.toString(), {
            nodeId: req.node.id,
            data: convertedData
        });
        // Save this data as the latest
        req.node.update(
            {lastData: convertedData},
            {fields: ['lastData']}
        ).catch(function(error) {
            console.log("Failed to save lastData: " + error);
        });
        res.status(200).json({
            success: true
        })
    }
    else {
        res.status(400).json({
            success: false,
            error: "Invalid number of data elements"
        })
    }
});
module.exports = router;