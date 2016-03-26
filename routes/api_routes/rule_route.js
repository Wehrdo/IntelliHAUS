/**
 * Created by David on 3/6/2016.
 */


var express = require('express');
var router = express.Router();
var models = require('../../models/index');
var ruleUtils = require('./rule_utils');
var ruleEvaluation = require('../../rule_evaluation');

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
            name: (req.body.name || "My Rule"),
            rule: req.body.rule
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

module.exports = router;