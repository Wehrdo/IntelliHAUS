/**
 * Created by David on 3/28/2016.
 */
var models = require('../models/index');

/*
 Checks if there are any rules right now that need to be re-evaluated
 actUpon is the function to call with each rule ID as the argument
  */
function checkNow(actUpon) {
    var now = new Date();
    var now_minutes = now.getHours()*60 + now.getMinutes();

    models.RuleTime.findAll({
        // We only care about the associated rule.
        attributes: ['RuleId'],
        where: {
            time: now_minutes
        }
    }).then(function(rulesToEval) {
        rulesToEval.forEach(function(ruleTime) {
            actUpon(ruleTime.RuleId);
        })
    })
}

exports.checkNow = checkNow;