/**
 * Created by David on 2/26/2016.
 */


var express = require('express');
var router = express.Router();
var path = require('path');
var models = require('../../models');

var publicRoot = path.join(__dirname, '../../public');

router.get('/', function(req, res) {
    res.sendFile('html/nodes_overview.html', {root: publicRoot});
});

router.get('/:id(\\d+)', function(req, res) {
    res.sendFile('html/node_single.html', {root: publicRoot});
});


module.exports = router;