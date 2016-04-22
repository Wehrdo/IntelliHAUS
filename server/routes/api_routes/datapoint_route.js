/**
 * Created by David on 2/10/2016.
 */
var express = require('express');
var router = express.Router();
var models = require('../../models/index');
var ruleEvaluation = require('../../rule_evaluation');

// Getting datapoint with integer ID
router.get('/:id(\\d+)', function(req, res) {
    res.end("Getting datapoint with ID " + req.params.id);
});

router.post('/', function(req, res) {
    var nodeId = req.body.nodeid;
    var data = req.body.data;
    // Get time if given, otherwise use now
    var time;
    if (req.body.time) {
        time = new Date(req.body.time);
    } else {
        time = new Date();
    }

    var node = models.Node.findOne({
        attributes: ['id'],
        where: {
            id: nodeId,
            UserId: req.user.id
        },
        include: [{
            model: models.Datastream,
            attributes: ['id', 'datatype']
        }]
    })
    .then(function(node) {
        // Node not found
        if (!node) {
            res.status(404).json({
                success: false,
                error: "Node " + nodeId + " not found for user " + req.user.id
            });
        }
        // Node has no datastream associated with it
        else if (!node.Datastream) {
            res.status(404).json({
                success: false,
                error: "No datastream associated with node"
            });
        }
        else {
            var cData, dData, dLabel, bData;
            if (node.Datastream.datatype == 'continuous') {
                cData = data;
            } else if (node.Datastream.datatype == 'discrete') {
                dData = data;
            } else if (node.Datastream.datatype == 'binary') {
                bData = data;
            }
            models.Datapoint.create({
                    DatastreamId: node.Datastream.id,
                    continuousData: cData,
                    discreteData: dData,
                    binaryData: bData,
                    time: time
            })
            .then(function(datapoint) {
                res.status(201).json({
                    success: true
                });
                // Evaluate associated rules
                ruleEvaluation.evaluate(node.Datastream);
            })
            .catch(function(error) {
                res.status(500).json({
                    success: false,
                    error: error.toString()
                })
            });
        }
    });
});

module.exports = router;