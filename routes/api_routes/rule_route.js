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
    function(req, res) {
        res.status(400).end();
});

module.exports = router;