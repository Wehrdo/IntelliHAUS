/**
 * Created by David on 2/26/2016.
 */


var express = require('express');
var router = express.Router();
var path = require('path');
var models = require('../../models');

router.get('/', function(req, res) {
    res.send("This is the datastreams overview page");
});

router.get('/:id(\\d+)', function(req, res) {
    var publicRoot = path.join(__dirname, '../../public');
    res.sendFile('html/ds_single.html', {root: publicRoot});
});


module.exports = router;