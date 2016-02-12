/**
 * Created by David on 2/11/2016.
 */

var express = require('express');
var router = express.Router();
var models = require('../models');
var bodyParser = require('body-parser');

// Query by id
router.get('/:id(\\d+)', function(req, res) {

});

// Query by username
router.get('/:username(\\[a-zA-Z])', function(req, res) {

});

module.exports = router;