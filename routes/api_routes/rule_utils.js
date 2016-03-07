/**
 * Created by David on 3/6/2016.
 */

var validator = new (require('jsonschema').Validator)();
var ruleSchema = require('./rule.schema.json');

var Queue = function() {
    var self = this;
    self.start_pt = 0;
    self.end_pt = 0;
    self.size = 0;
    self.cur_size = 1;
    self.container = new Array(self.cur_size);
    self.add = function(item) {
        if (self.size == self.cur_size) {
            self.resizeQueue();
        }
        self.container[self.end_pt] = item;
        self.end_pt = (self.end_pt + 1) % self.cur_size;
        self.size += 1;
    };
    self.get = function() {
        var to_ret = self.container[self.start_pt];
        self.start_pt = (self.start_pt + 1) % self.cur_size;
        self.size -= 1;
        return to_ret;
    };
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
    self.empty = function() {
        return self.size === 0;
    }
};

exports.schemaValidate = function(req, res, next) {
    var schemaValidated = validator.validate(req.body.rule, ruleSchema);
    console.log(schemaValidated);
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

/*
Checks to see if the array of branches completely covers the given range
 */
function validateBranchCoverage(branches, range) {
    // Returns the value of the bottom of the branch value range
    var getRangeStart = function(branch) {
        // Can be NEGATIVE_INFINITY, or POSITIVE_INFINITY
        // JSON doesn't allow passing of +- Inf, but JS number allows it
        if (typeof branch.value[0] === "string") {
            return Number[branch.value[0]];
        }
        else {
            return branches.value[0];
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
            return branches.value[1];
        }
    };
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
    var range_start = range[0];
    for (var i = 0; i < branches.length; i++) {
        // if this range doesn't start where it should, then there are gaps in the range
        if (getRangeStart(branches[i]) != range_start) {
            return false;
        }
        range_start = getRangeEnd(branches[i]);
    }
    // After last branch range, range_start should be at the end
    // of the required range
    return range_start === range[1];
}

exports.logicValidate = function(req, res, next) {
    var q = new Queue();
    var rule = req.body.rule;
    q.add(rule);
    while (!q.empty()) {
        rule = q.get();
        for (var i = 0, keys = Object.keys(rule); i < keys.length; i++) {
            var decisionType = keys[i];
            if (decisionType === "TimeDecision") {
                if (!validateBranchCoverage(rule[decisionType].branches, [-Infinity, Infinity])) {
                    return false;
                }
            }

            for (var b = 0; b < rule[decisionType].branches; b++) {
                q.add(rule[decisionType].action);
            }
        }
    }
};

var inst =
{
    "TimeDecision": {
        "branches": [
            {
                "value": [0, 600],
                "action": {
                    "NodeInput": {
                        "nodeId": 5,
                        "data": [50]
                    }
                }
            },
            {
                "value": [600, 86400],
                "action": {
                    "DataDecision": {
                        "datastreamId": 1,
                        "branches": [
                            {
                                "value": ["NEGATIVE_INFINITY", 30],
                                "action": null
                            },
                            {
                                "value": [30, "POSITIVE_INFINITY"],
                                "action": null
                            }
                        ]
                    }
                }
            }
        ]
    }
};