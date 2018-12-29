/**
 * Created by David on 4/15/2016.
 */

var express = require('express');
var router = express.Router();
var models = require('../../models/index');
var middleware = require('./../customMiddleware');
var longPolling = require('../../rule_evaluation/long_polling');
var env       = process.env.NODE_ENV || "development";
var config = require("../../" + env + "_config");


// Create a long-polling request for updates about a node
router.get('/', middleware.getHome, function(req, res) {
    // Only keep long-poll connection for a set amount of time
    res.setTimeout(config.long_poll_timeout, function() {
        longPolling.invalidateListener(req.home.id.toString());
        // Respond with no new updates
        res.status(200).json({
            success: true,
            updates: []
        });
    });

    var addUpdateListener = function(resp) {
        var timer = null;
        // A collection of the updates to send
        var will_send = [];
        var send = function() {
            // Clear any listeners on this home before sending response
            longPolling.invalidateListener(req.home.id.toString());
            resp.status(200).json({
                success: true,
                updates: will_send
            });
            timer = null;
        };
        longPolling.registerListener(req.home.id.toString(), function(node_update) {
            will_send.push(node_update);
            // A datastream update typically causes several rules to be evaluated, so wait a little
            // bit to let all the rules finish evaluation before sending out the update
            if (timer === null) {
                timer = setTimeout(send, 100);
            }
        })
    };

    addUpdateListener(res);
});

// Get the current state of every node
router.get('/all', middleware.getHome, function(req, res) {
    models.Node.findAll({
        where: {
            UserId: req.user.id,
            lastData: {$ne: null} // lastData is not null
        },
        attributes: ['id', 'lastData']
    }).then(function(nodes) {
        if (nodes) {
            // Create updates in correct format
            var updates = nodes.map(function(node_obj) {
                return {
                    nodeId: node_obj.id,
                    data: node_obj.lastData
                };
            });
            res.json({
                success: true,
                updates: updates
            });
        } else {
            // Failed for some reason
            res.status(400).json({
                success: false,
                error: "Failed on querying nodes"
            });
        }
    }).catch(function(error) {
        res.status(400).json({
            success: false,
            error: error
        });
    });
});

module.exports = router;