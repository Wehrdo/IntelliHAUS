/**
 * Created by David on 2/10/2016.
 */

var express = require('express');
var router = express.Router();

// Getting datapoint with integer ID
router.get('/:id(\\d+)', function(req, res) {
    res.end("Getting datapoint with ID " + req.params.id);
});

module.exports = router;