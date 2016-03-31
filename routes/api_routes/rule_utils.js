/**
 * Created by David on 3/6/2016.
 */

var validator = new (require('jsonschema').Validator)();
var ruleSchema = require('./rule.schema.json');
var models = require('../../models/index');

/*
Reusable high-performance Queue object
 */
var Queue = function() {
    var self = this;
    self.start_pt = 0;
    self.end_pt = 0;
    self.size = 0;
    self.cur_size = 1;
    self.container = new Array(self.cur_size);
    /*
    Add new item to the head of the queue
     */
    self.add = function(item) {
        if (self.size == self.cur_size) {
            self.resizeQueue();
        }
        self.container[self.end_pt] = item;
        self.end_pt = (self.end_pt + 1) % self.cur_size;
        self.size += 1;
    };
    /*
    Remove oldest item from queue
     */
    self.get = function() {
        var to_ret = self.container[self.start_pt];
        self.start_pt = (self.start_pt + 1) % self.cur_size;
        self.size -= 1;
        return to_ret;
    };
    /*
    Internal function for resizing size of holding array.
     */
    self.resizeQueue = function() {
        var oldSize = self.cur_size;
        // Double array size
        self.cur_size *= 2;
        // How much the array size has changed
        var size_change = self.cur_size - oldSize;
        // Copy all elements from start_pt to the end of the old array
        var to_copy = oldSize - self.start_pt;
        // Special case where start_pt is at the beginning, no copying is needed
        if (self.start_pt == 0) {
            to_copy = 0;
            // In this case, we just change the end point
            self.end_pt = oldSize;
            return;
        }
        for (var i = self.cur_size - 1; i >= self.cur_size - to_copy; i--) {
            self.container[i] = self.container[i - size_change];
        }
        // Need to move start point ahead, since we shifted elements from [start_pt, cur_size]
        self.start_pt += size_change;
    };
    /*
    Whether the queue is empty or not
     */
    self.empty = function() {
        return self.size === 0;
    }
};

/*
Middleware to check the given rule against the rule JSON schema
 */
exports.schemaValidate = function(req, res, next) {
    var schemaValidated = validator.validate(req.body.rule, ruleSchema);
    if (req.body.rule && schemaValidated.valid) {
        next();
    }
    else {
        res.status(400).json({
            success: false,
            error: schemaValidated.errors
        })
    }
};


// Returns the value of the bottom of the branch value range
var getRangeStart = function(branch) {
    // Can be NEGATIVE_INFINITY, or POSITIVE_INFINITY
    // JSON doesn't allow passing of +- Inf, but JS number allows it
    if (typeof branch.value[0] === "string") {
        return Number[branch.value[0]];
    }
    else {
        return branch.value[0];
    }
};
// Returns the value of the top of the branch value range
var getRangeEnd = function(branch) {
    // Can be NEGATIVE_INFINITY, or POSITIVE_INFINITY
    // JSON doesn't allow passing of +- Inf, but JS number allows it
    if (typeof branch.value[1] === "string") {
        return Number[branch.value[1]];
    }
    else {
        return branch.value[1];
    }
};

/*
Returns true if the array of branches completely covers the given range
 */
function validateBranchCoverage(branches, range) {
    // Sort branches by the start of their ranges
    branches.sort(function(branch1, branch2) {
        if (getRangeStart(branch1) > getRangeStart(branch2)) {
            return 1;
        }
        else if (getRangeStart(branch1) < getRangeStart(branch2)){
            return -1;
        }
        else {
            return 0;
        }
    });
    // Now that branches are sorted in ascending order, we can iterate through
    // them linearly to check for completeness and gaps
    // Where next range should start
    var progress = range[0];
    for (var i = 0; i < branches.length; i++) {
        // if this range doesn't start where it should, then there are gaps in the range
        if (getRangeStart(branches[i]) != progress) {
            return false;
        }
        progress = getRangeEnd(branches[i]);
    }
    // After last branch range, range_start should be at the end
    // of the required range
    return progress === range[1];
}

/*
Middleware verifies the logic of the rule
 */
exports.logicValidate = function(req, res, next) {
    var q = new Queue();
    var rule = req.body.rule;
    q.add(rule);
    var valid = true;

    var eval_times = [];

    // Look through all the decisions and make sure their branches cover the necessary cases
    while (!q.empty() && valid) {
        rule = q.get();
        for (var i = 0, keys = Object.keys(rule); i < keys.length; i++) {
            var decisionType = keys[i];
            var check_range;
            if (decisionType === "TimeDecision") {
                check_range = [0, 1440];
                // Find all times that need to be evaluated for this rule
                rule[decisionType].branches.forEach(function(branch) {
                    eval_times.push(getRangeStart(branch));
                })
            }
            else if (decisionType === "DataDecision") {
                check_range = [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
            }
            else if (decisionType === "DayDecision") {
                check_range = [1, 7]
            }
            else if (decisionType === "EventDecision") {
                // Since EventDecisions have the 'default' option, we do not need to check
                // their branch coverage
                q.add(rule[decisionType].default)
            }
            else {
                // Not a branch, skip to the next item
                continue;
            }
            // Is a branch, so check coverage
            if (!validateBranchCoverage(rule[decisionType].branches, check_range)) {
                valid = false;
            }
            // Add all subactions
            for (var b = 0; b < rule[decisionType].branches.length; b++) {
                var action = rule[decisionType].branches[b].action;
                if (action != null) {
                    q.add(action);
                }
            }
        }
    }

    // Remove duplicate times and store them in request
    req.eval_times = eval_times.filter(function(item, pos, self) {
        return self.indexOf(item) == pos;
    });

    if (valid) {
        next();
    }
    else {
        res.status(400).json({
            success: false,
            error: "Invalid branch coverage"
        });
    }
};

/*
Verifies that all the datastream and node IDs in the rule exist, are of the correct type, and belong to this user
 */
exports.idValidate = function(req, res, next) {
    var q = new Queue();
    var rule = req.body.rule;
    q.add(rule);

    // Create a list of all the database queries we need.
    // By creating this list beforehand, we will know when all the asynchronous calls have completed
    var to_check = [];
    // Collect the datastreams that a rule uses, so we can create the rule-datastream links when inserting into the database
    var datastream_ids = [];
    // Same for the affected nodes
    var node_ids = [];

    // Traverse rule to find all used IDs and create queries to verify them
    while (!q.empty()) {
        rule = q.get();
        for (var i = 0, keys = Object.keys(rule); i < keys.length; i++) {
            var decisionType = keys[i];
            var where;
            if (decisionType === "DataDecision") {
                // "Where" for the query
                where = {
                    id: rule[decisionType].datastreamId, // ID sould exist
                    UserId: req.user.id, // Should belong to this user
                    datatype: 'continuous' // Datastream should be the correct datatype
                };
                // Add the necessary query to our array
                to_check.push({
                    model: 'Datastream',
                    where: where
                });
                // Add this datastream
                datastream_ids.push(rule[decisionType].datastreamId);
            }
            else if (decisionType === "EventDecision") {
                where = {
                    id: rule[decisionType].datastreamId,
                    UserId: req.user.id,
                    datatype: 'discrete'
                };
                to_check.push({
                    model: 'Datastream',
                    where: where
                });
                datastream_ids.push(rule[decisionType].datastreamId);
            }
            else if (decisionType === "NodeInput") {
                // Sequelize "AND" query
                where = models.sequelize.and(
                        {'id': rule[decisionType].nodeId},
                        {'UserId': req.user.id},
                        {'RuleId': null}, // Isn't already controlled by a rule
                        // This verifies that the data given for a node input is the same number of elements as expected
                        models.sequelize.where(models.sequelize.fn('array_length', models.sequelize.col('inputTypes'), 1), rule[decisionType].data.length)
                );
                to_check.push({
                    model: 'Node',
                    where: where
                });
                node_ids.push(rule[decisionType].nodeId);
            }

            // Add all subactions if this action has branches
            if (rule[decisionType].branches) {
                for (var b = 0; b < rule[decisionType].branches.length; b++) {
                    var action = rule[decisionType].branches[b].action;
                    if (action != null) {
                        q.add(action);
                    }
                }
            }
        }
    }

    // Number of queries completed
    var nDone = 0;
    var all_success = true;

    // Query for all the IDs
    to_check.forEach(function(query) {
        models[query.model].findOne({
            where: query.where
        }).then(function(result) {
            nDone += 1;
            if (!result) {
                // Requested query was not found
                all_success = false;
            }
            // If it's the last query
            if (nDone == to_check.length) {
                if (all_success) {
                    next();
                } else {
                    res.json({
                        success: false,
                        error: "Invalid id"
                    })
                }
            }
        })
    });

    req.used_ds_ids = datastream_ids;
    req.used_node_ids = node_ids;
};

var inst =
{
    "TimeDecision": {
        "branches": [
            {
                "value": [0, 600],
                "action": {
                    "NodeInput": {
                        "nodeId": 1,
                        "data": [50]
                    }
                }
            },
            {
                "value": [600, 1440],
                "action": {
                    "DataDecision": {
                        "datastreamId": 1,
                        "branches": [
                            {
                                "value": ["NEGATIVE_INFINITY", 30],
                                "action": {
                                    "NodeInput": {
                                        "nodeId": 1,
                                        "data": [30]
                                    }
                                }
                            },
                            {
                                "value": [30, "POSITIVE_INFINITY"],
                                "action": {
                                    "NodeInput": {
                                        "nodeId": 1,
                                        "data": [40]
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        ]
    }
};