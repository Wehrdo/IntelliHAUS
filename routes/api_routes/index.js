/**
 * Created by David on 2/25/2016.
 */
var express = require('express');
var router = express.Router();

var home = require('./home_route');
router.use('/home', home);


var node_rt = require('./node_route');
router.use('/node', node_rt);


var datapoint_rt = require('./datapoint_route');
router.use('/datapoint', datapoint_rt);


var datastream_rt = require('./datastream_route');
router.use('/datastream', datastream_rt);

module.exports = router;