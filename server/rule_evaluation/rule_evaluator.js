/**
 * Created by David on 3/26/2016.
 */
var models = require('../models/index');

function evalAction(action) {
    if (action === null) {
        // Null actions mean don't do anything
        process.send({
            status: 'success',
            actuate: false
        });
        return;
    }

    var now = new Date();
    var action_type = Object.keys(action)[0];
    if (action_type === 'TimeDecision') {
        var total_mins = now.getHours()*60 + now.getMinutes();
        evalBranchRange(action[action_type], total_mins);
    }
    else if (action_type === 'DataDecision') {
        var ds_id = action[action_type].datastreamId;
        models.Datapoint.findOne({
            where: {
                DatastreamId: ds_id
            },
            // Gets the latest datapoint
            order: [['time', 'DESC']]}
        ).then(function(datapoint) {
            if (datapoint) {
                evalBranchRange(action[action_type], datapoint.continuousData);
            }
        })
    }
    else if (action_type === 'EventDecision') {
        var ds_id = action[action_type].datastreamId;
        models.Datapoint.findOne({
            where: {
                DatastreamId: ds_id
            },
            order: [['time', 'DESC']]}
        ).then(function(datapoint) {
            // How old this datapoint is, in minutes
            var age = (now - datapoint.time) / 1000 / 60;
            // Only evaluate if the datapoint exists, and is new enough
            if (datapoint && age <= action[action_type].lifetime) {
                evalEventBranches(action[action_type], datapoint.discreteData);
            } else { // Otherwise do the default
                evalAction(action[acttion_type].default);
            }
        })
    }
    else if (action_type === 'DayDecision') {
        evalBranchRange(action[action_type], now.getDay());
    }
    else if (action_type === 'NodeInput') {
        var nodeId = action[action_type].nodeId;
        var data_to_send = action[action_type].data;
        // Find the node, so we know what home it belongs to
        models.Node.findById(nodeId, {
            attributes: ['id', 'HomeId', 'lastData']
        })
            .then(function(node) {
                if (node) {
                    // Check if the new data is the same as the old data
                    if (node.lastData.length == data_to_send.length &&
                        node.lastData.every(function (val, idx) {
                            return val == data_to_send[idx];
                        })) {
                        // Same data as before, so don't send it out
                        process.send({
                            status: 'success',
                            actuate: false
                        });
                    }
                    else {
                        // New data, need to save it
                        node.update(
                            {lastData: data_to_send},
                            {fields: ['lastData']}
                        ).then(function() {
                            process.send({
                                status: 'success',
                                actuate: true,
                                data: data_to_send,
                                nodeId: node.id,
                                homeId: node.HomeId
                            });
                        }).catch(function(error) {
                            // TODO: Should we report failure and not send data if unable to save lastData?
                            process.send({
                                status: 'failure',
                                error: 'Failed to save lastData: ' + error
                            });
                        });
                    }
                }
                else {
                    process.send({
                        status: 'failure',
                        error: "Couldn't find node " + action[action_type].nodeId
                    })
                }
            });
    }
}


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

function evalBranchRange(decision, curVal) {
    for (var i = 0; i < decision.branches.length; i++) {
        var branch = decision.branches[i];
        if (curVal >= getRangeStart(branch) && curVal < getRangeEnd(branch)) {
            evalAction(branch.action);
        }
    }
}

function evalEventBranches(decision, curVal) {
    for (var i = 0; i < decision.branches.length; i++) {
        if (curVal == decision.branches[i].value) {
            evalAction(decision.branches[i].action);
            return;
        }
    }
    // Events have a default set, so if we havent' returned yet, do default
    evalAction(decision.default);
}

process.on('message', function(message) {
    models.Rule.findById(message.rule_id)
        .then(function(db_rule) {
            evalAction(db_rule.rule);
        });
});

// Notify manager that we are ready to work
process.send({status: 'ready'});