var path = require('path');
var models = require('../models/index');
var fork = require('child_process').fork;
var EventEmitter = require('events').EventEmitter;

/*

 Long Polling handling

 */
var updatesBus = new EventEmitter();
updatesBus.setMaxListeners(1);

// All the updates that failed to send
var updates_backlog = [];

// Number of milliseconds to keep an update for
var BACKLOG_MAX_AGE = 60 * 60000;
// Runs through all the failed updates to send them again
function tryBacklogs() {
    var now = new Date();
    var i = updates_backlog.length - 1;
    while (i >= 0) {
        var update = updates_backlog[i];
        var success = updatesBus.emit(update.homeId, update.update_info);
        if (success || ((now - update.time) > BACKLOG_MAX_AGE)) {
            updates_backlog.splice(i, 1);
        }
        i -= 1;
    }
}

// Try re-emitting backlogs every 10 seconds
setInterval(tryBacklogs, 10000);

exports.updatesBus = updatesBus;


/*

Rule Evaluation handling

 */

// Which workers are free
var available = [];
// Queue of rules to evaluate
var eval_q = [];


var proc_map = {};
// If we are in debug mode
var DEBUG = typeof v8debug === 'object';

// Create worker processes
for (i = 0; i < 2; i++) {
    // Change port for child processes if we are debugging, so they can also be debugged
    if (DEBUG) {
        var exec_args = ['--debug=' + (22851 + i)]
    }
    else {
        var exec_args = []
    }
    var eval_proc = fork(path.join(__dirname, 'rule_evaluator.js'), [], {
        execArgv: exec_args
    });


    // Map PID to child process
    proc_map[eval_proc.pid] = eval_proc;

    // Create message callback, binding this process to the callback
    eval_proc.on('message', function(proc, message) {
        // Rule evaluated successfully
        if (message.status == 'success') {
            // If rule requires data to be sent out
            if (message.actuate) {
                // Notify long-polling listener about new data
                var update_info = {
                    nodeId: message.nodeId,
                    data: message.data
                };
                var hasListeners = updatesBus.emit(message.homeId.toString(), update_info);
                // There were no listeners for this home; store in backlog
                if (!hasListeners) {
                    console.log("Storing node " + message.nodeId + " update in backlog");
                    updates_backlog.push({
                        time: new Date(),
                        homeId: message.homeId.toString(),
                        update_info: update_info
                    });
                }
            }
        }
        else if (message.status == 'failure') {
            console.log('error evaluating rule: ' + message.error);
        }
        else if (message.status == 'ready') {
            console.log('Process ' + proc.pid + " ready");
        }
        // Return process to available
        available.push(proc.pid);
        // Worker finished or ready, try to evaluate more rules
        doEval();

    }.bind(this, eval_proc));

    eval_proc.on('exit', function(proc, code, signal) {
        console.log("process " + proc.pid + " closed with code " + code);
        // TODO: If error, restart?
    }.bind(this, eval_proc));

    eval_proc.on('error', function(proc, error) {
        console.log("process " + proc.pid + " had error: " + error);
    }.bind(this, eval_proc));
}

function doEval() {
    while (available.length > 0 && eval_q.length > 0) {
        // V8 optimizes shift() for most arrays, making this efficient enough to use
        // See https://bugs.chromium.org/p/v8/issues/detail?id=3059
        var to_eval = eval_q.shift();
        var proc_to_use = proc_map[available.pop()];
        proc_to_use.send({
            ruleId: to_eval
        });
    }
}

function evalRule(ruleId) {
    eval_q.push(ruleId);
    doEval();
}

function evaluate(datastream) {
    // Add all associated rules to evaluate
    datastream.getRules().then(function(rules) {
        rules.forEach(function(rule) {
            evalRule(rule.id);
        });
    })
}

exports.evaluate = evaluate;
exports.evalRule = evalRule;
