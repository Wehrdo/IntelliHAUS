/**
 * Created by David on 2/26/2016.
 */

var express = require('express');
var router = express.Router();

var datastream = require('./datastream_route');
router.use('/datastream', datastream);

var node = require('./node_route');
router.use('/node', node);

var rule = require('./rule_route');
router.use('/rule', rule    );

module.exports = router;