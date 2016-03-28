/**
 * Created by David on 3/6/2016.
 */


var express = require('express');
var router = express.Router();
var models = require('../../models/index');
var middleware = require('./../customMiddleware');
var ruleUtils = require('./rule_utils');
var ruleEvaluation = require('../../rule_evaluation');
var env       = process.env.NODE_ENV || "dev";
var config = require("../../" + env + "_config");

// Returns a generic error 400 catch handler for the database creation chain
var catchHandler = function(res) {
    return function(error) {
        res.status(400).json({
            success: false,
            error: error
        })
    }
};

// Upload new route
router.post('/',
    ruleUtils.schemaValidate,
    ruleUtils.logicValidate,
    ruleUtils.idValidate,
    function (req, res) {
        models.Rule.create({
            UserId: req.user.id,
            name: (req.body.name || "My Rule"),
            rule: req.body.rule,
            public: (req.body.public || false)
        })
        .then(function(newRule) {
        // After creation, set associations to datastreams
        newRule.setDatastreams(req.used_ds_ids).catch(catchHandler(res))
        .then(function() {
        // Relate the nodes that the rule affects
        newRule.setNodes(req.used_node_ids).catch(catchHandler(res))
        .then(function() {
            res.status(201).json({
                success: true,
                id: newRule.id
            });
            // After creation of rule, evaluate it
            ruleEvaluation.evalRule(newRule.id);
        }).catch(catchHandler(res))
        })
        });
    });

router.get('/updates', middleware.getHome, function(req, res) {
    // Only keep long-poll connection for a set amount of time
    res.setTimeout(config.long_poll_timeout, function() {
        ruleEvaluation.updatesBus.removeAllListeners(req.home.id.toString());
        // Respond with no new updates
        res.status(200).json({
            updates: []
        });
    });
    
    var addUpdateListener = function(resp) {
        var timer = null;
        var backlog = [];
        var send = function() {
            // Clear any listeners on this home before sending response
            ruleEvaluation.updatesBus.removeAllListeners(req.home.id.toString());
            resp.status(200).json({
                updates: backlog
            });
        };
        ruleEvaluation.updatesBus.on(req.home.id.toString(), function(node_update) {
            backlog.push(node_update);
            // A datastream update typically causes several rules to be evaluated, so wait a little
            // bit to let all the rules finish evaluation before sending out the update
            if (timer === null) {
                timer = setTimeout(send, 1000);
            }
        })
    };

    //addUpdateListener(res);
});

module.exports = router;