/**
 * Created by David on 4/7/2016.
 */

var express = require('express');
var router = express.Router();
var path = require('path');

var publicRoot = path.join(__dirname, '../../public');

router.get('/', function(req, res) {
    res.sendFile('html/rule_overview.html', {root: publicRoot});
});

router.get('/:id(\\d+)', function(req, res) {
    res.sendFile('html/rule_edit.html', {root: publicRoot});
});

module.exports = router;