/**
 * Created by David on 2/26/2016.
 */

var express = require('express');
var router = express.Router();

var datastream = require('./datastream_route');
router.use('/datastreams', datastream);

module.exports = router;