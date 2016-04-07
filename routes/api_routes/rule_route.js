/**
 * Created by David on 3/6/2016.
 */


var express = require('express');
var router = express.Router();
var models = require('../../models/index');
var middleware = require('./../customMiddleware');
var ruleUtils = require('./rule_utils');
var ruleEvaluation = require('../../rule_evaluation');
var longPolling = require('../../rule_evaluation/long_polling');
var env       = process.env.NODE_ENV || "dev";
var config = require("../../" + env + "_config");

// Returns a generic error 400 catch handler for the database creation chain
var catchHandler = function(res) {
    return function(error) {
        res.status(400).json({
            success: false,
            error: error.toString()
        });
        throw error;
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
        newRule.setDatastreams(req.used_ds_ids)
        .then(function() {
        // Relate the nodes that the rule affects
        newRule.setNodes(req.used_node_ids)
        .then(function() {
        // Add rule's eval times
        var ruleId = newRule.id;
        var records = req.eval_times.map(function (time) {
            return {
                time: time,
                RuleId: ruleId
            }
        });
        models.RuleTime.bulkCreate(records, {validate: true})
        .then(function(newTimes) {
            if (newTimes && (newTimes.length === req.eval_times.length)) {
                res.status(201).json({
                    success: true,
                    id: newRule.id
                });
            }
            else {
                catchHandler(res)("Eval times not created");
            }
            // After creation of rule, evaluate it
            ruleEvaluation.evalRule(newRule.id);
        }).catch(catchHandler(res))
        }).catch(catchHandler(res))
        }).catch(catchHandler(res))
        }).catch(catchHandler(res));
    });

router.get('/', function(req, res) {
    req.user.getRules({
        attributes: ['id', 'name', 'public', 'createdAt', 'updatedAt']
    }).then(function(rules) {
        res.status(200).json({
            success: true,
            rules: rules
        })
    }).catch(function(error) {
        res.status(500).json({
            success: false,
            error: error
        })
    })
});

// Get a single rule by ID
router.get('/:id(\\d+)', function(req, res) {
    models.Rule.findOne({
        where: {
            id: req.params.id,
            UserId: req.user.id
        }
    }).then(function(rule) {
        if (rule) {
            res.json({
                success: true,
                rule: rule
            })
        } else {
            res.status(400).json({
                success: false,
                error: "Found no matching rules"
            })
        }
    }).catch(function(error) {
        res.status(400).json({
            success: false,
            error: error
        })
    })
});

// Create a long-polling request for updates about a node
router.get('/updates', middleware.getHome, function(req, res) {
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

module.exports = router;