var path = require('path');
var models = require('../models/index');
var fork = require('child_process').fork;

// Which workers are free
var available = [];
// Queue of rules to evaluate
var eval_q = [];

var proc_map = {};

// Create worker processes
for (i = 0; i < 2; i++) {
    var eval_proc = fork(path.join(__dirname, 'rule_evaluator.js'));
    // Map PID to child process
    proc_map[eval_proc.pid] = eval_proc;

    // Create message callback, binding this process to the callback
    eval_proc.on('message', function(proc, message) {
        if (message == 'success') {
            console.log(proc.pid + " completed");
        }
        else if (message == 'ready') {
            console.log(proc.pid + " ready");
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