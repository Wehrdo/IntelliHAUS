/**
 * Created by David on 3/6/2016.
 */


var express = require('express');
var router = express.Router();
var models = require('../../models/index');
var ruleUtils = require('./rule_utils');


// Upload new route
router.post('/',
    ruleUtils.schemaValidate,
    ruleUtils.logicValidate,
    ruleUtils.idValidate,
    function (req, res, next) {
        // create a new rule entry
        models.Rule.create({
            UserId: req.user.id,
            name: (req.body.name || "My Rule"),
            rule: req.body.rule,
            public: (req.body.public || false)
        }).then(function(newRule) {
            req.rule = newRule;
            next();
        }).catch(function(error) {
            res.status(400).json({
                success: false,
                error: error
            })
        });
    },
    // Set associations after creating it
    ruleUtils.setAssociations,
    function(req, res) {
        res.status(201).json({
            success: true,
            id: req.rule.id
        })
    }
);

router.put('/:id(\\d+)',
    function(req, res, next) {
        var success = true;
        var errors = [];
        var catchHandler = function(errors) {
            success = false;
            errors.push(error);
        };
        // Find the rule for this ID that belongs to the user
        models.Rule.findOne({
            where: {
                id: req.params.id,
                UserId: req.user.id
            }
        }).then(function(matchingRule) {
            if (matchingRule) {
                // If a rule was found, store it in the request and continue
                req.rule = matchingRule;
                next();
            } else {
                // If none found, respond with error
                catchHandler("Unable to find matching rule");
            }
        }).catch(catchHandler);
        if (!success) {
            res.status(400).json({
                success: false,
                error: errors
            });
        }
    },
    ruleUtils.schemaValidate,
    ruleUtils.logicValidate,
    ruleUtils.idValidate,
    function(req, res, next) {
        var success = true;
        var errors = [];
        var catchHandler = function(errors) {
            success = false;
            errors.push(error);
        };
        // Update the corresponding rule
        req.rule.update(
            req.body,
            {fields: ['name', 'rule']}
        ).then(function() {
            // Rule updated, delete RuleTime entries
            models.RuleTime.destroy({
                where: {
                    RuleId: req.rule.id
                }
            }).then(function() {
                // Rule ready to update associations
                next();
            }).catch(catchHandler);
        }).catch(catchHandler);
        if (!success) {
            res.status(400).json({
                success: false,
                error: errors
            });
        }
    },
    ruleUtils.setAssociations,
    function(req, res) {
        res.status(200).json({
            success: true
        })
    }
);

// Get all the meta-data for rules owned by a user
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

// Delete a rule and its associations
router.delete('/:id(\\d+)', function(req, res) {
    models.Rule.findOne({
        where: {
            id: req.params.id,
            UserId: req.user.id
        }
    }).then(function(rule) {
        if (rule) {
            rule.destroy().then(function() {
                res.status(200).json({
                    success: true
                });
            }).catch(function(error) {
                res.status(400).json({
                    success: false,
                    error: error
                });
            });
        } else {
            res.status(400).json({
                success: false,
                error: "Found no matching rules"
            });
        }
    }).catch(function(error) {
        res.status(400).json({
            success: false,
            error: error
        });
    })
});

module.exports = router;